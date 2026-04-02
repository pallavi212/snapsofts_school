const db = require('../db');

const UserModel = {
    getAll: () => db.query(
        'SELECT id, user_code, name, email, phone, role, status, created_at FROM users ORDER BY id'
    ).then(([rows]) => rows),

    create: async ({ name, email, phone, role, status, password }) => {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const [[{ count }]] = await conn.query('SELECT COUNT(*) as count FROM users');
            const code = `USR${String(Number(count) + 1).padStart(3, '0')}`;

            const [userResult] = await conn.query(
                `INSERT INTO users (user_code, name, email, phone, password, role, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [code, name, email, phone, password || '1', role, status || 'Active']
            );

            const user_id = userResult.insertId;

            if (role === 'Student') {
                const [[{ cnt }]] = await conn.query('SELECT COUNT(*) AS cnt FROM students');
                const student_code = `STU${String(cnt + 1).padStart(3, '0')}`;

                // Find the first available class
                const [[cls]] = await conn.query('SELECT id FROM classes LIMIT 1');
                const class_id = cls ? cls.id : null;

                if (!class_id) {
                    throw new Error('No classes available in the database. Please create a class first.');
                }

                await conn.query(
                    `INSERT INTO students (user_id, student_code, class_id, roll_no)
                      VALUES (?, ?, ?, ?)`,
                    [user_id, student_code, class_id, cnt + 1]
                );
            } else if (role === 'Teacher') {
                const [[{ count: tCount }]] = await conn.query('SELECT COUNT(*) as count FROM teachers');
                const teacher_code = `TCH${String(Number(tCount) + 1).padStart(3, '0')}`;
                await conn.query(
                    `INSERT INTO teachers (user_id, teacher_code, subject, qualification, experience)
                     VALUES (?, ?, 'Not Assigned', 'Not Specified', '0 Years')`,
                    [user_id, teacher_code]
                );
            }

            await conn.commit();
            return code;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    delete: (code) => db.query('DELETE FROM users WHERE user_code = ?', [code]),

    update: (code, { name, email, phone, role, status }) =>
        db.query(
            'UPDATE users SET name=?, email=?, phone=?, role=?, status=? WHERE user_code=?',
            [name, email, phone, role, status, code]
        ),
};

module.exports = UserModel;
