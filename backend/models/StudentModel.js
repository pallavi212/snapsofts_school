const db = require('../db');

const StudentModel = {
  create: async (data) => {
    const { name, email, phone, contact, status = 'Active', class: grade, section, parent, parentEmail, parentRelation, dob, gender } = data;
    const mappedPhone = phone || contact || '';
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Find or create parent user — store their users.id as parent_user_id
      let parent_user_id = null;
      if (parent) {
        const [existing] = await conn.query(
          `SELECT id FROM users WHERE name = ? AND role = 'Parent' LIMIT 1`,
          [parent]
        );
        if (existing.length > 0) {
          parent_user_id = existing[0].id;
        } else {
          const [[{ max_id: p_max_id }]] = await conn.query('SELECT MAX(id) AS max_id FROM users');
          const p_code = `USR${String((p_max_id || 0) + 1).padStart(3, '0')}`;
          const [pUserResult] = await conn.query(
            `INSERT INTO users (user_code, name, phone, email, password, role, status)
             VALUES (?, ?, ?, ?, '1', 'Parent', 'Active')`,
            [p_code, parent, mappedPhone, parentEmail || null]
          );
          parent_user_id = pUserResult.insertId;
        }
      }

      // Generate student_code like STU001
      const [[{ max_id: s_max_id }]] = await conn.query('SELECT MAX(id) AS max_id FROM students');
      const student_code = `STU${String((s_max_id || 0) + 1).padStart(3, '0')}`;

      // Generate user_code USR001
      const [[{ max_id: u_max_id }]] = await conn.query('SELECT MAX(id) AS max_id FROM users');
      const user_code = `USR${String((u_max_id || 0) + 1).padStart(3, '0')}`;

      // Insert into users
      const [userResult] = await conn.query(
        `INSERT INTO users (user_code, name, email, phone, password, role, status)
         VALUES (?, ?, ?, ?, '1', 'Student', ?)`,
        [user_code, name, email || `${student_code.toLowerCase()}@edusync.edu`, mappedPhone, status]
      );
      const user_id = userResult.insertId;

      // Find class_id by grade + section — auto-create if missing
      const sec = (section || 'A').toUpperCase();
      const gradeNum = parseInt(grade) || 1;
      const className = `${gradeNum}${sec}`;

      let [[cls]] = await conn.query(
        'SELECT id FROM classes WHERE name = ? LIMIT 1',
        [className]
      );
      if (!cls) {
        // Class doesn't exist yet — insert it on the fly
        const [newCls] = await conn.query(
          `INSERT INTO classes (name, grade, section, board) VALUES (?, ?, ?, 'CBSE')`,
          [className, gradeNum, sec]
        );
        cls = { id: newCls.insertId };
      }
      const class_id = cls.id;

      // Roll number = count of students in that class + 1
      const [[{ rollCnt }]] = await conn.query(
        'SELECT COUNT(*) AS rollCnt FROM students WHERE class_id = ?', [class_id]
      );
      const roll_no = rollCnt + 1;

      // Insert into students
      await conn.query(
        `INSERT INTO students (user_id, student_code, class_id, roll_no, dob, gender, parent_name, parent_user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, student_code, class_id, roll_no, dob || null, gender || null, parent || '', parent_user_id]
      );

      await conn.commit();
      return { student_code };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  getAll: () => db.query(`
    SELECT s.id, s.student_code, s.roll_no, s.dob, s.gender, s.parent_name,
           s.parent_user_id,
           u.name, u.email, u.phone, u.status,
           c.name AS class_name, c.grade, c.board,
           up.name AS parent_user_name, up.email AS parent_user_email
    FROM students s
    JOIN users u   ON s.user_id  = u.id
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN users up ON s.parent_user_id = up.id
  `).then(([rows]) => rows),

  // Get a single student's full profile by their users.id (for student self-view)
  getByUserId: (userId) => db.query(`
    SELECT s.id, s.student_code, s.roll_no, s.dob, s.gender, s.parent_name,
           s.parent_user_id,
           u.name, u.email, u.phone, u.status,
           c.name AS class_name, c.grade, c.section, c.board, c.id AS class_id,
           up.name AS parent_user_name, up.phone AS parent_phone, up.email AS parent_email
    FROM students s
    JOIN users u   ON s.user_id  = u.id
    JOIN classes c ON s.class_id = c.id
    LEFT JOIN users up ON s.parent_user_id = up.id
    WHERE s.user_id = ?
    LIMIT 1
  `, [userId]).then(([rows]) => rows[0] || null),
  getByParentUserId: (parentUserId) => db.query(`
    SELECT s.id, s.student_code, s.roll_no, s.dob, s.gender, s.parent_name,
           u.name, u.email, u.phone, u.status,
           c.name AS class_name, c.grade, c.board, c.id AS class_id
    FROM students s
    JOIN users u   ON s.user_id  = u.id
    JOIN classes c ON s.class_id = c.id
    WHERE s.parent_user_id = ?
    ORDER BY c.grade
  `, [parentUserId]).then(([rows]) => rows),

  countByClass: () => db.query(`
    SELECT c.name AS class_name, c.grade, c.section, c.board, COUNT(s.id) AS count
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    GROUP BY c.id
    ORDER BY c.grade, c.section
  `).then(([rows]) => rows),

  update: async (student_code, data) => {
    const { name, email, phone, contact, status, grade, class: cls, section, dob, gender, parent, parent_user_id } = data;
    const mappedPhone = phone || contact || '';
    const mappedGrade = grade || cls;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // Update user record
      await conn.query(
        `UPDATE users u
                 JOIN students s ON s.user_id = u.id
                 SET u.name = ?, u.email = COALESCE(?, u.email), u.phone = ?, u.status = ?
                 WHERE s.student_code = ?`,
        [name, email || null, mappedPhone, status, student_code]
      );
      // Update class if grade/section provided
      if (mappedGrade && section) {
        const sec = section.toUpperCase();
        const gradeNum = parseInt(mappedGrade);
        const className = `${gradeNum}${sec}`;

        let [[cls]] = await conn.query(
          'SELECT id FROM classes WHERE name = ? LIMIT 1', [className]
        );
        if (!cls) {
          const [newCls] = await conn.query(
            `INSERT INTO classes (name, grade, section, board) VALUES (?, ?, ?, 'CBSE')`,
            [className, gradeNum, sec]
          );
          cls = { id: newCls.insertId };
        }
        await conn.query(
          'UPDATE students SET class_id = ? WHERE student_code = ?',
          [cls.id, student_code]
        );
      }
      // Update dob, gender, parent_name and parent_user_id
      await conn.query(
        `UPDATE students
         SET dob = COALESCE(?, dob),
             gender = COALESCE(?, gender),
             parent_name = COALESCE(?, parent_name),
             parent_user_id = ?
         WHERE student_code = ?`,
        [dob || null, gender || null, parent || null, parent_user_id || null, student_code]
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },
};

module.exports = StudentModel;
