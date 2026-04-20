const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    clothType: { type: String, required: true },
    serviceType: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
    deliveryTimeDays: { type: Number, required: true, default: 2 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    consumables: [{
        inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
        quantity: { type: Number, required: true }
    }]
}, { timestamps: true });

ProductSchema.index({ clothType: 1, serviceType: 1 }, { unique: true });

module.exports = mongoose.model('Product', ProductSchema);
