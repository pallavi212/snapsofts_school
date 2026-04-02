const router = require('express').Router();
const {
    getSummary, getExpenses, addExpense, deleteExpense,
    getFund, addTopUp, getCategoryBreakdown
} = require('../controllers/pettyCashController');

router.get('/summary', getSummary);
router.get('/expenses', getExpenses);
router.post('/expenses', addExpense);
router.delete('/expenses/:id', deleteExpense);
router.get('/fund', getFund);
router.post('/fund', addTopUp);
router.get('/categories', getCategoryBreakdown);

module.exports = router;
