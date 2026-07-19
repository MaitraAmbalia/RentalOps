import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { 
  Trash2, ShoppingBag, ArrowRight, X, CreditCard, ShieldCheck 
} from 'lucide-react';
import { orderService } from '../../api/orderService';
import { paymentService } from '../../api/paymentService';
import { useToast } from '../../context/ToastContext';

export default function CartPage() {
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartItemQty, updateCartItemDates, clearCart } = useCart();

  // Coupon / Discount State
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // absolute amount now
  const [couponMsg, setCouponMsg] = useState('');
  const [isValidCoupon, setIsValidCoupon] = useState(false);

  // Express Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    address: '',
    zipCode: '',
    city: '',
    country: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e - s);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
  };

  // Calculations
  const getSubtotal = () => {
    return cart.reduce((sum, item) => {
      const days = calculateDays(item.rentalStartDate, item.scheduledReturnDate);
      const price = item.product.rentalPrice || item.product.dailyCharge || 0;
      return sum + (price * item.qty * days);
    }, 0);
  };

  const getDeposit = () => {
    return cart.reduce((sum, item) => {
      const price = item.product.rentalPrice || item.product.dailyCharge || 0;
      const depositVal = item.product.securityDepositValue || (price * 2);
      return sum + (depositVal * item.qty);
    }, 0);
  };

  const subtotal = getSubtotal();
  const discountAmount = appliedDiscount;
  const securityDeposit = getDeposit();
  const deliveryFee = 0; // Free Standard Delivery
  const total = subtotal - discountAmount + securityDeposit + deliveryFee;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    try {
      setCouponMsg('');
      const { cartService } = await import('../../api/cartService');
      const res = await cartService.applyCoupon(couponCode, cart);
      if (res.success) {
        setAppliedDiscount(res.discount);
        setIsValidCoupon(true);
        setCouponMsg(`Discount applied!`);
      }
    } catch (error) {
      setAppliedDiscount(0);
      setIsValidCoupon(false);
      setCouponMsg(error.response?.data?.message || 'Invalid coupon code.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardForm(prev => ({ ...prev, [name]: value }));
  };

  const handleExpressPayment = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setPaymentLoading(true);

    try {
      for (const item of cart) {
        // 1. Create storefront Order
        const orderPayload = {
          productId: item.product.id,
          quantity: item.qty,
          fulfillmentType: 'HOME_DELIVERY',
          orderSource: 'ONLINE',
          rentalStartDate: new Date(item.rentalStartDate),
          scheduledReturnDate: new Date(item.scheduledReturnDate),
          untaxedAmount: (item.product.rentalPrice || item.product.dailyCharge || 0) * item.qty * calculateDays(item.rentalStartDate, item.scheduledReturnDate),
          totalAmount: (item.product.rentalPrice || item.product.dailyCharge || 0) * item.qty * calculateDays(item.rentalStartDate, item.scheduledReturnDate),
          securityDepositAmount: item.product.securityDepositValue || ((item.product.rentalPrice || item.product.dailyCharge || 0) * 2),
        };
        if (isValidCoupon && couponCode) {
          orderPayload.couponCode = couponCode;
        }

        const orderRes = await orderService.createOrder(orderPayload);

        const orderId = orderRes.id;

        // 2. Generate Razorpay order for this order
        const payRes = await paymentService.createRazorpayOrder(orderId);
        
        // 3. Auto-verify (simulating secure payment verification)
        await paymentService.verifyPayment({
          razorpay_order_id: payRes.razorpayOrderId,
          razorpay_payment_id: payRes.paymentId || `pay_simulated_${Date.now()}`,
          razorpay_signature: 'signature_ok'
        });
      }

      clearCart();
      setCheckoutModalOpen(false);
      success('Payment processed successfully!');
      clearCart();
      navigate('/checkout/confirmation');
      navigate('/orders');
    } catch (err) {
      console.error(err);
      toastError('Express checkout payment failed. Please check inputs.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <ShoppingBag className="h-16 w-16 text-slate-350 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-slate-500">Pick products from our catalog to setup rental durations.</p>
        <Link 
          to="/dashboard" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all"
        >
          Browse Rental Gear
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-755 font-sans">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Shopping Cart</h1>
        <p className="text-sm text-slate-500 mt-1">Configure dates, quantities, and apply loyalty promo codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => {
            const days = calculateDays(item.rentalStartDate, item.scheduledReturnDate);
            const basePrice = item.product.rentalPrice || item.product.dailyCharge || 0;
            const periodicityLabel = item.product.periodicity === 'HOUR' ? 'hour' : item.product.periodicity === 'WEEK' ? 'week' : 'day';

            return (
              <div 
                key={idx} 
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
                  {item.product.images?.length > 0 ? (
                    <img src={getImageUrl(item.product.images[0])} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-slate-300" />
                  )}
                </div>

                <div className="space-y-1 sm:col-span-2 text-xs">
                  <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{item.product.name}</h3>
                  
                  {item.variant && Object.keys(item.variant).length > 0 && (
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Variant: {Object.entries(item.variant).map(([k, v]) => v).join(' / ')}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-semibold pt-1">
                    <span>Rate: ₹{basePrice} / {periodicityLabel}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-bold">{days} days duration</span>
                  </div>

                  <div className="flex space-x-2 pt-2 text-[10px]">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400">Start:</span>
                      <input 
                        type="date" 
                        value={item.rentalStartDate}
                        onChange={(e) => updateCartItemDates(item.product.id, e.target.value, item.scheduledReturnDate, item.variant)}
                        className="bg-slate-50 border border-slate-200 rounded p-1 text-[10px] text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400">End:</span>
                      <input 
                        type="date" 
                        value={item.scheduledReturnDate}
                        onChange={(e) => updateCartItemDates(item.product.id, item.rentalStartDate, e.target.value, item.variant)}
                        className="bg-slate-50 border border-slate-200 rounded p-1 text-[10px] text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 text-xs">
                  <span className="font-extrabold text-slate-900 text-sm">₹{(basePrice * item.qty * days).toFixed(2)}</span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.qty - 1, item.variant)}
                      className="w-6 h-6 bg-slate-50 border border-slate-250 font-bold rounded flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.qty + 1, item.variant)}
                      className="w-6 h-6 bg-slate-50 border border-slate-250 font-bold rounded flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.variant)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-2">
            <Link 
              to="/dashboard" 
              className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
            >
              <span>&larr; Continue Shopping</span>
            </Link>
            <button
              onClick={() => {
                if (confirm('Clear shopping cart?')) clearCart();
              }}
              className="text-xs font-bold text-slate-450 hover:text-slate-700"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Pricing Summary Side Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 self-start text-xs text-slate-500">
          <h3 className="text-base font-extrabold text-slate-900">Order Ledger Summary</h3>
          
          <div className="space-y-3.5">
            <div className="flex justify-between">
              <span>Rental Charges subtotal:</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon discount:</span>
                <span>-₹{appliedDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-start">
              <div>
                <span className="flex items-center text-slate-500 font-semibold">
                  Refundable Security Deposit 
                  <ShieldCheck className="h-4 w-4 ml-1 text-emerald-500 shrink-0" />
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">Held securely until equipment return</span>
              </div>
              <span className="font-semibold text-slate-800">₹{securityDeposit.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Fulfillment Courier Delivery:</span>
              <span className="font-semibold text-emerald-600">Free Standard</span>
            </div>

            <div className="border-t border-slate-100 pt-3.5 flex justify-between items-end text-sm font-bold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-xl font-black text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Coupon Code Form */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Coupon Code (use RENT10)</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="PROMOCODE"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none uppercase font-semibold"
              />
              <button
                type="submit"
                className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={`text-[10px] font-semibold ${appliedDiscount > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{couponMsg}</p>
            )}
          </form>

          {/* Checkout Triggers */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setCheckoutModalOpen(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/10"
            >
              <CreditCard className="h-4 w-4" />
              <span>Pay with Bank Card</span>
            </button>
            
            <button
              onClick={() => navigate('/checkout/address', { state: { couponCode: isValidCoupon ? couponCode : null, discountAmount: appliedDiscount } })}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5"
            >
              <span>Standard Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Express Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-xl space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>Express Billing Checkout</span>
              </span>
              <button onClick={() => setCheckoutModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExpressPayment} className="space-y-4 text-xs text-slate-750">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  required
                  placeholder="0000 0000 0000 0000"
                  value={cardForm.cardNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    required
                    placeholder="MM/YY"
                    value={cardForm.expiryDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Security CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    required
                    placeholder="***"
                    maxLength="3"
                    value={cardForm.cvv}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  name="cardholderName"
                  required
                  placeholder="John Doe"
                  value={cardForm.cardholderName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="block font-black text-slate-800 uppercase tracking-wider text-[10px]">Billing Location</span>
                
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Street, unit..."
                    value={cardForm.address}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="Chicago"
                      value={cardForm.city}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      placeholder="60601"
                      value={cardForm.zipCode}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Country</label>
                  <input
                    type="text"
                    name="country"
                    required
                    placeholder="United States"
                    value={cardForm.country}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-755 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                >
                  {paymentLoading ? 'Verifying payment...' : `Pay ₹${total.toFixed(2)} Now`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
