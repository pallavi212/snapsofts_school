-- ============================================================
--  EduSync School Management System — Database Schema
--  DB: school_db  |  user: root  |  password: pallavi05
-- ============================================================

CREATE DATABASE IF NOT EXISTS school_db;
USE school_db;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_code   VARCHAR(10)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE,
  phone       VARCHAR(20),
  password    VARCHAR(255) NOT NULL DEFAULT 'changeme',
  role        ENUM('Principal','Admin','Teacher','Accountant','Student','Parent') NOT NULL,
  status      ENUM('Active','Inactive','On Leave') DEFAULT 'Active',
  joined_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(10) NOT NULL UNIQUE,   -- e.g. 2B, 10D
  grade    TINYINT     NOT NULL,          -- 1-10
  section  CHAR(1)     NOT NULL,          -- A/B/C/D
  board    ENUM('CBSE','SSC') NOT NULL DEFAULT 'CBSE',
  room_no  VARCHAR(10),
  capacity TINYINT DEFAULT 40,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teachers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT         NOT NULL UNIQUE,
  teacher_code  VARCHAR(10) NOT NULL UNIQUE,
  subject       VARCHAR(50) NOT NULL,
  qualification VARCHAR(100),
  experience    VARCHAR(20),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teacher_classes (
  teacher_id INT NOT NULL,
  class_id   INT NOT NULL,
  PRIMARY KEY (teacher_id, class_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id)   REFERENCES classes(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT         NOT NULL UNIQUE,
  student_code   VARCHAR(10) NOT NULL UNIQUE,
  class_id       INT         NOT NULL,
  roll_no        TINYINT     NOT NULL,
  dob            DATE,
  gender         ENUM('Male','Female','Other'),
  address        TEXT,
  parent_name    VARCHAR(100),
  parent_user_id INT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)        REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id)       REFERENCES classes(id),
  FOREIGN KEY (parent_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT  NOT NULL,
  class_id   INT  NOT NULL,
  date       DATE NOT NULL,
  status     ENUM('Present','Absent','Late') DEFAULT 'Present',
  marked_by  INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance (student_id, date),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id)   REFERENCES classes(id),
  FOREIGN KEY (marked_by)  REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS fee_structure (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  grade_from    TINYINT       NOT NULL,
  grade_to      TINYINT       NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  academic_year VARCHAR(9)    NOT NULL,
  description   VARCHAR(100),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT           NOT NULL,
  amount_paid   DECIMAL(10,2) NOT NULL,
  payment_date  DATE          NOT NULL,
  payment_mode  ENUM('Cash','Online','Cheque','DD') DEFAULT 'Cash',
  receipt_no    VARCHAR(20)   NOT NULL UNIQUE,
  academic_year VARCHAR(9)    NOT NULL,
  remarks       VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timetable (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  class_id   INT NOT NULL,
  teacher_id INT NOT NULL,
  subject    VARCHAR(50) NOT NULL,
  day        ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  period_no  TINYINT NOT NULL,
  start_time TIME    NOT NULL,
  end_time   TIME    NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_slot (class_id, day, period_no),
  FOREIGN KEY (class_id)   REFERENCES classes(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(150) NOT NULL,
  event_date DATE         NOT NULL,
  end_date   DATE,
  type       ENUM('holiday','exam','event','ptm','activity') NOT NULL,
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS exams (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  class_id      INT          NOT NULL,
  subject       VARCHAR(50)  NOT NULL,
  exam_date     DATE         NOT NULL,
  total_marks   TINYINT      NOT NULL DEFAULT 100,
  passing_marks TINYINT      NOT NULL DEFAULT 35,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE IF NOT EXISTS results (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  exam_id    INT NOT NULL,
  student_id INT NOT NULL,
  marks      DECIMAL(5,2),
  grade      CHAR(2),
  remarks    VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_result (exam_id, student_id),
  FOREIGN KEY (exam_id)    REFERENCES exams(id)    ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS school_info (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  school_name      VARCHAR(150) NOT NULL,
  trust_name       VARCHAR(150),
  trust_id         VARCHAR(50),
  address_line1    VARCHAR(200),
  address_line2    VARCHAR(200),
  city             VARCHAR(100),
  state            VARCHAR(100),
  pincode          VARCHAR(10),
  phone            VARCHAR(20),
  email            VARCHAR(100),
  website          VARCHAR(150),
  principal_name   VARCHAR(100),
  academic_year    VARCHAR(9)   DEFAULT '2025-26',
  affiliation_no   VARCHAR(50),
  logo_url         VARCHAR(255),
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
