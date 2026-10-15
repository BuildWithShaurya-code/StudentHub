/**
 * GradingPolicy.java
 *
 * Demonstrates: ABSTRACTION (Interfaces)
 *
 * This interface defines the contract for academic evaluation.
 * It specifies WHAT operations any grading policy must support, without
 * dictating HOW those grades are computed.
 *
 * This decouples student business logic from specific grading rubrics, allowing
 * different institutions or programs to implement different evaluation algorithms.
 */
public interface GradingPolicy {

    /**
     * Computes the letter grade corresponding to raw percentage marks.
     *
     * @param marks Numeric score (0.00 to 100.00)
     * @return Letter grade (e.g., "O", "A+", "A", "B", "Pass", "Fail")
     */
    String calculateGrade(double marks);

    /**
     * Determines the qualitative academic standing of the student.
     *
     * @param marks Numeric score (0.00 to 100.00)
     * @return Standing label (e.g., "Dean's List", "Good Standing", "Academic Probation")
     */
    String getAcademicStanding(double marks);

    /**
     * Determines whether the score meets minimum promotion/passing thresholds.
     *
     * @param marks Numeric score (0.00 to 100.00)
     * @return true if the student passes, false otherwise
     */
    boolean isPassing(double marks);
}
