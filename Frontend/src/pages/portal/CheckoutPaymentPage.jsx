import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CreditCard, ShieldCheck, ArrowLeft, RefreshCw, FileText, CheckCircle, PenTool } from 'lucide-react';
import { orderService } from '../../api/orderService';
import { paymentService } from '../../api/paymentService';
import { agreementService } from '../../api/agreementService';
import SignaturePadModal from '../../components/common/SignaturePadModal';

export default function CheckoutPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const {
    deliveryMethod,
    shippingForm,
    billingSame,
    subtotal,
    discountAmount = 0,
    couponCode,
    securityDeposit,
    total
  } = location.state || {};

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);

  if (!shippingForm) {
    return (
      <div className="text-center py-20 text-slate-500 font-bold space-y-4">
        <p>No shipping address detected. Please complete shipping step first.</p>
        <Link to="/checkout/address" className="text-blue-600 hover:underline">Go back to address entry</Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e - s);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
  };

  const mockAgreementData = {
    orderNumber: `SO_${Date.now().toString().slice(-4)}`,
    vendorName: 'RentHub Direct Operations',
    clientName: shippingForm.fullName || 'Valued Client',
    rentalPeriod: cart.length > 0 ? `${new Date(cart[0].rentalStartDate).toLocaleDateString()} to ${new Date(cart[0].scheduledReturnDate).toLocaleDateString()}` : 'Standard Duration',
    items: cart.map(c => ({
      productName: c.product.name,
      quantity: c.qty,
      totalPrice: (c.product.rentalPrice || c.product.dailyCharge || 0) * c.qty
    })),
    financialSummary: {
      totalRentalAmount: subtotal,
      securityDepositAmount: securityDeposit
    },
    clauses: [
      { title: '1. Custody & Maintenance', text: 'Lessee agrees to use equipment for intended purposes only and return all enclosed accessories intact.' },
      { title: '2. Security Deposit Guarantee', text: `A refundable security deposit of ₹${(securityDeposit || 0).toFixed(2)} is held. Penalties for broken/missing parts will be deducted.` },
      { title: '3. Timely Return Policy', text: 'Equipment must be handed over by scheduled return date. Overdue charges apply daily.' },
      { title: '4. Liability Disclaimer', text: 'RentHub holds no liability for damages or delays caused during operations.' }
    ]
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!signatureData) {
      alert('Please review and digitally sign the Rental Agreement before placing order.');
      setAgreementModalOpen(true);
      return;
    }
    setLoading(true);
    setError('');

    try {
      const createdOrders = [];

      for (const item of cart) {
        // 1. Create Order
        const orderPayload = {
          productId: item.product.id,
          quantity: item.qty,
          fulfillmentType: deliveryMethod,
          orderSource: 'ONLINE',
          rentalStartDate: new Date(item.rentalStartDate),
          scheduledReturnDate: new Date(item.scheduledReturnDate),
          untaxedAmount: (item.product.rentalPrice || item.product.dailyCharge || 0) * item.qty * calculateDays(item.rentalStartDate, item.scheduledReturnDate),
          totalAmount: ((item.product.rentalPrice || item.product.dailyCharge || 0) * item.qty * calculateDays(item.rentalStartDate, item.scheduledReturnDate)) + (item.product.securityDepositValue || ((item.product.rentalPrice || item.product.dailyCharge || 0) * 2)),
          securityDepositAmount: item.product.securityDepositValue || ((item.product.rentalPrice || item.product.dailyCharge || 0) * 2),
        };
        if (couponCode) {
          orderPayload.couponCode = couponCode;
        }

        const orderRes = await orderService.createOrder(orderPayload);
        const orderId = orderRes.id;
        const orderNo = orderRes.orderNumber || `SO_GEN_${Date.now().toString().slice(-4)}`;

        // Attach E-Signature to Order
        try {
          await agreementService.signAgreement(orderId, signatureData);
        } catch (signErr) {
          console.warn("Signature attachment warning:", signErr);
        }

        // 2. Razorpay Order details
        const payRes = await paymentService.createRazorpayOrder(orderId);

        // 3. Confirm payment verification
        await paymentService.verifyPayment({
          razorpay_order_id: payRes.razorpayOrderId,
          razorpay_payment_id: payRes.paymentId || `pay_sim_${Date.now()}`,
          razorpay_signature: 'signature_ok'
        });

        createdOrders.push({
          id: orderId,
          orderNumber: orderNo,
          productName: item.product.name,
          qty: item.qty,
          subtotal: (item.product.rentalPrice || item.product.dailyCharge || 0) * item.qty
        });
      }

      clearCart();

      navigate('/checkout/confirmation', {
        state: {
          orders: createdOrders,
          shippingForm,
          deliveryMethod,
          subtotal,
          securityDeposit,
          total
        }
      });
    } catch (err) {
      console.error(err);
      setError('Payment gateway error. Please verify card credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-700 font-sans">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-150">
        <span className="text-slate-500">1. Shipping Address</span>
        <span>&rarr;</span>
        <span className="text-blue-600 font-black">2. Payment Details</span>
        <span>&rarr;</span>
        <span>3. Invoice Confirmation</span>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handlePaymentSubmit} className="lg:col-span-2 space-y-6 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Standard Bank Card</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  required
                  placeholder="0000 0000 0000 0000"
                  value={paymentForm.cardNumber}
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
                    value={paymentForm.expiryDate}
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
                    value={paymentForm.cvv}
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
                  value={paymentForm.cardholderName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Rental Terms & E-Signature</span>
            </h2>

            {signatureData ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-extrabold text-slate-900 block text-xs">Agreement Digitally Signed</span>
                    <span className="text-[10px] text-slate-500">Legal contract bound to current session.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAgreementModalOpen(true)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-sm"
                >
                  View Signed Contract
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block text-xs">E-Sign Required Before Payment</span>
                  <span className="text-[10px] text-slate-500">Review dynamic rental terms, deposit policy, & equipment manifest.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAgreementModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1.5"
                >
                  <PenTool className="h-4 w-4" />
                  <span>Review & Sign Agreement</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">Billing Address</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2 text-slate-500">
              <p><span className="font-bold text-slate-700">Billing Name:</span> {shippingForm.fullName}</p>
              <p>
                <span className="font-bold text-slate-700">Billing Address:</span> {shippingForm.address}, {shippingForm.city}, {shippingForm.zipCode}, {shippingForm.country}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold italic">Matched with delivery location (enabled in shipping step).</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button 
              type="button"
              onClick={() => navigate('/checkout/address')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Address</span>
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-md ${
                !signatureData
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : !signatureData ? (
                <>
                  <PenTool className="h-4.5 w-4.5" />
                  <span>Sign Agreement to Pay ₹{total?.toFixed(2)}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>Pay ₹{total?.toFixed(2)} Now</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 self-start text-xs text-slate-500">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider">Checkout Review</h3>
          
          <div className="space-y-3.5">
            <div className="flex justify-between">
              <span>Rental Charges:</span>
              <span className="font-semibold text-slate-800">₹{subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <span className="flex items-center text-slate-500">
                  Security Deposit 
                  <ShieldCheck className="h-4 w-4 ml-1 text-emerald-500 shrink-0" />
                </span>
              </div>
              <span className="font-semibold text-slate-800">₹{securityDeposit?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-100 pt-3">
              <span>Grand Total:</span>
              <span>₹{total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <SignaturePadModal
        isOpen={agreementModalOpen}
        onClose={() => setAgreementModalOpen(false)}
        agreementData={{
          ...mockAgreementData,
          signatureData
        }}
        readOnly={!!signatureData}
        onSignSuccess={(sigUrl) => {
          setSignatureData(sigUrl);
          setAgreementModalOpen(false);
        }}
      />
    </div>
  );
}
