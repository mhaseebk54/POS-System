
const router = require('express').Router();
const {
    getInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock
} = require('../controllers/inventoryController');
const { verifyToken } = require('../middleware/auth');

// Protect all routes with verifyToken
router.use(verifyToken);

// Get all items
router.get('/', getInventory);

// Add new item
router.post('/', addInventoryItem);

// Update item
router.put('/:id', updateInventoryItem);

// Adjust stock
router.patch('/adjust/:id', adjustStock);

// Delete item
router.delete('/:id', deleteInventoryItem);

module.exports = router;
