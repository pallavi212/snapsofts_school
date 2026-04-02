# Bugfix Requirements Document

## Introduction

The parent dashboard currently has no way to receive or view messages sent by the school (admin/teachers). When a school sends an Announcement, Homework assignment, Notice, Fee Reminder, or Attendance Alert to parents, there is no notification surface on the parent dashboard — parents remain unaware of these communications. This feature adds a school notifications/messaging panel to the parent dashboard so parents can see all messages directed at them or their children.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the school admin or teacher sends a message of type Announcement, Homework, Notice, Fee Reminder, or Attendance Alert THEN the system does not store or display the message to the parent.

1.2 WHEN a parent logs in and views the parent dashboard THEN the system does not show any notifications or messages panel.

1.3 WHEN a message is sent targeting a specific student's parent THEN the system has no mechanism to associate or deliver that message to the correct parent.

### Expected Behavior (Correct)

2.1 WHEN the school admin or teacher sends a message of type Announcement, Homework, Notice, Fee Reminder, or Attendance Alert THEN the system SHALL store the message with its type, content, target audience, and timestamp.

2.2 WHEN a parent logs in and views the parent dashboard THEN the system SHALL display a notifications panel listing all messages relevant to that parent, showing message type, title, body, and date.

2.3 WHEN a message is sent targeting a specific student's parent THEN the system SHALL associate the message with that parent via the student–parent link (students.parent_user_id = users.id) and display it on their dashboard.

2.4 WHEN a message is of type Fee Reminder THEN the system SHALL visually distinguish it (e.g. with a distinct badge/color) so the parent can identify urgent financial communications.

2.5 WHEN a message is of type Attendance Alert THEN the system SHALL visually distinguish it so the parent can identify attendance-related communications.

2.6 WHEN there are no messages for a parent THEN the system SHALL display an empty state message indicating no notifications are available.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a parent views the parent dashboard THEN the system SHALL CONTINUE TO display the child's attendance records correctly.

3.2 WHEN a parent views the parent dashboard THEN the system SHALL CONTINUE TO display the child's fee summary and payment status correctly.

3.3 WHEN a parent views the parent dashboard THEN the system SHALL CONTINUE TO display upcoming school calendar events correctly.

3.4 WHEN a parent has multiple children THEN the system SHALL CONTINUE TO allow switching between children and showing each child's data independently.

3.5 WHEN a parent requests a fee receipt THEN the system SHALL CONTINUE TO generate and display the receipt correctly.

3.6 WHEN an admin or teacher accesses the main dashboard THEN the system SHALL CONTINUE TO function without any disruption from the notifications feature.
