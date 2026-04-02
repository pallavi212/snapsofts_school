# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Notifications Panel Missing for Parent
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope to the concrete failing cases — any authenticated parent session on ParentDashboard
  - Test 1 — API missing: `GET /api/notifications/:parentUserId` → assert HTTP 404 (endpoint does not exist)
  - Test 2 — Panel absent: Render `<ParentDashboard />` → assert no element with `data-testid="notifications-panel"` exists
  - Test 3 — Send missing: `POST /api/notifications` → assert HTTP 404
  - isBugCondition: `userRole = 'Parent' AND currentPage = 'ParentDashboard' AND notificationsPanelExists = false AND apiEndpointExists = false`
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: All three tests FAIL (this is correct — it proves the bug exists)
  - Document counterexamples found (e.g., "GET /api/notifications/1 returns 404, no panel element rendered")
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Parent Dashboard Panels Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: `attendanceApi.getByStudent(studentId)` returns correct records for any student
  - Observe on UNFIXED code: `feeApi.getPaymentsByParent(parentUserId)` returns correct fee rows
  - Observe on UNFIXED code: `calendarApi.getAll()` returns correct upcoming events
  - Observe on UNFIXED code: child-switching (activeChild index) correctly changes displayed child data
  - Write property-based test: for any parent with N children, switching child index renders that child's data
  - Write property-based test: for any student, attendance records rendered match API response
  - Write property-based test: for any student, fee summary (paid/due/total) matches API response
  - Write property-based test: for any calendar state, upcoming events panel matches filtered API response
  - Verify all tests PASS on UNFIXED code (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Fix — Add school notifications pipeline

  - [ ] 3.1 Add `school_notifications` and `notification_reads` tables to database schema
    - Append `school_notifications` table to `database/schema.sql` (type ENUM, title, body, target_type, target_id, sent_by, created_at)
    - Append `notification_reads` join table (notification_id + user_id composite PK, read_at)
    - Create migration script or run ALTER/CREATE statements against the live DB
    - _Bug_Condition: isBugCondition where apiEndpointExists = false (no table → no endpoint)_
    - _Expected_Behavior: school_notifications table exists; notifications can be stored and queried_
    - _Preservation: No existing tables are modified; all existing FK relationships remain intact_
    - _Requirements: 2.1, 2.3_

  - [ ] 3.2 Create `backend/models/NotificationModel.js`
    - `getForParent(parentUserId)` — JOIN school_notifications with students (via parent_user_id) and LEFT JOIN notification_reads; return is_read boolean; filter by target_type ('all', 'class' matching student's class_id, 'student' matching student's id)
    - `create(data)` — INSERT into school_notifications; validate type, title, body, target_type, sent_by
    - `markRead(notificationId, parentUserId)` — INSERT IGNORE into notification_reads (idempotent)
    - _Bug_Condition: isBugCondition where apiEndpointExists = false (no model → no data layer)_
    - _Expected_Behavior: getForParent returns only notifications relevant to that parent's children_
    - _Preservation: No existing models are modified_
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.3 Create `backend/controllers/notificationController.js`
    - `getNotifications(req, res)` — calls `NotificationModel.getForParent(req.params.parentUserId)`; returns 200 with array
    - `createNotification(req, res)` — validates required fields (type, title, body, target_type, sent_by); returns 400 if missing; calls `NotificationModel.create`; returns 201
    - `markRead(req, res)` — calls `NotificationModel.markRead(req.params.id, req.body.parentUserId)`; returns 200
    - _Bug_Condition: isBugCondition where apiEndpointExists = false_
    - _Expected_Behavior: GET returns filtered notifications; POST stores new notification; PUT marks read_
    - _Preservation: No existing controllers are modified_
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.4 Create `backend/routes/notifications.js` and register in `backend/index.js`
    - Create route file: `GET /api/notifications/:parentUserId`, `POST /api/notifications`, `PUT /api/notifications/:id/read`
    - Add `app.use('/api/notifications', require('./routes/notifications'))` to `backend/index.js`
    - _Bug_Condition: isBugCondition where apiEndpointExists = false_
    - _Expected_Behavior: All three endpoints respond correctly after registration_
    - _Preservation: Existing route registrations in index.js are untouched_
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.5 Create `src/api/notificationApi.js` and export from `src/api/index.js`
    - Implement `getForParent(parentUserId)`, `send(body)`, `markRead(id, parentUserId)` using the existing `request` helper pattern from other api files
    - Add `export { notificationApi } from './notificationApi'` to `src/api/index.js`
    - _Bug_Condition: isBugCondition where notificationsPanelExists = false (no API module → panel can't fetch)_
    - _Expected_Behavior: Frontend can call all three notification endpoints_
    - _Preservation: Existing api exports in index.js are untouched_
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.6 Add `NotificationsPanel` component to `src/pages/ParentDashboard.jsx`
    - Add `data-testid="notifications-panel"` to the panel root element
    - Fetch `notificationApi.getForParent(user.id)` on mount; store in state
    - Render notification cards with color-coded type badge (Announcement=blue, Homework=purple, Notice=amber, Fee Reminder=red, Attendance Alert=green — per design color table)
    - "Mark as read" button per card calls `notificationApi.markRead`; updates local state
    - Show empty state "No notifications yet." when list is empty (`data-testid="notifications-empty"`)
    - Render panel in the existing grid below attendance/fees and events cards
    - _Bug_Condition: isBugCondition where notificationsPanelExists = false_
    - _Expected_Behavior: Panel visible for all parent sessions; shows relevant notifications with correct badges; empty state when none_
    - _Preservation: AttendancePanel, FeePanel, EventsPanel, child-selector, receipt modal — all untouched_
    - _Requirements: 2.2, 2.4, 2.5, 2.6_

  - [ ] 3.7 Add `SendNotificationForm` to `src/pages/Dashboard.jsx` for staff roles
    - Render form only when `['Principal', 'Admin', 'Teacher'].includes(user?.role)`
    - Fields: Type (select with 5 ENUM values), Title (text), Body (textarea), Target (All / Class / Student with conditional ID picker)
    - On submit call `notificationApi.send(body)`; show success/error feedback
    - _Bug_Condition: isBugCondition (staff have no send UI, so no notifications can be created)_
    - _Expected_Behavior: Staff can compose and send notifications; form submits to POST /api/notifications_
    - _Preservation: All existing Dashboard stat cards, events, enquiries, fee summary, teachers overview — untouched_
    - _Requirements: 2.1_

  - [ ] 3.8 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Notifications Panel Visible for Parent
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - Test 1: `GET /api/notifications/:parentUserId` → now returns 200 with array (not 404)
    - Test 2: Render `<ParentDashboard />` → element with `data-testid="notifications-panel"` now exists
    - Test 3: `POST /api/notifications` with valid body → now returns 201 (not 404)
    - **EXPECTED OUTCOME**: All three tests PASS (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Parent Dashboard Panels Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Confirm attendance, fee, calendar, and child-switching tests all still pass after fix
    - **EXPECTED OUTCOME**: All preservation tests PASS (confirms no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite; confirm Property 1 (bug condition) and Property 2 (preservation) both pass
  - Manually smoke-test: log in as a parent → notifications panel visible; log in as admin → send form visible; existing attendance/fee/calendar panels unaffected
  - Ask the user if any questions arise before closing the spec
