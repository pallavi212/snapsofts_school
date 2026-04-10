const StudentModel = require('../models/StudentModel');
const { logActivity } = require('../middleware/activityLogger');
const { validateCommonFields } = require('../utils/validators');

const getStudents = async (req, res) => {
    try {
        const students = await StudentModel.getAll();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getCountByClass = async (req, res) => {
    try {
        const counts = await StudentModel.countByClass();
        res.json(counts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createStudent = async (req, res) => {
    const errors = validateCommonFields({
        name: req.body.name,
        phone: req.body.phone || req.body.contact,
        dob: req.body.dob,
    });
    if (Object.keys(errors).length) {
        console.warn('[Validation] createStudent errors:', errors);
        return res.status(422).json({ errors });
    }
    try {
        const result = await StudentModel.create(req.body);
        logActivity(req, { action: 'CREATE', module: 'Students', details: `Admitted student ${req.body.name} to class ${req.body.class || ''}${req.body.section || ''}` });
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateStudent = async (req, res) => {
    const errors = validateCommonFields({
        name: req.body.name,
        phone: req.body.phone || req.body.contact,
        dob: req.body.dob,
    });
    if (Object.keys(errors).length) {
        console.warn('[Validation] updateStudent errors:', errors);
        return res.status(422).json({ errors });
    }
    try {
        await StudentModel.update(req.params.id, req.body);
        logActivity(req, { action: 'UPDATE', module: 'Students', details: `Updated student ${req.params.id}` });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getStudentsByParent = async (req, res) => {
    try {
        const students = await StudentModel.getByParentUserId(req.params.userId);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getStudentProfile = async (req, res) => {
    try {
        const profile = await StudentModel.getByUserId(req.params.userId);
        if (!profile) return res.status(404).json({ error: 'Student not found' });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getStudents, getCountByClass, createStudent, updateStudent, getStudentsByParent, getStudentProfile };
