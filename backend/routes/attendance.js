const router = require('express').Router();
const { getAttendance, saveAttendance, getStudentAttendance } = require('../controllers/attendanceController');

router.get('/', getAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.post('/', saveAttendance);

module.exports = router;
