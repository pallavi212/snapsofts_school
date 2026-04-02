const router = require('express').Router();
const { getTeachers, createTeacher, updateTeacher } = require('../controllers/teacherController');

router.get('/', getTeachers);
router.post('/', createTeacher);
router.put('/:id', updateTeacher);

module.exports = router;
