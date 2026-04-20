const mongoose = require('mongoose');

const BookingItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    priceAtBooking: { type: Number, required: true },
    total: { type: Number, required: true }
});

const BookingSchema = new mongoose.Schema({
    bookingId: { type: String, unique: true, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [BookingItemSchema],
    subtotal: { type: Number, required: true },
    totalTax: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Booked', 'In-Process', 'Ready', 'Delivered', 'Cancelled'],
        default: 'Booked'
    },
    deliveryDate: { type: Date, required: true },
    deliveryTime: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Partial', 'Paid'], default: 'Pending' },
    paidAmount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
