import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Truck, Store, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CheckoutAddressPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();

  const { couponCode, discountAmount = 0 } = location.state || {};

  const [deliveryMethod, setDeliveryMethod] = useState('HOME_DELIVERY');
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    address: '456 Oak Ave, Seattle',
    phone: '+1 (206) 555-9876',
    zipCode: '98101',
    city: 'Seattle',
    country: 'United States'
  });
  const [billingSame, setBillingSame] = useState(true);

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500 font-bold">
        Your cart is empty. <Link to="/dashboard" className="text-blue-600 hover:underline">Go to catalog</Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({ ...prev, [name]: value }));
  };

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e - s);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
  };

  const subtotal = cart.reduce((sum, item) => {
    const days = calculateDays(item.rentalStartDate, item.scheduledReturnDate);
    const price = item.product.rentalPrice || item.product.dailyCharge || 0;
    return sum + (price * item.qty * days);
  }, 0);

  const securityDeposit = cart.reduce((sum, item) => {
    const price = item.product.rentalPrice || item.product.dailyCharge || 0;
    const depositVal = item.product.securityDepositValue || (price * 2);
    return sum + (depositVal * item.qty);
  }, 0);

  const deliveryFee = 0;
  const total = subtotal - discountAmount + securityDeposit + deliveryFee;

  const handleContinue = (e) => {
    e.preventDefault();
    if (!shippingForm.fullName.trim() || !shippingForm.address.trim()) {
      alert('Please fill out all shipping details.');
      return;
    }
    navigate('/checkout/payment', {
      state: {
        deliveryMethod,
        shippingForm,
        billingSame,
        subtotal,
        discountAmount,
        couponCode,
        securityDeposit,
        total
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-700 font-sans">
      
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-150">
        <span className="text-blue-600 font-black">1. Shipping Address</span>
        <span>&rarr;</span>
        <span>2. Payment Details</span>
        <span>&rarr;</span>
        <span>3. Invoice Confirmation</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleContinue} className="lg:col-span-2 space-y-6 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">Delivery Method</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <label 
                className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  deliveryMethod === 'HOME_DELIVERY' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-250'
                }`}
              >
                <input 
                  type="radio" 
                  name="delivery" 
                  value="HOME_DELIVERY" 
                  checked={deliveryMethod === 'HOME_DELIVERY'} 
                  onChange={() => setDeliveryMethod('HOME_DELIVERY')} 
                  className="sr-only" 
                />
                <Truck className={`h-6 w-6 mb-2 ${deliveryMethod === 'HOME_DELIVERY' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`font-bold text-sm ${deliveryMethod === 'HOME_DELIVERY' ? 'text-blue-600' : 'text-slate-700'}`}>Standard Delivery</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Free delivery directly to address</span>
              </label>

              <label 
                className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  deliveryMethod === 'COLLECT_FROM_STORE' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-250'
                }`}
              >
                <input 
                  type="radio" 
                  name="delivery" 
                  value="COLLECT_FROM_STORE" 
                  checked={deliveryMethod === 'COLLECT_FROM_STORE'} 
                  onChange={() => setDeliveryMethod('COLLECT_FROM_STORE')} 
                  className="sr-only" 
                />
                <Store className={`h-6 w-6 mb-2 ${deliveryMethod === 'COLLECT_FROM_STORE' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`font-bold text-sm ${deliveryMethod === 'COLLECT_FROM_STORE' ? 'text-blue-600' : 'text-slate-700'}`}>Store Pickup</span>
                <span className="text-[10px] text-slate-455 mt-0.5">Collect from regional warehouse</span>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">Delivery Address Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Recipient Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. John Doe"
                  value={shippingForm.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Street Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={shippingForm.address}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingForm.city}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={shippingForm.zipCode}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={shippingForm.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Country</label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={shippingForm.country}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <button
                  type="button"
                  onClick={() => setBillingSame(!billingSame)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                    billingSame ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow transform transition-all ${
                    billingSame ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
                <div>
                  <span className="font-bold text-slate-800 block">Billing Address is the same</span>
                  <span className="text-[10px] text-slate-455">If enabled, billing and delivery addresses are matched.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link 
              to="/cart" 
              className="text-xs font-bold text-slate-450 hover:text-slate-700 flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Cart</span>
            </Link>
            
            <button
              type="submit"
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center space-x-1.5 transition-all shadow-md"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 self-start text-xs text-slate-550">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider">Review Order</h3>
          
          <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto pr-1">
            {cart.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 block line-clamp-1">{item.product.name}</span>
                  <span className="text-[10px] text-slate-400">Qty: {item.qty} units</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  ₹{((item.product.rentalPrice || item.product.dailyCharge || 0) * item.qty * calculateDays(item.rentalStartDate, item.scheduledReturnDate)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-150 pt-4 space-y-2.5">
            <div className="flex justify-between">
              <span>Rental Charges:</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon discount:</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-start">
              <div>
                <span className="flex items-center text-slate-500">
                  Security Deposit 
                  <ShieldCheck className="h-4 w-4 ml-1 text-emerald-500 shrink-0" />
                </span>
              </div>
              <span className="font-semibold text-slate-800">₹{securityDeposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-100 pt-3">
              <span>Total Payable:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
