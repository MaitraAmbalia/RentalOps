import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Send, CreditCard, Check, X, ShieldAlert } from 'lucide-react';
import { orderService } from '../../api/orderService';

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Invoice state simulation
  const [invoiceState, setInvoiceState] = useState('DRAFT'); // 'DRAFT', 'POSTED', 'PAID'
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderService.getOrderById(id);
      if (data) {
        setOrder(data);
        
        // Generate pseudo invoice metadata
        setInvoiceNumber(`INV/2026/${id.slice(0, 4).toUpperCase()}`);
        setInvoiceDate(new Date(data.createdAt || Date.now()).toLocaleDateString());
        
        // Check order status to simulate invoice state
        if (data.status === 'RETURNED') {
          setInvoiceState('PAID');
        } else if (data.status === 'RENTED' || data.status === 'OVERDUE') {
          setInvoiceState('POSTED');
        } else {
          setInvoiceState('DRAFT');
        }
      } else {
        setError('Corresponding order not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch corresponding order details for invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInvoice = () => {
    setInvoiceState('POSTED');
    alert('Invoice Posted and validated successfully!');
  };

  const handlePayInvoice = () => {
    setInvoiceState('PAID');
    alert('Payment recorded! Invoice status updated to Paid.');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCancelInvoice = () => {
    alert('Invoice cancelled.');
    navigate(`/vendor/orders/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Invoice Lookup Error</h2>
        <p className="text-slate-400">{error}</p>
        <button onClick={() => navigate('/vendor/orders')} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">
          Return to Orders Board
        </button>
      </div>
    );
  }

  const clientName = order.client ? `${order.client.firstName} ${order.client.lastName}` : 'Walk-in Customer';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 print:hidden">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/vendor/orders/${id}`)}
            className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <span>Invoice Lifecycle</span>
              <span className="text-slate-500 font-normal">({invoiceState})</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">Review ledger lines and invoice state changes.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {invoiceState === 'DRAFT' && (
            <>
              <button
                onClick={handleConfirmInvoice}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Confirm / Post</span>
              </button>
              <button
                onClick={handleCancelInvoice}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 text-sm font-semibold rounded-xl transition-all flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </>
          )}

          {invoiceState === 'POSTED' && (
            <>
              <button
                onClick={handlePayInvoice}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Register Payment (Pay)</span>
              </button>
              <button
                onClick={() => alert('Invoice sent to customer email!')}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold rounded-xl transition-all flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send via Email</span>
              </button>
            </>
          )}

          {invoiceState === 'PAID' && (
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>PAID & POSTED</span>
            </div>
          )}

          <button
            onClick={handlePrintInvoice}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-sm font-semibold rounded-xl transition-all flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice Document Layout (looks like a clean receipt/pdf) */}
      <div className="bg-slate-950 p-8 sm:p-12 rounded-3xl border border-slate-800 text-slate-300 space-y-8 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-800 pb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold text-white tracking-wider print:text-black">RENTHUB VENDOR LOGISTICS</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              RentHub Platform Inc.<br />
              100 Technology Dr, Suite 500<br />
              San Francisco, CA, 94107
            </p>
          </div>
          
          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs text-slate-500 uppercase tracking-widest block font-bold">Tax Invoice</span>
            <span className="text-2xl font-black text-white block print:text-black">{invoiceNumber}</span>
            <span className="text-xs text-slate-400 block"><span className="font-semibold text-slate-500">Invoice Date:</span> {invoiceDate}</span>
            <span className="text-xs text-slate-400 block"><span className="font-semibold text-slate-500">Order Ref:</span> {order.orderNumber}</span>
          </div>
        </div>

        {/* Addresses block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-slate-800 pb-8">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold mb-2">Billed To</span>
            <span className="text-base font-bold text-white block print:text-black">{clientName}</span>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              {order.client?.shippingAddress || 'No billing address provided.'}<br />
              Email: {order.client?.email}<br />
              Phone: {order.client?.phone}
            </p>
          </div>

          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold mb-2">Fulfillment Mode</span>
            <span className="text-sm bg-slate-900 border border-slate-800 rounded-lg p-2 px-3 inline-block font-semibold text-slate-300 print:border-slate-300">
              {order.fulfillmentType === 'HOME_DELIVERY' ? 'Home Delivery Address Routing' : 'Store Collection Pickup'}
            </span>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              {order.fulfillmentType === 'HOME_DELIVERY' ? order.client?.shippingAddress : 'Warehouse Outlet Store'}
            </p>
          </div>
        </div>

        {/* Invoice Lines Table */}
        <div className="space-y-4">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 text-xs font-bold uppercase tracking-wider pb-3">
                <th className="pb-3">Product Definition</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Daily Rent Price</th>
                <th className="pb-3 text-right">Tax Rates</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td className="py-4 font-semibold text-slate-200 print:text-black">
                    {item.product?.name || 'Heavy Machinery Equipment'}
                    <span className="block text-xs text-slate-500 font-normal mt-0.5">{item.product?.productDefinition || 'Standard Rentable Item'}</span>
                  </td>
                  <td className="py-4 text-center text-slate-300">{item.quantity}</td>
                  <td className="py-4 text-right text-slate-300">${parseFloat(item.unitPrice || item.product?.dailyCharge || 0).toFixed(2)}</td>
                  <td className="py-4 text-right text-slate-300">{order.taxPercent || 18}% (GST)</td>
                  <td className="py-4 text-right text-slate-100 font-bold print:text-black">${parseFloat(item.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ledger Bottom Calculation Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-4">
          <div className="text-xs text-slate-500 max-w-xs space-y-1">
            <p className="font-bold text-slate-400">Payment & Settlement Terms:</p>
            <p>Payment is captured at confirm checkout. Outstanding penalties due to delay returns are subject to deduction from held security deposits.</p>
          </div>

          <div className="w-full sm:w-80 space-y-3">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal:</span>
              <span>${parseFloat(order.untaxedAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Taxes ({order.taxPercent || 18}%):</span>
              <span>${parseFloat(order.taxAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-3 text-base font-extrabold text-white print:text-black">
              <span>Total Price:</span>
              <span className="text-primary print:text-black">${parseFloat(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
