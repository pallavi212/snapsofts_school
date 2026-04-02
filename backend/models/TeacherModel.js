const db = require('../db');

const TeacherModel = {
    getAll: () => db.query(`
        SELECT t.id, t.teacher_code, t.subject, t.qualification, t.experience,
               u.name, u.email, u.phone, u.status,
               GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ',') AS classes
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN teacher_classes tc ON tc.teacher_id = t.id
        LEFT JOIN classes c ON c.id = tc.class_id
        GROUP BY t.id
    `).then(([rows]) => rows.map(r => ({
        ...r,
        classes: r.classes ? r.classes.split(',') : [],
    }))),

    // Replace all assigned classes for a teacher
    _syncClasses: async (conn, teacher_id, classes = []) => {
        await conn.query('DELETE FROM teacher_classes WHERE teacher_id = ?', [teacher_id]);
        if (classes.length === 0) return;
        const [rows] = await conn.query(
            `SELECT id FROM classes WHERE name IN (${classes.map(() => '?').join(',')})`,
            classes
        );
        if (rows.length === 0) return;
        await conn.query(
            'INSERT INTO teacher_classes (teacher_id, class_id) VALUES ?',
            [rows.map(r => [teacher_id, r.id])]
        );
    },

    update: async (teacher_code, { name, email, phone, subject, qualification, experience, status, classes }) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            await conn.query(
                `UPDATE teachers t JOIN users u ON t.user_id = u.id
                 SET t.subject = ?, t.qualification = ?, t.experience = ?,
                     u.name = ?, u.email = ?, u.phone = ?, u.status = ?
                 WHERE t.teacher_code = ?`,
                [subject, qualification, experience, name, email, phone, status, teacher_code]
            );
            const [[teacher]] = await conn.query(
                'SELECT id FROM teachers WHERE teacher_code = ?', [teacher_code]
            );
            if (teacher) {
                await TeacherModel._syncClasses(conn, teacher.id, classes || []);
            }
            await conn.commit();
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    create: async ({ name, email, phone, subject, qualification, experience, status, classes }) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const [[{ max_id: u_max }]] = await conn.query('SELECT MAX(id) AS max_id FROM users');
            const user_code = `USR${String((u_max || 0) + 1).padStart(3, '0')}`;

            const [userResult] = await conn.query(
                `INSERT INTO users (user_code, name, email, phone, password, role, status)
                 VALUES (?, ?, ?, ?, '1', 'Teacher', ?)`,
                [user_code, name, email, phone, status || 'Active']
            );

            const [[{ max_id: t_max }]] = await conn.query('SELECT MAX(id) AS max_id FROM teachers');
            const teacher_code = `TCH${String((t_max || 0) + 1).padStart(3, '0')}`;

            const [teacherResult] = await conn.query(
                `INSERT INTO teachers (user_id, teacher_code, subject, qualification, experience)
                 VALUES (?, ?, ?, ?, ?)`,
                [userResult.insertId, teacher_code, subject, qualification, experience]
            );

            if (classes && classes.length > 0) {
                await TeacherModel._syncClasses(conn, teacherResult.insertId, classes);
            }

            await conn.commit();
            return teacher_code;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },
};

module.exports = TeacherModel;
