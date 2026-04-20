const mongoose = require('mongoose');
require('dotenv').config();

console.log("Attempting to connect to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Connection failed:', err);
        process.exit(1);
    });
