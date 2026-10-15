import sys
from pathlib import Path
import json

# Ensure backend package can be imported
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app import create_app
from extensions import db
from models.student import Student

def run_all_tests():
    print("=" * 70)
    print(" StudentHub Backend API Comprehensive Test Suite (Stage 2)")
    print("=" * 70)

    from config import Config
    if Config.DB_NAME != 'studenthub_audit_test':
        raise RuntimeError('Mutation tests require DB_NAME=studenthub_audit_test; production testing is prohibited.')
    app = create_app()
    client = app.test_client()

    results = []

    def record_test(name, passed, details=""):
        status = "PASSED" if passed else "FAILED"
        print(f"[{status}] {name}")
        if details:
            print(f"        -> {details}")
        results.append((name, passed, details))

    with app.app_context():
        # ------------------------------------------------------------
        # Test 1: GET /api/health
        # ------------------------------------------------------------
        res = client.get('/api/health')
        data = res.get_json()
        is_ok = res.status_code == 200 and data.get('status') == 'ok' and data.get('database') == 'connected'
        record_test("1. GET /api/health — Real MySQL Connectivity", is_ok, f"Status: {res.status_code}, DB: {data.get('database')}")

        # ------------------------------------------------------------
        # Test 2: GET /api/students (Initial empty state)
        # ------------------------------------------------------------
        res = client.get('/api/students')
        data = res.get_json()
        is_ok = res.status_code == 200 and 'students' in data and 'total' in data
        record_test("2. GET /api/students — Retrieve Students from MySQL", is_ok, f"Status: {res.status_code}, Total count: {data.get('total')}")

        # ------------------------------------------------------------
        # Test 3: Validation: Missing required fields
        # ------------------------------------------------------------
        res = client.post('/api/students', json={"roll_number": "TEMP-001"})
        is_ok = res.status_code == 400
        record_test("3. POST /api/students — Reject Missing Required Fields", is_ok, f"Status: {res.status_code}, Msg: {res.get_json().get('message')}")

        # ------------------------------------------------------------
        # Test 4: Validation: Invalid email format
        # ------------------------------------------------------------
        bad_email_payload = {
            "roll_number": "STU-VAL-1",
            "full_name": "Validation Student",
            "email": "not-a-valid-email",
            "department": "Computer Science",
            "semester": 3,
            "marks": 75.0
        }
        res = client.post('/api/students', json=bad_email_payload)
        is_ok = res.status_code == 400
        record_test("4. POST /api/students — Reject Invalid Email Format", is_ok, f"Status: {res.status_code}, Msg: {res.get_json().get('message')}")

        # ------------------------------------------------------------
        # Test 5: Validation: Marks outside permitted range (< 0 or > 100)
        # ------------------------------------------------------------
        bad_marks_payload = {
            "roll_number": "STU-VAL-2",
            "full_name": "Validation Student",
            "email": "valid.marks@college.edu",
            "department": "Computer Science",
            "semester": 3,
            "marks": 105.0
        }
        res = client.post('/api/students', json=bad_marks_payload)
        is_ok = res.status_code == 400
        record_test("5. POST /api/students — Reject Marks Outside Range (0-100)", is_ok, f"Status: {res.status_code}, Msg: {res.get_json().get('message')}")

        # ------------------------------------------------------------
        # Test 6: Validation: Invalid semester values (< 1 or > 8)
        # ------------------------------------------------------------
        bad_sem_payload = {
            "roll_number": "STU-VAL-3",
            "full_name": "Validation Student",
            "email": "valid.sem@college.edu",
            "department": "Computer Science",
            "semester": 12,
            "marks": 75.0
        }
        res = client.post('/api/students', json=bad_sem_payload)
        is_ok = res.status_code == 400
        record_test("6. POST /api/students — Reject Invalid Semester (> 8)", is_ok, f"Status: {res.status_code}, Msg: {res.get_json().get('message')}")

        # ------------------------------------------------------------
        # Test 7: POST /api/students — Create Valid Test Student
        # ------------------------------------------------------------
        test_payload = {
            "roll_number": "TEST-CS-999",
            "full_name": "Aarav Test Student",
            "email": "aarav.test@college.edu",
            "department": "Computer Science",
            "semester": 4,
            "marks": 88.50
        }
        res = client.post('/api/students', json=test_payload)
        created_data = res.get_json()
        created_id = created_data.get('student', {}).get('id')
        is_ok = res.status_code == 201 and created_id is not None
        record_test("7. POST /api/students — Create Student in MySQL", is_ok, f"Status: {res.status_code}, Created ID: {created_id}")

        # ------------------------------------------------------------
        # Test 8: Validation: Duplicate roll number rejection
        # ------------------------------------------------------------
        dup_roll_payload = {
            "roll_number": "TEST-CS-999",
            "full_name": "Another Person",
            "email": "another.email@college.edu",
            "department": "Mechanical Engineering",
            "semester": 2,
            "marks": 60.0
        }
        res = client.post('/api/students', json=dup_roll_payload)
        is_ok = res.status_code == 409
        record_test("8. POST /api/students — Reject Duplicate Roll Number", is_ok, f"Status: {res.status_code}, Msg: {res.get_json().get('message')}")

        # ------------------------------------------------------------
        # Test 9: Validation: Duplicate email rejection
        # ------------------------------------------------------------
        dup_email_payload = {
            "roll_number": "TEST-CS-888",
            "full_name": "Another Person",
            "email": "aarav.test@college.edu",
            "department": "Mechanical Engineering",
            "semester": 2,
            "marks": 60.0
        }
        res = client.post('/api/students', json=dup_email_payload)
        is_ok = res.status_code == 409
        record_test("9. POST /api/students — Reject Duplicate Email", is_ok, f"Status: {res.status_code}, Msg: {res.get_json().get('message')}")

        # ------------------------------------------------------------
        # Test 10: GET /api/students/<id> — Retrieve Single Student
        # ------------------------------------------------------------
        res = client.get(f'/api/students/{created_id}')
        get_data = res.get_json()
        is_ok = res.status_code == 200 and get_data.get('student', {}).get('roll_number') == 'TEST-CS-999'
        record_test("10. GET /api/students/<id> — Retrieve by ID", is_ok, f"Status: {res.status_code}, Name: {get_data.get('student', {}).get('full_name')}")

        # ------------------------------------------------------------
        # Test 11: GET /api/students/search — Search by query
        # ------------------------------------------------------------
        res = client.get('/api/students/search?query=Aarav')
        search_data = res.get_json()
        is_ok = res.status_code == 200 and search_data.get('total') >= 1
        record_test("11. GET /api/students/search?query=Aarav — Search by Name", is_ok, f"Status: {res.status_code}, Matches: {search_data.get('total')}")

        res_roll = client.get('/api/students/search?query=TEST-CS')
        search_roll_data = res_roll.get_json()
        is_ok_roll = res_roll.status_code == 200 and search_roll_data.get('total') >= 1
        record_test("11b. GET /api/students/search?query=TEST-CS — Search by Roll", is_ok_roll, f"Status: {res_roll.status_code}, Matches: {search_roll_data.get('total')}")

        # ------------------------------------------------------------
        # Test 12: PUT /api/students/<id> — Update Student
        # ------------------------------------------------------------
        update_payload = {
            "roll_number": "TEST-CS-999",
            "full_name": "Aarav Test Student (Honors)",
            "email": "aarav.test@college.edu",
            "department": "Computer Science",
            "semester": 4,
            "marks": 94.50
        }
        res = client.put(f'/api/students/{created_id}', json=update_payload)
        update_data = res.get_json()
        updated_student = update_data.get('student', {})
        is_ok = res.status_code == 200 and updated_student.get('marks') == 94.5 and updated_student.get('grade') == 'O'
        record_test("12. PUT /api/students/<id> — Update Record in MySQL", is_ok, f"Status: {res.status_code}, Updated Marks: {updated_student.get('marks')}, Grade: {updated_student.get('grade')}")

        # ------------------------------------------------------------
        # Test 13: GET /api/students/results — Academic Results Ledger
        # ------------------------------------------------------------
        res = client.get('/api/students/results')
        results_data = res.get_json()
        metrics = results_data.get('metrics', {})
        is_ok = res.status_code == 200 and metrics.get('total_candidates') >= 1 and metrics.get('distinction_count') >= 1
        record_test("13. GET /api/students/results — Computed Exam Ledger", is_ok, f"Status: {res.status_code}, Pass Rate: {metrics.get('pass_rate_percentage')}%, Dist: {metrics.get('distinction_count')}")

        # ------------------------------------------------------------
        # Test 14: GET /api/dashboard/stats — Aggregated Dashboard Metrics
        # ------------------------------------------------------------
        res = client.get('/api/dashboard/stats')
        stats_data = res.get_json()
        is_ok = res.status_code == 200 and stats_data.get('total_students') >= 1 and stats_data.get('average_marks') == 94.5
        record_test("14. GET /api/dashboard/stats — Aggregates from MySQL", is_ok, f"Status: {res.status_code}, Avg Marks: {stats_data.get('average_marks')}, Depts: {stats_data.get('department_distribution')}")

        # ------------------------------------------------------------
        # Test 15: Error handling: Nonexistent student ID
        # ------------------------------------------------------------
        res = client.get('/api/students/9999999')
        is_ok = res.status_code == 404
        record_test("15. GET /api/students/9999999 — Nonexistent ID 404", is_ok, f"Status: {res.status_code}")

        # ------------------------------------------------------------
        # Test 16: DELETE /api/students/<id> — Clean Up Test Record
        # ------------------------------------------------------------
        res = client.delete(f'/api/students/{created_id}')
        is_ok = res.status_code == 200
        record_test("16. DELETE /api/students/<id> — Delete Test Student", is_ok, f"Status: {res.status_code}, Msg: {res.get_json().get('message')}")

        # ------------------------------------------------------------
        # Test 17: Confirm Deletion (404)
        # ------------------------------------------------------------
        res = client.get(f'/api/students/{created_id}')
        is_ok = res.status_code == 404
        record_test("17. Verify Record Deleted from MySQL", is_ok, f"Status: {res.status_code} (Properly returned 404)")

        # ------------------------------------------------------------
        # Test 18: Confirm Clean Database State
        # ------------------------------------------------------------
        remaining = Student.query.count()
        is_ok = remaining == 0
        record_test("18. Verify 0 Residual Test Records in MySQL", is_ok, f"Remaining students in DB: {remaining}")

    print("=" * 70)
    passed_count = sum(1 for _, ok, _ in results if ok)
    total_tests = len(results)
    print(f"SUMMARY: {passed_count}/{total_tests} Tests Passed.")
    print("=" * 70)
    return passed_count == total_tests

if __name__ == '__main__':
    all_ok = run_all_tests()
    sys.exit(0 if all_ok else 1)
