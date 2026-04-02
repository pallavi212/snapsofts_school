const PettyCashModel = require('../models/PettyCashModel');

const getSummary = async (req, res) => {
    try { res.json(await PettyCashModel.getSummary()); }
    catch (err) { res.status(500).json({ error: err.message }); }
};

const getExpenses = async (req, res) => {
    try { res.json(await PettyCashModel.getExpenses()); }
    catch (err) { res.status(500).json({ error: err.message }); }
};

const addExpense = async (req, res) => {
    const { date, category, description, amount, recorded_by } = req.body;
    if (!date || !category || !description || !amount || !recorded_by)
        return res.status(400).json({ error: 'date, category, description, amount, recorded_by are required' });
    try {
        const result = await PettyCashModel.addExpense(req.body);
        res.status(201).json({ message: 'Expense recorded', ...result });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteExpense = async (req, res) => {
    try {
        await PettyCashModel.deleteExpense(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getFund = async (req, res) => {
    try { res.json(await PettyCashModel.getFund()); }
    catch (err) { res.status(500).json({ error: err.message }); }
};

const addTopUp = async (req, res) => {
    const { amount, added_by } = req.body;
    if (!amount || !added_by)
        return res.status(400).json({ error: 'amount and added_by are required' });
    try {
        const result = await PettyCashModel.addTopUp(req.body);
        res.status(201).json({ message: 'Fund topped up', ...result });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getCategoryBreakdown = async (req, res) => {
    try { res.json(await PettyCashModel.getCategoryBreakdown()); }
    catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getSummary, getExpenses, addExpense, deleteExpense, getFund, addTopUp, getCategoryBreakdown };
