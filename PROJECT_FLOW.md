# EduSync — Project Flow

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite                   |
| Styling   | CSS Variables + Tailwind (utility)|
| Routing   | React Router v6                   |
| Backend   | Node.js + Express                 |
| Database  | MySQL (school_db)                 |
| API       | REST — `http://localhost:5002/api`|

---

## Project Structure

```
school/
├── backend/
│   ├── .env                  # DB config + PORT
│   ├── index.js              # Express app entry, all routes registered
│   ├── db.js                 # MySQL2 connection pool
│   ├── models/               # DB query logic
│   │   ├── StudentModel.js
│   │   ├── TeacherModel.js
│   │   ├── AttendanceModel.js
│   │   ├── FeeModel.js
│   │   ├── CalendarModel.js
│   │   ├── ParentModel.js
│   │   └── UserModel.js
│   ├── controllers/          # Request handlers
│   └── routes/               # Express routers
│       ├── auth.js
│       ├── students.js
│       ├── teachers.js
│       ├── attendance.js
│       ├── fees.js
│       ├── users.js
│       ├── calendar.js
│       ├── classes.js
│       ├── parents.js
│       ├── schoolInfo.js
│       └── enquiry.js
│
├── database/
│   ├── schema.sql            # All CREATE TABLE statements
│   └── seed.sql              # Initial data
│
└── src/
    ├── api/                  # Frontend API calls (fetch wrappers)
    │   ├── config.js         # BASE_URL = localhost:5002/api
    │   ├── index.js          # Re-exports all APIs
    │   ├── authApi.js
    │   ├── studentApi.js
    │   ├── teacherApi.js
    │   ├── attendanceApi.js
    │   ├── feeApi.js
    │   ├── userApi.js
    │   ├── calendarApi.js
    │   ├── classApi.js
    │   ├── parentApi.js
    │   ├── schoolApi.js
    │   └── enquiryApi.js
    ├── context/
    │   ├── AuthContext.jsx   # Login state, user role
    │   └── SchoolContext.jsx # School info (name, trust, address)
    ├── components/
    │   ├── Header.jsx        # Top bar — school name, user, logout
    │   ├── Sidebar.jsx       # Role-based nav links
    │   └── Letterhead.jsx    # Reusable print letterhead
    ├── layouts/
    │   └── DashboardLayout.jsx
    └── pages/
        ├── Login.jsx
        ├── Dashboard.jsx
        ├── Students.jsx
        ├── Teachers.jsx
        ├── Attendance.jsx
        ├── Fees.jsx
        ├── Timetable.jsx
        ├── Calendar.jsx
        ├── UserManagement.jsx
        ├── Admissions.jsx
        ├── Settings.jsx
        └── LetterheadPreview.jsx
```

---

## Application Flow

### 1. Entry Point
```
main.jsx
  └── App.jsx
        ├── AuthProvider      (wraps everything)
        ├── SchoolProvider    (fetches school_info from DB)
        └── React Router
              ├── /login      → Login.jsx
              └── /           → DashboardLayout
                                  ├── Sidebar
                                  ├── Header
                                  └── <Outlet> → page content
```

### 2. Login Flow
```
Login.jsx
  └── authApi.login(email, password)
        └── POST /api/auth/login
              └── users table → returns { user, token }
                    └── AuthContext stores user + role
                          └── Redirect → /dashboard
```

### 3. Role-Based Access

| Role           | Pages Accessible                                              |
|----------------|---------------------------------------------------------------|
| Principal      | All pages including Settings, User Mgmt, Admissions          |
| Admin          | All pages including Settings, User Mgmt, Admissions          |
| Teacher        | Dashboard, Students, Teachers, Attendance, Timetable, Calendar|
| Accountant     | Dashboard, Students, Teachers, Fees, Calendar                |
| Student        | Dashboard, Students, Teachers, Timetable, Calendar, My Fees  |
| Parent         | Dashboard, Students, Teachers, Timetable, Calendar, My Fees  |

---

## Database Tables

```
school_db
├── users                 — all login accounts (all roles)
├── classes               — 40 classes (Grade 1–10 × A/B/C/D)
├── teachers              — teacher profiles
├── teacher_classes       — teacher ↔ class assignments
├── students              — student profiles
├── parents               — parent profiles
├── attendance            — daily per-student attendance
├── fee_structure         — fee slabs by grade range
├── fee_payments          — individual payment records
├── student_fees          — student fee summary
├── timetable             — period-wise schedule
├── calendar_events       — holidays, exams, PTM, activities
├── subjects              — subject master
├── exams                 — exam schedule
├── results               — student exam results
├── leaves                — leave applications
├── assignments           — homework/assignments
├── school_info           — school name, trust, address, contact
└── admission_enquiries   — walk-in admission leads
```

---

## Page-by-Page Flow

### Dashboard `/`
```
Dashboard.jsx
  ├── studentApi.getAll()         → total students
  ├── teacherApi.getAll()         → total teachers
  ├── userApi.getAll()            → total users
  └── feeApi.getAll()             → fee collected
        └── Shows stat cards (Principal/Admin only see financials)
```

### Students `/students`
```
Students.jsx
  ├── studentApi.getAll()         → GET /api/students
  ├── studentApi.countByClass()   → GET /api/students/count-by-class
  ├── Filters: Class dropdown (1–10) + Division dropdown (A/B/C/D)
  ├── Grade-grouped sections (10 → 1)
  │     └── Division sub-sections (A=CBSE, B=CBSE, C=SSC, D=SSC)
  └── Add/Edit modal (2-step: Student Info → Parent Info)
        └── studentApi.create() / studentApi.update()
              └── POST/PUT /api/students
                    └── StudentModel — transaction:
                          users INSERT + students INSERT + class_id lookup
```

### Teachers `/teachers`
```
Teachers.jsx
  ├── teacherApi.getAll()         → GET /api/teachers
  ├── Card grid view per teacher
  └── Add/Edit modal
        ├── Board: CBSE/SSC
        ├── Assigned Classes: 1A–10D (all 40)
        └── teacherApi.create() / teacherApi.update()
              └── TeacherModel — transaction:
                    users INSERT + teachers INSERT + teacher_classes sync
```

### Attendance `/attendance`
```
Attendance.jsx
  ├── studentApi.getAll()                     → student list
  ├── attendanceApi.getByClassAndDate()       → existing records
  ├── Class selector + Date picker
  ├── Per-student Present/Absent toggle
  ├── Bulk mark all + search
  └── attendanceApi.save()                    → POST /api/attendance
```

### Fees `/fees`
```
Fees.jsx
  ├── feeApi.getAll()             → student fee records
  ├── Fee structure display (Class 1–4: ₹30k, 5–8: ₹35k, 9–10: ₹40k)
  ├── Filter: Paid / Partial / Pending
  └── Payment recording
```

### Timetable `/timetable`
```
Timetable.jsx
  ├── Toggle: CBSE (8 periods) / SSC (7 periods)
  ├── Start time: 8:30 AM
  ├── Mon–Sat schedule grid
  └── Static display (DB-driven in future)
```

### Calendar `/calendar`
```
Calendar.jsx
  ├── calendarApi.getAll()        → GET /api/calendar
  ├── Monthly grid with color-coded event dots
  ├── Event types: holiday / exam / event / ptm / activity
  ├── Upcoming events panel
  └── Full 2025–26 academic year pre-seeded
```

### Admissions `/admissions`
```
Admissions.jsx
  ├── enquiryApi.getAll()         → GET /api/enquiries
  ├── Status summary cards: New / Contacted / Visited / Admitted / Not Interested
  ├── Inline status update (dropdown in table row)
  └── Add/Edit modal
        ├── Parent info (name, phone, email, address)
        ├── Student info (name, DOB, gender, class, board, prev school)
        └── Follow-up (status, date, notes)
              └── enquiryApi.create() / enquiryApi.update()
```

### User Management `/users`
```
UserManagement.jsx
  ├── userApi.getAll()            → GET /api/users
  ├── Role summary cards
  ├── Search + role filter
  └── Add/Edit modal (name, email, phone, role, status)
```

### Settings `/settings`
```
Settings.jsx
  ├── schoolApi.get()             → GET /api/school-info
  ├── View mode (all roles)
  └── Edit mode (Principal / Admin only)
        └── schoolApi.update()   → PUT /api/school-info
              Fields: school name, trust name, trust ID, address,
                      city, state, pincode, phone, email, website,
                      principal, academic year, affiliation no, board
```

### Letterhead `/letterhead`
```
LetterheadPreview.jsx
  └── <Letterhead title="..." printable>
        └── useSchool() — pulls live data from SchoolContext
              Displays: logo initial, school name, trust, address,
                        phone, email, board, affiliation no
              Print button → window.print()
              CSS: sidebar/header hidden on print
```

---

## API Endpoints Summary

| Method | Endpoint                        | Description                  |
|--------|---------------------------------|------------------------------|
| POST   | /api/auth/login                 | Login                        |
| GET    | /api/students                   | All students                 |
| GET    | /api/students/count-by-class    | Count per class              |
| POST   | /api/students                   | Add student                  |
| PUT    | /api/students/:id               | Update student               |
| GET    | /api/teachers                   | All teachers                 |
| POST   | /api/teachers                   | Add teacher                  |
| PUT    | /api/teachers/:id               | Update teacher               |
| GET    | /api/attendance                 | Attendance records           |
| POST   | /api/attendance                 | Save attendance              |
| GET    | /api/fees                       | Fee records                  |
| GET    | /api/users                      | All users                    |
| POST   | /api/users                      | Add user                     |
| PUT    | /api/users/:id                  | Update user                  |
| GET    | /api/calendar                   | Calendar events              |
| POST   | /api/calendar                   | Add event                    |
| GET    | /api/classes                    | All classes                  |
| GET    | /api/school-info                | School info                  |
| PUT    | /api/school-info                | Update school info           |
| GET    | /api/enquiries                  | Admission enquiries          |
| POST   | /api/enquiries                  | New enquiry                  |
| PUT    | /api/enquiries/:id              | Update enquiry               |
| DELETE | /api/enquiries/:id              | Delete enquiry               |

---

## How to Run

```bash
# 1. Database
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# 2. Backend
cd backend
npm install
node index.js          # runs on port 5002

# 3. Frontend
npm install
npm run dev            # runs on port 5173 or 5174
```

---

## Board & Section Convention

| Section | Board | Grades  |
|---------|-------|---------|
| A       | CBSE  | 1 – 10  |
| B       | CBSE  | 1 – 10  |
| C       | SSC   | 1 – 10  |
| D       | SSC   | 1 – 10  |

Total classes: **40** (10 grades × 4 sections)

---

## Fee Structure

| Grade Range | Annual Fee |
|-------------|------------|
| Class 1 – 4 | ₹ 30,000   |
| Class 5 – 8 | ₹ 35,000   |
| Class 9 – 10| ₹ 40,000   |
