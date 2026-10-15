/**
 * StandardGradingPolicy.java
 *
 * Demonstrates:
 * 1. ABSTRACTION IMPLEMENTATION: Implements the GradingPolicy contract.
 * 2. POLYMORPHISM: Can be referenced via the GradingPolicy interface.
 *
 * NOTE: The grading scale defined herein represents an illustrative sample scale
 * for academic demonstration purposes, matching the scale used in the Python Flask backend.
 * It is not an official statutory university regulation.
 */
public class StandardGradingPolicy implements GradingPolicy {

    /**
     * Computes the letter grade based on marks (0.00 - 100.00).
     */
    @Override
    public String calculateGrade(double marks) {
        validateMarks(marks);

        if (marks >= 90.0) {
            return "O";     // Outstanding
        } else if (marks >= 80.0) {
            return "A+";    // Excellent
        } else if (marks >= 70.0) {
            return "A";     // Very Good
        } else if (marks >= 60.0) {
            return "B+";    // Good
        } else if (marks >= 50.0) {
            return "B";     // Above Average
        } else if (marks >= 40.0) {
            return "Pass";  // Passing grade
        } else {
            return "Fail";  // Unsatisfactory
        }
    }

    /**
     * Returns academic standing commentary based on performance tiers.
     */
    @Override
    public String getAcademicStanding(double marks) {
        validateMarks(marks);

        if (marks >= 80.0) return "Dean's List";
        if (marks >= 40.0) return "Good Standing";
        return "Academic Warning";
    }

    /**
     * Determines passing status (minimum pass threshold: 40.00 marks).
     */
    @Override
    public boolean isPassing(double marks) {
        validateMarks(marks);
        return marks >= 40.0;
    }

    /**
     * Defensive validation helper ensuring score is within logical boundaries.
     */
    private void validateMarks(double marks) {
        if (!Double.isFinite(marks) || marks < 0.0 || marks > 100.0) {
            throw new IllegalArgumentException(
                String.format("Invalid marks: %.2f. Marks must be between 0.00 and 100.00.", marks)
            );
        }
    }

    /**
     * Educational helper method explaining the differences between Marks, Percentage, Grade, and Status.
     */
    public void printEvaluationSummary(Student student) {
        double m = student.getMarks();
        String grade = calculateGrade(m);
        String standing = getAcademicStanding(m);
        boolean passed = isPassing(m);

        System.out.printf("  Evaluation for %s (%s):%n", student.getName(), student.getRollNumber());
        System.out.printf("    - Raw Marks       : %.2f / 100.00%n", m);
        System.out.printf("    - Percentage      : %.2f%%%n", m);
        System.out.printf("    - Letter Grade    : %s%n", grade);
        System.out.printf("    - Academic Status : %s (%s)%n", (passed ? "PASS" : "FAIL"), standing);
    }
}
