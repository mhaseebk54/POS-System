const Booking = require('../models/Booking');
const Expense = require('../models/Expense');
const Inventory = require('../models/Inventory');

exports.getReportData = async (req, res) => {
    try {
        const { type } = req.params;
        const { customerId, managerId, startDate, endDate } = req.query;
        let query = {};
        if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        let data;
        switch (type) {
            case 'sales':
                data = await Booking.find(query)
                    .populate('customer', 'fullName phone')
                    .populate('createdBy', 'name')
                    .sort({ createdAt: -1 });
                break;
            case 'expenses':
                let expQuery = {};
                if (startDate && endDate) expQuery.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
                data = await Expense.find(expQuery).populate('createdBy', 'name').sort({ date: -1 });
                break;
            case 'inventory':
                data = await Inventory.find().select('itemName quantity unit history');
                break;
            case 'profit-loss':
                const sales = await Booking.find(query);
                let plExpQuery = {};
                if (startDate && endDate) plExpQuery.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
                const expenses = await Expense.find(plExpQuery);
                data = {
                    totalRevenue: sales.reduce((acc, b) => acc + b.totalAmount, 0),
                    totalExpenses: expenses.reduce((acc, e) => acc + e.amount, 0),
                    salesCount: sales.length,
                    expenseCount: expenses.length
                };
                break;
            case 'customer':
                if (!customerId) return res.status(400).json({ message: 'Customer ID required' });
                data = await Booking.find({ customer: customerId })
                    .populate('items.product')
                    .sort({ createdAt: -1 });
                break;
            case 'manager':
                data = await Booking.aggregate([
                    { $group: { _id: "$createdBy", totalSales: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
                    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'manager' } },
                    { $unwind: '$manager' },
                    { $project: { name: '$manager.name', totalSales: 1, count: 1 } }
                ]);
                break;
            default:
                return res.status(400).json({ message: 'Invalid report type' });
        }
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.exportSalesReport = async (req, res) => {
    // ...
    try {
        const bookings = await Booking.find()
            .populate('customer', 'fullName phone')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        // Generate CSV content
        let csv = 'Booking ID,Customer,Phone,Amount,Status,Delivery Date,Created By,Date\n';

        bookings.forEach(b => {
            const date = new Date(b.createdAt).toLocaleDateString();
            const deliveryDate = new Date(b.deliveryDate).toLocaleDateString();
            csv += `${b.bookingId},"${b.customer?.fullName || 'N/A'}",${b.customer?.phone || 'N/A'},${b.totalAmount},${b.status},${deliveryDate},"${b.createdBy?.name || 'N/A'}",${date}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.csv');
        res.status(200).send(csv);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.exportExpenseReport = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });

        let csv = 'Category,Amount,Date,Description\n';
        expenses.forEach(e => {
            const date = new Date(e.date).toLocaleDateString();
            csv += `${e.category},${e.amount},${date},"${e.description || ''}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=expense_report.csv');
        res.status(200).send(csv);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
