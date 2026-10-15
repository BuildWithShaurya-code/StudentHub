# StudentHub project report

StudentHub demonstrates a three-layer student management application: React/TypeScript frontend, Python Flask API and MySQL relational database. It preserves the supplied Stitch layout while integrating actual student records.

The implemented workflow registers students with a unique roll number/email, lists and filters records, retrieves details by primary ID, edits supported fields, confirms deletion and calculates overall results. Dashboard statistics, recent registrations and result summaries come from stored data. Browser failures and empty collections have distinct states; success follows confirmed API writes.

MySQL enforces primary/unique keys, marks and semester checks, and timestamps. Flask validates malformed input, handles duplicate conflicts and rolls back failed writes. The standalone Java example covers classes, objects, encapsulation, inheritance, abstraction, polymorphism and collection-based management using a compatible grading policy.

The audit found and fixed an incompatible SQL setup script, unsafe error disclosure, invalid numeric inputs, a numeric roll/ID collision, pagination truncation, misleading demo-data insertion, fabricated profile/metrics content, an edit navigation race, CSV export escaping and dependency conflicts. See [../audit/FINAL_AUDIT.md](../audit/FINAL_AUDIT.md) for executed checks, limits and publication status.

Current scope excludes authentication/authorization, fee management, attendance, real coursework, phone persistence and historical grades. Unsupported fields are disabled or marked not recorded. The project is intended for trusted local demonstration until a separately approved production design provides access controls, secure hosting, HTTPS and hosted MySQL connectivity.

No student database dump, credentials, virtual environment or build output is part of source publication. Existing application records were never mutation-test fixtures. See [../README.md](../README.md) for reproducible setup and exact commands.
