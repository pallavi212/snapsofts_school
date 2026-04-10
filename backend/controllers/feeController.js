const FeeModel = require('../models/FeeModel');
const { logActivity } = require('../middleware/activityLogger');

const getFeeStructure = async (req, res) => {
    try {
        res.json(await FeeModel.getStructure());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPayments = async (req, res) => {
    try {
        res.json(await FeeModel.getPayments());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addPayment = async (req, res) => {
    try {
        await FeeModel.addPayment(req.body);
        logActivity(req, { action: 'CREATE', module: 'Fees', details: `Fee payment ₹${req.body.amount_paid} recorded for student ${req.body.student_id}` });
        res.status(201).json({ message: 'Payment recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getStudentPayments = async (req, res) => {
    try {
        res.json(await FeeModel.getStudentPayments(req.params.studentId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getPaymentsByParent = async (req, res) => {
    try {
        res.json(await FeeModel.getPaymentsByParent(req.params.userId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getFeeStructure, getPayments, addPayment, getStudentPayments, getPaymentsByParent };
