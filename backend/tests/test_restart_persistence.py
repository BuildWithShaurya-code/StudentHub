"""Explicit process restart proof against the isolated test database."""
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import URLError
import uuid

root = Path(__file__).resolve().parents[2]
if os.environ.get('DB_NAME') != 'studenthub_audit_test':
    raise SystemExit('Set DB_NAME=studenthub_audit_test; production testing prohibited.')
base = 'http://127.0.0.1:5012/api'

def request(path, method='GET', data=None):
    body = json.dumps(data).encode() if data is not None else None
    req = Request(base+path, data=body, method=method, headers={'Content-Type':'application/json'})
    with urlopen(req,timeout=5) as response:
        return json.load(response)

def start():
    process = subprocess.Popen([sys.executable, str(root/'backend/app.py')],
        cwd=root,env={**os.environ,'FLASK_PORT':'5012','FLASK_DEBUG':'False','PYTHONDONTWRITEBYTECODE':'1'},
        stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    for _ in range(60):
        if process.poll() is not None:
            raise RuntimeError('Test server exited during startup')
        try:
            if request('/health')['target_database'] == 'studenthub_audit_test':
                return process
        except URLError:
            time.sleep(0.1)
    process.terminate();process.wait(timeout=5)
    raise RuntimeError('Test server did not become healthy')

identifier = None
process = start()
try:
    suffix=uuid.uuid4().hex[:12]
    student = request('/students','POST',dict(roll_number='RESTART-'+suffix,full_name='Synthetic Restart Student',email=suffix+'@example.invalid',department='Computer Science',semester=4,marks=88.5))['student']
    identifier=student['id']
    process.terminate();process.wait(timeout=5)
    process=start()
    after=request('/students/'+str(identifier))['student']
    assert after['roll_number']==student['roll_number'] and after['marks']==88.5
    request('/students/'+str(identifier),'DELETE');identifier=None
    print('PASS: synthetic MySQL student persisted after stopping and restarting the Flask process; cleaned up.')
finally:
    if identifier and process.poll() is None:
        request('/students/'+str(identifier),'DELETE')
    process.terminate();process.wait(timeout=5)
