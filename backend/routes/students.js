const router = require('express').Router();
const { getStudents, getCountByClass, createStudent, updateStudent, getStudentsByParent, getStudentProfile } = require('../controllers/studentController');

router.get('/', getStudents);
router.get('/count-by-class', getCountByClass);
router.get('/by-parent/:userId', getStudentsByParent);
router.get('/profile/:userId', getStudentProfile);
router.post('/', createStudent);
router.put('/:id', updateStudent);

module.exports = router;
