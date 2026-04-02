USE school_db;

-- ============================================================
-- Classes: grades 1-10, sections A/B/C/D, mixed CBSE & SSC
-- ============================================================
INSERT INTO classes (name, grade, section, board, room_no) VALUES
-- Grade 1
('1A',1,'A','CBSE','R101'), ('1B',1,'B','SSC','R102'), ('1C',1,'C','CBSE','R103'), ('1D',1,'D','SSC','R104'),
-- Grade 2
('2A',2,'A','CBSE','R105'), ('2B',2,'B','SSC','R106'), ('2C',2,'C','CBSE','R107'), ('2D',2,'D','SSC','R108'),
-- Grade 3
('3A',3,'A','CBSE','R109'), ('3B',3,'B','SSC','R110'), ('3C',3,'C','CBSE','R111'), ('3D',3,'D','SSC','R112'),
-- Grade 4
('4A',4,'A','CBSE','R113'), ('4B',4,'B','SSC','R114'), ('4C',4,'C','CBSE','R115'), ('4D',4,'D','SSC','R116'),
-- Grade 5
('5A',5,'A','CBSE','R201'), ('5B',5,'B','SSC','R202'), ('5C',5,'C','CBSE','R203'), ('5D',5,'D','SSC','R204'),
-- Grade 6
('6A',6,'A','CBSE','R205'), ('6B',6,'B','SSC','R206'), ('6C',6,'C','CBSE','R207'), ('6D',6,'D','SSC','R208'),
-- Grade 7
('7A',7,'A','CBSE','R209'), ('7B',7,'B','SSC','R210'), ('7C',7,'C','CBSE','R211'), ('7D',7,'D','SSC','R212'),
-- Grade 8
('8A',8,'A','CBSE','R301'), ('8B',8,'B','SSC','R302'), ('8C',8,'C','CBSE','R303'), ('8D',8,'D','SSC','R304'),
-- Grade 9
('9A',9,'A','CBSE','R305'), ('9B',9,'B','SSC','R306'), ('9C',9,'C','CBSE','R307'), ('9D',9,'D','SSC','R308'),
-- Grade 10
('10A',10,'A','CBSE','R309'), ('10B',10,'B','SSC','R310'), ('10C',10,'C','CBSE','R311'), ('10D',10,'D','SSC','R312');

-- ============================================================
-- Users
-- ============================================================
INSERT INTO users (user_code, name, email, phone, role, status, joined_date) VALUES
('USR001','Dr. Suresh Patil',  'principal@edusync.edu', '+91 9800000001','Principal', 'Active',   '2018-06-01'),
('USR002','Meena Kulkarni',    'admin@edusync.edu',     '+91 9800000002','Admin',     'Active',   '2019-03-15'),
('USR003','Dr. Rakesh Mehra',  'r.mehra@edusync.edu',   '+91 9876543220','Teacher',   'Active',   '2012-07-10'),
('USR004','Ms. Sunita Rao',    's.rao@edusync.edu',     '+91 9876543221','Teacher',   'Active',   '2016-06-01'),
('USR005','Mr. Anil Kumar',    'a.kumar@edusync.edu',   '+91 9876543222','Teacher',   'On Leave', '2019-08-01'),
('USR006','Mrs. Kavita Joshi', 'k.joshi@edusync.edu',   '+91 9876543223','Teacher',   'Active',   '2009-06-01'),
('USR007','Ms. Neha Singh',    'n.singh@edusync.edu',   '+91 9876543224','Teacher',   'Active',   '2021-06-01'),
('USR008','Ramesh Joshi',      'accounts@edusync.edu',  '+91 9800000008','Accountant','Active',   '2020-01-10'),
-- Students
('USR009','Aarav Sharma',      'aarav@edusync.edu',     '+91 9800000009','Student',   'Active',   '2023-06-01'),
('USR010','Priya Patel',       'priya@edusync.edu',     '+91 9800000010','Student',   'Active',   '2023-06-01'),
('USR011','Rohan Mehta',       'rohan@edusync.edu',     '+91 9800000011','Student',   'Active',   '2023-06-01'),
('USR012','Sneha Gupta',       'sneha@edusync.edu',     '+91 9800000012','Student',   'Active',   '2023-06-01'),
('USR013','Karan Singh',       'karan@edusync.edu',     '+91 9800000013','Student',   'Active',   '2023-06-01'),
('USR014','Ananya Joshi',      'ananya@edusync.edu',    '+91 9800000014','Student',   'Active',   '2023-06-01'),
-- Parents
('USR015','Rajesh Sharma',     'parent1@edusync.edu',   '+91 9800000015','Parent',    'Active',   '2023-06-01'),
('USR016','Amit Patel',        'parent2@edusync.edu',   '+91 9800000016','Parent',    'Active',   '2023-06-01');
-- ============================================================
-- Teachers
-- ============================================================
INSERT INTO teachers (user_id, teacher_code, subject, qualification, experience) VALUES
(3,'TCH001','Mathematics',     'Ph.D Mathematics','12 Years'),
(4,'TCH002','Science',         'M.Sc Physics',    '8 Years'),
(5,'TCH003','English',         'M.A English',     '5 Years'),
(6,'TCH004','Hindi',           'M.A Hindi',       '15 Years'),
(7,'TCH005','Computer Science','B.Tech CSE',      '3 Years');

-- ============================================================
-- Students  (class_id references: 10A=37, 10B=38, 9A=33, 8B=30, 5A=17, 2B=6)
-- ============================================================
INSERT INTO students (user_id, student_code, class_id, roll_no, dob, gender, parent_name, parent_user_id) VALUES
(9,  'STU001', 37, 1, '2008-04-12', 'Male',   'Rajesh Sharma', 15),
(10, 'STU002', 38, 1, '2008-09-05', 'Female', 'Amit Patel',    16),
(11, 'STU003', 33, 1, '2009-11-20', 'Male',   'Rajesh Sharma', 15),
(12, 'STU004', 30, 1, '2010-03-15', 'Female', 'Amit Patel',    16),
(13, 'STU005', 33, 2, '2009-07-22', 'Male',   'Rajesh Sharma', 15),
(14, 'STU006', 17, 1, '2013-01-10', 'Female', 'Amit Patel',    16);

-- ============================================================
-- Fee Structure
-- ============================================================
INSERT INTO fee_structure (grade_from, grade_to, amount, academic_year, description) VALUES
(1, 4,  30000.00, '2025-2026', 'Class 1 to 4 Annual Fee'),
(5, 8,  35000.00, '2025-2026', 'Class 5 to 8 Annual Fee'),
(9, 10, 40000.00, '2025-2026', 'Class 9 to 10 Annual Fee');

-- ============================================================
-- Fee Payments
-- ============================================================
INSERT INTO fee_payments (student_id, amount_paid, payment_date, payment_mode, receipt_no, academic_year) VALUES
(7, 40000.00, '2025-06-05', 'Online', 'RCP2025001', '2025-2026'),
(8, 20000.00, '2025-06-10', 'Cash',   'RCP2025002', '2025-2026'),
(9, 40000.00, '2025-06-03', 'Online', 'RCP2025003', '2025-2026');

-- ============================================================
-- Calendar Events
-- ============================================================
INSERT INTO calendar_events (title, event_date, type, created_by) VALUES
('Academic Year Begins',      '2025-06-02', 'event',    1),
('Eid al-Adha',               '2025-06-15', 'holiday',  1),
('Unit Test 1 Begins',        '2025-07-04', 'exam',     1),
('Unit Test 1 Ends',          '2025-07-08', 'exam',     1),
('PTM – Unit Test 1 Results', '2025-07-14', 'ptm',      1),
('Independence Day',          '2025-08-15', 'event',    1),
('Half-Yearly Exam Begins',   '2025-09-01', 'exam',     1),
('Half-Yearly Exam Ends',     '2025-09-10', 'exam',     1),
('PTM – Half-Yearly Results', '2025-09-15', 'ptm',      1),
('Gandhi Jayanti',            '2025-10-02', 'holiday',  1),
('Diwali',                    '2025-10-25', 'holiday',  1),
('Annual Cultural Fest',      '2025-11-24', 'activity', 1),
('Christmas',                 '2025-12-25', 'holiday',  1),
('Republic Day',              '2026-01-26', 'event',    1),
('Pre-Board Exam Begins',     '2026-02-02', 'exam',     1),
('Annual Board Exam Begins',  '2026-03-02', 'exam',     1),
('Holi',                      '2026-03-17', 'holiday',  1),
('Annual Day',                '2026-04-06', 'event',    1),
('Academic Year Ends',        '2026-04-20', 'event',    1);

-- ============================================================
-- School Info
-- ============================================================
INSERT INTO school_info
  (school_name, trust_name, trust_id, address_line1, address_line2, city, state, pincode, phone, email, website, principal_name, academic_year, affiliation_no)
VALUES
  ('EduSync International School', 'Snapsofts Tech', 'TRUST-SNP-001',
   'Plot No. 12, Sector 5', 'Near City Mall, MG Road',
   'Pune', 'Maharashtra', '411001',
   '+91 98000 00001', 'info@edusync.edu', 'www.edusync.edu',
   'Dr. Suresh Patil', '2025-26', 'AFF-CBSE-2025');
