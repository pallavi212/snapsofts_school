const CalendarModel = require('../models/CalendarModel');

const getEvents = async (req, res) => {
    try {
        res.json(await CalendarModel.getAll());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getEvents };
