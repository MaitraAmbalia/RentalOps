import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Printer } from 'lucide-react';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    orders = [],
    shippingForm,
    deliveryMethod,
    subtotal,
    securityDeposit,
    total
  } = location.state || {};

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500 font-bold space-y-4">
        <p>No confirmed order logs detected.</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">Go to catalog</Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 print:p-0 text-slate-700 font-sans">
      <div className="text-center space-y-3 bg-emerald-50 border border-emerald-200/50 p-8 rounded-3xl print:hidden">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500 shadow-md">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Thank you for your order!</h1>
        <p className="text-sm text-slate-650 max-w-md mx-auto">
          Your payment has been secure verified. Order items are processing and dispatch workflows have been scheduled.
        </p>

        <div className="pt-2 flex justify-center space-x-3 text-xs font-bold">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center space-x-1.5 transition-all shadow"
          >
            <Printer className="h-4 w-4" />
            <span>Print Invoice Sheet</span>
          </button>

          <Link 
            to="/orders"
            className="px-4 py-2 bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
          >
            Go to Order History
          </Link>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 print:border-0 print:shadow-none print:p-0">
        <div className="flex justify-between items-start border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="font-extrabold text-lg text-slate-955">RentHub Ledger Sheet</span>
            <p className="text-[10px] text-slate-455 uppercase font-black tracking-wider">Storefront Purchase Confirmation</p>
          </div>
          <div className="text-right text-xs text-slate-400 space-y-0.5">
            <p className="font-semibold text-slate-700">Date: {new Date().toLocaleDateString()}</p>
            <p>Payment: PAID (Standard Card)</p>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Registered Order References</span>
          <div className="flex flex-wrap gap-2">
            {orders.map((o, idx) => (
              <span key={idx} className="bg-blue-50/50 border border-blue-200/50 text-blue-600 font-mono text-xs px-3 py-1 rounded-lg">
                Order #{o.orderNumber}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-xs">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Billing & Delivery Address</span>
            <p className="font-bold text-slate-800">{shippingForm.fullName}</p>
            <p className="text-slate-500 leading-relaxed">
              {shippingForm.address}, {shippingForm.city}, {shippingForm.zipCode}, {shippingForm.country}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Fulfillment Details</span>
            <p><span className="font-bold text-slate-700">Delivery Mode:</span> {deliveryMethod === 'HOME_DELIVERY' ? 'Standard Courier Delivery (Home)' : 'Collect in Store'}</p>
            <p><span className="font-bold text-slate-700">Contact phone:</span> {shippingForm.phone}</p>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Rental Item Details</span>
          
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                  <th className="p-3">Product Description</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-semibold text-slate-800">{o.productName}</td>
                    <td className="p-3 text-center text-slate-655">{o.qty} units</td>
                    <td className="p-3 text-right font-bold text-slate-855">₹{o.subtotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex flex-col items-end text-xs space-y-2 text-slate-500">
          <div className="flex justify-between w-64">
            <span>Rental Cost Subtotal:</span>
            <span className="font-semibold text-slate-800">₹{subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-64">
            <span>Held Security Deposit Escrow:</span>
            <span className="font-semibold text-slate-800">₹{securityDeposit?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-64 border-t border-slate-150 pt-2 font-bold text-slate-900 text-sm">
            <span>Paid Grand Total:</span>
            <span className="text-blue-600 font-black">₹{total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-2 print:hidden">
        <Link to="/dashboard" className="text-xs font-bold text-blue-600 hover:underline">
          &larr; Back to Products Catalog
        </Link>
      </div>
    </div>
  );
}
