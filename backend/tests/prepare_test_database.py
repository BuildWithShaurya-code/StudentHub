"""Apply fresh-install schema ONLY to an explicitly approved test database."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from config import Config
from sqlalchemy import create_engine, text

if Config.DB_NAME != 'studenthub_audit_test':
    raise SystemExit('Refusing schema setup: set DB_NAME=studenthub_audit_test.')
engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
schema = Path(__file__).resolve().parents[2] / 'sql/schema.sql'
with engine.begin() as connection:
    connection.execute(text(schema.read_text().strip().rstrip(';')))
print('Approved test schema ready; no application tables modified.')
