const ActivityLogModel = require('../models/ActivityLogModel');

/**
 * Call this inside any controller to record an action.
 * req.user is set by auth middleware if present; otherwise pass actor manually.
 */
const logActivity = (req, { action, module, details, actor } = {}) => {
    const user = actor || req?.user || {};
    ActivityLogModel.log({
        user_id: user.id || null,
        user_name: user.name || user.email || 'Unknown',
        role: user.role || null,
        action,
        module,
        details,
    });
};

module.exports = { logActivity };
