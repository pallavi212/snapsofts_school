const db = require('../db');

const CalendarModel = {
    getAll: () => db.query(
        'SELECT * FROM calendar_events ORDER BY event_date'
    ).then(([rows]) => rows),
};

module.exports = CalendarModel;
