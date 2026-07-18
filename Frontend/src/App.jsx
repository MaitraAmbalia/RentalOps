import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Pages
import Landing from './pages/Landing';
import ClientLogin from './pages/auth/ClientLogin';
import ClientSignup from './pages/auth/ClientSignup';
import VendorLogin from './pages/auth/VendorLogin';
import PartnerLogin from './pages/auth/PartnerLogin';
import HomePage from './pages/portal/HomePage';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<ClientLogin />} />
        <Route path="/signup" element={<ClientSignup />} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/partner-login" element={<PartnerLogin />} />

        {/* Protected Routes (wrapped in MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
