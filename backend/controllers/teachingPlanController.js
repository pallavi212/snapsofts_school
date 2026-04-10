const TeachingPlanModel = require('../models/TeachingPlanModel');
const db = require('../db');

const getPlans = async (req, res) => {
    try {
        const { teacher_id, class_id, week_start } = req.query;
        if (!teacher_id) return res.status(400).json({ error: 'teacher_id required' });
        const plans = await TeachingPlanModel.getByTeacher(teacher_id, { class_id, week_start });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPlansByClass = async (req, res) => {
    try {
        const { class_id } = req.params;
        const { week_start } = req.query;
        const plans = await TeachingPlanModel.getByClass(class_id, week_start);
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getHomeworkByClass = async (req, res) => {
    try {
        const { class_id } = req.params;
        const hw = await TeachingPlanModel.getHomeworkByClass(class_id);
        res.json(hw);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createPlan = async (req, res) => {
    try {
        const { teacher_id, class_id, class_name, week_start, day, subject, topic, description, homework } = req.body;
        if (!teacher_id || !week_start || !day || !topic)
            return res.status(400).json({ error: 'teacher_id, week_start, day, topic are required' });

        let resolvedClassId = class_id;
        if (!resolvedClassId && class_name) {
            const [[cls]] = await db.query('SELECT id FROM classes WHERE name = ?', [class_name]);
            if (!cls) return res.status(400).json({ error: `Class '${class_name}' not found` });
            resolvedClassId = cls.id;
        }
        if (!resolvedClassId) return res.status(400).json({ error: 'class_id or class_name required' });

        const pdf_path = req.files?.pdf?.[0]?.filename || null;
        const image_path = req.files?.image?.[0]?.filename || null;

        const id = await TeachingPlanModel.create({
            teacher_id, class_id: resolvedClassId, week_start, day,
            subject, topic, description, homework, pdf_path, image_path,
        });
        res.status(201).json({ id, pdf_path, image_path });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updatePlan = async (req, res) => {
    try {
        const { topic, description, homework } = req.body;
        const pdf_path = req.files?.pdf?.[0]?.filename || null;
        const image_path = req.files?.image?.[0]?.filename || null;
        await TeachingPlanModel.update(req.params.id, { topic, description, homework, pdf_path, image_path });
        res.json({ message: 'Plan updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deletePlan = async (req, res) => {
    try {
        await TeachingPlanModel.delete(req.params.id);
        res.json({ message: 'Plan deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getPlans, getPlansByClass, getHomeworkByClass, createPlan, updatePlan, deletePlan };
