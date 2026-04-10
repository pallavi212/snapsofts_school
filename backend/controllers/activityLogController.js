const ActivityLogModel = require('../models/ActivityLogModel');

const getLogs = async (req, res) => {
    try {
        const { module, action, user_id, limit } = req.query;
        const logs = await ActivityLogModel.getAll({ module, action, user_id, limit });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getLogs };
