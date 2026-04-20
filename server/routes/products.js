
const router = require('express').Router();
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/role');

// Public read? Or authenticated? Usually authenticated in POS.
router.get('/', verifyToken, getProducts);

// Admin only write access
router.post('/', verifyToken, verifyRole(['admin']), addProduct);
router.put('/:id', verifyToken, verifyRole(['admin']), updateProduct);
router.delete('/:id', verifyToken, verifyRole(['admin']), deleteProduct);

module.exports = router;
