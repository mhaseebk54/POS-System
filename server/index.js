const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('common'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log('MongoDB Connection Error:', err));

// Routes (Placeholders)
app.get('/', (req, res) => {
    res.send('Laundry POS API is running');
});


//Chatbot
app.post("/api/chat", async (req, res) => {
  const { message, context } = req.body;

  const prompt = `
You are a POS system assistant.
Context: ${context || "general"}
User question: ${message}
Give a short, helpful answer.
`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();

    res.json({
      reply: data.response,
      source: "ollama",
      offline: true
    });
  } catch (error) {
    res.status(500).json({
      reply: "Ollama is not running. Please start the service.",
      offline: true
    });
  }
});


// Routes
const authRoute = require('./routes/auth');
const inventoryRoute = require('./routes/inventory');
const productRoute = require('./routes/products');
const customerRoute = require('./routes/customers');
const bookingRoute = require('./routes/bookings');
const expenseRoute = require('./routes/expenses');
const invoiceRoute = require('./routes/invoices');
const dashboardRoute = require('./routes/dashboard');
const reportRoute = require('./routes/reports');

app.use('/api/auth', authRoute);
app.use('/api/inventory', inventoryRoute);
app.use('/api/products', productRoute);
app.use('/api/customers', customerRoute);
app.use('/api/bookings', bookingRoute);
app.use('/api/expenses', expenseRoute);
app.use('/api/invoices', invoiceRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/reports', reportRoute);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
