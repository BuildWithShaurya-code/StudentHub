/**
 * Main.java
 *
 * StudentHub — Standalone Java OOP Demonstration
 *
 * This executable console application walks through all fundamental Object-Oriented
 * Programming (OOP) concepts using the StudentHub Student Management domain.
 *
 * Concepts Demonstrated:
 * 1. Classes and Objects
 * 2. Inheritance
 * 3. Encapsulation & Validation
 * 4. Abstraction (Interfaces & Abstract Classes)
 * 5. Runtime Polymorphism
 * 6. Composition and Collections (List/ArrayList)
 */
public class Main {

    public static void main(String[] args) {
        printHeader("STUDENTHUB — STANDALONE JAVA OOP DEMONSTRATION");
        System.out.println("Academic Mini-Project Demonstration Module");
        System.out.println("Domain: Student Management System (Educational Simulation)\n");

        // =====================================================================
        // 1. CLASSES AND OBJECTS
        // =====================================================================
        printSectionBanner("1. CLASSES AND OBJECTS");
        System.out.println("Concept: A Class is a blueprint; an Object is an instantiated entity in memory.\n");

        Student student1 = new Student("CS-2026-001", "Aarav Sharma", "aarav.sharma@college.edu", "Computer Science", 4, 91.50);
        Student student2 = new Student("CS-2026-002", "Diya Patel", "diya.patel@college.edu", "Computer Science", 4, 82.25);
        Student student3 = new Student("ME-2026-003", "Rohan Mehta", "rohan.mehta@college.edu", "Mechanical Eng", 6, 68.75);
        Student student4 = new Student("EC-2026-004", "Ananya Verma", "ananya.verma@college.edu", "Electronics & Comm", 2, 45.00);
        Student student5 = new Student("IT-2026-005", "Kabir Singh", "kabir.singh@college.edu", "Information Tech", 1, 34.00);

        System.out.println("Instantiated 5 Student objects successfully:");
        System.out.printf("  Created: %s%n", student1);
        System.out.printf("  Created: %s%n", student2);
        System.out.printf("  Created: %s%n", student3);
        System.out.printf("  Created: %s%n", student4);
        System.out.printf("  Created: %s%n", student5);

        // =====================================================================
        // 2. INHERITANCE (Student extends Person)
        // =====================================================================
        printSectionBanner("2. INHERITANCE (Student extends Person)");
        System.out.println("Concept: Child class (Student) inherits common fields (name, email) and methods from parent (Person).\n");

        System.out.println("Invoking inherited Person methods directly on Student objects:");
        System.out.printf("  student1.getName()  : %s%n", student1.getName());
        System.out.printf("  student1.getEmail() : %s%n", student1.getEmail());
        student1.displayContactInfo();
        student2.displayContactInfo();

        // =====================================================================
        // 3. ENCAPSULATION & DATA VALIDATION
        // =====================================================================
        printSectionBanner("3. ENCAPSULATION & DATA VALIDATION");
        System.out.println("Concept: Fields are private; access is controlled via getters and boundary-checked setters.\n");

        System.out.printf("  Current Marks for %s: %.2f%n", student1.getName(), student1.getMarks());
        System.out.println("  Updating marks validly to 95.00...");
        student1.setMarks(95.00);
        System.out.printf("  Updated Marks: %.2f%n", student1.getMarks());

        System.out.println("\n  Testing Defensive Validation (Attempting to set invalid marks: 115.00):");
        try {
            student1.setMarks(115.00);
            System.out.println("  [FAIL] Invalid marks were accepted!");
        } catch (IllegalArgumentException ex) {
            System.out.printf("  [CAUGHT EXPECTED EXCEPTION] %s%n", ex.getMessage());
        }

        System.out.println("\n  Testing Defensive Validation (Attempting to set invalid semester: 9):");
        try {
            student1.setSemester(9);
            System.out.println("  [FAIL] Invalid semester was accepted!");
        } catch (IllegalArgumentException ex) {
            System.out.printf("  [CAUGHT EXPECTED EXCEPTION] %s%n", ex.getMessage());
        }

        // =====================================================================
        // 4. COMPOSITION & COLLECTIONS (StudentManager)
        // =====================================================================
        printSectionBanner("4. COMPOSITION & COLLECTIONS (StudentManager)");
        System.out.println("Concept: StudentManager HAS-A collection (ArrayList<Student>) and enforces business logic.\n");

        StudentManager manager = new StudentManager();
        System.out.println("Enrolling students into StudentManager:");
        manager.addStudent(student1);
        manager.addStudent(student2);
        manager.addStudent(student3);
        manager.addStudent(student4);
        manager.addStudent(student5);

        System.out.println("\nTesting Duplicate Roll Number Prevention:");
        Student duplicateStudent = new Student("CS-2026-001", "Imposter Student", "imposter@college.edu", "Computer Science", 4, 75.0);
        manager.addStudent(duplicateStudent);

        // =====================================================================
        // 5. DISPLAYING ENROLLED STUDENTS
        // =====================================================================
        printSectionBanner("5. DISPLAYING ALL ENROLLED STUDENTS");
        manager.displayAllStudents();

        // =====================================================================
        // 6. SEARCHING BY ROLL NUMBER
        // =====================================================================
        printSectionBanner("6. SEARCHING RECORDS (StudentManager)");
        String searchRoll = "CS-2026-002";
        System.out.printf("Searching for student with Roll Number: '%s'...\n", searchRoll);
        Student found = manager.findByRollNumber(searchRoll);
        if (found != null) {
            System.out.println("  [FOUND RECORD MATCH]");
            found.displayAcademicDetails();
        } else {
            System.out.println("  [NOT FOUND] No record matching roll number.");
        }

        // =====================================================================
        // 7. ABSTRACTION & INTERFACE USAGE (GradingPolicy)
        // =====================================================================
        printSectionBanner("7. ABSTRACTION (GradingPolicy Interface)");
        System.out.println("Concept: GradingPolicy defines WHAT an evaluator does; StandardGradingPolicy defines HOW.\n");

        GradingPolicy gradingPolicy = new StandardGradingPolicy(); // Interface reference
        StandardGradingPolicy detailedPolicy = (StandardGradingPolicy) gradingPolicy;

        System.out.println("Grading Scale Demonstrations:");
        detailedPolicy.printEvaluationSummary(student1); // 95.00 -> O (Dean's List)
        System.out.println();
        detailedPolicy.printEvaluationSummary(student3); // 68.75 -> B+ (Satisfactory)
        System.out.println();
        detailedPolicy.printEvaluationSummary(student5); // 34.00 -> Fail (Academic Probation)

        // =====================================================================
        // 8. RUNTIME POLYMORPHISM
        // =====================================================================
        printSectionBanner("8. RUNTIME POLYMORPHISM");
        System.out.println("Concept: Dynamic method dispatch invokes child method through parent reference at runtime.\n");

        // A. Polymorphism via Parent Class Reference (Person -> Student)
        Person personReference = student1; // Parent reference pointing to child object
        System.out.println("A. Parent Class Reference (Person ref = new Student(...)):");
        System.out.printf("  personReference.getClass().getSimpleName() : %s%n", personReference.getClass().getSimpleName());
        System.out.printf("  personReference.getName()                  : %s%n", personReference.getName());
        System.out.printf("  personReference.getRole() [Dynamic Dispatch]: %s%n", personReference.getRole());

        // B. Polymorphism via Interface Reference (GradingPolicy -> StandardGradingPolicy)
        System.out.println("\nB. Interface Reference (GradingPolicy ref = new StandardGradingPolicy()):");
        double testScore = 84.50;
        System.out.printf("  Score: %.2f | Grade via Interface: %s | Standing: %s | Passing: %b%n",
            testScore,
            gradingPolicy.calculateGrade(testScore),
            gradingPolicy.getAcademicStanding(testScore),
            gradingPolicy.isPassing(testScore));

        // =====================================================================
        // 9. REMOVING A RECORD & DISPLAYING UPDATED REGISTRY
        // =====================================================================
        printSectionBanner("9. RECORD REMOVAL & REGISTRY UPDATE");
        String removeRoll = "ME-2026-003";
        System.out.printf("Removing student with Roll Number: '%s'...\n", removeRoll);
        manager.removeByRollNumber(removeRoll);

        System.out.println("\nRegistry after deletion:");
        manager.displayAllStudents();

        // =====================================================================
        // 10. CONCLUSION & VIVA SUMMARY
        // =====================================================================
        printSectionBanner("10. OOP PRINCIPLES SUMMARY");
        System.out.println("  [Classes & Objects] Instantiated concrete Student entities from class blueprints.");
        System.out.println("  [Encapsulation]     Data fields are private; state guarded by bounds checks.");
        System.out.println("  [Inheritance]       Student inherits personal identity (name, email) from Person.");
        System.out.println("  [Abstraction]       Grading contract declared via GradingPolicy interface.");
        System.out.println("  [Polymorphism]      Runtime method dispatch through Person and GradingPolicy references.");
        System.out.println("  [Composition]       StudentManager HAS-A ArrayList<Student> collection.");
        System.out.println("\n>>> Java OOP Demonstration Executed Successfully. <<<\n");
    }

    private static void printHeader(String title) {
        System.out.println("================================================================================");
        System.out.printf("  %s%n", title);
        System.out.println("================================================================================");
    }

    private static void printSectionBanner(String sectionTitle) {
        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.printf(">>> %s%n", sectionTitle);
        System.out.println("--------------------------------------------------------------------------------");
    }
}
