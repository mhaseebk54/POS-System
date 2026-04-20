const Booking = require('../models/Booking');
const Expense = require('../models/Expense');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');
const User = require('../models/User');

exports.getAdminDashboard = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Daily Metrics
        const [
            todayBookings,
            todayDeliveries,
            todayExpenses,
            inventoryAlerts,
            totalCustomers,
            totalManagers,
            activeBookings,
            pendingPayments
        ] = await Promise.all([
            Booking.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
            Booking.countDocuments({ updatedAt: { $gte: todayStart, $lte: todayEnd }, status: 'Delivered' }),
            Expense.find({ date: { $gte: todayStart, $lte: todayEnd } }),
            Inventory.find({ $expr: { $lte: ["$quantity", "$lowStockThreshold"] } }),
            Customer.countDocuments(),
            User.countDocuments({ role: 'manager' }),
            Booking.countDocuments({ status: { $ne: 'Delivered' } }),
            Booking.find({ paymentStatus: { $ne: 'Paid' } })
        ]);

        // Revenue & Collection
        const bookingsToday = await Booking.find({ createdAt: { $gte: todayStart, $lte: todayEnd } });
        const invoicesToday = await require('../models/Invoice').find({ createdAt: { $gte: todayStart, $lte: todayEnd } });

        const salesToday = bookingsToday.reduce((acc, b) => acc + b.totalAmount, 0);
        const collectedToday = bookingsToday.reduce((acc, b) => acc + (b.paidAmount || 0), 0) +
            invoicesToday.reduce((acc, inv) => {
                // Only add payments that weren't part of the initial booking to avoid double counting
                // Actually, it's safer to sum all payments in invoices today
                return acc + inv.payments.reduce((pAcc, p) => pAcc + p.amount, 0);
            }, 0);

        const expensesToday = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
        const totalPendingAmount = pendingPayments.reduce((acc, b) => acc + (b.totalAmount - (b.paidAmount || 0)), 0);

        // Prep Payment History for logs
        const paymentHistory = [
            ...bookingsToday.filter(b => b.paidAmount > 0).map(b => ({
                customerName: b.customerName,
                amount: b.paidAmount,
                createdAt: b.createdAt,
                bookingId: b.bookingId,
                description: 'Advance Payment',
                status: 'Collected'
            })),
            ...invoicesToday.flatMap(inv => inv.payments.map(p => ({
                customerName: inv.customerInfo?.name,
                amount: p.amount,
                createdAt: p.date,
                bookingId: inv.invoiceId, // Use invoice ID or get parent booking ID
                description: `Payment via ${p.method}`,
                status: 'Invoiced'
            })))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Chart Data: Revenue vs Expenses (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Booking.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthlyExpenses = await Expense.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                    expense: { $sum: "$amount" }
                }
            }
        ]);

        // Popular Services
        const popularServices = await Booking.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.serviceType",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Customer Growth (Last 6 Months)
        const customerGrowth = await Customer.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Manager Performance (Total Sales by Manager)
        const managerPerformance = await Booking.aggregate([
            {
                $group: {
                    _id: "$createdBy",
                    totalSales: { $sum: "$totalAmount" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "manager"
                }
            },
            { $unwind: "$manager" },
            {
                $project: {
                    name: "$manager.name",
                    totalSales: 1
                }
            },
            { $sort: { totalSales: -1 } }
        ]);

        res.status(200).json({
            metrics: {
                todayBookings,
                todayDeliveries,
                revenueToday: collectedToday,
                salesToday,
                expensesToday,
                netProfitToday: collectedToday - expensesToday,
                totalPendingPayments: totalPendingAmount,
                activeBookings,
                totalCustomers,
                totalManagers,
                lowStockCount: inventoryAlerts.length
            },
            history: {
                revenue: paymentHistory,
                expenses: todayExpenses,
                bookings: bookingsToday,
                deliveries: await Booking.find({ updatedAt: { $gte: todayStart, $lte: todayEnd }, status: 'Delivered' }),
                pending: pendingPayments.map(b => ({
                    ...b.toObject(),
                    pendingAmount: b.totalAmount - (b.paidAmount || 0)
                })),
                profit: [...paymentHistory, ...todayExpenses.map(e => ({ ...e.toObject(), totalAmount: -e.amount, customerName: e.description }))]
            },
            charts: {
                monthlyStats,
                monthlyExpenses,
                popularServices,
                customerGrowth,
                managerPerformance
            },
            lowStockItems: inventoryAlerts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.getManagerDashboard = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [todayBookings, todayDeliveries, inventoryAlerts, todayInvoices] = await Promise.all([
            Booking.find({ createdAt: { $gte: todayStart, $lte: todayEnd }, createdBy: req.user.id }),
            Booking.find({ updatedAt: { $gte: todayStart, $lte: todayEnd }, status: 'Delivered', createdBy: req.user.id }),
            Inventory.find({ $expr: { $lte: ["$quantity", "$lowStockThreshold"] } }),
            require('../models/Invoice').find({ createdAt: { $gte: todayStart, $lte: todayEnd }, issuedBy: req.user.id })
        ]);

        const collectionHistory = [
            ...todayBookings.filter(b => b.paidAmount > 0).map(b => ({
                customerName: b.customerName,
                amount: b.paidAmount,
                createdAt: b.createdAt,
                bookingId: b.bookingId,
                description: 'Advance',
                status: 'Collected'
            })),
            ...todayInvoices.flatMap(inv => inv.payments.map(p => ({
                customerName: inv.customerInfo?.name,
                amount: p.amount,
                createdAt: p.date,
                bookingId: inv.invoiceId,
                description: `Payment (${p.method})`,
                status: 'Invoiced'
            })))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const myRevenue = todayBookings.reduce((acc, b) => acc + (b.paidAmount || 0), 0) +
            todayInvoices.reduce((acc, inv) => acc + inv.payments.reduce((pAcc, p) => pAcc + p.amount, 0), 0);

        res.status(200).json({
            todayBookings: todayBookings.length,
            todayDeliveries: todayDeliveries.length,
            myRevenue,
            inventoryAlerts: inventoryAlerts.length,
            lowStockItems: inventoryAlerts,
            history: {
                bookings: todayBookings,
                deliveries: todayDeliveries,
                revenue: collectionHistory
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
