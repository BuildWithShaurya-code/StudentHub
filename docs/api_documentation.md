# Flask API

Default base URL: `http://127.0.0.1:5001/api`. CORS allows exactly `FRONTEND_ORIGIN`; credentials are not enabled. The application has no authentication and is intended for trusted local use.

| Method and path | Behavior |
|---|---|
| GET /health | Actual SELECT 1 / version query; 200 connected or safe 503 |
| GET /students | students, total, page, page_size, total_pages |
| GET /students/search?query=value | Name/roll partial search; empty query returns no matches |
| GET /students/results | All records with backend grades and aggregate metrics |
| GET /dashboard/stats | Totals, average, pass/distinction/backlog rates, department distribution, recent registrations |
| GET /students/{id} | Student by numeric primary ID; 404 if missing |
| POST /students | Validate and create; 201 |
| PUT /students/{id} | Validate full replacement of editable fields; 200 |
| DELETE /students/{id} | Delete designated student; 200 or 404 |

List parameters: `search` (partial name/roll), `department` (exact match), `semester` (1–8 or Semester N), `page`, `page_size` (maximum 1000), `roll_number` (exact roll lookup). The frontend traverses pages when it needs the complete collection. Numeric identifiers mean database IDs; roll availability uses the explicit roll_number query. Non-numeric legacy roll detail URLs remain supported.

POST and PUT require roll_number (max 30), full_name (max 100), email (max 150), department (max 100), semester (integer 1–8) and finite marks (0–100). String fields must be nonempty strings. Aliases name and rollNumber are retained for compatibility. Marks are rounded to two decimals only after validating the original bounds. Duplicate roll/email returns 409, invalid payload 400, database unavailability 503, missing resources 404, unsupported methods 405. Error responses contain error/message and never raw database exceptions.

A successful mutation contains `status`, `message` and `student`. Student JSON includes database fields, numeric `id`, semester display string and semester_int/semester_number, marks, grade, standing, result_status, is_passed, creation/update timestamps and compatibility aliases name, rollNumber and registeredDate. Optional fields absent from the schema are empty or explicitly not recorded. Coursework is an empty array.

Grade thresholds: 90 O; 80 A+; 70 A; 60 B+; 50 B; 40 Pass; below 40 Fail. Distinction begins at 80 and passing at 40. Standing is Dean's List at 80, Good Standing at 40, otherwise Academic Warning. Frontend grade-point values are illustrative estimates.
