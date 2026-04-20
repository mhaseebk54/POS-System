
const Inventory = require('../models/Inventory');

// Get all inventory items
exports.getInventory = async (req, res) => {
    try {
        const items = await Inventory.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add new inventory item
exports.addInventoryItem = async (req, res) => {
    try {
        const newItem = new Inventory(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = await Inventory.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(404).json({ message: 'Item not found' });
    }
};

// Adjust stock (Increase/Decrease)
exports.adjustStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, reason } = req.body; // amount can be positive or negative

        const item = await Inventory.findById(id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.quantity += amount;
        item.history.push({
            change: amount,
            reason: reason || 'Manual adjustment',
            user: req.user.id
        });

        const saved = await item.save();
        res.status(200).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        await Inventory.findByIdAndDelete(id);
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(404).json({ message: 'Item not found' });
    }
};
