# StudentHub — Standalone Java OOP Demonstration Module

This directory contains a standalone, beginner-friendly Java console application developed to demonstrate fundamental **Object-Oriented Programming (OOP)** principles for university computer science evaluations and oral viva examinations.

---

## 1. Architectural Role: Standalone Demonstration vs. Full-Stack Web App

> [!IMPORTANT]
> **Separation of Concerns**:
> The actual production **StudentHub** web application runs on:
> - **Frontend**: Google Stitch React 19 + TypeScript + Tailwind CSS (Vite) on port `3000`.
> - **Backend**: Python Flask REST API on port `5001`.
> - **Database**: Local MySQL Community Server on port `3306`.
>
> This Java module is **strictly educational and standalone**. It does **not** connect directly to the MySQL database, does not alter the Flask backend, and requires no web servers or external libraries. It demonstrates core OOP patterns purely in memory using standard Java collections.

---

## 2. Prerequisites

- **Operating System**: macOS (Apple Silicon `arm64` or Intel `x86_64`), Linux, or Windows.
- **Java Development Kit (JDK)**: Standard JDK 17 or 21 LTS (e.g., Amazon Corretto 21, Eclipse Temurin 21).
- **Verification Command**:
  ```bash
  java -version
  javac -version
  ```

---

## 3. Project File Structure

```
java-oop-demo/
├── src/
│   ├── Person.java                 # Abstract parent class (Inheritance & Abstraction)
│   ├── Student.java                # Child class extending Person (Encapsulation & Validation)
│   ├── GradingPolicy.java          # Interface defining evaluation contract (Abstraction)
│   ├── StandardGradingPolicy.java  # Concrete grading implementation
│   ├── StudentManager.java         # Manager demonstrating Composition & Collections
│   └── Main.java                   # Interactive driver demonstrating all 10 steps
├── bin/                            # Compiled Java bytecode (.class files)
└── README.md                       # Comprehensive guide and viva reference
```

---

## 4. Class-by-Class Explanation

### 1. `Person.java` (Abstract Class)
- **Role**: Serves as the base superclass representing any human entity within an academic institution.
- **Key Fields**: `private String name`, `private String email`.
- **Constructor**: Guarded constructor initializing `name` and `email` with basic validation.
- **Abstract Method**: `public abstract String getRole();` — Forces all subclasses to declare their specific institutional designation.
- **Shared Method**: `public void displayContactInfo()` — Reusable across any subclass.

### 2. `Student.java` (Concrete Subclass)
- **Role**: Represents an enrolled student entity.
- **Inheritance**: `public class Student extends Person` ("Student IS-A Person").
- **Encapsulated Fields**:
  - `private final String rollNumber;` (Immutable unique key)
  - `private String department;`
  - `private int semester;` (Validated bounds: `1` to `8`)
  - `private double marks;` (Validated bounds: `0.00` to `100.00`)
- **Defensive Setters**: `setMarks(double)` and `setSemester(int)` throw `IllegalArgumentException` if values are out of bounds.
- **Runtime Polymorphism**: Overrides `getRole()` to return `"Student"` and overrides `toString()` for clean formatted inspection.

### 3. `GradingPolicy.java` (Interface)
- **Role**: Defines the abstract contract for evaluating student performance.
- **Methods**:
  - `String calculateGrade(double marks);`
  - `String getAcademicStanding(double marks);`
  - `boolean isPassing(double marks);`
- **Design Principle**: Separates the **contract** (WHAT operations exist) from the **implementation** (HOW grades are calculated).

### 4. `StandardGradingPolicy.java` (Interface Implementation)
- **Role**: Implements the `GradingPolicy` contract using a standardized collegiate grade scale.
- **Grade Scale (Illustrative Sample)**:
  - $Marks \ge 90.00$: Grade **O** (Outstanding) | Standing: *Dean's List*
  - $80.00 \le Marks < 90.00$: Grade **A+** (Excellent) | Standing: *Good Standing*
  - $70.00 \le Marks < 80.00$: Grade **A** (Very Good) | Standing: *Good Standing*
  - $60.00 \le Marks < 70.00$: Grade **B+** (Good) | Standing: *Satisfactory*
  - $50.00 \le Marks < 60.00$: Grade **B** (Above Average) | Standing: *Satisfactory*
  - $40.00 \le Marks < 50.00$: Grade **Pass** | Standing: *Needs Improvement*
  - $Marks < 40.00$: Grade **Fail** | Standing: *Academic Probation*
- **Key Method**: `printEvaluationSummary(Student)` explains the difference between raw marks, percentage, letter grade, and pass/fail standing.

### 5. `StudentManager.java` (Composition & Collection Management)
- **Role**: Represents the academic registry.
- **Composition ("HAS-A")**: Encapsulates a `List<Student> students = new ArrayList<>()`.
- **Operations**:
  - `addStudent(Student)`: Enforces business logic by rejecting duplicate roll numbers.
  - `findByRollNumber(String)`: Case-insensitive search returning matching `Student`.
  - `removeByRollNumber(String)`: Removes student record by roll number.
  - `displayAllStudents()`: Formats student records into a clean CLI table.

### 6. `Main.java` (Demonstration Driver)
- **Role**: Execution entry point walking through 10 distinct demonstration steps with clear console banners.

---

## 5. OOP Concepts Mapping Table (Viva Reference)

| OOP Concept | Java Class | Relevant Code / Method | Viva Explanation |
| :--- | :--- | :--- | :--- |
| **Classes & Objects** | `Student`, `Main` | `new Student("CS-2026-001", "Aarav Sharma", ...)` | A class is a blueprint; an object is a distinct runtime instance stored in heap memory. |
| **Encapsulation** | `Student` | `private double marks;` + `setMarks(double marks)` | Restricting direct variable access and validating data through public getters/setters prevents invalid object states (e.g., negative marks). |
| **Inheritance** | `Person`, `Student` | `public class Student extends Person` | Code reusability where child class inherits `name`, `email`, and `displayContactInfo()` from the parent class ("IS-A" relationship). |
| **Abstraction** | `GradingPolicy`, `Person` | `public interface GradingPolicy` and `abstract class Person` | Hides implementation details and declares abstract contracts without specifying internal algorithms. |
| **Polymorphism (Runtime)** | `Main`, `Person`, `Student` | `Person p = student; p.getRole();` | Dynamic method dispatch: calling an overridden method through a superclass reference executes the child's implementation at runtime. |
| **Composition & Collections** | `StudentManager` | `private final List<Student> students = new ArrayList<>();` | "HAS-A" relationship where a container object holds and coordinates a collection of other objects. |

---

## 6. How to Compile and Run on macOS

Open Terminal and navigate to the project directory:

```bash
cd StudentHub
```

### Step 1: Compile all Java source files
```bash
# Create bin directory if not present
mkdir -p java-oop-demo/bin

# Compile all source files into bin/
javac -d java-oop-demo/bin java-oop-demo/src/*.java
```

### Step 2: Run the demonstration
```bash
# Execute Main class from the bin classpath
java -cp java-oop-demo/bin Main
```

---

## 7. Verified Sample Console Output

```
================================================================================
  STUDENTHUB — STANDALONE JAVA OOP DEMONSTRATION
================================================================================
Academic Mini-Project Demonstration Module
Domain: Student Management System (Educational Simulation)


--------------------------------------------------------------------------------
>>> 1. CLASSES AND OBJECTS
--------------------------------------------------------------------------------
Concept: A Class is a blueprint; an Object is an instantiated entity in memory.

Instantiated 5 Student objects successfully:
  Created: Student[roll='CS-2026-001', name='Aarav Sharma', email='aarav.sharma@college.edu', dept='Computer Science', sem=4, marks=91.50]
  Created: Student[roll='CS-2026-002', name='Diya Patel', email='diya.patel@college.edu', dept='Computer Science', sem=4, marks=82.25]
  Created: Student[roll='ME-2026-003', name='Rohan Mehta', email='rohan.mehta@college.edu', dept='Mechanical Eng', sem=6, marks=68.75]
  Created: Student[roll='EC-2026-004', name='Ananya Verma', email='ananya.verma@college.edu', dept='Electronics & Comm', sem=2, marks=45.00]
  Created: Student[roll='IT-2026-005', name='Kabir Singh', email='kabir.singh@college.edu', dept='Information Tech', sem=1, marks=34.00]

--------------------------------------------------------------------------------
>>> 2. INHERITANCE (Student extends Person)
--------------------------------------------------------------------------------
Concept: Child class (Student) inherits common fields (name, email) and methods from parent (Person).

Invoking inherited Person methods directly on Student objects:
  student1.getName()  : Aarav Sharma
  student1.getEmail() : aarav.sharma@college.edu
  [Contact Info] Name: Aarav Sharma | Email: aarav.sharma@college.edu
  [Contact Info] Name: Diya Patel | Email: diya.patel@college.edu

--------------------------------------------------------------------------------
>>> 3. ENCAPSULATION & DATA VALIDATION
--------------------------------------------------------------------------------
Concept: Fields are private; access is controlled via getters and boundary-checked setters.

  Current Marks for Aarav Sharma: 91.50
  Updating marks validly to 95.00...
  Updated Marks: 95.00

  Testing Defensive Validation (Attempting to set invalid marks: 115.00):
  [CAUGHT EXPECTED EXCEPTION] Invalid marks: 115.00. Marks must be between 0.00 and 100.00.

  Testing Defensive Validation (Attempting to set invalid semester: 9):
  [CAUGHT EXPECTED EXCEPTION] Invalid semester: 9. Semester must be between 1 and 8.

--------------------------------------------------------------------------------
>>> 4. COMPOSITION & COLLECTIONS (StudentManager)
--------------------------------------------------------------------------------
Concept: StudentManager HAS-A collection (ArrayList<Student>) and enforces business logic.

Enrolling students into StudentManager:
  [SUCCESS] Enrolled student 'Aarav Sharma' (Roll: CS-2026-001) into registry.
  [SUCCESS] Enrolled student 'Diya Patel' (Roll: CS-2026-002) into registry.
  [SUCCESS] Enrolled student 'Rohan Mehta' (Roll: ME-2026-003) into registry.
  [SUCCESS] Enrolled student 'Ananya Verma' (Roll: EC-2026-004) into registry.
  [SUCCESS] Enrolled student 'Kabir Singh' (Roll: IT-2026-005) into registry.

Testing Duplicate Roll Number Prevention:
  [REJECTED] Duplicate Roll Number 'CS-2026-001'. Student 'Imposter Student' was NOT added.

--------------------------------------------------------------------------------
>>> 5. DISPLAYING ALL ENROLLED STUDENTS
--------------------------------------------------------------------------------
  -------------------------------------------------------------------------------------------------
  | #    | Roll No      | Full Name            | Department           | Sem  | Marks   |
  -------------------------------------------------------------------------------------------------
  | 1    | CS-2026-001  | Aarav Sharma         | Computer Science     | 4    |  95.00  |
  | 2    | CS-2026-002  | Diya Patel           | Computer Science     | 4    |  82.25  |
  | 3    | ME-2026-003  | Rohan Mehta          | Mechanical Eng       | 6    |  68.75  |
  | 4    | EC-2026-004  | Ananya Verma         | Electronics & Comm   | 2    |  45.00  |
  | 5    | IT-2026-005  | Kabir Singh          | Information Tech     | 1    |  34.00  |
  -------------------------------------------------------------------------------------------------
  Total Students: 5

--------------------------------------------------------------------------------
>>> 6. SEARCHING RECORDS (StudentManager)
--------------------------------------------------------------------------------
Searching for student with Roll Number: 'CS-2026-002'...
  [FOUND RECORD MATCH]
  [Student Profile] Roll: CS-2026-002  | Name: Diya Patel         | Dept: Computer Science   | Sem: 4 | Marks:  82.25

--------------------------------------------------------------------------------
>>> 7. ABSTRACTION (GradingPolicy Interface)
--------------------------------------------------------------------------------
Concept: GradingPolicy defines WHAT an evaluator does; StandardGradingPolicy defines HOW.

Grading Scale Demonstrations:
  Evaluation for Aarav Sharma (CS-2026-001):
    - Raw Marks       : 95.00 / 100.00
    - Percentage      : 95.00%
    - Letter Grade    : O
    - Academic Status : PASS (Dean's List)

  Evaluation for Rohan Mehta (ME-2026-003):
    - Raw Marks       : 68.75 / 100.00
    - Percentage      : 68.75%
    - Letter Grade    : B+
    - Academic Status : PASS (Satisfactory)

  Evaluation for Kabir Singh (IT-2026-005):
    - Raw Marks       : 34.00 / 100.00
    - Percentage      : 34.00%
    - Letter Grade    : Fail
    - Academic Status : FAIL (Academic Probation)

--------------------------------------------------------------------------------
>>> 8. RUNTIME POLYMORPHISM
--------------------------------------------------------------------------------
Concept: Dynamic method dispatch invokes child method through parent reference at runtime.

A. Parent Class Reference (Person ref = new Student(...)):
  personReference.getClass().getSimpleName() : Student
  personReference.getName()                  : Aarav Sharma
  personReference.getRole() [Dynamic Dispatch]: Student

B. Interface Reference (GradingPolicy ref = new StandardGradingPolicy()):
  Score: 84.50 | Grade via Interface: A+ | Standing: Good Standing | Passing: true

--------------------------------------------------------------------------------
>>> 9. RECORD REMOVAL & REGISTRY UPDATE
--------------------------------------------------------------------------------
Removing student with Roll Number: 'ME-2026-003'...
  [DELETED] Removed student 'Rohan Mehta' (Roll: ME-2026-003) from registry.

Registry after deletion:
  -------------------------------------------------------------------------------------------------
  | #    | Roll No      | Full Name            | Department           | Sem  | Marks   |
  -------------------------------------------------------------------------------------------------
  | 1    | CS-2026-001  | Aarav Sharma         | Computer Science     | 4    |  95.00  |
  | 2    | CS-2026-002  | Diya Patel           | Computer Science     | 4    |  82.25  |
  | 3    | EC-2026-004  | Ananya Verma         | Electronics & Comm   | 2    |  45.00  |
  | 4    | IT-2026-005  | Kabir Singh          | Information Tech     | 1    |  34.00  |
  -------------------------------------------------------------------------------------------------
  Total Students: 4

--------------------------------------------------------------------------------
>>> 10. OOP PRINCIPLES SUMMARY
--------------------------------------------------------------------------------
  [Classes & Objects] Instantiated concrete Student entities from class blueprints.
  [Encapsulation]     Data fields are private; state guarded by bounds checks.
  [Inheritance]       Student inherits personal identity (name, email) from Person.
  [Abstraction]       Grading contract declared via GradingPolicy interface.
  [Polymorphism]      Runtime method dispatch through Person and GradingPolicy references.
  [Composition]       StudentManager HAS-A ArrayList<Student> collection.

>>> Java OOP Demonstration Executed Successfully. <<<
```

---

## 8. Common Compilation Errors & Troubleshooting

| Error | Root Cause | Solution |
| :--- | :--- | :--- |
| **`Unable to locate a Java Runtime`** | No JDK configured in system path | Install OpenJDK (e.g. Corretto 21 or Temurin 21) into `~/Library/Java/JavaVirtualMachines/`. macOS will automatically discover it. |
| **`cannot find symbol: class Student`** | Compiling `Main.java` without other dependent source files | Use wildcard compilation: `javac -d java-oop-demo/bin java-oop-demo/src/*.java`. |
| **`Could not find or load main class Main`** | Incorrect classpath when invoking `java` | Ensure you specify the `-cp` flag: `java -cp java-oop-demo/bin Main`. |
| **`Person is abstract; cannot be instantiated`** | Attempted `new Person(...)` | Expected OOP behavior: `Person` is abstract. Instantiate concrete subclasses like `Student`. |

---

## 9. Current Limitations & Educational Context

- **Persistence**: Records are stored strictly in memory within an `ArrayList<Student>`. When the Java program terminates, memory is freed. The persistent database is managed by the Flask/MySQL web application.
- **Scope**: Designed specifically to provide clear, demonstrable code for college OOP evaluations without introducing external framework complexities.
