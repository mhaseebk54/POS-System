const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected for Seed');
        seedAdmin();
    })
    .catch((err) => console.log(err));

const seedAdmin = async () => {
    try {
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('Admin already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const newAdmin = new User({
            name: 'Super Admin',
            email: 'admin@pos.com',
            password: hashedPassword,
            role: 'admin',
            phone: '0000000000'
        });

        await newAdmin.save();
        console.log('Admin created: admin@pos.com / admin123');
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
