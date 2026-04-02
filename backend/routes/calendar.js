const router = require('express').Router();
const { getEvents } = require('../controllers/calendarController');

router.get('/', getEvents);

module.exports = router;
