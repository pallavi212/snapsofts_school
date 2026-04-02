const NotificationModel = require('../models/NotificationModel');

const getForParent = async (req, res) => {
    try {
        res.json(await NotificationModel.getForParent(req.params.parentUserId));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAll = async (req, res) => {
    try {
        res.json(await NotificationModel.getAll());
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const createNotification = async (req, res) => {
    const { type, title, body, sent_by } = req.body;
    if (!type || !title || !body || !sent_by)
        return res.status(400).json({ error: 'type, title, body, sent_by are required' });
    try {
        const result = await NotificationModel.create(req.body);
        res.status(201).json({ message: 'Notification sent', id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const markRead = async (req, res) => {
    const { parentUserId } = req.body;
    if (!parentUserId) return res.status(400).json({ error: 'parentUserId required' });
    try {
        await NotificationModel.markRead(req.params.id, parentUserId);
        res.json({ message: 'Marked as read' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteNotification = async (req, res) => {
    try {
        await NotificationModel.delete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getForParent, getAll, createNotification, markRead, deleteNotification };
