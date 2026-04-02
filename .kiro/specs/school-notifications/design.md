# School Notifications Bugfix Design

## Overview

Parents currently have no way to receive or view messages sent by the school. This fix adds a
full notifications pipeline: a `school_notifications` DB table, a backend Model → Controller →
Route layer, a frontend `notificationApi.js`, and a Notifications panel on `ParentDashboard`.
Admin/Principal/Teacher also get a simple send-notification form on their Dashboard.

The fix is additive — no existing tables, routes, or UI components are modified. All existing
parent dashboard behaviour (attendance, fees, calendar, receipt) is preserved unchanged.

---

## Glossary

- **Bug_Condition (C)**: A parent is logged in and the dashboard renders, yet no notifications
  panel exists and no school messages are shown.
- **Property (P)**: After the fix, the parent dashboard SHALL display a notifications panel
  listing all messages relevant to that parent, with type badges, read/unread state, and an
  empty state when there are none.
- **Preservation**: All existing parent dashboard panels (attendance, fees, calendar, receipt)
  and all admin/teacher dashboard functionality must remain unchanged.
- **NotificationModel**: `backend/models/NotificationModel.js` — SQL queries against
  `school_notifications`.
- **notificationController**: `backend/controllers/notificationController.js` — Express
  handlers for GET (parent) and POST (staff).
- **notificationApi**: `src/api/notificationApi.js` — frontend fetch wrapper.
- **NotificationsPanel**: React component rendered inside `ParentDashboard.jsx` showing the
  notification list.
- **SendNotificationForm**: React component rendered inside `src/pages/Dashboard.jsx` for
  Admin/Principal/Teacher to compose and send a notification.
- **target_type**: `'all'` | `'class'` | `'student'` — scope of the notification.
- **target_id**: NULL for `all`, class_id for `class`, student_id for `student`.

---

## Bug Details

### Bug Condition

The bug manifests whenever a parent loads their dashboard. The `ParentDashboard` component
fetches attendance, fees, and calendar data but never fetches or renders notifications because
no notifications table, API endpoint, or UI panel exists.

**Formal Specification:**
```
FUNCTION isBugCondition(context)
  INPUT: context = { userRole, currentPage, notificationsPanelExists, apiEndpointExists }
  OUTPUT: boolean

  RETURN context.userRole = 'Parent'
         AND context.currentPage = 'ParentDashboard'
         AND context.notificationsPanelExists = false
         AND context.apiEndpointExists = false
END FUNCTION
```

### Examples

- Parent logs in → dashboard loads → no bell badge, no notifications section → parent misses
  a Fee Reminder sent by admin. (Expected: panel shows the reminder with an orange badge.)
- Teacher sends a Homework notification targeting Class 5A → parent of a 5A student sees
  nothing. (Expected: notification appears in parent's panel.)
- Admin broadcasts an Announcement to all parents → no parent sees it. (Expected: all parents
  see it in their notifications panel.)
- No notifications have been sent yet → parent sees nothing. (Expected: empty state message
  "No notifications yet.")

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Attendance panel in `ParentDashboard` must continue to fetch and display records correctly.
- Fee summary, payment status, and receipt generation must continue to work correctly.
- Upcoming calendar events panel must continue to display correctly.
- Multi-child selector must continue to switch children and show per-child data.
- Admin/Teacher main `Dashboard` page must continue to function without disruption.
- All existing backend routes (`/api/attendance`, `/api/fees`, `/api/parents`, etc.) must
  remain unmodified.

**Scope:**
All code paths that do NOT involve the new `school_notifications` table or
`/api/notifications` routes are completely unaffected by this fix.

---

## Hypothesized Root Cause

The feature is entirely absent — this is a missing-feature bug, not a logic error in existing
code. The root causes are:

1. **No DB table**: `school_notifications` does not exist in `database/schema.sql`, so there
   is nowhere to store messages.

2. **No backend layer**: No `NotificationModel`, `notificationController`, or
   `/api/notifications` route exists, so the frontend has no endpoint to call.

3. **No frontend API module**: `src/api/notificationApi.js` does not exist and is not
   exported from `src/api/index.js`.

4. **No UI panel**: `ParentDashboard.jsx` has no notifications panel, no bell badge with
   unread count, and no send-notification form exists on `Dashboard.jsx`.

---

## Correctness Properties

Property 1: Bug Condition — Notifications Panel Visible to Parent

_For any_ authenticated parent session where the parent dashboard is rendered, the fixed
application SHALL display a notifications panel listing all messages where `target_type =
'all'`, OR `target_type = 'class'` AND the parent's child is in that class, OR `target_type =
'student'` AND the parent's child matches `target_id`. Each notification SHALL show its type
badge, title, body, and formatted date.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

Property 2: Preservation — Existing Parent Dashboard Panels Unchanged

_For any_ parent session where the bug condition does NOT hold (notifications panel already
exists and works), the fixed code SHALL produce exactly the same attendance records, fee
summaries, calendar events, and receipt data as the original code, with no regressions in
any existing panel.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

---

## Fix Implementation

### 1. Database — `database/schema.sql` (append) + migration script

**New table:**
```sql
CREATE TABLE IF NOT EXISTS school_notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('Announcement','Homework','Notice','Fee Reminder','Attendance Alert') NOT NULL,
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  target_type ENUM('all','class','student') NOT NULL DEFAULT 'all',
  target_id   INT DEFAULT NULL,          -- class_id or student_id; NULL when target_type='all'
  sent_by     INT NOT NULL,              -- users.id of sender
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sent_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id INT NOT NULL,
  user_id         INT NOT NULL,          -- parent users.id
  read_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id, user_id),
  FOREIGN KEY (notification_id) REFERENCES school_notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)         REFERENCES users(id) ON DELETE CASCADE
);
```

> `is_read` is stored per-parent in a separate `notification_reads` join table rather than a
> column on `school_notifications`, because a single notification can target many parents.

### 2. Backend

**File: `backend/models/NotificationModel.js`**
- `getForParent(parentUserId)` — JOIN `school_notifications` with `students` and
  `notification_reads` to return all notifications relevant to the parent, with an `is_read`
  boolean derived from whether a `notification_reads` row exists.
- `create(data)` — INSERT into `school_notifications`.
- `markRead(notificationId, parentUserId)` — INSERT IGNORE into `notification_reads`.

**File: `backend/controllers/notificationController.js`**
- `getNotifications(req, res)` — calls `NotificationModel.getForParent(req.params.parentUserId)`.
- `createNotification(req, res)` — validates required fields, calls `NotificationModel.create`.
- `markRead(req, res)` — calls `NotificationModel.markRead`.

**File: `backend/routes/notifications.js`**
```
GET  /api/notifications/:parentUserId   → getNotifications
POST /api/notifications                 → createNotification
PUT  /api/notifications/:id/read        → markRead (body: { parentUserId })
```

**File: `backend/index.js`** — add:
```js
app.use('/api/notifications', require('./routes/notifications'));
```

### 3. Frontend API

**File: `src/api/notificationApi.js`**
```js
export const notificationApi = {
  getForParent: (parentUserId) => request('GET', `/notifications/${parentUserId}`),
  send: (body) => request('POST', '/notifications', body),
  markRead: (id, parentUserId) => request('PUT', `/notifications/${id}/read`, { parentUserId }),
};
```

**File: `src/api/index.js`** — add export:
```js
export { notificationApi } from './notificationApi';
```

### 4. Frontend UI

**File: `src/pages/ParentDashboard.jsx`**

Add a `NotificationsPanel` component (inline or imported) that:
- Fetches `notificationApi.getForParent(user.id)` on mount.
- Shows a list of notification cards with a color-coded type badge.
- Supports "Mark as read" per notification (calls `notificationApi.markRead`).
- Shows an empty state when the list is empty.
- Renders in the existing grid below the attendance/fees and events cards.

Add a bell icon with unread count badge in the parent dashboard welcome banner (or reuse the
existing `Header` bell — see note below).

**Bell icon placement:** The existing `Header.jsx` already renders a `<Bell>` icon with a
static red dot. The fix will make the bell functional for parent sessions by passing the
unread count as a prop or via context, and clicking it will scroll to / open the notifications
panel.

**Type badge color mapping:**
| Type              | Background                        | Text color                  |
|-------------------|-----------------------------------|-----------------------------|
| Announcement      | `hsla(221,83%,53%,0.12)`          | `hsl(221,83%,45%)`          |
| Homework          | `hsla(271,81%,56%,0.12)`          | `hsl(271,81%,45%)`          |
| Notice            | `hsla(38,92%,50%,0.12)`           | `hsl(38,92%,35%)`           |
| Fee Reminder      | `hsla(354,70%,54%,0.12)`          | `hsl(354,70%,45%)`          |
| Attendance Alert  | `hsla(152,69%,41%,0.12)`          | `hsl(152,69%,30%)`          |

**File: `src/pages/Dashboard.jsx`**

Add a `SendNotificationForm` section visible only to roles `Principal`, `Admin`, `Teacher`.
Fields: Type (select), Title (text), Body (textarea), Target (All / Class / Student with
conditional ID picker). Submit calls `notificationApi.send`.

---

## Testing Strategy

### Validation Approach

Two-phase: first run exploratory tests on the unfixed codebase to confirm the bug (missing
endpoint / missing panel), then run fix-checking and preservation tests after implementation.

### Exploratory Bug Condition Checking

**Goal**: Confirm the bug exists before implementing the fix.

**Test Plan**: Make HTTP requests to `/api/notifications/:parentUserId` and assert 404.
Render `ParentDashboard` in a test environment and assert no notifications panel is present.

**Test Cases:**
1. **API Missing Test**: `GET /api/notifications/1` → expect 404 (will confirm on unfixed code).
2. **Panel Absent Test**: Render `<ParentDashboard />` → assert no element with
   `data-testid="notifications-panel"` exists (will confirm on unfixed code).
3. **Send Missing Test**: `POST /api/notifications` → expect 404 (will confirm on unfixed code).

**Expected Counterexamples:**
- All three requests return 404 / component renders without the panel.

### Fix Checking

**Goal**: Verify that after the fix, all bug-condition inputs produce the correct behavior.

**Pseudocode:**
```
FOR ALL parentUser WHERE isBugCondition({ role:'Parent', page:'ParentDashboard',
                                          panelExists:false, apiExists:false }) DO
  result := renderParentDashboard(parentUser)
  ASSERT notificationsPanelVisible(result) = true
  ASSERT notificationsMatchDB(result, parentUser.id) = true
END FOR
```

### Preservation Checking

**Goal**: Verify that all existing parent dashboard panels are unaffected.

**Pseudocode:**
```
FOR ALL parentUser WHERE NOT isBugCondition(context) DO
  ASSERT attendancePanel_original(parentUser) = attendancePanel_fixed(parentUser)
  ASSERT feePanel_original(parentUser)        = feePanel_fixed(parentUser)
  ASSERT calendarPanel_original(parentUser)   = calendarPanel_fixed(parentUser)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because
it generates many parent/student combinations automatically and catches edge cases.

**Test Cases:**
1. **Attendance Preservation**: Verify attendance records render identically before and after fix.
2. **Fee Preservation**: Verify fee summary and receipt generation are unaffected.
3. **Calendar Preservation**: Verify upcoming events panel is unaffected.
4. **Multi-child Preservation**: Verify child-switching still works correctly.

### Unit Tests

- `NotificationModel.getForParent` returns only notifications relevant to the given parent.
- `NotificationModel.getForParent` correctly filters by `target_type` (`all`, `class`, `student`).
- `NotificationModel.markRead` inserts a `notification_reads` row and is idempotent.
- `notificationController.createNotification` returns 400 when required fields are missing.
- `NotificationsPanel` renders the correct badge color for each notification type.
- `NotificationsPanel` renders the empty state when the list is empty.

### Property-Based Tests

- For any set of randomly generated notifications with mixed `target_type` values, only
  notifications relevant to the parent's children appear in the panel (no leakage).
- For any parent with N unread notifications, the unread count badge shows exactly N.
- For any existing parent dashboard state (attendance/fees/calendar), adding notifications
  does not change the data returned by the other API endpoints.

### Integration Tests

- Full flow: Admin sends Announcement (target: all) → parent logs in → notification appears.
- Full flow: Teacher sends Homework (target: class) → parent of student in that class sees it,
  parent of student in a different class does not.
- Full flow: Parent marks notification as read → unread count decreases → re-fetch shows
  `is_read: true`.
- Regression: After fix is deployed, existing attendance/fee/calendar API calls return the
  same data as before.
