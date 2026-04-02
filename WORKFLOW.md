# EduSync — Complete Workflow Guide

> School: EduSync International School | Trust: Snapsofts Tech
> DB: school_db | Backend: localhost:5002 | Frontend: localhost:5173

---

## How to Start the Project

```bash
# Terminal 1 — Backend
cd backend
node index.js
# → Running on http://localhost:5002

# Terminal 2 — Frontend
npm run dev
# → Running on http://localhost:5173
```

---

## Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React 18 + Vite               |
| Routing   | React Router v6               |
| Styling   | CSS Variables (no framework)  |
| Backend   | Node.js + Express             |
| Database  | MySQL 8 — school_db           |
| API Base  | http://localhost:5002/api     |

---

## Login Credentials (all passwords = `1`)

| Role       | Email                          | Password |
|------------|--------------------------------|----------|
| Principal  | principal@edusync.edu          | 1        |
| Admin      | admin@edusync.edu              | 1        |
| Teacher    | santosh.teacher@gmail.com      | 1        |
| Accountant | accounts@edusync.edu           | 1        |
| Parent     | dhondiram@gmail.com            | 1        |
| Student    | aditi@gmail.com                | 123456   |

> The login page has a clickable demo credentials panel — click any row to auto-fill.

---

## Application Entry Flow

```
Browser → localhost:5173
  └── main.jsx
        └── App.jsx
              ├── AuthProvider     ← manages login state + JWT token
              ├── SchoolProvider   ← fetches school_info from DB on load
              └── React Router
                    ├── /login     → Login.jsx (public)
                    └── /          → DashboardLayout (protected)
                                        ├── Sidebar (role-based nav)
                                        ├── Header (school name, user, logout)
                                        └── <Outlet> → active page
```

---

## Role-Based Home Page

When a user logs in, they land on different dashboards:

| Role       | Home Page          | What they see |
|------------|--------------------|---------------|
| Principal  | Dashboard.jsx      | Full school stats, all panels |
| Admin      | Dashboard.jsx      | Full school stats, all panels |
| Teacher    | Dashboard.jsx      | Stats + Send Notification form |
| Accountant | Dashboard.jsx      | Fee stats only |
| Parent     | ParentDashboard.jsx | Their children's data only |
| Student    | StudentDashboard.jsx | Own profile, attendance, subjects |

---

## Page-by-Page Workflow

### 🔐 Login `/login`
```
User selects role → enters email + password
  └── POST /api/auth/login
        └── Checks users table (email + role match + password)
              └── Returns JWT token + user object
                    └── Stored in localStorage
                          └── Redirect to /
```

---

### 📊 Admin Dashboard `/`
```
Loads 7 APIs simultaneously (Promise.allSettled):
  ├── GET /api/students          → total count, CBSE/SSC split
  ├── GET /api/students/count-by-class → class-wise strip
  ├── GET /api/teachers          → total, active, on-leave
  ├── GET /api/users             → total users
  ├── GET /api/fees/payments     → collected + pending amounts
  ├── GET /api/calendar          → upcoming events (next 30 days)
  └── GET /api/enquiries         → recent admission leads

Displays:
  ├── Stat cards (role-filtered — finance only for Principal/Admin/Accountant)
  ├── Class-wise student strip (Std 10 → 1)
  ├── Upcoming events panel
  ├── Recent enquiries panel (management only)
  ├── Fee summary with progress bars
  ├── Teachers overview
  └── Send Notification form (Principal/Admin/Teacher only)
```

---

### 👨‍👩‍👧 Parent Dashboard `/` (role=Parent)
```
Loads 3 APIs:
  ├── GET /api/students/by-parent/:userId  → children linked to this parent
  ├── GET /api/fees/payments/by-parent/:userId → fee summary per child
  └── GET /api/calendar → upcoming events

Displays:
  ├── Welcome banner
  ├── Child selector tabs (if multiple children)
  ├── Child info card (name, class, board, status)
  ├── Attendance tab → GET /api/attendance/student/:studentId
  ├── Fees tab → paid/due/receipt
  ├── Upcoming events
  └── School Messages panel → GET /api/notifications/:parentUserId
```

---

### 🎓 Student Dashboard `/` (role=Student)
```
Loads 2 APIs:
  ├── GET /api/students/profile/:userId → own profile
  └── GET /api/calendar → upcoming events

Displays:
  ├── My Profile (name, ID, class, roll, DOB, parent details)
  ├── My Subjects (board-based list)
  ├── My Attendance → GET /api/attendance/student/:studentId
  └── School Notices & Events
```

---

### 👨‍🎓 Students `/students`
```
GET /api/students → all students
GET /api/students/count-by-class → grade totals

UI:
  ├── Search by name/ID
  ├── Class dropdown (10 → 1 with counts)
  ├── Division dropdown (A/B/C/D)
  └── Grade-grouped collapsible sections
        └── Division sub-sections (A/B=CBSE, C/D=SSC)
              └── Student table with parent info

Add Student (Admin/Principal only):
  Step 1: Board, Name, Class, Section, DOB, Gender, Status
  Step 2: Parent name, relation, contact, email
          + Link Parent Login Account (search existing parent users)
  └── POST /api/students
        └── Transaction: INSERT users + INSERT students + find/create parent

Edit Student:
  └── PUT /api/students/:student_code
        └── Updates users + students + class + parent_user_id
```

---

### 👩‍🏫 Teachers `/teachers`
```
GET /api/teachers → all teachers with assigned classes

UI:
  ├── Teacher cards (subject, qualification, experience, status)
  └── Add/Edit modal
        ├── Name, email, phone, subject, qualification, experience, status
        └── Assigned Classes (all 40: 1A–10D checkboxes)

Add Teacher:
  └── POST /api/teachers
        └── Transaction: INSERT users + INSERT teachers + sync teacher_classes

Edit Teacher:
  └── PUT /api/teachers/:teacher_code
        └── Updates users + teachers + deletes/re-inserts teacher_classes
```

---

### 📋 Attendance `/attendance`
```
GET /api/classes → class dropdown
GET /api/attendance?class_id=1A&date=2026-03-01 → existing records

UI:
  ├── Class selector (all 40 classes)
  ├── Date picker (default: today)
  ├── Search student
  ├── All Present / All Absent bulk buttons
  └── Per-student Present/Absent toggle

Save:
  └── POST /api/attendance
        Body: { class: "1A", date: "2026-03-01", records: [{student_code, status}] }
        Controller resolves:
          "1A" → classes.id (numeric)
          student_code → students.id (numeric)
        └── INSERT attendance with ON DUPLICATE KEY UPDATE
```

---

### 💰 Fees `/fees`
```
GET /api/fees/structure → fee slabs
GET /api/fees/payments  → all students with total_paid

UI:
  ├── Fee structure cards (₹30k / ₹35k / ₹40k)
  ├── Student table: Annual Fee | Paid | Due | Status
  ├── Filter: All / Paid / Partial / Pending
  └── Pay button → Add Payment modal
        └── POST /api/fees/payments
              Body: { student_db_id, amount_paid, payment_date, payment_mode, receipt_no, academic_year }

Receipt button:
  └── GET /api/fees/payments/:studentId → payment history
        └── FeeReceipt modal with:
              ├── Print (new window)
              ├── WhatsApp (wa.me link)
              └── Email (mailto link)
```

---

### 🕐 Timetable `/timetable`
```
GET /api/classes → all 40 classes for dropdown

UI:
  ├── Class dropdown (grouped by grade, 10 → 1)
  ├── Board auto-detected from selected class
  └── Weekly grid (Mon–Sat)
        ├── CBSE: 8 periods, 8:30 AM – 3:25 PM
        └── SSC:  7 periods, 8:30 AM – 2:45 PM
```

---

### 📅 Calendar `/calendar`
```
GET /api/calendar → all events

UI:
  ├── Monthly grid with color-coded dots
  ├── Event types: holiday / exam / event / ptm / activity
  ├── Click date → see events
  └── Add/Edit/Delete (Admin/Principal only)
        └── POST/PUT/DELETE /api/calendar
```

---

### 📢 Admissions `/admissions`
```
GET /api/enquiries → all enquiries

UI:
  ├── Status summary cards: New / Contacted / Visited / Admitted / Not Interested
  ├── Inline status dropdown per row
  └── Add/Edit modal:
        ├── Student: name, DOB, gender, class, board, previous school
        ├── Parent: name, phone, email, address
        └── Follow-up: status, date, notes
              └── POST/PUT /api/enquiries
```

---

### 👥 User Management `/users`
```
GET /api/users → all users

UI:
  ├── Role summary cards
  ├── Search + role filter
  └── Add/Edit modal (name, email, phone, role, status)
        └── POST /api/users
              If role=Student → also creates students row
              If role=Teacher → also creates teachers row
```

---

### 💵 Petty Cash `/petty-cash`
```
GET /api/petty-cash/summary   → current balance, total funded, total spent
GET /api/petty-cash/expenses  → all expense records
GET /api/petty-cash/categories → spending by category

UI:
  ├── Balance card (red warning if < ₹500)
  ├── Category breakdown pills (click to filter)
  ├── Search + Date range filter + Quick presets (Today/Week/Month/Last 30)
  ├── Table view / History view toggle
  │     History: grouped by date with daily totals
  └── Add Expense modal (date, category, description, amount, paid-to, receipt no)
        └── POST /api/petty-cash/expenses

Add Funds (Admin/Principal only):
  └── POST /api/petty-cash/fund
        └── Top-up or Adjustment entry
```

---

### ⚙️ Settings `/settings`
```
GET /api/school-info → school details

UI:
  ├── View mode (all roles)
  └── Edit mode (Principal/Admin only)
        Fields: school name, trust name, trust ID, address, city, state,
                pincode, phone, email, website, principal, academic year,
                affiliation no, board
        └── PUT /api/school-info
```

---

### 📄 Letterhead `/letterhead`
```
Uses SchoolContext (already loaded) — no extra API call

Displays:
  ├── Gradient header bars
  ├── School logo initial
  ├── School name, trust, address, phone, email, board, affiliation no
  └── Print button → window.print() (sidebar/header hidden via CSS)
```

---

### 🔔 School Notifications
```
Staff sends (Admin/Principal/Teacher — on Dashboard):
  └── POST /api/notifications
        Body: { type, title, body, target_type: 'all'|'class'|'student', sent_by }

Parent receives (on ParentDashboard):
  └── GET /api/notifications/:parentUserId
        Returns notifications where:
          target_type = 'all'
          OR target_type = 'class' AND parent's child is in that class
          OR target_type = 'student' AND parent's child matches

Mark as read:
  └── PUT /api/notifications/:id/read
        Body: { parentUserId }
        └── INSERT IGNORE into notification_reads table
```

---

## Complete API Reference

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/login | Login | Public |
| GET | /api/students | All students | All staff |
| GET | /api/students/count-by-class | Grade counts | All staff |
| GET | /api/students/by-parent/:userId | Parent's children | Parent |
| GET | /api/students/profile/:userId | Student's own profile | Student |
| POST | /api/students | Add student | Admin/Principal |
| PUT | /api/students/:code | Update student | Admin/Principal |
| GET | /api/teachers | All teachers | All |
| POST | /api/teachers | Add teacher | Admin/Principal |
| PUT | /api/teachers/:code | Update teacher | Admin/Principal |
| GET | /api/attendance | By class + date | Teacher+ |
| GET | /api/attendance/student/:id | Student history | Parent/Student |
| POST | /api/attendance | Save attendance | Teacher+ |
| GET | /api/fees/structure | Fee slabs | All |
| GET | /api/fees/payments | All student fees | Accountant+ |
| GET | /api/fees/payments/by-parent/:userId | Parent's children fees | Parent |
| GET | /api/fees/payments/:studentId | Student payment history | All |
| POST | /api/fees/payments | Record payment | Accountant+ |
| GET | /api/calendar | All events | All |
| POST | /api/calendar | Add event | Admin/Principal |
| PUT | /api/calendar/:id | Update event | Admin/Principal |
| DELETE | /api/calendar/:id | Delete event | Admin/Principal |
| GET | /api/classes | All 40 classes | All |
| GET | /api/users | All users | Admin/Principal |
| GET | /api/users/parents | Parent users list | Admin/Principal |
| POST | /api/users | Add user | Admin/Principal |
| PUT | /api/users/:code | Update user | Admin/Principal |
| DELETE | /api/users/:code | Delete user | Admin/Principal |
| GET | /api/enquiries | All enquiries | Admin/Principal |
| POST | /api/enquiries | New enquiry | Admin/Principal |
| PUT | /api/enquiries/:id | Update enquiry | Admin/Principal |
| DELETE | /api/enquiries/:id | Delete enquiry | Admin/Principal |
| GET | /api/school-info | School details | All |
| PUT | /api/school-info | Update school info | Admin/Principal |
| GET | /api/petty-cash/summary | Balance summary | Accountant+ |
| GET | /api/petty-cash/expenses | All expenses | Accountant+ |
| POST | /api/petty-cash/expenses | Add expense | Accountant+ |
| DELETE | /api/petty-cash/expenses/:id | Delete expense | Admin/Principal |
| GET | /api/petty-cash/fund | Fund history | Admin/Principal |
| POST | /api/petty-cash/fund | Add top-up | Admin/Principal |
| GET | /api/petty-cash/categories | Category breakdown | Accountant+ |
| GET | /api/notifications | All notifications | Staff |
| GET | /api/notifications/:parentUserId | Parent's notifications | Parent |
| POST | /api/notifications | Send notification | Staff |
| PUT | /api/notifications/:id/read | Mark as read | Parent |
| DELETE | /api/notifications/:id | Delete notification | Admin/Principal |
| GET | /api/health | Server health check | Public |

---

## Data Flow: Request to Response

```
Frontend (React)
  └── src/api/studentApi.js
        └── request('GET', '/students')
              └── fetch('http://localhost:5002/api/students')
                    └── backend/routes/students.js
                          └── studentController.getStudents()
                                └── StudentModel.getAll()
                                      └── MySQL query → school_db.students JOIN users JOIN classes
                                            └── Returns rows
                                                  └── res.json(rows)
                                                        └── React state update → UI re-renders
```

---

## Sidebar Navigation by Role

| Role | Nav Items |
|------|-----------|
| Principal | Dashboard, Students, Teachers, User Mgmt, Admissions, Letterhead, Settings, Attendance, Timetable, Calendar, Fees, Petty Cash |
| Admin | Same as Principal |
| Teacher | Dashboard, Students, Teachers, Attendance, Timetable, Calendar |
| Accountant | Dashboard, Students, Teachers, Calendar, Fees, Petty Cash |
| Parent | My Dashboard, Calendar, Timetable |
| Student | My Dashboard, Timetable, Calendar |

---

## Board & Class Convention

| Section | Board | Grades |
|---------|-------|--------|
| A | CBSE | 1–10 |
| B | CBSE | 1–10 |
| C | SSC  | 1–10 |
| D | SSC  | 1–10 |

Total: **40 classes** (10 grades × 4 sections)

---

## Fee Structure

| Grade | Annual Fee |
|-------|-----------|
| 1–4   | ₹30,000   |
| 5–8   | ₹35,000   |
| 9–10  | ₹40,000   |

---

## Key Files Reference

```
src/
  api/config.js          ← BASE_URL = http://localhost:5002/api
  api/index.js           ← exports all API modules
  context/AuthContext.jsx ← user login state, JWT token
  context/SchoolContext.jsx ← school info (name, trust, address)
  layouts/DashboardLayout.jsx ← sidebar + header shell
  pages/Login.jsx        ← login form with demo credentials
  pages/Dashboard.jsx    ← admin/teacher home
  pages/ParentDashboard.jsx ← parent home
  pages/StudentDashboard.jsx ← student home

backend/
  .env                   ← DB_HOST, DB_USER, DB_PASS, DB_NAME, PORT=5002
  index.js               ← Express app, all routes registered
  db.js                  ← MySQL2 connection pool
  models/                ← SQL query logic
  controllers/           ← request/response handlers
  routes/                ← Express route definitions

database/
  schema.sql             ← CREATE TABLE statements
  seed.sql               ← initial data
  fix_parent_link.sql    ← parent-child link migration
```
