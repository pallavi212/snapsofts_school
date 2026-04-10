const router = require('express').Router();
const { getLogs } = require('../controllers/activityLogController');

router.get('/', getLogs);

module.exports = router;
