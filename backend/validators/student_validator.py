import re
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from models.student import Student

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


def parse_semester(value):
    if isinstance(value, bool):
        raise ValueError('Invalid semester')
    if isinstance(value, int):
        semester = value
    elif isinstance(value, str) and re.fullmatch(r'(?:Semester )?[1-8]', value.strip()):
        semester = int(value.strip().split()[-1])
    else:
        raise ValueError('Invalid semester')
    if not 1 <= semester <= 8:
        raise ValueError('Invalid semester')
    return semester


def validate_student_payload(data, exclude_student_id=None):
    def invalid(message, status=400):
        return False, None, message, status

    if not isinstance(data, dict):
        return invalid('Invalid request payload. Expected JSON object.')
    cleaned = {}
    fields = [('roll_number', 'rollNumber', 30), ('full_name', 'name', 100),
              ('email', 'email', 150), ('department', 'department', 100)]
    for field, alias, maximum in fields:
        value = data.get(field, data.get(alias))
        if not isinstance(value, str) or not value.strip():
            return invalid(f'{field} is required and must be a nonempty string.')
        value = value.strip()
        if len(value) > maximum:
            return invalid(f'{field} must not exceed {maximum} characters.')
        cleaned[field] = value
    if not EMAIL_REGEX.fullmatch(cleaned['email']):
        return invalid('Invalid email format. Please provide a valid email address.')
    try:
        cleaned['semester'] = parse_semester(data.get('semester'))
    except ValueError:
        return invalid('Semester must be an integer between 1 and 8.')
    try:
        raw = data.get('marks')
        if isinstance(raw, (bool, dict, list)) or raw is None:
            raise InvalidOperation
        marks = Decimal(str(raw))
        if not marks.is_finite() or not 0 <= marks <= 100:
            return invalid('Marks must be a finite number between 0.00 and 100.00.')
        cleaned['marks'] = marks.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    except (InvalidOperation, ValueError, TypeError):
        return invalid('Marks must be a valid numeric value.')

    for field, label in [('roll_number', 'Roll number'), ('email', 'Email')]:
        query = Student.query.filter(getattr(Student, field) == cleaned[field])
        if exclude_student_id is not None:
            query = query.filter(Student.id != exclude_student_id)
        if query.first():
            return invalid(f'{label} is already registered to another student.', 409)
    return True, cleaned, None, 200
