const db = require('../db');

const AttendanceModel = {
  getByClassAndDate: (class_id, date) => db.query(`
    SELECT s.id, s.student_code, u.name,
           COALESCE(a.status, 'Absent') AS status
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
    WHERE s.class_id = ?
    ORDER BY s.roll_no
  `, [date, class_id]).then(([rows]) => rows),

  // Attendance history for a single student (for parent view)
  getByStudentId: (student_id) => db.query(`
        SELECT a.date, a.status, c.name AS class_name
        FROM attendance a
        JOIN classes c ON a.class_id = c.id
        WHERE a.student_id = ?
        ORDER BY a.date DESC
        LIMIT 60
    `, [student_id]).then(([rows]) => rows),

  save: (class_id, date, records, marked_by) => {
    const values = records.map(r => [r.student_id, class_id, date, r.status, marked_by]);
    return db.query(`
      INSERT INTO attendance (student_id, class_id, date, status, marked_by)
      VALUES ?
      ON DUPLICATE KEY UPDATE status = VALUES(status)
    `, [values]);
  },
};

module.exports = AttendanceModel;
