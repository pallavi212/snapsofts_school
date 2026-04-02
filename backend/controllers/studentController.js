const StudentModel = require('../models/StudentModel');

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
    try {
        const result = await StudentModel.create(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        await StudentModel.update(req.params.id, req.body);
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
