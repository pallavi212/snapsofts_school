# EduSync — Feature Status & Roadmap

> School: EduSync International School | Trust: Snapsofts Tech | DB: school_db | Port: 5002

---

## ✅ BUILT & WORKING

### 🔐 Auth & Users
- Role-based login — Principal, Admin, Teacher, Accountant, Student, Parent
- JWT token auth with bcrypt password support + plain-text fallback
- Role-based home route (Admin→Dashboard, Parent→ParentDashboard, Student→StudentDashboard)
- User Management page — create, edit, delete users across all roles
- Auto-creates student/teacher record when user is created with that role

### 🏫 School Settings
- School Info page — name, trust, address, phone, email, board, affiliation no, academic year
- Edit mode for Admin/Principal only
- School data shared app-wide via `SchoolContext`
- School Letterhead component with print support

### 👨‍🎓 Students
- Student list with grade-grouped, division sub-sections (A/B=CBSE, C/D=SSC)
- Search by name/ID, filter by class and division
- Add student (2-step modal: student info → parent info)
- Edit student — updates user + class + parent details
- Parent account linking — search and assign a parent login to a student
- `parent_user_id` stored in students table for portal access
- Class-wise student counts on dashboard

### 👩‍🏫 Teachers
- Teacher list with subject, qualification, experience, status
- Add/Edit teacher modal with assigned classes (1A–10D, all 40 classes)
- Classes saved to `teacher_classes` table
- Status: Active / On Leave

### 📋 Attendance
- Class selector (all 40 classes from DB)
- Date picker with default = today
- Toggle Present/Absent per student
- Mark All Present / Mark All Absent
- Save to DB — resolves class name → class_id, student_code → student_id automatically
- Attendance % progress bar
- Student attendance history (last 60 records) for parent/student portal

### 💰 Fees
- Fee structure cards (Class 1–4: ₹30k, 5–8: ₹35k, 9–10: ₹40k)
- Student fee table — annual fee, paid, due, status (Paid/Partial/Pending)
- Add payment modal with amount, date, mode, remarks
- Fee receipt — school letterhead, payment history table with running balance
- Receipt sharing — Print (new window), WhatsApp (`wa.me`), Email (mailto)
- Auto-open receipt after recording a payment

### 📅 Calendar
- School calendar with event types: holiday, exam, event, ptm, activity
- Color-coded event cards
- Add/Edit/Delete events (Admin/Principal)

### 🕐 Timetable
- Class-wise timetable — dropdown with all 40 classes grouped by grade
- Board auto-detected from selected class (CBSE/SSC)
- CBSE: 8 periods, SSC: 7 periods, both with break/lunch slots
- Subject color legend

### 📢 Admissions / Enquiries
- Walk-in enquiry tracking with status: New → Contacted → Visited → Admitted / Not Interested
- Add/Edit enquiry modal — student name, parent info, class preference, board, follow-up date, notes
- Status summary cards with counts
- Inline status update dropdown

### 👨‍👩‍👧 Parent Dashboard
- Shows only linked children (via `students.parent_user_id`)
- Child selector tabs (if multiple children)
- Child info card — name, class, board, status
- Attendance tab — monthly summary, % bar, daily records
- Fees tab — annual/paid/due strip, progress bar, receipt button
- Upcoming events (next 30 days)
- Fee receipt with print/WhatsApp/email

### 🎓 Student Dashboard
- My Profile — name, ID, class, roll no, DOB, gender, email, phone, parent details
- My Subjects — board-based subject list with color badges
- My Attendance — month picker, present/absent/late counts, daily record grid
- School Notices & Events — next 60 days from calendar

### 📊 Admin Dashboard
- Live data from 7 APIs simultaneously (Promise.allSettled)
- Stat cards — students (CBSE/SSC split), teachers (active/on leave), users, fee collected, pending, enquiries
- Class-wise student strip (Std 10→1 with mini progress bars)
- Upcoming events panel
- Recent enquiries panel
- Fee summary with progress bars
- Teachers overview card
- Role-based visibility (finance cards, enquiry cards)

### 📱 Mobile Responsive
- Sidebar becomes slide-in drawer on mobile (≤768px)
- Hamburger menu in header
- Overlay backdrop closes sidebar
- Header hides school info and user name on small screens
- Tables scroll horizontally
- Reduced padding on mobile/tablet

---

## 🔴 NOT BUILT YET — PRIORITY ORDER

### P1 — High Impact, Build Next

| # | Feature | Why |
|---|---------|-----|
| 1 | **School Notifications** | Admin/Teacher sends Announcement, Homework, Notice, Fee Reminder, Attendance Alert → parents & students see on dashboard. Spec already written in `.kiro/specs/school-notifications/` |
| 2 | **Exam & Results** | Exam schedule, marks entry by teacher, result card per student. DB tables `exams` + `results` already in schema |
| 3 | **Homework / Assignments** | Teacher posts homework per class, students see it on their dashboard, submission status |
| 4 | **Teacher Dashboard** | Teacher sees their assigned classes, today's timetable, attendance to mark, homework to post |

### P2 — Medium Priority

| # | Feature | Why |
|---|---------|-----|
| 5 | **Report Cards / Progress Report** | Auto-generate PDF report card from exam results |
| 6 | **Fee Reminder Automation** | Auto-flag students with pending fees, bulk WhatsApp/email reminder |
| 7 | **Marks Entry UI** | Teacher enters marks per exam per student, grade auto-calculated |
| 8 | **Student Promotion** | End-of-year bulk promote students from Class N to N+1 |

### P3 — Nice to Have

| # | Feature | Why |
|---|---------|-----|
| 9 | **Library Management** | Book catalog, issue/return, fine tracking |
| 10 | **Transport Management** | Bus routes, driver info, student transport assignment |
| 11 | **Leave Management** | Teacher leave requests, approval workflow |
| 12 | **Analytics & Reports** | Attendance trends, fee collection graphs, class performance |
| 13 | **Export to PDF/Excel** | Download student list, fee report, attendance report |
| 14 | **SMS/WhatsApp Integration** | Bulk messaging via Twilio or WhatsApp Business API |

---

## 🔧 KNOWN ISSUES / TECH DEBT

| Issue | Status |
|-------|--------|
| Timetable is static (hardcoded subjects) — not from DB `timetable` table | Open |
| Attendance page loads all students then filters client-side — slow for large schools | Open |
| No JWT middleware on backend routes (all routes are public) | Open |
| `parents` table exists but unused — parent link uses `students.parent_user_id` directly | Open |
| Password reset / forgot password flow missing | Open |
| No pagination on Students, Teachers, Fees tables | Open |

---

## 📁 FILE MAP

```
src/pages/
  Dashboard.jsx          — Admin/Principal/Teacher/Accountant home
  ParentDashboard.jsx    — Parent home (children's data)
  StudentDashboard.jsx   — Student home (own profile/attendance)
  Students.jsx           — Student management
  Teachers.jsx           — Teacher management
  Attendance.jsx         — Daily attendance marking
  Fees.jsx               — Fee collection
  Calendar.jsx           — School calendar
  Timetable.jsx          — Class-wise timetable
  Admissions.jsx         — Enquiry/admission tracking
  UserManagement.jsx     — All users CRUD
  Settings.jsx           — School info settings
  LetterheadPreview.jsx  — School letterhead print

backend/routes/
  auth.js                — Login, register
  students.js            — CRUD + by-parent + profile
  teachers.js            — CRUD
  attendance.js          — Save + get by class/date/student
  fees.js                — Structure + payments + receipts
  calendar.js            — Events CRUD
  classes.js             — All classes
  users.js               — Users CRUD + parents list
  enquiry.js             — Admissions enquiries CRUD
  schoolInfo.js          — GET/PUT school info
  parents.js             — Parent list
```

---

## 🚀 RECOMMENDED NEXT BUILD

**Build in this order for maximum value:**

1. **School Notifications** — spec is ready, just needs implementation. Run all tasks in `.kiro/specs/school-notifications/tasks.md`
2. **Exam & Results** — `exams` and `results` tables already in schema, just needs UI
3. **Teacher Dashboard** — teachers currently see the admin dashboard which is confusing
4. **Homework Module** — completes the student dashboard experience
