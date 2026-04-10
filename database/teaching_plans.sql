-- Teaching Plans & Homework
CREATE TABLE IF NOT EXISTS teaching_plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id  INT          NOT NULL,
  class_id    INT          NOT NULL,
  week_start  DATE         NOT NULL,   -- Monday of the week
  day         ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  subject     VARCHAR(50)  NOT NULL,
  topic       VARCHAR(200) NOT NULL,
  description TEXT,
  homework    TEXT,                    -- homework instructions text
  pdf_path    VARCHAR(255),            -- uploaded PDF filename
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id)   REFERENCES classes(id)  ON DELETE CASCADE
);
