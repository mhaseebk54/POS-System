const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');

// Generate invoice for a booking
exports.generateInvoice = async (req, res) => {
    try {
        const { bookingId, payments, currentPaidAmount } = req.body;

        const booking = await Booking.findById(bookingId).populate('items.product');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Calculate paid and balance
        const totalPaidSoFar = (booking.paidAmount || 0) + currentPaidAmount;
        const balance = booking.totalAmount - totalPaidSoFar;

        const count = await Invoice.countDocuments();
        const invoiceId = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

        const newInvoice = new Invoice({
            invoiceId,
            booking: bookingId,
            customerInfo: {
                name: booking.customerName,
                phone: booking.customerPhone
            },
            items: booking.items.map(item => ({
                clothType: item.product?.clothType || 'Unknown',
                serviceType: item.product?.serviceType || 'Service',
                quantity: item.quantity,
                price: item.priceAtBooking,
                total: item.total
            })),
            subtotal: booking.subtotal,
            tax: booking.totalTax,
            discount: booking.totalDiscount,
            totalAmount: booking.totalAmount,
            paidAmount: totalPaidSoFar,
            balance: balance,
            payments: payments,
            status: balance <= 0 ? 'Paid' : (totalPaidSoFar > 0 ? 'Partial' : 'Pending'),
            issuedBy: req.user.id
        });

        const savedInvoice = await newInvoice.save();

        // Update booking payment status
        booking.paymentStatus = newInvoice.status;
        booking.paidAmount = totalPaidSoFar;
        await booking.save();

        res.status(201).json(savedInvoice);
    } catch (err) {
        console.error('Invoice Error:', err);
        res.status(400).json({ message: err.message });
    }
};

// Get invoice by Booking ID
exports.getInvoiceByBooking = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ booking: req.params.bookingId })
            .populate('booking')
            .populate('issuedBy', 'name');

        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.status(200).json(invoice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
