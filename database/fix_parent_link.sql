-- ============================================================
--  Fix parent-child link & set login passwords
--  Run this once in MySQL: source database/fix_parent_link.sql
-- ============================================================
USE school_db;

-- Set plain-text passwords for all seeded users (password = '1' for easy testing)
-- In production, use bcrypt hashed passwords
UPDATE users SET password = '1' WHERE password = 'changeme' OR password IS NULL OR password = '';

-- Verify parent_user_id is set correctly on students
-- Rajesh Sharma (USR015) → id=15 → children: STU001, STU003, STU005
-- Amit Patel    (USR016) → id=16 → children: STU002, STU004, STU006

-- If parent_user_id is NULL (e.g. after a fresh seed), fix it:
UPDATE students s
JOIN users u ON u.name = s.parent_name AND u.role = 'Parent'
SET s.parent_user_id = u.id
WHERE s.parent_user_id IS NULL AND s.parent_name IS NOT NULL AND s.parent_name != '';

-- Confirm the links
SELECT s.student_code, u_s.name AS student, s.parent_name,
       s.parent_user_id, u_p.name AS parent_login, u_p.email AS parent_email
FROM students s
JOIN users u_s ON s.user_id = u_s.id
LEFT JOIN users u_p ON s.parent_user_id = u_p.id
ORDER BY s.id;
