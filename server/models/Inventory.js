const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'units' },
    lowStockThreshold: { type: Number, default: 10 },
    history: [{
        change: Number,
        reason: String,
        date: { type: Date, default: Date.now },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
