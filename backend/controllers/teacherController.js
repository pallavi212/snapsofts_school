const TeacherModel = require('../models/TeacherModel');
const { logActivity } = require('../middleware/activityLogger');
const { validateCommonFields } = require('../utils/validators');

const getTeachers = async (req, res) => {
    try {
        const teachers = await TeacherModel.getAll();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createTeacher = async (req, res) => {
    const errors = validateCommonFields({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
    });
    if (Object.keys(errors).length) {
        console.warn('[Validation] createTeacher errors:', errors);
        return res.status(422).json({ errors });
    }
    try {
        const code = await TeacherModel.create(req.body);
        logActivity(req, { action: 'CREATE', module: 'Teachers', details: `Added teacher ${req.body.name} (${code})` });
        res.status(201).json({ message: 'Teacher added', teacher_code: code });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateTeacher = async (req, res) => {
    const errors = validateCommonFields({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
    });
    if (Object.keys(errors).length) {
        console.warn('[Validation] updateTeacher errors:', errors);
        return res.status(422).json({ errors });
    }
    try {
        await TeacherModel.update(req.params.id, req.body);
        logActivity(req, { action: 'UPDATE', module: 'Teachers', details: `Updated teacher ${req.params.id}` });
        res.json({ message: 'Teacher updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getTeachers, createTeacher, updateTeacher };
