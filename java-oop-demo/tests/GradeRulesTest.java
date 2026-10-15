public class GradeRulesTest {
    public static void main(String[] args) {
        StandardGradingPolicy policy = new StandardGradingPolicy();
        double[] marks = {0, 39.99, 40, 50, 60, 70, 80, 90, 100};
        String[] grades = {"Fail", "Fail", "Pass", "B", "B+", "A", "A+", "O", "O"};
        for (int i=0; i<marks.length; i++) {
            if (!policy.calculateGrade(marks[i]).equals(grades[i])) throw new AssertionError("Grade mismatch");
            String standing = marks[i]>=80 ? "Dean's List" : marks[i]>=40 ? "Good Standing" : "Academic Warning";
            if (!policy.getAcademicStanding(marks[i]).equals(standing)) throw new AssertionError("Standing mismatch");
        }
        for (double invalid : new double[]{Double.NaN, Double.POSITIVE_INFINITY, -1, 101}) {
            boolean gradeRejected=false, studentRejected=false;
            try { policy.calculateGrade(invalid); } catch (IllegalArgumentException expected) { gradeRejected=true; }
            try { new Student("TEST", "Synthetic Student", "test@example.invalid", "Computer Science", 4, invalid); }
            catch (IllegalArgumentException expected) { studentRejected=true; }
            if (!gradeRejected || !studentRejected) throw new AssertionError("Invalid marks accepted");
        }
        System.out.println("PASS: 9 grade/standing boundaries and 4 invalid marks cases");
    }
}
