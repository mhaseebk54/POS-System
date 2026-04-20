const router = require('express').Router();
const { getAdminDashboard, getManagerDashboard } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/role');

router.get('/admin', verifyToken, verifyRole(['admin']), getAdminDashboard);
router.get('/manager', verifyToken, getManagerDashboard);

module.exports = router;
