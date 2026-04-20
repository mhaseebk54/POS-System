const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    address: { type: String },
    cnic: { type: String },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
