const router = require('express').Router();
const { getUsers, createUser, deleteUser, updateUser, getParents } = require('../controllers/userController');

router.get('/', getUsers);
router.get('/parents', getParents);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
