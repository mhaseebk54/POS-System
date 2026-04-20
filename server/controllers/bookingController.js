const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const {
            customerId, items, subtotal, totalTax, totalDiscount,
            totalAmount, deliveryDate, deliveryTime, paidAmount, paymentMethod
        } = req.body;

        // Fetch customer details to store name and phone
        const customer = await Customer.findById(customerId);
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        // Generate a unique Booking ID (e.g., LB-2024-XXXX)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await Booking.countDocuments();
        const bookingId = `LB-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

        const newBooking = new Booking({
            bookingId,
            customer: customerId,
            customerName: customer.fullName,
            customerPhone: customer.phone,
            items,
            subtotal,
            totalTax,
            totalDiscount,
            totalAmount,
            deliveryDate,
            deliveryTime,
            createdBy: req.user.id,
            status: 'Booked',
            paidAmount: paidAmount || 0,
            paymentStatus: (paidAmount >= totalAmount) ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Pending')
        });

        // AUTO-CONSUME INVENTORY
        for (const item of items) {
            const product = await Product.findById(item.product).populate('consumables.inventoryItem');
            if (product && product.consumables) {
                for (const consumable of product.consumables) {
                    const inventoryId = consumable.inventoryItem;
                    if (!inventoryId) continue;

                    const deductionQty = consumable.quantity * item.quantity;

                    await Inventory.findByIdAndUpdate(inventoryId, {
                        $inc: { quantity: -deductionQty },
                        $push: {
                            history: {
                                change: -deductionQty,
                                reason: `Auto-consumed for booking ${bookingId}`,
                                user: req.user.id
                            }
                        }
                    });
                }
            }
        }

        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (err) {
        console.error('Booking Error:', err);
        res.status(400).json({ message: err.message });
    }
};

// Get all bookings (with filters for status/customer)
exports.getBookings = async (req, res) => {
    try {
        const { status, customerId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (customerId) query.customer = customerId;

        const bookings = await Booking.find(query)
            .populate('customer', 'fullName phone')
            .populate('items.product', 'clothType serviceType')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Booked', 'In-Process', 'Ready', 'Delivered', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        res.status(200).json(updatedBooking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (!['Pending', 'Partial', 'Paid'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const updateData = { paymentStatus };

        // Sync paidAmount with manual status changes
        const booking = await Booking.findById(id);
        if (booking) {
            if (paymentStatus === 'Paid') {
                updateData.paidAmount = booking.totalAmount;
            } else if (paymentStatus === 'Pending') {
                updateData.paidAmount = 0;
            }
            // For 'Partial', we keep the current paidAmount
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        res.status(200).json(updatedBooking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
