const router = require('express').Router();
const Expense = require('../models/Expense');
const { verifyToken } = require('../middleware/auth');
const { verifyRole } = require('../middleware/role');

router.use(verifyToken);

// Create expense
router.post('/', async (req, res) => {
    try {
        const newExpense = new Expense({
            ...req.body,
            createdBy: req.user.id
        });
        const saved = await newExpense.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get expenses with filtering
router.get('/', async (req, res) => {
    try {
        const { category, startDate, endDate, managerId } = req.query;
        let query = {};
        if (category) query.category = category;
        if (managerId) query.createdBy = managerId;
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const expenses = await Expense.find(query)
            .populate('createdBy', 'name email role')
            .sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Approve expense (Admin only)
router.patch('/:id/approve', verifyRole(['admin']), async (req, res) => {
    try {
        const updated = await Expense.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
