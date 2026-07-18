import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import BackendLayout from '../components/layout/BackendLayout';
import DeliveryLayout from '../components/layout/DeliveryLayout';

// Public Pages
import Landing from '../pages/Landing';

// Customer Portal Pages
import LoginPage from '../pages/portal/LoginPage';
import SignupPage from '../pages/portal/SignupPage';
import VendorSignupPage from '../pages/portal/VendorSignupPage';
import ResetPasswordPage from '../pages/portal/ResetPasswordPage';
import HomePage from '../pages/portal/HomePage';
import ProductDetailPage from '../pages/portal/ProductDetailPage';
import CartPage from '../pages/portal/CartPage';
import CheckoutAddressPage from '../pages/portal/CheckoutAddressPage';
import CheckoutPaymentPage from '../pages/portal/CheckoutPaymentPage';
import OrderConfirmationPage from '../pages/portal/OrderConfirmationPage';
import MyOrdersPage from '../pages/portal/MyOrdersPage';
import OrderDetailPagePortal from '../pages/portal/OrderDetailPage';
import ProfilePagePortal from '../pages/portal/ProfilePage';
import SupportPage from '../pages/portal/SupportPage';

// Vendor Backend Pages
import DashboardPage from '../pages/backend/DashboardPage';
import OrdersPage from '../pages/backend/OrdersPage';
import OrderDetailPageBackend from '../pages/backend/OrderDetailPage';
import ProductsPage from '../pages/backend/ProductsPage';
import ProductFormPage from '../pages/backend/ProductFormPage';
import DeliveryPartnersPage from '../pages/backend/DeliveryPartnersPage';
import WorkflowsPage from '../pages/backend/WorkflowsPage';
import QueriesPage from '../pages/backend/QueriesPage';
import ProfilePageBackend from '../pages/backend/ProfilePage';
import VendorSettingsPage from '../pages/portal/VendorSettingsPage';
import QuotationTemplatesPage from '../pages/backend/QuotationTemplatesPage';
import QuotationsPage from '../pages/backend/QuotationsPage';
import ClientQuotationPage from '../pages/portal/ClientQuotationPage';

// Previous Vendor Pages (Preserved for features compatibility)
import NewOrderPage from '../pages/portal/NewOrderPage';
import InvoicePage from '../pages/portal/InvoicePage';
import ReportsPage from '../pages/portal/ReportsPage';
import RentalSchedulerPage from '../pages/portal/RentalSchedulerPage';

// Delivery Pages
import DeliveryLoginPage from '../pages/delivery/DeliveryLoginPage';
import DeliveryDashboardPage from '../pages/delivery/DeliveryDashboardPage';
import TaskDetailPage from '../pages/delivery/TaskDetailPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing */}
      <Route path="/" element={<Landing />} />

      {/* Unified Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/vendor-signup" element={<VendorSignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Customer Storefront Portal */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/address" element={<CheckoutAddressPage />} />
        <Route path="/checkout/payment" element={<CheckoutPaymentPage />} />
        <Route path="/checkout/confirmation" element={<OrderConfirmationPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/account/orders/:id" element={<OrderDetailPagePortal />} />
        <Route path="/account/quotations/:id" element={<ClientQuotationPage />} />
        <Route path="/profile" element={<ProfilePagePortal />} />
        <Route path="/account/support" element={<SupportPage />} />
      </Route>

      {/* Vendor Control Panel */}
      <Route element={<BackendLayout />}>
        <Route path="/vendor/dashboard" element={<DashboardPage />} />
        <Route path="/vendor/orders" element={<OrdersPage />} />
        <Route path="/vendor/orders/new" element={<NewOrderPage />} />
        <Route path="/vendor/orders/:id" element={<OrderDetailPageBackend />} />
        <Route path="/vendor/quotations" element={<QuotationsPage />} />
        <Route path="/vendor/invoices/:id" element={<InvoicePage />} />
        <Route path="/vendor/products" element={<ProductsPage />} />
        <Route path="/vendor/products/new" element={<ProductFormPage />} />
        <Route path="/vendor/products/:id" element={<ProductFormPage />} />
        <Route path="/vendor/workflows" element={<WorkflowsPage />} />
        <Route path="/vendor/queries" element={<QueriesPage />} />
        <Route path="/vendor/partners" element={<DeliveryPartnersPage />} />

        {/* Configuration Section */}
        <Route path="/vendor/settings" element={<VendorSettingsPage />} />
        <Route path="/vendor/user" element={<ProfilePageBackend />} />
        <Route path="/vendor/quotation-templates" element={<QuotationTemplatesPage />} />

        {/* Preserved pages */}
        <Route path="/vendor/schedule" element={<RentalSchedulerPage />} />
        <Route path="/vendor/reports" element={<ReportsPage />} />
      </Route>

      {/* Courier/Delivery App */}
      <Route path="/delivery/login" element={<DeliveryLoginPage />} />
      <Route element={<DeliveryLayout />}>
        <Route path="/delivery/dashboard" element={<DeliveryDashboardPage />} />
        <Route path="/delivery/tasks/:id" element={<TaskDetailPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
