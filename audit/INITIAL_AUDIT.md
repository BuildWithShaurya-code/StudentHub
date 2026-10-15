# StudentHub initial audit — 15 October 2026

Source: supplied ZIP, extracted into this separate audit folder. Existing workspace and original project preserved. No .git directory, branch, commits, remotes, or history were present in the archive. GitHub account inspected through connected GitHub; user selected a new public StudentHub repository.

## Implemented
React/TypeScript/Vite/Tailwind SPA with dashboard, directory, add, details, edit, results and feedback demo; centralized fetch client; Flask/SQLAlchemy/PyMySQL API with CRUD, filters, search, metrics and grading; Java OOP demonstration; documentation and two manual Python test runners.

## Initial executed checks
- PASS: frontend TypeScript compiler and Vite production build (archived dependencies).
- PASS: actual read-only MySQL connection outside network sandbox; version 26.7.0, database studenthub_db, one existing student. Only students table exists.
- NOT TESTED: CRUD/browser flows at this stage; existing tests mutate the configured database and assume an empty dataset.

## Defects identified
- sql/schema.sql defines string IDs, name, string semester, extra required fields and coursework; Flask/live database use auto-increment bigint IDs, full_name, integer semester and ten columns. Setup cannot reproduce application schema.
- Raw database exceptions returned by route handlers; validation queries and lookup errors escape inconsistent error handling.
- Validator accepts fractional/boolean semesters, negative strings after stripping punctuation, NaN marks, non-string identity fields, and overlong names/departments.
- Numeric roll numbers conflict with ID lookup; frontend routes use roll numbers rather than primary IDs.
- Frontend getAll silently limits records to 1,000; dashboard/results failures resemble empty data.
- Reset Demo Database inserts hardcoded students, swallows errors and reports success.
- Student profiles and backend serializer fabricate phone/advisor/coursework/batch data; phone edits are not persisted.
- Edit component conditionally calls hooks; asynchronous navigation can show stale records.
- Grade Fail differs between frontend and backend; CSV quoting/formula handling incomplete.
- CORS accepts several extra origins and credentials; Flask binds all interfaces with debug enabled by default.
- Frontend ships embedded source archive/base64 content and unnecessary AI/backend dependencies.
- Existing documentation includes old stack/schema claims and historical test claims that are not audit evidence.

## Remaining verification
Read-only live schema constraints/indexes; safe regression tests in approved isolated MySQL database; browser navigation/CRUD/cancel/errors/loading/empty/responsive/console; restart persistence; Java compile/demo; secret scan excluding local environments; reproducible dependency setup; final staged diff and public GitHub publication. No production data changes authorized. Isolated studenthub_audit_test database explicitly approved by user.
