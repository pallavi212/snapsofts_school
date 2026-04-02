const router = require('express').Router();
const { getParents, getParentById } = require('../controllers/parentController');

router.get('/', getParents);
router.get('/:id', getParentById);

module.exports = router;
