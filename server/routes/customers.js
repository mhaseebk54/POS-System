
const router = require('express').Router();
const { getCustomers, getCustomer, addCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { verifyToken } = require('../middleware/auth');
// Both admin and manager can manage customers
const { verifyRole } = require('../middleware/role');

router.get('/', verifyToken, getCustomers);
router.get('/:id', verifyToken, getCustomers); // Reuse or specific get
router.post('/', verifyToken, addCustomer);
router.put('/:id', verifyToken, updateCustomer);
router.delete('/:id', verifyToken, verifyRole(['admin']), deleteCustomer); // Only admin can delete? Or manager too? Step 2 says Manager registers customers. Let's allow manager to edit, maybe delete restricted to admin for safety.

module.exports = router;
