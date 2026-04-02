const TeacherModel = require('../models/TeacherModel');

const getTeachers = async (req, res) => {
    try {
        const teachers = await TeacherModel.getAll();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createTeacher = async (req, res) => {
    try {
        const code = await TeacherModel.create(req.body);
        res.status(201).json({ message: 'Teacher added', teacher_code: code });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateTeacher = async (req, res) => {
    try {
        await TeacherModel.update(req.params.id, req.body);
        res.json({ message: 'Teacher updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getTeachers, createTeacher, updateTeacher };
