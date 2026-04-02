const db = require('../db');

const NotificationModel = {
    // Get all notifications relevant to a parent (via their children)
    getForParent: (parentUserId) => db.query(`
        SELECT DISTINCT n.*,
               u.name AS sent_by_name,
               IF(nr.user_id IS NOT NULL, 1, 0) AS is_read
        FROM school_notifications n
        JOIN users u ON n.sent_by = u.id
        LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
        WHERE n.target_type = 'all'
           OR (n.target_type = 'class'   AND n.target_id IN (
                SELECT class_id FROM students WHERE parent_user_id = ?
               ))
           OR (n.target_type = 'student' AND n.target_id IN (
                SELECT id FROM students WHERE parent_user_id = ?
               ))
        ORDER BY n.created_at DESC
    `, [parentUserId, parentUserId, parentUserId]).then(([rows]) => rows),

    // Get all notifications (for staff view)
    getAll: () => db.query(`
        SELECT n.*, u.name AS sent_by_name
        FROM school_notifications n
        JOIN users u ON n.sent_by = u.id
        ORDER BY n.created_at DESC
    `).then(([rows]) => rows),

    create: ({ type, title, body, target_type, target_id, sent_by }) =>
        db.query(
            `INSERT INTO school_notifications (type, title, body, target_type, target_id, sent_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [type, title, body, target_type || 'all', target_id || null, sent_by]
        ).then(([r]) => r),

    markRead: (notificationId, userId) =>
        db.query(
            `INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)`,
            [notificationId, userId]
        ).then(([r]) => r),

    delete: (id) => db.query('DELETE FROM school_notifications WHERE id = ?', [id]),
};

module.exports = NotificationModel;
