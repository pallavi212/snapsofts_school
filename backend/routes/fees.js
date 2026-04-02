const router = require('express').Router();
const { getFeeStructure, getPayments, addPayment, getStudentPayments, getPaymentsByParent } = require('../controllers/feeController');

router.get('/structure', getFeeStructure);
router.get('/payments', getPayments);
router.get('/payments/by-parent/:userId', getPaymentsByParent);
router.get('/payments/:studentId', getStudentPayments);
router.post('/payments', addPayment);

module.exports = router;
