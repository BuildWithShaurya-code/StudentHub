from extensions import db
from sqlalchemy.dialects.mysql import BIGINT
from services.academic_service import student_to_dict

class Student(db.Model):
    """
    SQLAlchemy model representing the existing 'students' table in MySQL studenthub_db.
    """
    __tablename__ = 'students'

    id = db.Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    roll_number = db.Column(db.String(30), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(100), nullable=False, index=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    department = db.Column(db.String(100), nullable=False, index=True)
    semester = db.Column(db.Integer, nullable=False)
    marks = db.Column(db.Numeric(5, 2), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=False, server_default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def to_dict(self) -> dict:
        return student_to_dict(self)

    def __repr__(self) -> str:
        return f"<Student id={self.id} roll_number='{self.roll_number}' name='{self.full_name}'>"
