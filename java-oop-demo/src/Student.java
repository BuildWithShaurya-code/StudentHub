/**
 * Student.java
 *
 * Demonstrates:
 * 1. INHERITANCE: Extends the abstract Person class ("Student IS-A Person").
 * 2. ENCAPSULATION: Private fields, guarded accessors, and boundary-checked mutators.
 * 3. RUNTIME POLYMORPHISM: Overrides getRole() and toString() from Person and Object.
 */
public class Student extends Person {

    // Encapsulated student-specific fields
    private final String rollNumber; // Unique academic identifier (immutable once created)
    private String department;
    private int semester;            // Validated range: 1 through 8
    private double marks;            // Validated range: 0.00 through 100.00

    /**
     * Parameterized Constructor
     * Uses super(name, email) to initialize inherited Person fields,
     * and performs defensive validation on student-specific fields.
     */
    public Student(String rollNumber, String name, String email, String department, int semester, double marks) {
        super(name, email); // Initialize parent (Person) attributes

        if (rollNumber == null || rollNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Roll number cannot be null or empty.");
        }
        if (department == null || department.trim().isEmpty()) {
            throw new IllegalArgumentException("Department cannot be null or empty.");
        }

        this.rollNumber = rollNumber.trim();
        this.department = department.trim();

        // Use encapsulated setters to enforce validation rules
        setSemester(semester);
        setMarks(marks);
    }

    // Getters (Read-only access to encapsulated state)
    public String getRollNumber() {
        return rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    public int getSemester() {
        return semester;
    }

    public double getMarks() {
        return marks;
    }

    // Controlled Mutators / Setters with validation

    /**
     * Updates student marks with boundary validation (0.00 - 100.00).
     * Prevents invalid states such as negative marks or marks exceeding 100.
     */
    public void setMarks(double marks) {
        if (!Double.isFinite(marks) || marks < 0.0 || marks > 100.0) {
            throw new IllegalArgumentException(
                String.format("Invalid marks: %.2f. Marks must be between 0.00 and 100.00.", marks)
            );
        }
        this.marks = marks;
    }

    /**
     * Updates student semester with boundary validation (1 - 8).
     * Typical undergraduate collegiate engineering programs have 8 semesters.
     */
    public void setSemester(int semester) {
        if (semester < 1 || semester > 8) {
            throw new IllegalArgumentException(
                String.format("Invalid semester: %d. Semester must be between 1 and 8.", semester)
            );
        }
        this.semester = semester;
    }

    public void setDepartment(String department) {
        if (department == null || department.trim().isEmpty()) {
            throw new IllegalArgumentException("Department cannot be null or empty.");
        }
        this.department = department.trim();
    }

    /**
     * Implementation of abstract method from Person.
     * Demonstrates RUNTIME POLYMORPHISM when invoked via a Person reference.
     */
    @Override
    public String getRole() {
        return "Student";
    }

    /**
     * Displays complete academic profile including inherited and class-specific attributes.
     */
    public void displayAcademicDetails() {
        System.out.printf("  [Student Profile] Roll: %-12s | Name: %-18s | Dept: %-18s | Sem: %d | Marks: %6.2f%n",
            rollNumber, getName(), department, semester, marks);
    }

    /**
     * Overrides java.lang.Object.toString() for readable logging and debugging.
     */
    @Override
    public String toString() {
        return String.format("Student[roll='%s', name='%s', email='%s', dept='%s', sem=%d, marks=%.2f]",
            rollNumber, getName(), getEmail(), department, semester, marks);
    }
}
