PRAGMA foreign_keys = ON;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
  user_id     INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  address     TEXT,
  phone       TEXT,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL,

  index_no    TEXT,
  major       TEXT,
  year        INTEGER,

  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

  CHECK (role IN ('ADMIN','PROFESSOR','STUDENT'))
);

-- =========================
-- COURSES
-- =========================
CREATE TABLE courses (
  course_id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  code         TEXT NOT NULL UNIQUE,
  espb         INTEGER NOT NULL,
  description  TEXT,
  professor_id INTEGER NOT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (professor_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);

-- =========================
-- ENROLLMENTS
-- =========================
CREATE TABLE enrollments (
  enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id    INTEGER NOT NULL,
  course_id     INTEGER NOT NULL,

  UNIQUE(student_id, course_id),

  FOREIGN KEY (student_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,

  FOREIGN KEY (course_id)
    REFERENCES courses(course_id)
    ON DELETE CASCADE
);

-- =========================
-- EXAM PERIODS
-- =========================
CREATE TABLE exam_periods (
  period_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  date_from  DATE NOT NULL,
  date_to    DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- EXAM APPLICATIONS
-- =========================
CREATE TABLE exam_applications (
  application_id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id     INTEGER NOT NULL,
  course_id      INTEGER NOT NULL,
  period_id      INTEGER NOT NULL,
  status         TEXT NOT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(student_id, course_id, period_id),

  CHECK (status IN ('PRIJAVLJEN','POLOZIO','NIJE_POLOZIO')),

  FOREIGN KEY (student_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,

  FOREIGN KEY (course_id)
    REFERENCES courses(course_id)
    ON DELETE CASCADE,

  FOREIGN KEY (period_id)
    REFERENCES exam_periods(period_id)
    ON DELETE CASCADE
);

-- =========================
-- GRADES
-- =========================
CREATE TABLE grades (
  grade_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL UNIQUE,
  grade           INTEGER NOT NULL,
  graded_at       DATETIME DEFAULT CURRENT_TIMESTAMP,

  CHECK (grade BETWEEN 5 AND 10),

  FOREIGN KEY (application_id)
    REFERENCES exam_applications(application_id)
    ON DELETE CASCADE
);

-- =========================
-- MATERIALS
-- =========================
CREATE TABLE materials (
  material_id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id   INTEGER NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  file_path   TEXT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id)
    REFERENCES courses(course_id)
    ON DELETE CASCADE
);

-- =========================
-- ANNOUNCEMENTS
-- =========================
CREATE TABLE announcements (
  announcement_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  author_id       INTEGER NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (author_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);
