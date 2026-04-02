const db = require('../db');

const ParentModel = {
  getAll: () => db.query(`
    SELECT p.id as parent_id, p.relation, p.occupation,
           u.id as user_id, u.user_code, u.name, u.email, u.phone, u.status, u.created_at
    FROM parents p
    JOIN users u ON p.user_id = u.id
  `).then(([rows]) => rows),

  getById: (id) => db.query(`
    SELECT p.id as parent_id, p.relation, p.occupation,
           u.id as user_id, u.user_code, u.name, u.email, u.phone, u.status, u.created_at
    FROM parents p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `, [id]).then(([rows]) => rows[0])
};

module.exports = ParentModel;
