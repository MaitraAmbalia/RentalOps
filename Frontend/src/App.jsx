import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import VendorLayout from './layouts/VendorLayout';

// Pages
import Landing from './pages/Landing';
import ClientLogin from './pages/auth/ClientLogin';
import ClientSignup from './pages/auth/ClientSignup';
import VendorLogin from './pages/auth/VendorLogin';
import VendorSignup from './pages/auth/VendorSignup';
import PartnerLogin from './pages/auth/PartnerLogin';
import HomePage from './pages/portal/HomePage';
import VendorDashboard from './pages/portal/VendorDashboard';
import VendorProducts from './pages/portal/VendorProducts';
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
        <Route path="/vendor-signup" element={<VendorSignup />} />
        <Route path="/partner-login" element={<PartnerLogin />} />

        {/* Client Protected Routes (wrapped in MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
        </Route>

        {/* Vendor Protected Routes (wrapped in VendorLayout) */}
        <Route element={<VendorLayout />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<VendorProducts />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
