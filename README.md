# StudentHub — Student Management System

StudentHub is a college mini project with the existing Google Stitch interface, a React/TypeScript frontend, a Python Flask API and MySQL. It manages student identity, department, semester and overall marks. The standalone Java module demonstrates OOP concepts; it does not replace the Flask backend.

## Project structure

```text
frontend/          React, Vite, Tailwind CSS, UI and browser tests
backend/           Flask, SQLAlchemy, PyMySQL, validation and API tests
sql/schema.sql     Fresh-install students table matching the Flask model
java-oop-demo/     Standalone Java educational demonstration
docs/              Database/API/architecture documentation
audit/            Initial and final audit reports
```

The functional screens are Dashboard, Student Directory, Add Student, Student Details, Edit Student and Results. System States / UI is explicitly a demonstration screen. The current database does not store phone numbers, course-level results, attendance, advisors, fees, RFID, admission date or historical grades; these are disabled or shown as not recorded. Grade-point estimates are illustrative conversions, not an official university GPA.

## Prerequisites

- Python 3.9+ with pip and venv.
- Node.js 22.12+ (Node 24 also supported) and npm.
- MySQL Server 8.0.16+ with enforced CHECK constraints and MySQL Workbench or the mysql CLI.
- A local MySQL account with appropriate database access. Keep credentials private.
- Optional: JDK 17+ for the independent Java module.

## Backend setup

From the repository root:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements-lock.txt
cp backend/.env.example backend/.env
```

Edit `backend/.env` privately. Set `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME=studenthub_db`, your MySQL username/password, `FLASK_PORT=5001`, `FLASK_DEBUG=False` and `FRONTEND_ORIGIN=http://localhost:3000`. Environment variables supplied by the shell take precedence over the file. Never commit `.env` or paste its password into logs or command arguments.

For an existing installation, inspect its schema first. Do not drop, clear or recreate tables. The audited local `studenthub_db` already has the expected schema and requires no migration.

For a **new installation only**, create `studenthub_db` in MySQL Workbench, select it as the default schema, review `sql/schema.sql`, and execute that script. The script creates only the students table in the selected database and never inserts sample students. `CREATE TABLE IF NOT EXISTS` does not migrate an existing incompatible table. Resolve differences with a separately reviewed migration.

Check connectivity, then start Flask:

```sh
python backend/test_connection.py
python backend/app.py
```

Flask listens on `http://127.0.0.1:5001`. The health check performs an actual database query:

```sh
curl http://127.0.0.1:5001/api/health
curl 'http://127.0.0.1:5001/api/students?page=1&page_size=10'
```

## Frontend setup

In another terminal:

```sh
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Open **http://localhost:3000**. The default API URL is `http://127.0.0.1:5001/api`; change `VITE_API_BASE_URL` in `frontend/.env` only when necessary, then restart Vite. CORS allows exactly the backend's configured `FRONTEND_ORIGIN`. `localhost` and `127.0.0.1` are different browser origins.

Navigation uses URL hashes: `/#/dashboard`, `/#/students`, `/#/add-student`, `/#/students/1`, `/#/students/1/edit`, `/#/results`. Student detail and edit links use database IDs.

## Verification

Frontend checks do not need a database:

```sh
cd frontend
npm run lint
npm test
npm run build
```

All database mutation tests are restricted to an explicitly approved isolated database named `studenthub_audit_test`. Never point them at `studenthub_db`. After approving and creating the isolated database in Workbench, from the repository root:

```sh
source .venv/bin/activate
DB_NAME=studenthub_audit_test python backend/tests/prepare_test_database.py
DB_NAME=studenthub_audit_test python -m unittest discover -s backend/tests -p test_regressions.py -v
DB_NAME=studenthub_audit_test python backend/tests/test_api_suite.py
DB_NAME=studenthub_audit_test python backend/tests/test_restart_persistence.py
```

The legacy API runner assumes an empty isolated database. Run suites sequentially. New regression tests clean up only IDs they create. Tests never erase the application table.

For HTTP and browser tests, start the isolated backend and frontend in separate terminals:

```sh
# Repository root, with .venv active
DB_NAME=studenthub_audit_test FLASK_PORT=5011 FRONTEND_ORIGIN=http://localhost:3010 FLASK_DEBUG=False python backend/app.py
```

```sh
cd frontend
VITE_API_BASE_URL=http://127.0.0.1:5011/api npm run dev -- --port 3010
```

```sh
# Repository root
DB_NAME=studenthub_audit_test FLASK_PORT=5011 FRONTEND_ORIGIN=http://localhost:3010 python backend/tests/test_stage4_e2e.py
cd frontend
npx playwright install chromium
npm run test:browser
```

If using an installed Chrome browser instead of Playwright's download, set `CHROME_PATH` to that Chrome executable. Browser tests use `http://localhost:3010` and `http://127.0.0.1:5011/api` by default; override with `TEST_FRONTEND_URL` and `TEST_API_URL` if needed. They verify the test database identity, reject requests to other API targets, use synthetic students and save screenshots/logs under ignored `audit/artifacts/`. Do not run these tests concurrently against the same isolated database.

The executed results and remaining limitations are in [audit/FINAL_AUDIT.md](audit/FINAL_AUDIT.md) and [docs/testing_report.md](docs/testing_report.md). Historical claims from the supplied archive are not treated as evidence.

## Optional Java demonstration

```sh
mkdir -p java-oop-demo/bin
javac -d java-oop-demo/bin java-oop-demo/src/*.java java-oop-demo/tests/*.java
java -cp java-oop-demo/bin Main
java -cp java-oop-demo/bin GradeRulesTest
```

## Troubleshooting

- **MySQL 2003 / cannot connect:** start MySQL Server and confirm host/port. Do not reset credentials or change databases as a workaround.
- **MySQL 1045:** verify the configured account/password privately with MySQL Workbench. No automatic root password reset is required.
- **Unknown database / missing table:** inspect the selected database. Use the fresh-install procedure only for a new installation.
- **CORS error:** use the exact `FRONTEND_ORIGIN`, including hostname and port.
- **Port already in use:** stop your own previous server or select a new backend port/API URL and matching frontend origin. Port 5000 may be occupied on macOS; 5001 is the default.
- **Dependency failure:** use a supported Node/Python version and the supplied lockfiles. npm 12 may require `npm ci --allow-remote=all` for explicit registry tarball dependencies in the lockfile.
- **Empty directory versus failed request:** an empty database shows an empty state; an unavailable backend shows an explicit error with Retry.
- **Phone/coursework unavailable:** these fields are not in the current schema, so they cannot be edited or inferred.

## Source publication and hosting

Publishing this repository to GitHub publishes **source code**. It does not run Flask or host MySQL. No student data, database dumps, `.env`, virtual environments, build output or local test artifacts belong in the repository.

Live hosting needs a Flask-capable service with a production WSGI server, a securely reachable MySQL server, private production environment variables, HTTPS, and a frontend API URL/CORS configuration for the hosted origins. This local mini project has no authentication or authorization and is intended for trusted local use; external access controls must be designed before exposing student data. No hosting, database migration, paid resources or public MySQL access was provisioned during this audit.
