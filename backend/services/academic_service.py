from datetime import datetime
import re

PASSING_MARK = 40.0
DISTINCTION_MARK = 80.0

def calculate_grade(marks: float) -> str:
    """
    Standard college grading scale:
    90-100: O (Outstanding)
    80-89.99: A+ (Excellent)
    70-79.99: A (Very Good)
    60-69.99: B+ (Good)
    50-59.99: B (Above Average)
    40-49.99: Pass
    < 40: Fail
    """
    m = float(marks or 0.0)
    if m >= 90.0:
        return 'O'
    elif m >= 80.0:
        return 'A+'
    elif m >= 70.0:
        return 'A'
    elif m >= 60.0:
        return 'B+'
    elif m >= 50.0:
        return 'B'
    elif m >= 40.0:
        return 'Pass'
    else:
        return 'Fail'


def calculate_standing(marks: float) -> str:
    """Computes academic standing based on marks."""
    m = float(marks or 0.0)
    if m >= DISTINCTION_MARK:
        return "Dean's List"
    elif m >= PASSING_MARK:
        return "Good Standing"
    else:
        return "Academic Warning"


def calculate_result_status(marks: float) -> str:
    """Categorizes examination result."""
    m = float(marks or 0.0)
    if m >= DISTINCTION_MARK:
        return "Passed - Distinction"
    elif m >= PASSING_MARK:
        return "Passed"
    else:
        return "Fail / Backlog"


def parse_semester_int(sem_val) -> int:
    """Parses semester integer from integer, string (e.g. 'Semester 4' or '4')."""
    if isinstance(sem_val, int):
        return sem_val
    if isinstance(sem_val, (float, str)):
        digits = re.sub(r'[^0-9]', '', str(sem_val))
        if digits:
            return int(digits)
    return 1


def format_registered_date(created_at) -> str:
    """Formats datetime object to standard 'Month DD, YYYY' format."""
    if not created_at:
        return datetime.now().strftime("%b %d, %Y")
    if isinstance(created_at, datetime):
        return created_at.strftime("%b %d, %Y")
    return str(created_at)


def student_to_dict(student) -> dict:
    """
    Serializes a Student model to a rich dictionary satisfying:
    1. REST API specification (snake_case column names)
    2. Frontend UI data contract (camelCase aliases, calculated academic standings)
    """
    marks_val = float(student.marks) if student.marks is not None else 0.0
    sem_int = int(student.semester) if student.semester is not None else 1
    grade_val = calculate_grade(marks_val)
    standing_val = calculate_standing(marks_val)
    result_val = calculate_result_status(marks_val)
    reg_date = format_registered_date(student.created_at)

    return {
        # Primary Database Fields
        "id": student.id,
        "roll_number": student.roll_number,
        "full_name": student.full_name,
        "email": student.email,
        "department": student.department,
        "semester": f"Semester {sem_int}",
        "semester_int": sem_int,
        "semester_number": sem_int,
        "marks": round(marks_val, 2),
        "created_at": student.created_at.isoformat() if getattr(student, 'created_at', None) else None,
        "updated_at": student.updated_at.isoformat() if getattr(student, 'updated_at', None) else None,

        # Academic Calculations
        "percentage": round(marks_val, 2),
        "grade": grade_val,
        "standing": standing_val,
        "result_status": result_val,
        "is_passed": marks_val >= PASSING_MARK,

        # Frontend Compatibility Aliases
        "name": student.full_name,
        "rollNumber": student.roll_number,
        "semesterFormatted": f"Semester {sem_int}",
        # The current schema does not store these optional profile details.
        "batch": "Not recorded",
        "registeredDate": reg_date,
        "enrollmentStatus": "ACTIVE",
        "degreeTrack": "Not recorded",
        "admissionDate": "Not recorded",
        "advisor": "Not recorded",
        "phone": "",
        "coursework": []
    }
