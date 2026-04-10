const UserModel = require('../models/UserModel');
const { logActivity } = require('../middleware/activityLogger');

const getUsers = async (req, res) => {
    try {
        res.json(await UserModel.getAll());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createUser = async (req, res) => {
    try {
        const code = await UserModel.create(req.body);
        logActivity(req, { action: 'CREATE', module: 'Users', details: `Created user ${req.body.name} (${req.body.role})` });
        res.status(201).json({ message: 'User created', user_code: code });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await UserModel.delete(req.params.id);
        logActivity(req, { action: 'DELETE', module: 'Users', details: `Deleted user ${req.params.id}` });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        await UserModel.update(req.params.id, req.body);
        logActivity(req, { action: 'UPDATE', module: 'Users', details: `Updated user ${req.params.id}` });
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getParents = async (req, res) => {
    try {
        const [rows] = await require('../db').query(
            `SELECT id, user_code, name, email, phone FROM users WHERE role = 'Parent' AND status = 'Active' ORDER BY name`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getUsers, createUser, deleteUser, updateUser, getParents };
