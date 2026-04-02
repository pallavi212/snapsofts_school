const ParentModel = require('../models/ParentModel');

const getParents = async (req, res) => {
    try {
        const parents = await ParentModel.getAll();
        res.json(parents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getParentById = async (req, res) => {
    try {
        const parent = await ParentModel.getById(req.params.id);
        if (!parent) {
            return res.status(404).json({ error: 'Parent not found' });
        }
        res.json(parent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getParents, getParentById };
