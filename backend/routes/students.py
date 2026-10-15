from flask import Blueprint, request, jsonify, abort
from sqlalchemy import or_, func
from datetime import datetime
from extensions import db
from models.student import Student
from validators.student_validator import validate_student_payload, parse_semester
from services.academic_service import (
    PASSING_MARK,
    DISTINCTION_MARK
)

students_bp = Blueprint('students', __name__)

# ============================================================
# A. List Students (with search, department, semester filters & pagination)
# ============================================================
@students_bp.route('/students', methods=['GET'])
def get_students():
    """
    GET /api/students
    Retrieves students from MySQL with optional filtering and pagination.
    Query params:
      - search: string (matches name or roll_number)
      - department: string (department filter)
      - semester: int or string (e.g. 4 or 'Semester 4')
      - page: int (default: 1)
      - page_size: int (default: 50)
    """
    query = Student.query
    exact_roll = request.args.get('roll_number', '').strip()
    if exact_roll:
        query = query.filter(Student.roll_number == exact_roll)

    # 1. Search filter (name or roll number)
    search_term = request.args.get('search', '').strip()
    if search_term:
        like_pattern = f"%{search_term}%"
        query = query.filter(
            or_(
                Student.full_name.ilike(like_pattern),
                Student.roll_number.ilike(like_pattern)
            )
        )

    # 2. Department filter
    dept = request.args.get('department', '').strip()
    if dept and dept.lower() not in ('all', 'all departments'):
        query = query.filter(Student.department == dept)

    # 3. Semester filter
    sem = request.args.get('semester', '').strip()
    if sem and sem.lower() not in ('all', 'all semesters'):
        try:
            sem_int = parse_semester(sem)
        except ValueError:
            abort(400, description='Semester must be an integer between 1 and 8.')
        query = query.filter(Student.semester == sem_int)

    # 4. Sorting by ID / creation date descending
    query = query.order_by(Student.id.desc())

    # 5. Pagination
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('page_size', default=50, type=int)
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 50
    page_size = min(page_size, 1000)

    total_count = query.count()
    paginated_students = query.offset((page - 1) * page_size).limit(page_size).all()
    student_list = [s.to_dict() for s in paginated_students]

    total_pages = max(1, (total_count + page_size - 1) // page_size) if total_count > 0 else 1

    return jsonify({
        "status": "success",
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "students": student_list
    }), 200

# ============================================================
# B. Search Students
# ============================================================
@students_bp.route('/students/search', methods=['GET'])
def search_students():
    """
    GET /api/students/search?query=value
    Case-insensitive partial search by full_name or roll_number.
    """
    search_query = request.args.get('query', '').strip()
    if not search_query:
        return jsonify({
            "status": "success",
            "message": "Query parameter is empty. No search performed.",
            "total": 0,
            "students": []
        }), 200

    like_term = f"%{search_query}%"
    matches = Student.query.filter(
        or_(
            Student.full_name.ilike(like_term),
            Student.roll_number.ilike(like_term)
        )
    ).order_by(Student.id.desc()).all()

    return jsonify({
        "status": "success",
        "query": search_query,
        "total": len(matches),
        "students": [s.to_dict() for s in matches]
    }), 200

# ============================================================
# C. Academic Results & Grades Ledger
# ============================================================
@students_bp.route('/students/results', methods=['GET'])
def get_results():
    """
    GET /api/students/results
    Returns all students with backend-computed grades, standings, and exam metrics.
    """
    all_students = Student.query.order_by(Student.marks.desc()).all()
    student_records = [s.to_dict() for s in all_students]

    total = len(student_records)
    passed = sum(1 for s in student_records if s['is_passed'])
    distinction = sum(1 for s in student_records if s['marks'] >= DISTINCTION_MARK)
    backlogs = total - passed
    pass_rate = round((passed / total * 100.0), 1) if total > 0 else 0.0

    return jsonify({
        "status": "success",
        "metrics": {
            "total_candidates": total,
            "passed_count": passed,
            "distinction_count": distinction,
            "backlog_count": backlogs,
            "pass_rate_percentage": pass_rate,
            "passing_mark_threshold": PASSING_MARK,
            "distinction_threshold": DISTINCTION_MARK
        },
        "results": student_records
    }), 200

# ============================================================
# D. Dashboard Statistics
# ============================================================
@students_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """
    GET /api/dashboard/stats
    Calculates aggregated statistics directly from MySQL records.
    """
    total_students = Student.query.count()

    if total_students == 0:
        return jsonify({
            "status": "success",
            "total_students": 0,
            "average_marks": 0.0,
            "pass_rate": 0.0,
            "departments_count": 0,
            "department_distribution": {},
            "registrations_this_month": 0,
            "recent_students": []
        }), 200

    # 1. Average Marks
    avg_res = db.session.query(func.avg(Student.marks)).scalar()
    average_marks = round(float(avg_res or 0.0), 1)

    # 2. Pass Rate
    pass_count = Student.query.filter(Student.marks >= PASSING_MARK).count()
    pass_rate = round((pass_count / total_students) * 100.0, 1)

    distinction_count = Student.query.filter(Student.marks >= DISTINCTION_MARK).count()

    # 3. Department Distribution
    dept_counts = (
        db.session.query(Student.department, func.count(Student.id))
        .group_by(Student.department)
        .all()
    )
    dept_dist = {dept: count for dept, count in dept_counts}

    # 4. Registrations this month
    now = datetime.now()
    month_registrations = (
        Student.query.filter(
            func.year(Student.created_at) == now.year,
            func.month(Student.created_at) == now.month
        ).count()
    )

    # 5. Latest 5 registrations
    recent = Student.query.order_by(Student.id.desc()).limit(5).all()

    return jsonify({
        "status": "success",
        "total_students": total_students,
        "average_marks": average_marks,
        "pass_rate": pass_rate,
        "distinction_rate": round(distinction_count / total_students * 100, 1),
        "standard_pass_rate": round((pass_count - distinction_count) / total_students * 100, 1),
        "backlog_rate": round((total_students - pass_count) / total_students * 100, 1),
        "departments_count": len(dept_dist),
        "department_distribution": dept_dist,
        "registrations_this_month": month_registrations,
        "recent_students": [s.to_dict() for s in recent]
    }), 200

# ============================================================
# E. Retrieve One Student (by numeric ID or roll number)
# ============================================================
@students_bp.route('/students/<student_identifier>', methods=['GET'])
def get_student(student_identifier):
    """
    GET /api/students/<student_identifier>
    Fetches student by database ID or unique roll number.
    Returns 404 if not found.
    """
    student = None
    # Check if numeric ID
    if str(student_identifier).isdigit():
        student = db.session.get(Student, int(student_identifier))

    # Numeric identifiers always mean primary IDs. Roll checks use an explicit query.
    if not str(student_identifier).isdigit():
        student = Student.query.filter(Student.roll_number == str(student_identifier).strip()).first()

    if not student:
        return jsonify({
            "error": "Student not found",
            "message": f"No student record found with identifier '{student_identifier}'."
        }), 404

    return jsonify({
        "status": "success",
        "student": student.to_dict()
    }), 200

# ============================================================
# F. Add a New Student
# ============================================================
@students_bp.route('/students', methods=['POST'])
def create_student():
    """
    POST /api/students
    Creates a new student record in MySQL.
    """
    payload = request.get_json(silent=True) or {}
    is_valid, cleaned, error_msg, http_code = validate_student_payload(payload)

    if not is_valid:
        return jsonify({"error": "Validation failed", "message": error_msg}), http_code

    new_student = Student(
        roll_number=cleaned['roll_number'],
        full_name=cleaned['full_name'],
        email=cleaned['email'],
        department=cleaned['department'],
        semester=cleaned['semester'],
        marks=cleaned['marks']
    )
    db.session.add(new_student)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Student record created successfully.",
        "student": new_student.to_dict()
    }), 201

# ============================================================
# G. Update a Student
# ============================================================
@students_bp.route('/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    """
    PUT /api/students/<int:student_id>
    Updates an existing student in MySQL.
    """
    student = db.session.get(Student, student_id)
    if not student:
        return jsonify({
            "error": "Student not found",
            "message": f"Cannot update. No student found with ID {student_id}."
        }), 404

    payload = request.get_json(silent=True) or {}
    is_valid, cleaned, error_msg, http_code = validate_student_payload(
        payload,
        exclude_student_id=student_id
    )

    if not is_valid:
        return jsonify({"error": "Validation failed", "message": error_msg}), http_code

    student.roll_number = cleaned['roll_number']
    student.full_name = cleaned['full_name']
    student.email = cleaned['email']
    student.department = cleaned['department']
    student.semester = cleaned['semester']
    student.marks = cleaned['marks']

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Student record updated successfully.",
        "student": student.to_dict()
    }), 200

# ============================================================
# H. Delete a Student
# ============================================================
@students_bp.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """
    DELETE /api/students/<int:student_id>
    Deletes the requested student record from MySQL.
    """
    student = db.session.get(Student, student_id)
    if not student:
        return jsonify({
            "error": "Student not found",
            "message": f"Cannot delete. No student found with ID {student_id}."
        }), 404

    deleted_id = student.id
    deleted_roll = student.roll_number
    deleted_name = student.full_name

    db.session.delete(student)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": f"Student '{deleted_name}' ({deleted_roll}) deleted successfully.",
        "id": deleted_id
    }), 200
