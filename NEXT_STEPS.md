# EduSync — What to Build Next

Current status: Core modules are working (Login, Dashboard, Students, Teachers, Attendance, Fees, Timetable, Calendar, User Management, Admissions, Settings, Letterhead).

Below is a prioritized roadmap — ordered by impact and effort.

---

## Priority 1 — Complete What's Half-Built

These are already in the DB schema but have no UI yet.

### 1.1 Exam & Results Module
- Pages: `Exams.jsx`, `Results.jsx`
- DB tables: `exams`, `results` (already exist)
- What to build:
  - Exam schedule list (name, class, subject, date, total marks)
  - Teacher enters marks per student
  - Auto-calculate grade (A/B/C/D/F) based on percentage
  - Student/Parent can view their own results
- Backend routes: `GET/POST /api/exams`, `GET/POST /api/results`

### 1.2 Student Fee — Full Payment Flow
- Currently: fee structure shown, payments seeded
- What's missing:
  - Record a new payment (receipt no, amount, mode, date)
  - Show per-student fee status (Paid / Partial / Pending)
  - Print fee receipt using `<Letterhead>` component
- Backend: `POST /api/fees/pay`, `GET /api/fees/student/:id`

### 1.3 Assignments Module
- DB table: `assignments` (exists)
- Teacher creates assignment → students see it
- Pages: `Assignments.jsx`
- Backend: `GET/POST /api/assignments`

---

## Priority 2 — High Value Features

### 2.1 Report Cards / Progress Report
- Auto-generate from `results` table
- Print using `<Letterhead>` component
- Per-student PDF-style view
- Page: `ReportCard.jsx`

### 2.2 Parent Portal (Dedicated Dashboard)
- When role = Parent, show:
  - Child's attendance summary (% present this month)
  - Fee dues
  - Upcoming exams
  - Recent results
- Already have parent data in DB — just needs a filtered dashboard view

### 2.3 Student Portal
- When role = Student, show:
  - My timetable
  - My attendance
  - My fees
  - My results
  - Upcoming exams / events

### 2.4 Notifications / Announcements
- Simple notice board — admin posts, all roles see
- DB table: `announcements (id, title, body, role_target, created_by, created_at)`
- Show on Dashboard as a banner or bell dropdown

---

## Priority 3 — Operational Features

### 3.1 Leave Management
- DB table: `leaves` (already exists)
- Teacher/Student applies for leave
- Principal/Admin approves or rejects
- Page: `Leaves.jsx`
- Backend: `GET/POST/PUT /api/leaves`

### 3.2 Timetable — DB Driven
- Currently timetable is static/hardcoded
- Wire it to `timetable` table in DB
- Admin can assign teacher + subject to each period
- Teacher sees only their own periods

### 3.3 Admission → Student Conversion
- On Admissions page, add "Convert to Student" button
- Pre-fills the Add Student modal with enquiry data
- On save, marks enquiry status as `Admitted`

### 3.4 Bulk Attendance Import
- Upload CSV for attendance
- Useful for large classes

---

## Priority 4 — Analytics & Reports

### 4.1 Attendance Analytics
- Monthly attendance % per class
- Students below 75% attendance — highlight
- Bar/line chart (use Recharts or Chart.js)

### 4.2 Fee Collection Report
- Total collected vs pending per month
- Class-wise fee collection summary
- Export to CSV

### 4.3 Class Performance Report
- Average marks per subject per class
- Pass/fail ratio per exam

---

## Priority 5 — Polish & Production Readiness

### 5.1 Authentication — JWT Tokens
- Currently login stores user in context only
- Add JWT: backend signs token, frontend stores in localStorage
- Send `Authorization: Bearer <token>` header with every API call
- Backend middleware validates token on protected routes

### 5.2 Password Hashing
- Currently passwords stored as plain text (`'1'`)
- Use `bcrypt` to hash on create, compare on login

### 5.3 Dark Mode Toggle
- CSS variables already support theming
- Add a toggle button in Header

### 5.4 Mobile Responsive Sidebar
- Sidebar currently hidden on mobile
- Add hamburger menu + slide-in drawer

### 5.5 Export to PDF / Excel
- Fee receipts → PDF via `window.print()` (already works with Letterhead)
- Student list → CSV export button
- Attendance report → CSV

---

## Suggested Build Order

```
Week 1  →  Exam + Results module  (1.1)
Week 2  →  Fee payment flow + receipt print  (1.2)
Week 3  →  Parent & Student portals  (2.2, 2.3)
Week 4  →  Report cards  (2.1)
Week 5  →  Announcements + Leave management  (2.4, 3.1)
Week 6  →  JWT auth + bcrypt  (5.1, 5.2)
Week 7  →  Analytics charts  (4.1, 4.2)
Week 8  →  Timetable DB-driven + Admission conversion  (3.2, 3.3)
```

---

## Quick Wins (can do in 1–2 hours each)

| Task | File to edit |
|------|-------------|
| Delete student from DB (not just UI) | `backend/routes/students.js` — add DELETE route |
| Delete teacher from DB | `backend/routes/teachers.js` — add DELETE route |
| Show student count on Dashboard cards | `src/pages/Dashboard.jsx` |
| Admission → Student convert button | `src/pages/Admissions.jsx` |
| Fee receipt print | `src/pages/Fees.jsx` + `Letterhead.jsx` |
| Dark mode toggle in Header | `src/components/Header.jsx` |
| Password change for logged-in user | `src/pages/Settings.jsx` |
