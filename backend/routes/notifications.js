const router = require('express').Router();
const { getForParent, getAll, createNotification, markRead, deleteNotification } = require('../controllers/notificationController');

router.get('/', getAll);
router.get('/:parentUserId', getForParent);
router.post('/', createNotification);
router.put('/:id/read', markRead);
router.delete('/:id', deleteNotification);

module.exports = router;
