import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Components
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Expenses from './pages/Expenses';
import Managers from './pages/Managers';
import Reports from './pages/Reports';
import Chatbot from './pages/chatbot';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Private Routes wrapped in Layout */}
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/inventory" element={<PrivateRoute><Layout><Inventory /></Layout></PrivateRoute>} />
        <Route path="/chatbot" element={
  <PrivateRoute>
    <Layout>
      <Chatbot />
    </Layout>
  </PrivateRoute>
} />
        <Route path="/products" element={<PrivateRoute><Layout><Products /></Layout></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Layout><Customers /></Layout></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Layout><Orders /></Layout></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><Layout><Expenses /></Layout></PrivateRoute>} />
        <Route path="/managers" element={<PrivateRoute><Layout><Managers /></Layout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
