const db = require('../db');

const TeachingPlanModel = {
    getByTeacher: (teacher_id, { class_id, week_start } = {}) => {
        let sql = `
            SELECT tp.*, c.name AS class_name, u.name AS teacher_name
            FROM teaching_plans tp
            JOIN classes c  ON c.id = tp.class_id
            JOIN teachers t ON t.id = tp.teacher_id
            JOIN users u    ON u.id = t.user_id
            WHERE tp.teacher_id = ?
        `;
        const params = [teacher_id];
        if (class_id) { sql += ' AND tp.class_id = ?'; params.push(class_id); }
        if (week_start) { sql += ' AND tp.week_start = ?'; params.push(week_start); }
        sql += ' ORDER BY tp.week_start, FIELD(tp.day,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday")';
        return db.query(sql, params).then(([rows]) => rows);
    },

    getByClass: (class_id, week_start) => {
        let sql = `
            SELECT tp.*, u.name AS teacher_name
            FROM teaching_plans tp
            JOIN teachers t ON t.id = tp.teacher_id
            JOIN users u    ON u.id = t.user_id
            WHERE tp.class_id = ?
        `;
        const params = [class_id];
        if (week_start) { sql += ' AND tp.week_start = ?'; params.push(week_start); }
        sql += ' ORDER BY tp.week_start, FIELD(tp.day,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday")';
        return db.query(sql, params).then(([rows]) => rows);
    },

    // Only plans that have homework text, PDF or image — for parent homework view
    getHomeworkByClass: (class_id) => {
        const sql = `
            SELECT tp.*, u.name AS teacher_name
            FROM teaching_plans tp
            JOIN teachers t ON t.id = tp.teacher_id
            JOIN users u    ON u.id = t.user_id
            WHERE tp.class_id = ?
              AND (tp.homework IS NOT NULL AND tp.homework != ''
                   OR tp.pdf_path IS NOT NULL
                   OR tp.image_path IS NOT NULL)
            ORDER BY tp.week_start DESC,
                     FIELD(tp.day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')
        `;
        return db.query(sql, [class_id]).then(([rows]) => rows);
    },

    create: ({ teacher_id, class_id, week_start, day, subject, topic, description, homework, pdf_path, image_path }) =>
        db.query(
            `INSERT INTO teaching_plans
               (teacher_id, class_id, week_start, day, subject, topic, description, homework, pdf_path, image_path)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [teacher_id, class_id, week_start, day, subject, topic,
                description || null, homework || null, pdf_path || null, image_path || null]
        ).then(([r]) => r.insertId),

    update: (id, { topic, description, homework, pdf_path, image_path }) =>
        db.query(
            `UPDATE teaching_plans
             SET topic = ?, description = ?, homework = ?,
                 pdf_path   = COALESCE(?, pdf_path),
                 image_path = COALESCE(?, image_path)
             WHERE id = ?`,
            [topic, description || null, homework || null, pdf_path || null, image_path || null, id]
        ).then(([r]) => r),

    delete: (id) => db.query('DELETE FROM teaching_plans WHERE id = ?', [id]),
};

module.exports = TeachingPlanModel;
