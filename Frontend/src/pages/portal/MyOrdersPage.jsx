import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Calendar, Clock, ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react';
import { orderService } from '../../api/orderService';
import { quotationService } from '../../api/quotationService';

const STATUS_CONFIG = {
  PROCESSING:  { badge: 'bg-primary/10 text-primary border border-primary/20',       dot: 'bg-primary' },
  RENTED:      { badge: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20', dot: 'bg-emerald-500' },
  OVERDUE:     { badge: 'bg-amber-500/10 text-amber-500 border border-amber-500/20', dot: 'bg-amber-500' },
  RETURNED:    { badge: 'bg-border-main text-text-muted border border-border-main',   dot: 'bg-text-muted' },
  CANCELLED:   { badge: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',    dot: 'bg-rose-500' },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersData, quotesData] = await Promise.all([
        orderService.getOrders(),
        quotationService.getQuotations().catch(() => [])
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setQuotations(Array.isArray(quotesData) ? quotesData : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your rental orders.');
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter(o => ['PROCESSING', 'RENTED', 'OVERDUE'].includes(o.status));
  const pastOrders   = orders.filter(o => ['RETURNED', 'CANCELLED'].includes(o.status));
  const displayed    = activeTab === 'active' ? activeOrders : activeTab === 'past' ? pastOrders : quotations;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-main">My Orders & Rentals</h1>
          <p className="text-xs text-text-muted mt-1 font-medium">Review active hire periods, proposals, and deposit statuses.</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Tab Switcher */}
          <div className="flex bg-bg-card border border-border-main p-1 rounded-xl gap-1">
            {['active', 'past', 'quotations'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab === 'active' && `Active (${activeOrders.length})`}
                {tab === 'past' && `Past (${pastOrders.length})`}
                {tab === 'quotations' && `Quotation Proposals (${quotations.length})`}
              </button>
            ))}
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-bg-card rounded-2xl h-40 border border-border-main animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        /* Empty State */
        <div className="bg-bg-card rounded-2xl p-16 text-center border border-border-main space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-text-main">
              {activeTab === 'quotations' ? 'No Proposals Found' : 'No Orders Found'}
            </h2>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto font-medium">
              {activeTab === 'quotations'
                ? 'You do not have any quotation proposals from vendors currently.'
                : `You don't have any ${activeTab} orders yet. Browse the catalog to rent gear.`}
            </p>
          </div>
          {activeTab !== 'quotations' && (
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm shadow-primary/20 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Browse Catalog</span>
            </Link>
          )}
        </div>
      ) : activeTab === 'quotations' ? (
        /* Quotation Cards */
        <div className="space-y-4">
          {displayed.map((q) => (
            <div
              key={q.id}
              className="bg-bg-card border border-border-main rounded-2xl p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-extrabold text-text-main text-sm">
                      Proposal #{q.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      q.status === 'CONFIRMED'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : q.status === 'CANCELLED'
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted font-semibold">
                    Issued by {q.vendor?.companyName || `Vendor ${q.vendorId.slice(0, 8)}`} • Validity {q.quotationValidityDays || 7} Days
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-muted font-bold uppercase block">Downpayment Required</span>
                  <span className="font-extrabold text-text-main text-base">
                    {q.paymentTermsPercent || 100}%
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-border-main py-3 text-xs text-text-muted">
                <span className="font-bold text-text-main">Items: </span>
                {q.items?.map(it => `${it.product?.name || 'Equipment'} (x${it.quantity})`).join(', ') || 'No equipment lines'}
              </div>

              <div className="flex justify-end items-center">
                <Link
                  to={`/account/quotations/${q.id}`}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-primary/20"
                >
                  <span>{q.status === 'CONFIRMED' || q.status === 'CANCELLED' ? 'View Proposal' : 'Review & E-Sign'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Order Cards */
        <div className="space-y-4">
          {displayed.map((o) => {
            const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.RETURNED;
            return (
              <div
                key={o.id}
                className="bg-bg-card border border-border-main rounded-2xl p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      <span className="font-extrabold text-text-main text-sm">
                        Order #{o.orderNumber || o.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${sc.badge}`}>
                        {o.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted font-semibold pl-4.5">
                      Placed {fmt(o.createdAt)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-text-muted font-bold uppercase block">Total Amount</span>
                    <span className="font-extrabold text-text-main text-base">
                      ₹{Number(o.totalAmount || o.estimatedRentalPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Booking Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-border-main py-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Pickup Date</span>
                      <span className="text-xs font-bold text-text-main">{fmt(o.rentalStartDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Return Date</span>
                      <span className="text-xs font-bold text-text-main">{fmt(o.scheduledReturnDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Fulfillment</span>
                      <span className="text-xs font-bold text-text-main capitalize">
                        {o.fulfillmentType?.replace('_', ' ').toLowerCase() || 'Delivery'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                  <div className="text-xs flex items-center space-x-2">
                    <span className="text-text-muted font-bold">Item:</span>
                    <span className="font-bold text-text-main">{o.product?.name || 'Rental Equipment'}</span>
                    {o.quantity > 1 && (
                      <span className="bg-bg-main text-text-muted font-bold px-1.5 py-0.5 rounded-lg border border-border-main text-[10px]">
                        ×{o.quantity}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/account/orders/${o.id}`}
                    className="flex items-center space-x-1.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-primary/20"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
