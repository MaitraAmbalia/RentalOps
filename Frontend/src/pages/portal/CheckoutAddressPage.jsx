import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Truck, Store, ArrowLeft, ArrowRight, ShieldCheck, MapPin, Building2, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { calculateProductDeposit } from '../../utils/depositHelper';

export default function CheckoutAddressPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const { warning } = useToast();

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
        Your cart is empty. <Link to="/dashboard" className="text-primary hover:underline">Go to catalog</Link>
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
    const diffMs = e.getTime() - s.getTime();
    if (diffMs <= 0) return 1;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const subtotal = cart.reduce((sum, item) => {
    const days = calculateDays(item.rentalStartDate, item.scheduledReturnDate);
    const price = item.product.rentalPrice || item.product.dailyCharge || 0;
    return sum + (price * item.qty * days);
  }, 0);

  const securityDeposit = cart.reduce((sum, item) => {
    const price = item.product.rentalPrice || item.product.dailyCharge || 0;
    const depositVal = calculateProductDeposit(item.product, price);
    return sum + (depositVal * item.qty);
  }, 0);

  const deliveryFee = 0;
  const total = subtotal - discountAmount + securityDeposit + deliveryFee;

  const handleContinue = (e) => {
    e.preventDefault();

    if (deliveryMethod === 'HOME_DELIVERY') {
      if (!shippingForm.fullName.trim() || !shippingForm.address.trim() || !shippingForm.phone.trim()) {
        warning('Please fill out all required delivery address details.');
        return;
      }
    } else {
      if (!shippingForm.fullName.trim() || !shippingForm.phone.trim()) {
        warning('Please provide the collector name and contact phone for store pickup.');
        return;
      }
    }

    const finalShippingForm = deliveryMethod === 'COLLECT_FROM_STORE' ? {
      ...shippingForm,
      address: 'RentalOps Central Equipment Depot (Store Pickup)',
      city: 'Regional Logistics Hub',
      zipCode: '560001',
      country: 'India'
    } : shippingForm;

    navigate('/checkout/payment', {
      state: {
        deliveryMethod,
        shippingForm: finalShippingForm,
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
      
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-200">
        <span className="text-primary font-black">1. Fulfillment & Address</span>
        <span>&rarr;</span>
        <span>2. Digital Agreement & Payment</span>
        <span>&rarr;</span>
        <span>3. Invoice Confirmation</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleContinue} className="lg:col-span-2 space-y-6 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">Choose Fulfillment Method</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <label 
                className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  deliveryMethod === 'HOME_DELIVERY' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 hover:border-slate-300'
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
                <Truck className={`h-6 w-6 mb-2 ${deliveryMethod === 'HOME_DELIVERY' ? 'text-primary' : 'text-slate-400'}`} />
                <span className={`font-bold text-sm ${deliveryMethod === 'HOME_DELIVERY' ? 'text-primary' : 'text-slate-700'}`}>Standard Delivery</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Dispatched directly to your address</span>
              </label>

              <label 
                className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  deliveryMethod === 'COLLECT_FROM_STORE' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 hover:border-slate-300'
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
                <Store className={`h-6 w-6 mb-2 ${deliveryMethod === 'COLLECT_FROM_STORE' ? 'text-primary' : 'text-slate-400'}`} />
                <span className={`font-bold text-sm ${deliveryMethod === 'COLLECT_FROM_STORE' ? 'text-primary' : 'text-slate-700'}`}>Store Pickup</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Collect at Regional Depot Hub</span>
              </label>
            </div>
          </div>

          {deliveryMethod === 'COLLECT_FROM_STORE' ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Regional Depot Pickup Location</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Collect your equipment directly from our regional fulfillment facility.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full uppercase border border-emerald-200">
                  Ready for Pickup
                </span>
              </div>

              {/* Regional Hub Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-primary shadow-xs">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-slate-900 text-sm">RentalOps Central Equipment Depot</h4>
                    <p className="text-slate-600 text-xs flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" />
                      Plot 42, Metro Industrial Corridor, Phase 2, Regional Logistics Terminal
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-primary" />
                      <span>Pickup Window</span>
                    </span>
                    <span className="font-extrabold text-slate-800 block">10:00 AM – 07:00 PM</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span>Return Cutoff</span>
                    </span>
                    <span className="font-extrabold text-slate-800 block">By 07:00 PM on return date</span>
                  </div>
                </div>
              </div>

              {/* Verification Requirement Note */}
              <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl flex items-start space-x-2.5 text-xs text-blue-900">
                <AlertCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Handover Verification Requirements</span>
                  <span className="text-[11px] text-blue-800 leading-snug block mt-0.5">
                    Please present a valid Government Photo ID matching the recipient name below. Equipment inspection and digital condition sign-off will occur at the depot counter.
                  </span>
                </div>
              </div>

              {/* Form for Pickup */}
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Authorized Collector Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Alice Smith"
                      value={shippingForm.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1.5">Contact Phone (for SMS Pickup PIN)</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="e.g. 9876543210"
                      value={shippingForm.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-primary"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-primary"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setBillingSame(!billingSame)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                      billingSame ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow transform transition-all ${
                      billingSame ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                  <div>
                    <span className="font-bold text-slate-800 block">Billing Address is the same</span>
                    <span className="text-[10px] text-slate-400">If enabled, billing and delivery addresses are matched.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <Link 
              to="/cart" 
              className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center space-x-1"
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

        {/* Pricing Summary Side Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 self-start text-xs text-slate-500">
          <h3 className="text-base font-extrabold text-slate-900">Summary</h3>
          
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="font-medium text-slate-800 truncate max-w-[150px]">{item.product.name} (x{item.qty})</span>
                <span className="font-semibold text-slate-900">₹{((item.product.rentalPrice || item.product.dailyCharge || 0) * item.qty * calculateDays(item.rentalStartDate, item.scheduledReturnDate)).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2.5">
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
