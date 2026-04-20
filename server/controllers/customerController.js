
const Customer = require('../models/Customer');

// Get all customers
exports.getCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const customers = await Customer.find(query).sort({ createdAt: -1 });
        res.status(200).json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single customer
exports.getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add Customer
exports.addCustomer = async (req, res) => {
    try {
        const newCustomer = new Customer(req.body);
        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update Customer
exports.updateCustomer = async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedCustomer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Customer
exports.deleteCustomer = async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
