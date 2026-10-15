/**
 * Person.java
 *
 * Demonstrates: INHERITANCE and ABSTRACTION
 *
 * This abstract class represents the common personal attributes of any human entity
 * in an academic institution (e.g., Student, Faculty, Staff).
 *
 * It cannot be instantiated directly (abstract), establishing an "IS-A" parent
 * relationship for subclasses such as Student.
 */
public abstract class Person {

    // Encapsulated fields common to all persons
    private String name;
    private String email;

    /**
     * Parameterized Constructor
     * Initializes common personal attributes.
     *
     * @param name  Full name of the person
     * @param email Valid institutional contact email
     */
    public Person(String name, String email) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Person name cannot be null or empty.");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("A valid email address containing '@' is required.");
        }
        this.name = name.trim();
        this.email = email.trim();
    }

    // Getters
    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    // Controlled Setters
    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Person name cannot be null or empty.");
        }
        this.name = name.trim();
    }

    public void setEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("A valid email address containing '@' is required.");
        }
        this.email = email.trim();
    }

    /**
     * Abstract method enforcing that every concrete subclass defines its specific institutional role.
     * This provides the foundation for RUNTIME POLYMORPHISM.
     *
     * @return The specific role (e.g., "Student", "Faculty")
     */
    public abstract String getRole();

    /**
     * Common display method shared by all Person subclasses.
     * Demonstrates code reusability through inheritance.
     */
    public void displayContactInfo() {
        System.out.printf("  [Contact Info] Name: %s | Email: %s%n", name, email);
    }
}
