# EduSync — Features Documentation

A complete reference of every feature in the system, including the logic flow from frontend to database.

---

## 1. Authentication & User Management

**What it does:** Role-based login system supporting 6 roles — Principal, Admin, Teacher, Accountant, Student, Parent.

**Logic Flow:**
- `Login.jsx` → user enters email + password + selects role → calls `authApi.login()`
- `POST /auth/login` → `authController.js` validates email/role, compares password (bcrypt or plain-text fallback), returns JWT token
- `AuthContext` stores user data globally and drives role-based route protection throughout the app
- On student/teacher creation, a corresponding `users` record is auto-created

**Database:** `users` (id, user_code, name, email, phone, password, role, status)

---

## 2. School Settings & Letterhead

**What it does:** Manage school information and print a formatted school letterhead.

**Logic Flow:**
- `Settings.jsx` → Admin/Principal only can edit school fields (name, trust, address, board, affiliation, principal name, academic year)
- `schoolApi.js` → `GET/PUT /school-info` → `school_info` table
- `SchoolContext` provides school data app-wide to all components
- `Letterhead.jsx` renders the school header (name, address, phone, email) used in printed documents like fee receipts

**Database:** `school_info`

---

## 3. Student Management

**What it does:** Add, edit, view, and manage student records with parent linking and class assignment.

**Logic Flow:**
- `Students.jsx` → students grouped by grade (10→1) and division (A/B = CBSE, C/D = SSC)
- Add Student uses a 2-step modal: Step 1 = student info + class/section, Step 2 = parent info + contact
- `studentApi.create()` → `POST /students` → `StudentModel.create()`:
  1. Find or create parent user in `users` table (role = 'Parent')
  2. Generate `student_code` (STU001, STU002…) and `user_code` (USR###)
  3. Insert into `users` with role = 'Student'
  4. Auto-create or find class by grade + section in `classes` table
  5. Calculate `roll_no` = count of students in that class + 1
  6. Insert into `students` with `parent_user_id` link
- Edit/Delete via `studentApi.update()` / `studentApi.remove()`

**Database:** `users`, `students`, `classes`, `teacher_classes`

---

## 4. Teacher Management

**What it does:** Add, edit, and manage teacher records with subject assignment and class allocation.

**Logic Flow:**
- `Teachers.jsx` → card grid view with teacher details
- Add/Edit modal: name, qualification, subject, experience, email, phone, status, assigned classes (multi-select from 40 classes: 1A–10D)
- `teacherApi.create()` → `POST /teachers` → `TeacherModel.create()`:
  1. Generate `user_code` (USR###) and `teacher_code` (TCH###)
  2. Insert into `users` with role = 'Teacher'
  3. Insert into `teachers` with subject, qualification, experience
  4. Sync assigned classes to `teacher_classes` junction table
- Status options: Active, On Leave, Inactive

**Database:** `users`, `teachers`, `teacher_classes`, `classes`

---

## 5. Attendance Marking

**What it does:** Daily attendance marking per class with Present/Absent toggle and percentage tracking.

**Logic Flow:**
- `Attendance.jsx` → class selector + date picker + student list with toggle buttons
- On load: fetch students for selected class, fetch existing attendance for that date, default unrecorded students to "Present"
- Toggle button switches Present ↔ Absent per student
- Bulk actions: "Mark All Present" / "Mark All Absent"
- `attendanceApi.save()` → `POST /attendance` → `AttendanceModel.save()`:
  1. Resolve class_name → class_id
  2. Resolve student_code → student_id for each record
  3. `INSERT ... ON DUPLICATE KEY UPDATE` (upsert — safe to re-save)
- Summary shows: total days, present count, absent count, attendance % with progress bar
- Parent/Student view shows last 60 attendance records with date and status

**Database:** `attendance` (student_id, class_id, date, status, marked_by)

---

## 6. Fee Management & Receipts

**What it does:** Track fee structure, record payments, and generate printable/shareable fee receipts.

**Logic Flow:**
- Fee structure: 3 tiers by grade (1–4: ₹30k, 5–8: ₹35k, 9–10: ₹40k)
- `Fees.jsx` → fee structure cards + student fee table (annual / paid / due / status)
- Add Payment modal: amount (defaults to remaining due), date, mode (Cash/Online/Cheque/DD), optional receipt no and remarks
- `feeApi.addPayment()` → `POST /fees/payments` → `FeeModel.addPayment()`:
  1. Generate `receipt_no` (RCP + timestamp)
  2. Insert into `fee_payments`
  3. Calculate `cumulative_paid` (running balance)
- `FeeReceipt.jsx` renders:
  - School letterhead
  - Student details (name, ID, class, parent)
  - Payment history table with running balance
  - Print button (`window.print()`)
  - WhatsApp share (`wa.me` with receipt details)
  - Email share (`mailto` with receipt details)
- Parent view: see all children's fee status and download receipts

**Database:** `fee_structure`, `fee_payments`

---

## 7. Teaching Plans & Homework

**What it does:** Teachers post weekly lesson plans with topics, descriptions, homework, and file attachments (PDF/images).

**Logic Flow:**
- `TeachingPlans.jsx` → week navigator + day-wise grid (Monday–Saturday)
- Teacher selects class + week → add/edit/delete plans per day
- Add Plan modal: class, day, subject, topic, description, homework text, upload PDF (homework sheet) and/or image (whiteboard photo)
- `teachingPlanApi.create(formData)` → `POST /teaching-plans` (multipart/form-data) → `TeachingPlanController.createPlan()`:
  1. Resolve class_name → class_id
  2. Handle file uploads via multer → store filenames
  3. Insert into `teaching_plans`
- Files stored in `/backend/uploads/plans/` and served statically
- Parent/Student view (`ParentDashboard.jsx`): plans grouped by week/day, images inline, PDFs downloadable, homework highlighted

**Database:** `teaching_plans` (teacher_id, class_id, week_start, day, subject, topic, description, homework, pdf_path, image_path)

---

## 8. School Calendar & Events

**What it does:** Manage school calendar with color-coded event types.

**Logic Flow:**
- `Calendar.jsx` → month view with event dots + upcoming events sidebar
- Event types: Holiday (red), Exam (orange), Event (blue), PTM (purple), Activity (green)
- Add Event: Admin/Principal only → date + type + title
- `calendarApi.getAll()` → `GET /calendar` → fetches all events
- Display logic: filter for next 30 days (dashboard) or 60 days (student dashboard), color-code by type, show dots on calendar grid, click date to see day's events
- Dashboard integration: upcoming events panel shows next 6 events with date/type badges

**Database:** `calendar_events` (event_date, title, type)

---

## 9. Petty Cash Management

**What it does:** Track petty cash expenses by category with fund top-ups and balance tracking.

**Logic Flow:**
- `PettyCash.jsx` → summary cards (current balance, total funded, total spent) + expense table
- Add Expense modal: date, category (Stationery, Cleaning, Repairs, Courier, Refreshments, Printing, Transport, Misc), description, amount, paid_to, receipt_no
- Add Funds modal: amount, type (Top-up/Adjustment), note → auto-calculates `balance_after`
- `pettyCashApi.addExpense()` → `POST /petty-cash/expenses`:
  1. Generate `expense_no` (PCE + year + ###)
  2. Calculate balance = total_funded − total_spent
  3. Low balance warning if < ₹500
- Filters: search by description/vendor/category, date range presets (Today, This Week, This Month, Last 30 Days)
- Category breakdown: pie chart showing spending by category

**Database:** `petty_cash_expenses`, `petty_cash_fund`

---

## 10. Admissions & Enquiry Tracking

**What it does:** Track admission enquiries with a status workflow from first contact to admission.

**Logic Flow:**
- `Admissions.jsx` → enquiry cards with status summary + table view
- Add Enquiry modal: parent info (name, phone, email, address), student info (name, DOB, gender, applying for class, board preference), previous school, follow-up date, notes
- Status workflow: New → Contacted → Visited → Admitted / Not Interested
- Inline status update: dropdown in table to change status → `enquiryApi.update(id, form)` → `PUT /enquiries/{id}`
- Dashboard integration: enquiry count cards show breakdown by status

**Database:** `enquiries` (enquiry_no, parent_name, phone, email, student_name, dob, gender, applying_for_grade, board_preference, previous_school, address, status, follow_up_date, notes, enquiry_date)

---

## 11. Activity Log & Audit Trail

**What it does:** Track all user actions (CREATE, UPDATE, DELETE, LOGIN) across modules for audit purposes.

**Logic Flow:**
- `ActivityLog.jsx` → filterable table with user, action, module, timestamp, details
- `activityLogger.js` middleware → `logActivity()` called after each significant action (fire-and-forget, errors don't crash main request)
- Logged actions: LOGIN (auth), CREATE/UPDATE/DELETE (students, teachers, users, fees, expenses, etc.)
- `activityLogApi.getAll(params)` → `GET /activity-logs?module=&action=&user_id=&limit=`
- Filters: by module, action, user, with limit (default 200)

**Database:** `activity_logs` (user_id, user_name, role, action, module, details, created_at)

---

## 12. Parent Dashboard & Portal

**What it does:** Parent-specific view showing linked children's attendance, fees, homework, and school notifications.

**Logic Flow:**
- `ParentDashboard.jsx` → child selector tabs (if multiple children linked)
- Child linking: via `students.parent_user_id` (set during student creation or edit)
- On load (parallel API calls):
  1. `studentApi.getByParent(user.id)` → all linked children
  2. `feeApi.getPaymentsByParent(user.id)` → fee status per child
  3. `attendanceApi.getByStudent(student_id)` → attendance history
  4. `teachingPlanApi.getByClass(class_id)` → homework/plans
  5. `calendarApi.getAll()` → upcoming events
  6. `notificationApi.getForParent(user.id)` → school messages
- Tabs: Attendance (monthly summary + daily grid), Fees (annual/paid/due + receipt button), Homework (week-grouped plans with images/PDFs), Notifications (school messages with unread count), Events (upcoming calendar events)

**Database:** `students`, `attendance`, `fee_payments`, `teaching_plans`, `calendar_events`, `school_notifications`, `notification_reads`

---

## 13. Student Dashboard & Self-Service

**What it does:** Student-specific view showing own profile, subjects, attendance, and school events.

**Logic Flow:**
- `StudentDashboard.jsx` → collapsible sections
- On load:
  1. `studentApi.getProfile(user.id)` → own profile
  2. `attendanceApi.getByStudent(student_id)` → attendance history
  3. `calendarApi.getAll()` → upcoming events
- Sections:
  - My Profile: name, ID, class, roll no, DOB, gender, email, phone, parent details
  - My Subjects: board-based subject list (CBSE: Math, Science, English, Hindi, Social Studies, CS; SSC: similar with Marathi)
  - My Attendance: month picker, present/absent/late counts, daily record grid, % bar
  - School Notices & Events: next 60 days from calendar

**Database:** `students`, `users`, `classes`, `attendance`, `calendar_events`

---

## 14. Admin Dashboard & Analytics

**What it does:** Comprehensive overview for Principal/Admin with live statistics, class distribution, and key metrics.

**Logic Flow:**
- `Dashboard.jsx` → loads 7 APIs in parallel using `Promise.allSettled` (failures don't block the page)
- Stat cards: Total Students (CBSE/SSC split), Total Teachers (active/on-leave), Total Users, Fee Collected (this year), Pending Fees, Enquiries
- Class-wise strip: Std 10→1 with student counts and mini progress bars
- Upcoming Events: next 30 days from calendar
- Recent Enquiries: last 6 with status badges
- Fee Summary: collected vs pending with progress bars
- Send Notification form: Admin/Teacher can broadcast messages to all parents
- Role-based visibility: Principal/Admin see all cards; Teacher sees students/events (no finance); Accountant sees fee cards only

**Database:** `students`, `teachers`, `users`, `fee_payments`, `calendar_events`, `enquiries`

---

## 15. User Management & Role Administration

**What it does:** CRUD operations for all users across roles with status management.

**Logic Flow:**
- `UserManagement.jsx` → role filter cards + search + table
- Add User modal: name, email, phone, role, status, password
- `userApi.create()` → `POST /users` → `UserModel.create()`:
  1. Generate `user_code` (USR###)
  2. Hash password with bcrypt
  3. Insert into `users`
  4. If role = Student: auto-create `students` record
  5. If role = Teacher: auto-create `teachers` record
- Role summary cards show count per role (Principal, Admin, Teacher, Accountant, Student, Parent)
- Status options: Active, Inactive, On Leave

**Database:** `users`, `students`, `teachers`

---

## 16. Notifications & Messaging

**What it does:** Admin/Teacher broadcast school messages to parents with read status tracking.

**Logic Flow:**
- Send Notification form in `Dashboard.jsx` (Admin/Teacher only)
- Fields: type (Announcement, Homework, Notice, Fee Reminder, Attendance Alert), title, body, target_type (all / class / student), optional target_id
- `notificationApi.send()` → `POST /notifications`
- `notificationApi.getForParent(parentUserId)` → `GET /notifications/{parentUserId}`:
  1. Fetch all notifications with `target_type = 'all'`
  2. OR `target_type = 'class'` AND `target_id` IN parent's children's classes
  3. OR `target_type = 'student'` AND `target_id` IN parent's children's IDs
  4. Join with `notification_reads` to check read status
- `notificationApi.markRead(id, parentUserId)` → `PUT /notifications/{id}/read`
- Parent view: unread count badge, mark as read button, color-coded by type

**Database:** `school_notifications`, `notification_reads`

---

## Database Tables Summary

| Table | Purpose |
|---|---|
| `users` | All user accounts across all roles |
| `students` | Student records with parent_user_id link |
| `teachers` | Teacher records (subject, qualification, experience) |
| `classes` | Class definitions (1A–10D, grade, section, board) |
| `teacher_classes` | Junction: teacher ↔ class assignments |
| `attendance` | Daily attendance per student per class |
| `fee_structure` | Fee tiers by grade |
| `fee_payments` | Payment records with receipt tracking |
| `teaching_plans` | Weekly lesson plans with homework and file paths |
| `calendar_events` | School events (holiday, exam, PTM, activity) |
| `petty_cash_expenses` | Expense records by category |
| `petty_cash_fund` | Fund top-ups with running balance |
| `enquiries` | Admission enquiry tracking |
| `activity_logs` | Audit trail of all user actions |
| `school_notifications` | Broadcast messages to parents |
| `notification_reads` | Read status per parent per notification |
| `school_info` | School metadata (name, trust, address, board, etc.) |

---

## Key Architectural Patterns

- Role-Based Access Control — user.role drives feature visibility and route protection
- Parent-Child Linking — `students.parent_user_id` enables the parent portal
- Auto-Code Generation — STU###, TCH###, USR###, PCE###, RCP### codes generated on insert
- Upsert Pattern — attendance uses `ON DUPLICATE KEY UPDATE` for idempotent saves
- Fire-and-Forget Logging — activity log errors never crash the main request
- Multipart File Upload — teaching plans support PDF/image uploads via multer
- JWT Authentication — token-based auth with bcrypt password hashing
- Context API — `SchoolContext` and `AuthContext` provide global state
- Parallel API Loading — `Promise.allSettled` on dashboard prevents one failure from blocking others
- Static File Serving — `/uploads` directory served via `express.static` for PDFs and images
