const db = require('../db');

const ActivityLogModel = {
    log: ({ user_id, user_name, role, action, module, details }) =>
        db.query(
            `INSERT INTO activity_logs (user_id, user_name, role, action, module, details)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id || null, user_name || 'System', role || null, action, module, details || null]
        ).catch(() => { }), // never crash the main request

    getAll: ({ module, action, user_id, limit = 200 } = {}) => {
        let sql = `SELECT * FROM activity_logs WHERE 1=1`;
        const params = [];
        if (module) { sql += ' AND module = ?'; params.push(module); }
        if (action) { sql += ' AND action = ?'; params.push(action); }
        if (user_id) { sql += ' AND user_id = ?'; params.push(user_id); }
        sql += ` ORDER BY created_at DESC LIMIT ?`;
        params.push(Number(limit));
        return db.query(sql, params).then(([rows]) => rows);
    },
};

module.exports = ActivityLogModel;
