import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Package, Calendar, Clock, ArrowRight, RefreshCw, ShoppingBag, Plus, XCircle, FileText } from 'lucide-react';
import { orderService } from '../../api/orderService';
import { quotationService } from '../../api/quotationService';
import { productService } from '../../api/productService';

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
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  // RFQ Modal States
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [rfqCategoryId, setRfqCategoryId] = useState('');
  const [rfqDescription, setRfqDescription] = useState('');
  const [rfqQuantity, setRfqQuantity] = useState(1);
  const [rfqRentalStart, setRfqRentalStart] = useState(new Date().toISOString().split('T')[0]);
  const [rfqRentalEnd, setRfqRentalEnd] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [rfqSubmitting, setRfqSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    if (location.state?.openRfq) {
      setActiveTab('quotations');
      setShowRfqModal(true);
      if (location.state.categoryId) setRfqCategoryId(location.state.categoryId);
      if (location.state.rfqQuantity) setRfqQuantity(location.state.rfqQuantity);
      if (location.state.rfqRentalStart) setRfqRentalStart(location.state.rfqRentalStart.split('T')[0]);
      if (location.state.rfqRentalEnd) setRfqRentalEnd(location.state.rfqRentalEnd.split('T')[0]);
      if (location.state.rfqDescription) setRfqDescription(location.state.rfqDescription);
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersData, quotesData, catsData] = await Promise.all([
        orderService.getOrders(),
        quotationService.getQuotations().catch(() => []),
        productService.getCategories().catch(() => [])
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setQuotations(Array.isArray(quotesData) ? quotesData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your rental orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRfq = async (e) => {
    e.preventDefault();
    if (!rfqCategoryId) {
      setError('Please select a category');
      return;
    }
    const selectedCat = categories.find(c => c.id === rfqCategoryId);
    if (!selectedCat) {
      setError('Selected category not found');
      return;
    }

    setRfqSubmitting(true);
    setError('');
    try {
      const payload = {
        categoryId: rfqCategoryId,
        vendorId: selectedCat.vendorId,
        rfqDescription,
        rfqQuantity: Number(rfqQuantity),
        rfqRentalStart: new Date(rfqRentalStart).toISOString(),
        rfqRentalEnd: new Date(rfqRentalEnd).toISOString(),
        status: 'RFQ'
      };

      await quotationService.createQuotation(payload);
      setShowRfqModal(false);
      setRfqDescription('');
      setRfqQuantity(1);
      fetchOrders();
    } catch (err) {
      console.error(err);
      setError('Failed to submit Request for Quotation');
    } finally {
      setRfqSubmitting(false);
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

          {activeTab === 'quotations' && (
            <button
              onClick={() => setShowRfqModal(true)}
              className="flex items-center space-x-2 px-4 py-1.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Request Quote (RFQ)</span>
            </button>
          )}

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
          {activeTab !== 'quotations' ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm shadow-primary/20 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Browse Catalog</span>
            </Link>
          ) : (
            <button
              onClick={() => setShowRfqModal(true)}
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm shadow-primary/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Request Custom Quote (RFQ)</span>
            </button>
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
                        : q.status === 'RFQ'
                        ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
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

              {q.status === 'RFQ' ? (
                <div className="border-t border-b border-border-main py-3 text-xs text-text-muted space-y-1">
                  <div>
                    <span className="font-bold text-text-main">Requested Category: </span>
                    <span className="text-text-main font-semibold">{q.category?.name || 'Any Category'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-text-main">Details: </span>
                    <span className="italic text-text-main">"{q.rfqDescription || 'No description provided'}"</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-[11px]">
                    <div>
                      <span className="font-bold text-text-main">Qty: </span>
                      <span>{q.rfqQuantity || 1}</span>
                    </div>
                    <div>
                      <span className="font-bold text-text-main">Requested Dates: </span>
                      <span className="text-text-main font-semibold">
                        {q.rfqRentalStart ? fmt(q.rfqRentalStart) : '—'} to {q.rfqRentalEnd ? fmt(q.rfqRentalEnd) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-b border-border-main py-3 text-xs text-text-muted">
                  <span className="font-bold text-text-main">Items: </span>
                  {q.items?.map(it => `${it.product?.name || 'Equipment'} (x${it.quantity})`).join(', ') || 'No equipment lines'}
                </div>
              )}

              <div className="flex justify-end items-center">
                <Link
                  to={`/account/quotations/${q.id}`}
                  className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-colors shadow-sm ${
                    q.status === 'RFQ'
                      ? 'bg-bg-main text-text-muted border border-border-main cursor-default pointer-events-none'
                      : 'bg-primary hover:bg-primary-hover text-white shadow-primary/20'
                  }`}
                >
                  <span>
                    {q.status === 'RFQ'
                      ? 'Awaiting Vendor Quote'
                      : q.status === 'CONFIRMED' || q.status === 'CANCELLED'
                      ? 'View Proposal'
                      : 'Review & E-Sign'}
                  </span>
                  {q.status !== 'RFQ' && <ArrowRight className="h-3.5 w-3.5" />}
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

      {/* RFQ Creation Modal */}
      {showRfqModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-main rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <h3 className="text-lg font-extrabold text-text-main flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Request Custom Quote (RFQ)</span>
              </h3>
              <button
                onClick={() => setShowRfqModal(false)}
                className="p-1 text-text-muted hover:text-text-main rounded-lg hover:bg-bg-main transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Equipment Category & Vendor *</label>
                <select
                  required
                  value={rfqCategoryId}
                  onChange={e => setRfqCategoryId(e.target.value)}
                  className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-primary transition-all"
                >
                  <option value="">-- Select Category (Vendor) --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (by {cat.vendor?.companyName || 'Unknown Vendor'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Requested Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={rfqQuantity}
                  onChange={e => setRfqQuantity(Number(e.target.value))}
                  className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Rental Start Date</label>
                  <input
                    type="date"
                    required
                    value={rfqRentalStart}
                    onChange={e => setRfqRentalStart(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Rental End Date</label>
                  <input
                    type="date"
                    required
                    value={rfqRentalEnd}
                    onChange={e => setRfqRentalEnd(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Custom Specifications & Details *</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Explain exactly what model, brand, color, specs, or accessories you need that aren't listed on our portal..."
                  value={rfqDescription}
                  onChange={e => setRfqDescription(e.target.value)}
                  className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setShowRfqModal(false)}
                  className="px-4 py-2.5 border border-border-main text-text-muted hover:text-text-main rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rfqSubmitting}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {rfqSubmitting ? 'Submitting Request...' : 'Submit RFQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
