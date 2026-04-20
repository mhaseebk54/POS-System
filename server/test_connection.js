const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/laundry_pos';

console.log('Attempting to connect to:', uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    })
    .catch((err) => {
        console.error('FAILURE: Could not connect to MongoDB');
        console.error(err);
        process.exit(1);
    });
