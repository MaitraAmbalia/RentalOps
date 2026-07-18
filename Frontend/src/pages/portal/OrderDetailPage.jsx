import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Info, AlertTriangle, Printer,
  Package, CreditCard, Clock, MapPin, ShieldCheck
} from 'lucide-react';
import { orderService } from '../../api/orderService';
import { depositInvoiceService } from '../../api/depositInvoiceService';

const STATUS_CONFIG = {
  PROCESSING:  { badge: 'bg-primary/10 text-primary border border-primary/20',               label: 'Processing' },
  RENTED:      { badge: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',   label: 'Active Rental' },
  OVERDUE:     { badge: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',         label: 'Overdue' },
  RETURNED:    { badge: 'bg-border-main text-text-muted border border-border-main',           label: 'Returned' },
  CANCELLED:   { badge: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',            label: 'Cancelled' },
};

const DEPOSIT_STATUS = {
  HELD:      'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  REFUNDED:  'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  SETTLED:   'bg-border-main text-text-muted border border-border-main',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchOrderDetail(); }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true); setError('');
    try {
      const [ord, dep] = await Promise.all([
        orderService.getOrderById(id),
        depositInvoiceService.getDepositSummary(id).catch(() => null)
      ]);
      setOrder(ord);
      setDeposit(dep);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-text-muted font-semibold">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8 text-rose-500" />
        </div>
        <p className="text-text-muted font-semibold text-sm">{error || 'Order not found.'}</p>
        <button onClick={() => navigate('/orders')} className="text-primary hover:underline text-xs font-bold">
          ← Back to Orders
        </button>
      </div>
    );
  }

  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.RETURNED;
  const rental = Number(order.totalAmount || order.estimatedRentalPrice || 0);
  const depositAmt = Number(order.securityDepositAmount || 0);
  const totalPaid = rental + depositAmt;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-border-main pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-text-main">
              Order #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Rental Detail Sheet
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl transition-colors text-xs font-bold"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={() => navigate('/account/support', { state: { orderId: order.id, orderNumber: order.orderNumber } })}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Lodge Dispute</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="md:col-span-2 space-y-5">

          {/* Product Summary */}
          <div className="bg-bg-card border border-border-main rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Product Hired</span>
                  <span className="font-extrabold text-text-main text-base">{order.product?.name || 'Rental Equipment'}</span>
                  {order.quantity > 1 && (
                    <span className="text-xs text-text-muted font-medium block">Qty: {order.quantity} units</span>
                  )}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap ${sc.badge}`}>
                {sc.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border-main pt-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Rental Start</span>
                  <span className="text-xs font-bold text-text-main">{fmt(order.rentalStartDate)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Scheduled Return</span>
                  <span className="text-xs font-bold text-text-main">{fmt(order.scheduledReturnDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Ledger */}
          <div className="bg-bg-card border border-border-main rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-extrabold text-text-main uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Security Deposit</span>
            </h3>
            {deposit ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted font-semibold">Deposit Status:</span>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${DEPOSIT_STATUS[deposit.status] || DEPOSIT_STATUS.SETTLED}`}>
                    {deposit.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-bg-main p-4 rounded-xl border border-border-main text-xs">
                  <div>
                    <span className="text-text-muted font-semibold block">Amount Held</span>
                    <span className="font-extrabold text-text-main text-sm">{fmtMoney(deposit.amount)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted font-semibold block">Refund Amount</span>
                    <span className={`font-extrabold text-sm ${deposit.refundAmount ? 'text-emerald-500' : 'text-text-muted'}`}>
                      {deposit.refundAmount ? fmtMoney(deposit.refundAmount) : 'Pending inspection'}
                    </span>
                  </div>
                </div>
                {deposit.settlementNotes && (
                  <div className="p-3 bg-bg-main rounded-xl border border-border-main text-xs text-text-muted italic leading-relaxed">
                    "{deposit.settlementNotes}"
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-bg-main rounded-xl border border-border-main text-xs text-text-muted flex items-start space-x-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Security deposit details are pending. They will appear once your order is processed by the vendor.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Charges Summary */}
        <div className="bg-bg-card border border-border-main rounded-2xl p-6 space-y-4 self-start">
          <h3 className="text-xs font-extrabold text-text-main uppercase tracking-wider flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span>Charges Summary</span>
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted font-semibold">Rental Fee</span>
              <span className="font-bold text-text-main">{fmtMoney(rental)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted font-semibold">Security Deposit</span>
              <span className="font-bold text-text-main">{fmtMoney(depositAmt)}</span>
            </div>
            <div className="h-px bg-border-main" />
            <div className="flex justify-between">
              <span className="font-extrabold text-text-main text-xs">Total Paid</span>
              <span className="font-extrabold text-primary text-base">{fmtMoney(totalPaid)}</span>
            </div>
          </div>

          {/* Fulfillment info */}
          {order.fulfillmentType && (
            <div className="flex items-start space-x-2 pt-2 border-t border-border-main text-xs">
              <MapPin className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Fulfillment</span>
                <span className="font-bold text-text-main capitalize">
                  {order.fulfillmentType.replace('_', ' ').toLowerCase()}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
