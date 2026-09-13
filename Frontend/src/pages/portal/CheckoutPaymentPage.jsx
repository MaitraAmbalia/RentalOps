import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  FileText, 
  CheckCircle, 
  PenTool, 
  Store, 
  Truck, 
  Calendar, 
  MapPin, 
  Clock, 
  Lock 
} from 'lucide-react';
import { orderService } from '../../api/orderService';
import { paymentService } from '../../api/paymentService';
import { agreementService } from '../../api/agreementService';
import SignaturePadModal from '../../components/common/SignaturePadModal';
import { useToast } from '../../context/ToastContext';

export default function CheckoutPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { warning } = useToast();

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


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);

  if (!shippingForm) {
    return (
      <div className="text-center py-20 text-slate-500 font-bold space-y-4">
        <p>No shipping address detected. Please complete shipping step first.</p>
        <Link to="/checkout/address" className="text-primary hover:underline">Go back to address entry</Link>
      </div>
    );
  }



  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diffMs = e.getTime() - s.getTime();
    if (isNaN(diffMs) || diffMs <= 0) return 1;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const isStorePickup = deliveryMethod === 'COLLECT_FROM_STORE';

  const mockAgreementData = {
    orderNumber: `SO_${Date.now().toString().slice(-4)}`,
    vendorName: 'RentalOps Direct Operations',
    clientName: shippingForm.fullName || 'Valued Client',
    rentalPeriod: cart.length > 0 ? `${new Date(cart[0].rentalStartDate).toLocaleDateString()} to ${new Date(cart[0].scheduledReturnDate).toLocaleDateString()} (${calculateDays(cart[0].rentalStartDate, cart[0].scheduledReturnDate)} Days)` : 'Standard Duration',
    items: cart.map(c => ({
      productName: c.product.name,
      quantity: c.qty,
      totalPrice: (c.product.rentalPrice || c.product.dailyCharge || 0) * c.qty * calculateDays(c.rentalStartDate, c.scheduledReturnDate)
    })),
    financialSummary: {
      totalRentalAmount: subtotal,
      securityDepositAmount: securityDeposit
    },
    clauses: [
      { 
        title: '1. Custody & Maintenance', 
        text: 'Lessee agrees to use equipment solely for authorized purposes and return all enclosed accessories in original functional condition.' 
      },
      { 
        title: '2. 100% Refundable Security Deposit Guarantee', 
        text: `A refundable security deposit of ₹${(securityDeposit || 0).toFixed(2)} is held in escrow. Full amount is returned within 24 hours upon physical equipment handover and diagnostic inspection.` 
      },
      { 
        title: isStorePickup ? '3. Regional Depot Handover & Return Protocol' : '3. Doorstep Delivery & Return Protocol', 
        text: isStorePickup 
          ? 'Equipment is to be collected and returned at RentalOps Regional Central Depot during operating hours (10:00 AM – 07:00 PM). Photo ID is mandatory at collection.'
          : 'Equipment will be dispatched to the provided delivery address. Return pickup will be scheduled for the return date specified.'
      },
      { 
        title: '4. Liability & Protection', 
        text: 'Standard wear & tear is protected. Accidental structural or electronic damages beyond wear & tear will be evaluated according to documented check-in photos.' 
      }
    ]
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!signatureData) {
      warning('Please review and digitally sign the Rental Agreement before placing order.');
      setAgreementModalOpen(true);
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Create Order
      const orderPayload = {
        fulfillmentType: deliveryMethod,
        orderSource: 'ONLINE',
        rentalStartDate: new Date(cart[0].rentalStartDate).toISOString(),
        scheduledReturnDate: new Date(cart[0].scheduledReturnDate).toISOString(),
        untaxedAmount: subtotal,
        totalAmount: total - securityDeposit,
        securityDepositAmount: securityDeposit,
        items: cart.map(item => ({
          productId: item.product.id,
          productVariantId: item.productVariantId || undefined,
          quantity: Number(item.qty),
          unitPrice: Number(item.product.rentalPrice || item.product.dailyCharge || 0),
          amount: Number(item.product.rentalPrice || item.product.dailyCharge || 0) * Number(item.qty) * calculateDays(item.rentalStartDate, item.scheduledReturnDate),
          rentalStart: new Date(item.rentalStartDate).toISOString(),
          rentalEnd: new Date(item.scheduledReturnDate).toISOString()
        }))
      };

      if (couponCode) {
        orderPayload.couponCode = couponCode;
      }

      const orderRes = await orderService.createOrder(orderPayload);
      const orderId = orderRes.id || orderRes.order?.id;
      const orderNo = orderRes.orderNumber || orderRes.order?.orderNumber || `SO_GEN_${Date.now().toString().slice(-4)}`;

      // Attach E-Signature to Order
      try {
        await agreementService.signAgreement(orderId, signatureData);
      } catch (signErr) {
        console.warn("Signature attachment warning:", signErr);
      }

      // 2. Razorpay Order details
      const payRes = await paymentService.createRazorpayOrder(orderId);
      const { razorpayOrderId, amount, keyId } = payRes.data || payRes;

      // 3. Initialize Razorpay Checkout
      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'RentalOps Portal',
        description: `Order ${orderNo}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // 4. Confirm payment verification on success
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            clearCart();
            
            navigate('/checkout/confirmation', {
              state: {
                orders: [orderRes], // The confirmation page expects an array of orders
                shippingForm,
                deliveryMethod,
                subtotal,
                securityDeposit,
                total
              }
            });
          } catch (verifyErr) {
            console.error(verifyErr);
            setError('Payment verification failed.');
            setLoading(false);
          }
        },
        prefill: {
          name: shippingForm?.fullName || 'User',
          contact: shippingForm?.phone || '9999999999'
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(response.error.description || 'Payment failed.');
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to initiate checkout. Please verify details and try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = typeof err.response.data.message === 'string' ? err.response.data.message : JSON.stringify(err.response.data.message);
      }
      setError(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-700 font-sans">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-200">
        <span className="text-slate-500">1. Shipping Address</span>
        <span>&rarr;</span>
        <span className="text-primary font-black">2. Payment Details</span>
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
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
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
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1.5"
                >
                  <PenTool className="h-4 w-4" />
                  <span>Review & Sign Agreement</span>
                </button>
              </div>
            )}
          </div>

          {/* Fulfillment & Recipient / Collector Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                {isStorePickup ? (
                  <>
                    <Store className="h-5 w-5 text-primary" />
                    <span>Store Pickup & Verification</span>
                  </>
                ) : (
                  <>
                    <Truck className="h-5 w-5 text-primary" />
                    <span>Delivery & Billing Details</span>
                  </>
                )}
              </h2>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                isStorePickup ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-100 text-slate-700'
              }`}>
                {isStorePickup ? 'Self Pickup Hub' : 'Doorstep Delivery'}
              </span>
            </div>

            {isStorePickup ? (
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">RentalOps Central Depot Hub</span>
                      <p className="text-slate-500 text-[11px]">Plot 42, Metro Industrial Corridor, Phase 2, Near Tech Park Ring Road</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Operating Pickup Hours: <strong className="text-slate-800">10:00 AM – 07:00 PM</strong> daily</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Authorized Collector</span>
                    <strong className="text-slate-800">{shippingForm.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Contact Phone</span>
                    <strong className="text-slate-800">{shippingForm.phone}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-slate-600 text-xs">
                <p><span className="font-bold text-slate-800">Recipient Name:</span> {shippingForm.fullName}</p>
                <p><span className="font-bold text-slate-800">Delivery Address:</span> {shippingForm.address}, {shippingForm.city}, {shippingForm.zipCode}, {shippingForm.country}</p>
                <p><span className="font-bold text-slate-800">Phone:</span> {shippingForm.phone}</p>
              </div>
            )}
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
                  : 'bg-primary hover:bg-primary-hover text-white shadow-primary/20'
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

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 self-start text-xs text-slate-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Rental Summary</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + (Number(i.qty) || 1), 0)} Item(s)
            </span>
          </div>

          {cart.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-1.5 text-primary font-bold">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Rental Duration</span>
              </div>
              <p className="text-slate-700 font-semibold">
                {new Date(cart[0].rentalStartDate).toLocaleDateString()} &rarr; {new Date(cart[0].scheduledReturnDate).toLocaleDateString()}
              </p>
              <p className="text-[10px] text-slate-500">
                Duration: <strong className="text-slate-800">{calculateDays(cart[0].rentalStartDate, cart[0].scheduledReturnDate)} day(s)</strong>
              </p>
            </div>
          )}

          <div className="space-y-3 pt-1">
            <div className="flex justify-between">
              <span>Rental Charges:</span>
              <span className="font-semibold text-slate-800">₹{subtotal?.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Promotional Discount:</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-start">
              <div>
                <span className="flex items-center text-slate-500">
                  Security Deposit 
                  <ShieldCheck className="h-4 w-4 ml-1 text-emerald-500 shrink-0" />
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block">100% Refundable</span>
              </div>
              <span className="font-semibold text-slate-800">₹{securityDeposit?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 text-sm border-t border-slate-100 pt-3">
              <span>Grand Total:</span>
              <span className="text-primary text-base font-black">₹{total?.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-[10px] text-slate-400">
            <div className="flex items-center space-x-2">
              <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>256-bit encrypted bank grade checkout</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Full deposit escrow protection</span>
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
