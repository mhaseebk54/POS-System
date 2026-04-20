const router = require('express').Router();
const { exportSalesReport, exportExpenseReport, getReportData } = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/role');

router.get('/data/:type', verifyToken, verifyRole(['admin']), getReportData);
router.get('/sales', verifyToken, verifyRole(['admin']), exportSalesReport);
router.get('/expenses', verifyToken, verifyRole(['admin']), exportExpenseReport);

module.exports = router;
