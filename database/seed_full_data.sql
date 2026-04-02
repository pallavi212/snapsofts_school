USE school_db;

-- ============================================================
-- Add students across grades 2-10 (users + students)
-- ============================================================
-- Grade 2 students (class 2A id=5, 2B id=6)
INSERT INTO users (user_code,name,email,password,role,status) VALUES
('USR063','Riya Desai',      'riya.desai@edusync.edu',      '1','Student','Active'),
('USR064','Arjun Nair',      'arjun.nair@edusync.edu',      '1','Student','Active'),
('USR065','Pooja Verma',     'pooja.verma@edusync.edu',     '1','Student','Active'),
('USR066','Siddharth Rao',   'siddharth.rao@edusync.edu',   '1','Student','Active');

-- Grade 3 students (class 3A id=9, 3B id=10)
INSERT INTO users (user_code,name,email,password,role,status) VALUES
('USR067','Kavya Iyer',      'kavya.iyer@edusync.edu',      '1','Student','Active'),
('USR068','Rahul Patil',     'rahul.patil@edusync.edu',     '1','Student','Active'),
('USR069','Ananya Kulkarni', 'ananya.kulkarni@edusync.edu', '1','Student','Active'),
('USR070','Dev Mehta',       'dev.mehta@edusync.edu',       '1','Student','Active');

-- Grade 4 students (class 4A id=13, 4B id=14)
INSERT INTO users (user_code,name,email,password,role,status) VALUES
('USR071','Ishaan Sharma',   'ishaan.sharma@edusync.edu',   '1','Student','Active'),
('USR072','Prachi Joshi',    'prachi.joshi@edusync.edu',    '1','Student','Active'),
('USR073','Rohan Gupta',     'rohan.gupta@edusync.edu',     '1','Student','Active'),
('USR074','Sneha Patel',     'sneha.patel@edusync.edu',     '1','Student','Active');

-- Grade 5 students (class 5A id=17, 5B id=18)
INSERT INTO users (user_code,name,email,password,role,status) VALUES
('USR075','Aditya Singh',    'aditya.singh@edusync.edu',    '1','Student','Active'),
('USR076','Meera Nair',      'meera.nair@edusync.edu',      '1','Student','Active'),
('USR077','Karan Verma',     'karan.verma@edusync.edu',     '1','Student','Active'),
('USR078','Divya Rao',       'divya.rao@edusync.edu',       '1','Student','Active');

-- Grade 6 students (class 6A id=21, 6C id=23)
INSERT INTO users (user_code,name,email,password,role,status) VALUES
('USR079','Nikhil Desai',    'nikhil.desai@edusync.edu',    '1','Student','Active'),
('USR080','Tanvi Mehta',     'tanvi.mehta@edusync.edu',     '1','Student','Active'),
('USR081','Saurabh Iyer',    'saurabh.iyer@edusync.edu',    '1','Student','Active'),
('USR082','Priya Kulkarni',  'priya.kulkarni@edusync.edu',  '1','Student','Active');

-- Grade 7 students (class 7A id=25, 7B id=26)
INSERT INTO users (user_code,name,email,password,role,status) VALUES
('USR083','Akash Sharma',    'akash.sharma@edusync.edu',    '1','Student','Active'),
('USR084','Ritu Patil',      'ritu.patil@edusync.edu',      '1','Student','Active'),
('USR085','Vivek Joshi',     'vivek.joshi@edusync.edu',     '1','Student','Active'),
('USR086','Shruti Gupta',    'shruti.gupta@edusync.edu',    '1','Student','Active');

-- Grade 8 students (class 8A id=29, 8B id=30)
INSERT INTO users (user_code,name,email,password,role,status) VALUES
('USR087','Harsh Nair',      'harsh.nair@edusync.edu',      '1','Student','Active'),
('USR088','Neha Verma',      'neha.verma@edusync.edu',      '1','Student','Active'),
('USR089','Yash Rao',        'yash.rao@edusync.edu',        '1','Student','Active'),
('USR090','Ankita Desai',    'ankita.desai@edusync.edu',    '1','Student','Active');

-- Grade 9 students (class 9A id=33, 9B id=34)
INSERT INTO users (user_code,name,email,password,role,status) VALUES
('USR091','Raj Mehta',       'raj.mehta@edusync.edu',       '1','Student','Active'),
('USR092','Simran Iyer',     'simran.iyer@edusync.edu',     '1','Student','Active'),
('USR093','Aryan Kulkarni',  'aryan.kulkarni@edusync.edu',  '1','Student','Active'),
('USR094','Pooja Sharma',    'pooja.sharma@edusync.edu',    '1','Student','Active');

-- Grade 10 students (class 10A id=37, 10B id=38)
INSERT INTO users (user_code,name,email,password,role,status) VALUES
('USR095','Vikram Patil',    'vikram.patil@edusync.edu',    '1','Student','Active'),
('USR096','Ananya Joshi',    'ananya2.joshi@edusync.edu',   '1','Student','Active'),
('USR097','Rohit Gupta',     'rohit.gupta@edusync.edu',     '1','Student','Active'),
('USR098','Sakshi Nair',     'sakshi.nair@edusync.edu',     '1','Student','Active');

-- ============================================================
-- Insert student records (user_id from above inserts)
-- class_id: 2A=5,2B=6, 3A=9,3B=10, 4A=13,4B=14, 5A=17,5B=18
--           6A=21,6C=23, 7A=25,7B=26, 8A=29,8B=30, 9A=33,9B=34, 10A=37,10B=38
-- ============================================================
INSERT INTO students (user_id,student_code,class_id,roll_no,gender,parent_name) VALUES
-- Grade 2
((SELECT id FROM users WHERE user_code='USR063'),'STU024',5,1,'Female','Suresh Desai'),
((SELECT id FROM users WHERE user_code='USR064'),'STU025',5,2,'Male',  'Mohan Nair'),
((SELECT id FROM users WHERE user_code='USR065'),'STU026',6,1,'Female','Ramesh Verma'),
((SELECT id FROM users WHERE user_code='USR066'),'STU027',6,2,'Male',  'Sunil Rao'),
-- Grade 3
((SELECT id FROM users WHERE user_code='USR067'),'STU028',9,1,'Female','Ganesh Iyer'),
((SELECT id FROM users WHERE user_code='USR068'),'STU029',9,2,'Male',  'Vijay Patil'),
((SELECT id FROM users WHERE user_code='USR069'),'STU030',10,1,'Female','Arun Kulkarni'),
((SELECT id FROM users WHERE user_code='USR070'),'STU031',10,2,'Male', 'Sanjay Mehta'),
-- Grade 4
((SELECT id FROM users WHERE user_code='USR071'),'STU032',13,1,'Male',  'Deepak Sharma'),
((SELECT id FROM users WHERE user_code='USR072'),'STU033',13,2,'Female','Prakash Joshi'),
((SELECT id FROM users WHERE user_code='USR073'),'STU034',14,1,'Male',  'Manoj Gupta'),
((SELECT id FROM users WHERE user_code='USR074'),'STU035',14,2,'Female','Nilesh Patel'),
-- Grade 5
((SELECT id FROM users WHERE user_code='USR075'),'STU036',17,3,'Male',  'Rajendra Singh'),
((SELECT id FROM users WHERE user_code='USR076'),'STU037',17,4,'Female','Harish Nair'),
((SELECT id FROM users WHERE user_code='USR077'),'STU038',18,1,'Male',  'Suresh Verma'),
((SELECT id FROM users WHERE user_code='USR078'),'STU039',18,2,'Female','Dinesh Rao'),
-- Grade 6
((SELECT id FROM users WHERE user_code='USR079'),'STU040',21,1,'Male',  'Ashok Desai'),
((SELECT id FROM users WHERE user_code='USR080'),'STU041',21,2,'Female','Vinod Mehta'),
((SELECT id FROM users WHERE user_code='USR081'),'STU042',23,1,'Male',  'Ramesh Iyer'),
((SELECT id FROM users WHERE user_code='USR082'),'STU043',23,2,'Female','Suresh Kulkarni'),
-- Grade 7
((SELECT id FROM users WHERE user_code='USR083'),'STU044',25,1,'Male',  'Anil Sharma'),
((SELECT id FROM users WHERE user_code='USR084'),'STU045',25,2,'Female','Ravi Patil'),
((SELECT id FROM users WHERE user_code='USR085'),'STU046',26,1,'Male',  'Mohan Joshi'),
((SELECT id FROM users WHERE user_code='USR086'),'STU047',26,2,'Female','Sanjay Gupta'),
-- Grade 8
((SELECT id FROM users WHERE user_code='USR087'),'STU048',29,1,'Male',  'Vijay Nair'),
((SELECT id FROM users WHERE user_code='USR088'),'STU049',29,2,'Female','Sunil Verma'),
((SELECT id FROM users WHERE user_code='USR089'),'STU050',30,1,'Male',  'Ganesh Rao'),
((SELECT id FROM users WHERE user_code='USR090'),'STU051',30,2,'Female','Deepak Desai'),
-- Grade 9
((SELECT id FROM users WHERE user_code='USR091'),'STU052',33,1,'Male',  'Prakash Mehta'),
((SELECT id FROM users WHERE user_code='USR092'),'STU053',33,2,'Female','Manoj Iyer'),
((SELECT id FROM users WHERE user_code='USR093'),'STU054',34,1,'Male',  'Nilesh Kulkarni'),
((SELECT id FROM users WHERE user_code='USR094'),'STU055',34,2,'Female','Rajendra Sharma'),
-- Grade 10
((SELECT id FROM users WHERE user_code='USR095'),'STU056',37,1,'Male',  'Harish Patil'),
((SELECT id FROM users WHERE user_code='USR096'),'STU057',37,2,'Female','Dinesh Joshi'),
((SELECT id FROM users WHERE user_code='USR097'),'STU058',38,1,'Male',  'Ashok Gupta'),
((SELECT id FROM users WHERE user_code='USR098'),'STU059',38,2,'Female','Vinod Patel');

-- ============================================================
-- Timetable (class 1A, 1B, 5A, 9A, 10A — 5 periods Mon-Fri)
-- teacher ids: 2=Santosh(Physics), 3=pravin(English), 4=Haseena(Hindi)
--              15=Ankit(Math), 16=Tanvi(Science), 17=Ajay(English)
--              18=Neha(Hindi), 19=Sakshi(Computer)
-- ============================================================
INSERT INTO timetable (class_id,teacher_id,subject,day,period_no,start_time,end_time) VALUES
-- Class 1A (id=1)
(1,15,'Math',    'Monday',   1,'08:30:00','09:15:00'),
(1,16,'Science', 'Monday',   2,'09:15:00','10:00:00'),
(1,3, 'English', 'Monday',   3,'10:15:00','11:00:00'),
(1,4, 'Hindi',   'Monday',   4,'11:00:00','11:45:00'),
(1,19,'Computer','Monday',   5,'12:30:00','13:15:00'),
(1,15,'Math',    'Tuesday',  1,'08:30:00','09:15:00'),
(1,2, 'Physics', 'Tuesday',  2,'09:15:00','10:00:00'),
(1,17,'English', 'Tuesday',  3,'10:15:00','11:00:00'),
(1,18,'Hindi',   'Tuesday',  4,'11:00:00','11:45:00'),
(1,16,'Science', 'Tuesday',  5,'12:30:00','13:15:00'),
(1,15,'Math',    'Wednesday',1,'08:30:00','09:15:00'),
(1,3, 'English', 'Wednesday',2,'09:15:00','10:00:00'),
(1,4, 'Hindi',   'Wednesday',3,'10:15:00','11:00:00'),
(1,19,'Computer','Wednesday',4,'11:00:00','11:45:00'),
(1,2, 'Physics', 'Wednesday',5,'12:30:00','13:15:00'),
(1,15,'Math',    'Thursday', 1,'08:30:00','09:15:00'),
(1,16,'Science', 'Thursday', 2,'09:15:00','10:00:00'),
(1,17,'English', 'Thursday', 3,'10:15:00','11:00:00'),
(1,18,'Hindi',   'Thursday', 4,'11:00:00','11:45:00'),
(1,19,'Computer','Thursday', 5,'12:30:00','13:15:00'),
(1,15,'Math',    'Friday',   1,'08:30:00','09:15:00'),
(1,2, 'Physics', 'Friday',   2,'09:15:00','10:00:00'),
(1,3, 'English', 'Friday',   3,'10:15:00','11:00:00'),
(1,4, 'Hindi',   'Friday',   4,'11:00:00','11:45:00'),
(1,16,'Science', 'Friday',   5,'12:30:00','13:15:00');

-- Class 10A (id=37) timetable
INSERT INTO timetable (class_id,teacher_id,subject,day,period_no,start_time,end_time) VALUES
(37,15,'Math',    'Monday',   1,'08:30:00','09:15:00'),
(37,2, 'Physics', 'Monday',   2,'09:15:00','10:00:00'),
(37,3, 'English', 'Monday',   3,'10:15:00','11:00:00'),
(37,4, 'Hindi',   'Monday',   4,'11:00:00','11:45:00'),
(37,16,'Science', 'Monday',   5,'12:30:00','13:15:00'),
(37,15,'Math',    'Tuesday',  1,'08:30:00','09:15:00'),
(37,19,'Computer','Tuesday',  2,'09:15:00','10:00:00'),
(37,17,'English', 'Tuesday',  3,'10:15:00','11:00:00'),
(37,18,'Hindi',   'Tuesday',  4,'11:00:00','11:45:00'),
(37,2, 'Physics', 'Tuesday',  5,'12:30:00','13:15:00'),
(37,15,'Math',    'Wednesday',1,'08:30:00','09:15:00'),
(37,16,'Science', 'Wednesday',2,'09:15:00','10:00:00'),
(37,3, 'English', 'Wednesday',3,'10:15:00','11:00:00'),
(37,4, 'Hindi',   'Wednesday',4,'11:00:00','11:45:00'),
(37,19,'Computer','Wednesday',5,'12:30:00','13:15:00'),
(37,15,'Math',    'Thursday', 1,'08:30:00','09:15:00'),
(37,2, 'Physics', 'Thursday', 2,'09:15:00','10:00:00'),
(37,17,'English', 'Thursday', 3,'10:15:00','11:00:00'),
(37,18,'Hindi',   'Thursday', 4,'11:00:00','11:45:00'),
(37,16,'Science', 'Thursday', 5,'12:30:00','13:15:00'),
(37,15,'Math',    'Friday',   1,'08:30:00','09:15:00'),
(37,19,'Computer','Friday',   2,'09:15:00','10:00:00'),
(37,3, 'English', 'Friday',   3,'10:15:00','11:00:00'),
(37,4, 'Hindi',   'Friday',   4,'11:00:00','11:45:00'),
(37,2, 'Physics', 'Friday',   5,'12:30:00','13:15:00');

-- ============================================================
-- Attendance for all students — last 30 school days
-- Realistic: ~85% present, some absent, some late
-- ============================================================
INSERT INTO attendance (student_id,class_id,date,status) VALUES
-- STU001 (id=4, class 1B id=2)
(4,2,'2026-02-02','Present'),(4,2,'2026-02-03','Present'),(4,2,'2026-02-04','Absent'),
(4,2,'2026-02-05','Present'),(4,2,'2026-02-06','Present'),(4,2,'2026-02-09','Present'),
(4,2,'2026-02-10','Late'),   (4,2,'2026-02-11','Present'),(4,2,'2026-02-12','Present'),
(4,2,'2026-02-13','Present'),(4,2,'2026-02-16','Present'),(4,2,'2026-02-17','Absent'),
(4,2,'2026-02-18','Present'),(4,2,'2026-02-19','Present'),(4,2,'2026-02-20','Present'),
(4,2,'2026-02-23','Present'),(4,2,'2026-02-24','Present'),(4,2,'2026-02-25','Present'),
(4,2,'2026-02-26','Late'),   (4,2,'2026-02-27','Present'),(4,2,'2026-03-02','Present'),
(4,2,'2026-03-03','Present'),(4,2,'2026-03-04','Absent'), (4,2,'2026-03-05','Present'),
(4,2,'2026-03-06','Present'),(4,2,'2026-03-09','Present'),(4,2,'2026-03-10','Present'),
(4,2,'2026-03-11','Present'),(4,2,'2026-03-12','Present'),(4,2,'2026-03-13','Present'),
-- STU010 (id=11, class 1A id=1)
(11,1,'2026-02-02','Present'),(11,1,'2026-02-03','Absent'),(11,1,'2026-02-04','Present'),
(11,1,'2026-02-05','Present'),(11,1,'2026-02-06','Present'),(11,1,'2026-02-09','Late'),
(11,1,'2026-02-10','Present'),(11,1,'2026-02-11','Present'),(11,1,'2026-02-12','Absent'),
(11,1,'2026-02-13','Present'),(11,1,'2026-02-16','Present'),(11,1,'2026-02-17','Present'),
(11,1,'2026-02-18','Present'),(11,1,'2026-02-19','Present'),(11,1,'2026-02-20','Absent'),
(11,1,'2026-02-23','Present'),(11,1,'2026-02-24','Present'),(11,1,'2026-02-25','Present'),
(11,1,'2026-02-26','Present'),(11,1,'2026-02-27','Present'),(11,1,'2026-03-02','Present'),
(11,1,'2026-03-03','Present'),(11,1,'2026-03-04','Present'),(11,1,'2026-03-05','Late'),
(11,1,'2026-03-06','Present'),(11,1,'2026-03-09','Present'),(11,1,'2026-03-10','Present'),
(11,1,'2026-03-11','Present'),(11,1,'2026-03-12','Present'),(11,1,'2026-03-13','Present');

-- Attendance for remaining 1A students
INSERT INTO attendance (student_id,class_id,date,status) VALUES
(16,1,'2026-02-02','Present'),(16,1,'2026-02-03','Present'),(16,1,'2026-02-04','Present'),
(16,1,'2026-02-05','Absent'), (16,1,'2026-02-06','Present'),(16,1,'2026-02-09','Present'),
(16,1,'2026-02-10','Present'),(16,1,'2026-02-11','Present'),(16,1,'2026-02-12','Present'),
(16,1,'2026-02-13','Late'),   (16,1,'2026-02-16','Present'),(16,1,'2026-02-17','Present'),
(16,1,'2026-02-18','Absent'), (16,1,'2026-02-19','Present'),(16,1,'2026-02-20','Present'),
(17,1,'2026-02-02','Present'),(17,1,'2026-02-03','Present'),(17,1,'2026-02-04','Present'),
(17,1,'2026-02-05','Present'),(17,1,'2026-02-06','Absent'), (17,1,'2026-02-09','Present'),
(17,1,'2026-02-10','Present'),(17,1,'2026-02-11','Late'),   (17,1,'2026-02-12','Present'),
(17,1,'2026-02-13','Present'),(17,1,'2026-02-16','Present'),(17,1,'2026-02-17','Present'),
(17,1,'2026-02-18','Present'),(17,1,'2026-02-19','Present'),(17,1,'2026-02-20','Present'),
(18,1,'2026-02-02','Absent'), (18,1,'2026-02-03','Present'),(18,1,'2026-02-04','Present'),
(18,1,'2026-02-05','Present'),(18,1,'2026-02-06','Present'),(18,1,'2026-02-09','Present'),
(18,1,'2026-02-10','Present'),(18,1,'2026-02-11','Present'),(18,1,'2026-02-12','Present'),
(18,1,'2026-02-13','Present'),(18,1,'2026-02-16','Late'),   (18,1,'2026-02-17','Present'),
(18,1,'2026-02-18','Present'),(18,1,'2026-02-19','Absent'), (18,1,'2026-02-20','Present'),
(19,1,'2026-02-02','Present'),(19,1,'2026-02-03','Present'),(19,1,'2026-02-04','Present'),
(19,1,'2026-02-05','Present'),(19,1,'2026-02-06','Present'),(19,1,'2026-02-09','Absent'),
(19,1,'2026-02-10','Present'),(19,1,'2026-02-11','Present'),(19,1,'2026-02-12','Present'),
(19,1,'2026-02-13','Present'),(19,1,'2026-02-16','Present'),(19,1,'2026-02-17','Present'),
(19,1,'2026-02-18','Present'),(19,1,'2026-02-19','Present'),(19,1,'2026-02-20','Late'),
(20,1,'2026-02-02','Present'),(20,1,'2026-02-03','Absent'), (20,1,'2026-02-04','Present'),
(20,1,'2026-02-05','Present'),(20,1,'2026-02-06','Present'),(20,1,'2026-02-09','Present'),
(20,1,'2026-02-10','Present'),(20,1,'2026-02-11','Present'),(20,1,'2026-02-12','Absent'),
(20,1,'2026-02-13','Present'),(20,1,'2026-02-16','Present'),(20,1,'2026-02-17','Present'),
(20,1,'2026-02-18','Present'),(20,1,'2026-02-19','Present'),(20,1,'2026-02-20','Present');

-- Fee payments for new students (grades 5-10 partial payments)
INSERT INTO fee_payments (student_id,amount_paid,payment_date,payment_mode,receipt_no,academic_year) VALUES
-- Grade 5 students (STU036=id will be auto, use subquery)
((SELECT id FROM students WHERE student_code='STU036'),35000,'2025-06-10','Online','RCP2025010','2025-2026'),
((SELECT id FROM students WHERE student_code='STU037'),17500, '2025-06-12','Cash',  'RCP2025011','2025-2026'),
((SELECT id FROM students WHERE student_code='STU038'),35000,'2025-06-08','Online','RCP2025012','2025-2026'),
-- Grade 9 students
((SELECT id FROM students WHERE student_code='STU052'),40000,'2025-06-05','Online','RCP2025013','2025-2026'),
((SELECT id FROM students WHERE student_code='STU053'),20000,'2025-06-15','Cash',  'RCP2025014','2025-2026'),
((SELECT id FROM students WHERE student_code='STU054'),40000,'2025-06-03','Online','RCP2025015','2025-2026'),
-- Grade 10 students
((SELECT id FROM students WHERE student_code='STU056'),40000,'2025-06-01','Online','RCP2025016','2025-2026'),
((SELECT id FROM students WHERE student_code='STU057'),20000,'2025-06-20','Cash',  'RCP2025017','2025-2026'),
((SELECT id FROM students WHERE student_code='STU058'),40000,'2025-06-04','Online','RCP2025018','2025-2026'),
((SELECT id FROM students WHERE student_code='STU059'),10000,'2025-07-01','Cash',  'RCP2025019','2025-2026');
