-- StudentHub fresh-install schema, matching the inspected Flask model/live table.
-- Review before running. Never use this to migrate an existing table.
-- Select your approved database in MySQL Workbench first (studenthub_db normally).
CREATE TABLE IF NOT EXISTS students (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  roll_number VARCHAR(30) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  department VARCHAR(100) NOT NULL,
  semester INT NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_students_roll_number (roll_number),
  UNIQUE KEY uq_students_email (email),
  KEY idx_students_full_name (full_name),
  KEY idx_students_department_semester (department, semester),
  CONSTRAINT chk_students_marks CHECK (marks BETWEEN 0 AND 100),
  CONSTRAINT chk_students_semester CHECK (semester BETWEEN 1 AND 8)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
