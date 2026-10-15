# Application architecture

The existing Stitch interface is a React/TypeScript SPA built by Vite and Tailwind. Hash navigation selects screens; details and edit use numeric database IDs. Navigation waits for the requested student before mounting the editable form, and stale asynchronous route results are ignored.

The frontend API client uses fetch, normalizes HTTP errors and prevents duplicate in-flight mutations. StudentService maps form fields to the Flask API contract and traverses all list pages. Dashboard and results consume actual database metrics/records. Failed requests show explicit errors, distinct from empty tables.

Flask creates the application, installs the students blueprint and restricts CORS to the configured frontend origin. Routes use SQLAlchemy parameter binding, validate payloads and commit transactions. Centralized error handling rolls back failures and returns safe JSON. SQLAlchemy connects to the selected MySQL database with PyMySQL; it does not auto-create or clear application tables.

MySQL owns the unique keys, check constraints and timestamp behavior. Overall marks determine grades. Profile fields absent from the schema are not fabricated. The separate Java OOP module is an educational console application and does not participate in web requests.

Development servers bind loopback by default. GitHub stores source only. Production hosting and access control are separate work requiring explicit approval.
