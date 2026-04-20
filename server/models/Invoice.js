const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    invoiceId: { type: String, unique: true, required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerInfo: {
        name: String,
        phone: String
    },
    items: [{
        clothType: String,
        serviceType: String,
        quantity: Number,
        price: Number,
        total: Number
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    balance: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Partial', 'Paid'], default: 'Pending' },
    payments: [{
        method: { type: String, enum: ['Cash', 'POS Card', 'Online Transfer', 'Pending'], required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        reference: { type: String }
    }],
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
