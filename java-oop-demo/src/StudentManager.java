import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * StudentManager.java
 *
 * Demonstrates: COMPOSITION / AGGREGATION & COLLECTIONS
 *
 * This class demonstrates the "HAS-A" relationship:
 * A StudentManager "HAS-A" collection of Student objects (List<Student>).
 *
 * It manages student lifecycle operations (add, search, list, remove)
 * and enforces business invariants such as roll number uniqueness.
 */
public class StudentManager {

    // Composition: StudentManager owns and encapsulates a List collection of Student objects
    private final List<Student> students;

    /**
     * Default Constructor
     * Initializes the internal ArrayList storage.
     */
    public StudentManager() {
        this.students = new ArrayList<>();
    }

    /**
     * Adds a student to the collection, rejecting duplicates based on roll number.
     *
     * @param student The Student object to add
     * @return true if added successfully, false if roll number already exists
     */
    public boolean addStudent(Student student) {
        if (student == null) {
            System.out.println("  [ERROR] Cannot add a null student reference.");
            return false;
        }

        // Check for duplicate roll number (case-insensitive)
        if (findByRollNumber(student.getRollNumber()) != null) {
            System.out.printf("  [REJECTED] Duplicate Roll Number '%s'. Student '%s' was NOT added.%n",
                student.getRollNumber(), student.getName());
            return false;
        }

        students.add(student);
        System.out.printf("  [SUCCESS] Enrolled student '%s' (Roll: %s) into registry.%n",
            student.getName(), student.getRollNumber());
        return true;
    }

    /**
     * Finds a student by roll number.
     *
     * @param rollNumber The roll number to look up
     * @return The Student object if found, or null otherwise
     */
    public Student findByRollNumber(String rollNumber) {
        if (rollNumber == null || rollNumber.trim().isEmpty()) {
            return null;
        }
        for (Student s : students) {
            if (s.getRollNumber().equalsIgnoreCase(rollNumber.trim())) {
                return s;
            }
        }
        return null;
    }

    /**
     * Removes a student by roll number.
     *
     * @param rollNumber The roll number of the student to remove
     * @return true if found and removed, false if not found
     */
    public boolean removeByRollNumber(String rollNumber) {
        if (rollNumber == null || rollNumber.trim().isEmpty()) {
            return false;
        }
        for (int i = 0; i < students.size(); i++) {
            if (students.get(i).getRollNumber().equalsIgnoreCase(rollNumber.trim())) {
                Student removed = students.remove(i);
                System.out.printf("  [DELETED] Removed student '%s' (Roll: %s) from registry.%n",
                    removed.getName(), removed.getRollNumber());
                return true;
            }
        }
        System.out.printf("  [NOT FOUND] No student found with Roll Number '%s' to delete.%n", rollNumber);
        return false;
    }

    /**
     * Displays all students currently enrolled in the collection.
     */
    public void displayAllStudents() {
        if (students.isEmpty()) {
            System.out.println("  [INFO] Registry is empty. No students enrolled.");
            return;
        }

        System.out.println("  -------------------------------------------------------------------------------------------------");
        System.out.printf("  | %-4s | %-12s | %-20s | %-20s | %-4s | %-7s |%n",
            "#", "Roll No", "Full Name", "Department", "Sem", "Marks");
        System.out.println("  -------------------------------------------------------------------------------------------------");

        int index = 1;
        for (Student s : students) {
            System.out.printf("  | %-4d | %-12s | %-20s | %-20s | %-4d | %6.2f  |%n",
                index++, s.getRollNumber(), s.getName(), s.getDepartment(), s.getSemester(), s.getMarks());
        }
        System.out.println("  -------------------------------------------------------------------------------------------------");
        System.out.printf("  Total Students: %d%n", students.size());
    }

    /**
     * Returns an unmodifiable view of the student list to protect encapsulation.
     */
    public List<Student> getStudents() {
        return Collections.unmodifiableList(students);
    }

    /**
     * Returns the total count of enrolled students.
     */
    public int getStudentCount() {
        return students.size();
    }
}
