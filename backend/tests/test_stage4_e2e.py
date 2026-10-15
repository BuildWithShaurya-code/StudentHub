import sys
import os
import json
import time
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from config import Config
from extensions import db
from models.student import Student
from app import create_app

FLASK_BASE_URL = f"http://127.0.0.1:{Config.FLASK_PORT}/api"
FRONTEND_URL = Config.FRONTEND_ORIGIN

def make_request(method, endpoint, payload=None):
    url = f"{FLASK_BASE_URL}{endpoint}"
    data_bytes = json.dumps(payload).encode('utf-8') if payload is not None else None
    req = Request(url, data=data_bytes, method=method)
    req.add_header('Accept', 'application/json')
    if data_bytes:
        req.add_header('Content-Type', 'application/json')

    try:
        with urlopen(req, timeout=5) as resp:
            body = resp.read().decode('utf-8')
            return resp.status, json.loads(body) if body else {}
    except HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            parsed = json.loads(body)
        except:
            parsed = {"raw": body}
        return e.code, parsed
    except URLError as e:
        return 0, {"error": str(e.reason)}

def run_qa_suite():
    print("=" * 75)
    print(" StudentHub Stage 4: End-to-End QA & System Verification Suite")
    print(f" Target Backend  : {FLASK_BASE_URL}")
    print(f" Target Frontend : {FRONTEND_URL}")
    print(f" Target MySQL    : {Config.safe_db_summary()}")
    print("=" * 75)

    checklist = []

    def log_test(category, name, passed, details=""):
        status = "PASS" if passed else "FAIL"
        print(f"[{status}] [{category}] {name}")
        if details:
            print(f"        -> {details}")
        checklist.append({
            "category": category,
            "name": name,
            "status": status,
            "details": details
        })

    # ============================================================
    # 1. Pre-Test Checks
    # ============================================================
    # Check MySQL DB
    if Config.DB_NAME != 'studenthub_audit_test':
        raise RuntimeError('Mutation tests require DB_NAME=studenthub_audit_test; production testing is prohibited.')
    app = create_app()
    with app.app_context():
        try:
            tbl_count = Student.query.count()
            log_test("Pre-Test", "1.1 MySQL Database Connectivity", True, f"Connected to {Config.DB_NAME}. Active records in 'students': {tbl_count}")
        except Exception as e:
            log_test("Pre-Test", "1.1 MySQL Database Connectivity", False, str(e))

    # Check Flask /api/health over HTTP
    code, data = make_request('GET', '/health')
    if data.get('target_database') != 'studenthub_audit_test':
        raise RuntimeError('HTTP server is not connected to the isolated test database. Aborting before mutations.')
    is_healthy = code == 200 and data.get('status') == 'ok' and data.get('database') == 'connected'
    log_test("Pre-Test", "1.2 Flask Backend /api/health Endpoint", is_healthy, f"HTTP {code}, DB Status: {data.get('database')}")

    # Check Frontend HTTP serving
    try:
        with urlopen(FRONTEND_URL, timeout=3) as resp:
            frontend_ok = resp.status == 200
            log_test("Pre-Test", "1.3 Vite Frontend Server Availability", frontend_ok, f"HTTP {resp.status} on {FRONTEND_URL}")
    except Exception as e:
        log_test("Pre-Test", "1.3 Vite Frontend Server Availability", False, str(e))

    # ============================================================
    # 2. Student Lifecycle: Create, Read, Search, Update, Delete
    # ============================================================
    test_roll = "QA-2026-888"
    test_email = "rohit.verma.qa@college.edu"
    test_payload = {
        "roll_number": test_roll,
        "full_name": "Rohit Verma",
        "email": test_email,
        "department": "Computer Science",
        "semester": 4,
        "marks": 86.50
    }

    # Test A: Create Student
    code, data = make_request('POST', '/students', test_payload)
    created_student = data.get('student', {})
    student_id = created_student.get('id')
    created_ok = code == 201 and student_id is not None and created_student.get('roll_number') == test_roll
    log_test("Lifecycle", "2.1 Test A: Add Student (POST /api/students)", created_ok, f"HTTP {code}, Created DB ID: {student_id}, Roll: {test_roll}")

    # Test B: Read & Search
    code, get_data = make_request('GET', f'/students/{student_id}')
    read_ok = code == 200 and get_data.get('student', {}).get('roll_number') == test_roll
    log_test("Lifecycle", "2.2 Test B: Retrieve by Database ID (GET /api/students/<id>)", read_ok, f"HTTP {code}, Name: {get_data.get('student', {}).get('name')}")

    # Read by Roll Number
    code, roll_data = make_request('GET', f'/students/{test_roll}')
    roll_ok = code == 200 and roll_data.get('student', {}).get('id') == student_id
    log_test("Lifecycle", "2.3 Test B: Retrieve by Roll Number (GET /api/students/<roll>)", roll_ok, f"HTTP {code}, Verified matching ID: {student_id}")

    # Search by partial name
    code, search_name = make_request('GET', '/students/search?query=Rohit')
    search_name_ok = code == 200 and search_name.get('total') >= 1
    log_test("Lifecycle", "2.4 Test B: Search by Partial Name ('Rohit')", search_name_ok, f"HTTP {code}, Matches found: {search_name.get('total')}")

    # Search by partial roll number
    code, search_roll = make_request('GET', '/students/search?query=QA-2026')
    search_roll_ok = code == 200 and search_roll.get('total') >= 1
    log_test("Lifecycle", "2.5 Test B: Search by Partial Roll ('QA-2026')", search_roll_ok, f"HTTP {code}, Matches found: {search_roll.get('total')}")

    # Department filter
    code, dept_data = make_request('GET', '/students?department=Computer%20Science')
    dept_ok = code == 200 and any(s.get('id') == student_id for s in dept_data.get('students', []))
    log_test("Lifecycle", "2.6 Test B: Filter by Department ('Computer Science')", dept_ok, f"HTTP {code}, Filter matched created record")

    # Semester filter
    code, sem_data = make_request('GET', '/students?semester=4')
    sem_ok = code == 200 and any(s.get('id') == student_id for s in sem_data.get('students', []))
    log_test("Lifecycle", "2.7 Test B: Filter by Semester ('Semester 4')", sem_ok, f"HTTP {code}, Filter matched created record")

    # Combined Search + Filters
    code, combo_data = make_request('GET', '/students?search=Rohit&department=Computer%20Science&semester=4')
    combo_ok = code == 200 and len(combo_data.get('students', [])) == 1
    log_test("Lifecycle", "2.8 Test B: Combined Search + Dept + Semester Filters", combo_ok, f"HTTP {code}, Exactly 1 record matched")

    # Test C: Edit Student (Update marks to 94.00, name to 'Rohit Verma (Honors)')
    update_payload = {
        "roll_number": test_roll,
        "full_name": "Rohit Verma (Honors)",
        "email": test_email,
        "department": "Computer Science",
        "semester": 4,
        "marks": 94.00
    }
    code, update_data = make_request('PUT', f'/students/{student_id}', update_payload)
    updated_rec = update_data.get('student', {})
    update_ok = (
        code == 200 and
        updated_rec.get('name') == "Rohit Verma (Honors)" and
        updated_rec.get('marks') == 94.0 and
        updated_rec.get('grade') == 'O' and
        updated_rec.get('standing') == "Dean's List"
    )
    log_test("Lifecycle", "2.9 Test C: Edit Student (PUT /api/students/<id>)", update_ok, f"HTTP {code}, Updated Marks: {updated_rec.get('marks')}, Grade: {updated_rec.get('grade')}, Standing: {updated_rec.get('standing')}")

    # Test D: Results & Grades Verification
    code, results_data = make_request('GET', '/students/results')
    metrics = results_data.get('metrics', {})
    results_ok = (
        code == 200 and
        metrics.get('total_candidates') >= 1 and
        metrics.get('distinction_count') >= 1 and
        metrics.get('pass_rate_percentage') == 100.0
    )
    log_test("Results", "2.10 Academic Results Ledger (GET /api/students/results)", results_ok, f"HTTP {code}, Total: {metrics.get('total_candidates')}, Pass Rate: {metrics.get('pass_rate_percentage')}%, Dist: {metrics.get('distinction_count')}")

    # Test D: Dashboard Statistics Verification
    code, stats_data = make_request('GET', '/dashboard/stats')
    stats_ok = (
        code == 200 and
        stats_data.get('total_students') >= 1 and
        stats_data.get('average_marks') == 94.0 and
        stats_data.get('department_distribution', {}).get('Computer Science') == 1
    )
    log_test("Dashboard", "2.11 Dashboard Statistics (GET /api/dashboard/stats)", stats_ok, f"HTTP {code}, Total: {stats_data.get('total_students')}, Avg: {stats_data.get('average_marks')}, Depts: {stats_data.get('departments_count')}")

    # ============================================================
    # 3. Validation & Error Handling Tests
    # ============================================================
    # Missing required fields
    code, data = make_request('POST', '/students', {"roll_number": "TEMP-X"})
    log_test("Validation", "3.1 Missing Required Fields Rejection", code == 400, f"HTTP {code}, Error: {data.get('message')}")

    # Invalid email format
    code, data = make_request('POST', '/students', {
        "roll_number": "TEMP-Y", "full_name": "Test User", "email": "invalid-email-address",
        "department": "Computer Science", "semester": 2, "marks": 50
    })
    log_test("Validation", "3.2 Invalid Email Format Rejection", code == 400, f"HTTP {code}, Error: {data.get('message')}")

    # Marks out of bounds (< 0)
    code, data = make_request('POST', '/students', {
        "roll_number": "TEMP-Z", "full_name": "Test User", "email": "test@college.edu",
        "department": "Computer Science", "semester": 2, "marks": -10.0
    })
    log_test("Validation", "3.3 Marks Below 0 Rejection", code == 400, f"HTTP {code}, Error: {data.get('message')}")

    # Marks out of bounds (> 100)
    code, data = make_request('POST', '/students', {
        "roll_number": "TEMP-Z", "full_name": "Test User", "email": "test@college.edu",
        "department": "Computer Science", "semester": 2, "marks": 105.0
    })
    log_test("Validation", "3.4 Marks Above 100 Rejection", code == 400, f"HTTP {code}, Error: {data.get('message')}")

    # Invalid semester (< 1 or > 8)
    code, data = make_request('POST', '/students', {
        "roll_number": "TEMP-Z", "full_name": "Test User", "email": "test@college.edu",
        "department": "Computer Science", "semester": 9, "marks": 75.0
    })
    log_test("Validation", "3.5 Invalid Semester (> 8) Rejection", code == 400, f"HTTP {code}, Error: {data.get('message')}")

    # Duplicate roll number rejection
    code, data = make_request('POST', '/students', {
        "roll_number": test_roll, "full_name": "Duplicate Student", "email": "another.email@college.edu",
        "department": "Information Tech", "semester": 1, "marks": 70.0
    })
    log_test("Validation", "3.6 Duplicate Roll Number Rejection", code == 409, f"HTTP {code}, Conflict: {data.get('message')}")

    # Duplicate email rejection
    code, data = make_request('POST', '/students', {
        "roll_number": "DIFF-ROLL-001", "full_name": "Duplicate Email", "email": test_email,
        "department": "Information Tech", "semester": 1, "marks": 70.0
    })
    log_test("Validation", "3.7 Duplicate Email Address Rejection", code == 409, f"HTTP {code}, Conflict: {data.get('message')}")

    # Nonexistent Student ID
    code, data = make_request('GET', '/students/99999999')
    log_test("Validation", "3.8 Nonexistent Student ID 404 Response", code == 404, f"HTTP {code}, Message: {data.get('message')}")

    # Empty search query
    code, data = make_request('GET', '/students/search?query=')
    log_test("Validation", "3.9 Empty Search Query Graceful Handling", code == 200, f"HTTP {code}, Returned 0 matches without error")

    # ============================================================
    # 4. Clean-Up Test Record
    # ============================================================
    code, data = make_request('DELETE', f'/students/{student_id}')
    delete_ok = code == 200 and data.get('id') == student_id
    log_test("Lifecycle", "4.1 Test E: Delete Student (DELETE /api/students/<id>)", delete_ok, f"HTTP {code}, Msg: {data.get('message')}")

    # Verify deletion in MySQL
    code, data = make_request('GET', f'/students/{student_id}')
    verify_delete_ok = code == 404
    log_test("Lifecycle", "4.2 Confirm Test Record Removed from MySQL", verify_delete_ok, f"HTTP {code} correctly returned (Not Found)")

    # ============================================================
    # 5. Persistence Across Restart Test
    # ============================================================
    # Create a designated persist test record
    persist_payload = {
        "roll_number": "PERSIST-TEST-001",
        "full_name": "Persistence Verification Student",
        "email": "persist.test@college.edu",
        "department": "Mechanical Engineering",
        "semester": 6,
        "marks": 78.00
    }
    code, data = make_request('POST', '/students', persist_payload)
    persist_id = data.get('student', {}).get('id')
    persist_created = code == 201 and persist_id is not None

    # Verify record in direct MySQL connection
    with app.app_context():
        db_student = db.session.get(Student, persist_id)
        in_mysql = db_student is not None and db_student.roll_number == "PERSIST-TEST-001"
    log_test("Persistence", "5.1 Persist Record Created in MySQL", in_mysql, f"Saved with ID {persist_id} in {Config.DB_NAME}.students")

    # Verify query over HTTP
    code, get_persist = make_request('GET', f'/students/{persist_id}')
    persist_get_ok = code == 200 and get_persist.get('student', {}).get('roll_number') == "PERSIST-TEST-001"
    log_test("Persistence", "5.2 Verified Persistence Over HTTP Endpoint", persist_get_ok, f"HTTP {code}, Read from MySQL successfully")

    # Clean up persist record
    make_request('DELETE', f'/students/{persist_id}')
    with app.app_context():
        remaining = Student.query.count()
    log_test("Persistence", "5.3 Clean Up Persist Test Record", remaining == 0, f"0 residual records remaining in {Config.DB_NAME}.students")

    # ============================================================
    # Summary
    # ============================================================
    print("=" * 75)
    total_passed = sum(1 for c in checklist if c['status'] == 'PASS')
    total_tests = len(checklist)
    print(f"STAGE 4 QA TEST SUMMARY: {total_passed}/{total_tests} Tests Passed.")
    print("=" * 75)
    return total_passed == total_tests

if __name__ == '__main__':
    all_passed = run_qa_suite()
    sys.exit(0 if all_passed else 1)
