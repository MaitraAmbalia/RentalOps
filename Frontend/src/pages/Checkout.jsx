import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Truck, Store, MapPin, Phone, CreditCard, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, startDate, endDate, days, rentalPrice } = location.state || {};

  const [deliveryType, setDeliveryType] = useState('home');
  const [address, setAddress] = useState('123 Main St, Springfield');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // If no product is passed, redirect to dashboard
  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">No order found</h2>
        <Link to="/dashboard" className="text-primary hover:underline">Go back to catalog</Link>
      </div>
    );
  }

  const securityDeposit = rentalPrice * 2;
  const totalPayable = rentalPrice + securityDeposit;

  const handleProceedToPay = async () => {
    setLoading(true);
    try {
      // Simulate Razorpay and create order
      await api.placeOrder({
        productId: product.id,
        productName: product.name,
        startDate,
        endDate,
        totalPrice: rentalPrice,
        securityDeposit,
        deliveryType,
        deliveryAddress: deliveryType === 'home' ? address : 'Pickup Point - Warehouse A',
        contactPhone: phone,
      });
      
      // Show success modal
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Product
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Secure Checkout</h1>
        <p className="text-slate-500 mt-2">Complete your booking for {product.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Delivery Preferences */}
          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-sm">1</span> 
              Delivery Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all ${deliveryType === 'home' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="delivery" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} className="sr-only" />
                <Truck className={`h-6 w-6 mb-3 ${deliveryType === 'home' ? 'text-primary' : 'text-slate-400'}`} />
                <span className={`font-semibold ${deliveryType === 'home' ? 'text-primary' : 'text-slate-700'}`}>Home Delivery</span>
                <span className="text-xs text-slate-500 mt-1">Delivered directly to your site</span>
              </label>

              <label className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all ${deliveryType === 'pickup' ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="delivery" value="pickup" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} className="sr-only" />
                <Store className={`h-6 w-6 mb-3 ${deliveryType === 'pickup' ? 'text-primary' : 'text-slate-400'}`} />
                <span className={`font-semibold ${deliveryType === 'pickup' ? 'text-primary' : 'text-slate-700'}`}>Self Pickup</span>
                <span className="text-xs text-slate-500 mt-1">Pick up from vendor warehouse</span>
              </label>
            </div>
          </section>

          {/* Info Confirmation */}
          <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 text-sm">2</span> 
              Contact & Address
            </h2>
            
            <div className="space-y-5">
              {deliveryType === 'home' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Delivery Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h3>
            
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
              <img src={product.images?.[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-slate-100" />
              <div>
                <h4 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h4>
                <p className="text-sm text-slate-500">{days} {days === 1 ? 'day' : 'days'} rental</p>
              </div>
            </div>

            <div className="space-y-4 mb-6 pb-6 border-b border-slate-100 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Rental Price ({days} days)</span>
                <span className="font-semibold text-slate-900">${rentalPrice}</span>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-slate-600 flex items-center">Security Deposit <ShieldCheck className="h-4 w-4 ml-1 text-green-500" /></span>
                  <span className="text-xs text-slate-400 mt-1">Refundable upon return</span>
                </div>
                <span className="font-semibold text-slate-900">${securityDeposit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Delivery Fee</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-3xl font-extrabold text-slate-900">${totalPayable}</span>
            </div>

            <button
              onClick={handleProceedToPay}
              disabled={loading}
              className="w-full flex items-center justify-center bg-slate-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70"
            >
              {loading ? 'Processing...' : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Pay
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
            <p className="text-slate-500 mb-6">Your order has been placed. Redirecting to your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
