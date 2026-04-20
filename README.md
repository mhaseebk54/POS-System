# Laundry POS System

A modern Point of Sale system designed for laundry businesses, featuring real-time inventory management, customer tracking, and comprehensive reporting.

![Laundry POS](https://img.shields.io/badge/POS-Laundry%20Management-indigo)
![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-mongodb)

## Features

- **Dashboard** - Real-time metrics for revenue, bookings, deliveries, and pending payments
- **Inventory Management** - Track supplies with low-stock alerts
- **Product Management** - Manage laundry services and pricing
- **Customer Management** - Customer database with order history
- **Order Tracking** - Monitor bookings and deliveries
- **Expense Tracking** - Record and categorize business expenses
- **Manager Portal** - Branch-specific operations and reporting
- **Reports** - Export sales, expenses (CSV) and executive summaries (PDF)
- **AI Chatbot** - Integrated POS assistant powered by Ollama (Llama 3.2)
- **Dark Mode** - Theme toggle for comfortable viewing

## Tech Stack

### Frontend
- React 19 + Vite
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Recharts for data visualization
- jsPDF for report generation

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Helmet & CORS for security
- Morgan for logging

## Project Structure

```
POS/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── utils/
│   │   └── context/
│   └── public/
└── server/          # Express backend
    ├── routes/
    ├── models/
    ├── middleware/
    └── scripts/
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Ollama (optional, for chatbot feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd POS
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Create `.env` in the `server` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/laundry-pos
   PORT=5000
   JWT_SECRET=your-secret-key
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend (new terminal)**
   ```bash
   cd client
   npm run dev
   ```

3. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/auth` | Authentication routes |
| `/api/inventory` | Inventory management |
| `/api/products` | Product/service catalog |
| `/api/customers` | Customer management |
| `/api/bookings` | Order bookings |
| `/api/expenses` | Expense tracking |
| `/api/invoices` | Invoice generation |
| `/api/dashboard` | Dashboard metrics |
| `/api/reports` | Report exports |
| `/api/chat` | AI chatbot endpoint |

## License

ISC

---

Built with React, Express, and MongoDB
