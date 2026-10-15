# MySQL database

The application uses MySQL through Flask-SQLAlchemy and PyMySQL, normally at `127.0.0.1:3306/studenthub_db`. Private credentials belong in `backend/.env`. Shell variables take precedence over the file.

The live schema was inspected with `SHOW CREATE TABLE students` on 15 October 2026. It matches [../sql/schema.sql](../sql/schema.sql):

| Column | Type | Rule |
|---|---|---|
| id | BIGINT UNSIGNED | Primary key, auto increment |
| roll_number | VARCHAR(30) | Required, unique |
| full_name | VARCHAR(100) | Required, indexed |
| email | VARCHAR(150) | Required, unique |
| department | VARCHAR(100) | Required; composite index with semester |
| semester | INT | Required, CHECK 1–8 |
| marks | DECIMAL(5,2) | Required, CHECK 0–100 |
| created_at | TIMESTAMP | Required, default current timestamp |
| updated_at | TIMESTAMP | Required, default/current timestamp on update |

The table uses InnoDB and utf8mb4_unicode_ci. Uniqueness follows that collation. Flask validates payloads before writing and handles database constraint conflicts safely, including concurrent duplicates. Failed transactions are rolled back.

The current schema does not store phone, advisors, coursework, batch, fees, attendance or historical grades. Those must not be invented from the overall marks.

The old bundled schema described incompatible string IDs and extra tables; the fresh-install script has been corrected. No migration was needed or executed against the existing application database. Never treat CREATE TABLE IF NOT EXISTS as a schema migration.

The user approved a separate `studenthub_audit_test` database for synthetic mutation tests. Guards prevent those runners from targeting `studenthub_db`. The live database is checked read-only; no existing students are test fixtures. See the root README for setup and verification commands.
