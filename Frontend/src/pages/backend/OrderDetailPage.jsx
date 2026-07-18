import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Send, Check, RefreshCw, X, ShieldAlert, Truck, RotateCcw, DollarSign
} from 'lucide-react';
import { orderService } from '../../api/orderService';
import { quotationService } from '../../api/quotationService';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [record, setRecord] = useState(null);
  const [isQuotation, setIsQuotation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Settlement Form State
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [penaltyDays, setPenaltyDays] = useState(0);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Try to fetch as order first
      try {
        const orderData = await orderService.getOrderById(id);
        if (orderData) {
          setRecord(orderData);
          setIsQuotation(false);
          setLoading(false);
          return;
        }
      } catch (orderErr) {
        console.log("Not found as sale order, checking quotations...");
      }

      // 2. Fetch as quotation
      const quoteData = await quotationService.getQuotationById(id);
      if (quoteData) {
        setRecord(quoteData);
        setIsQuotation(true);
      } else {
        setError('Record not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch details. The ID may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuotation = async () => {
    setActionLoading(true);
    try {
      await quotationService.updateQuotationStatus(id, 'SENT');
      setRecord(prev => ({ ...prev, status: 'SENT' }));
      alert('Quotation marked as Sent!');
    } catch (err) {
      console.error(err);
      alert('Failed to update quotation status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmQuotation = async () => {
    setActionLoading(true);
    try {
      await quotationService.updateQuotationStatus(id, 'CONFIRMED');

      const firstItem = record.items?.[0] || {};
      const rentalStart = firstItem.rentalStart || new Date().toISOString();
      const rentalEnd = firstItem.rentalEnd || new Date(Date.now() + 86400000 * 3).toISOString();

      const itemsPrice = record.items?.reduce((sum, item) => {
        const price = parseFloat(item.product?.dailyCharge || item.product?.rentalPrice || 0);
        return sum + (price * (item.quantity || 1));
      }, 0) || 0;

      const duration = Math.max(1, Math.ceil((new Date(rentalEnd) - new Date(rentalStart)) / (1000 * 60 * 60 * 24)));
      const untaxedAmount = itemsPrice * duration;
      const taxPercent = 18;
      const taxAmount = (untaxedAmount * taxPercent) / 100;
      const totalAmount = untaxedAmount + taxAmount;
      const securityDepositAmount = untaxedAmount * 2;

      const orderPayload = {
        clientId: record.clientId,
        fulfillmentType: 'HOME_DELIVERY',
        orderSource: 'OFFLINE',
        rentalStartDate: rentalStart,
        scheduledReturnDate: rentalEnd,
        untaxedAmount,
        taxPercent,
        taxAmount,
        totalAmount,
        securityDepositAmount,
        quotationId: record.id,
        items: record.items?.map(item => ({
          productId: item.productId,
          productVariantId: item.productVariantId || undefined,
          quantity: item.quantity || 1,
          unitPrice: parseFloat(item.product?.dailyCharge || item.product?.rentalPrice || 0),
          amount: parseFloat(item.product?.dailyCharge || item.product?.rentalPrice || 0) * (item.quantity || 1) * duration,
          rentalStart,
          rentalEnd
        }))
      };

      const newOrder = await orderService.createOrder(orderPayload);
      alert('Quotation successfully confirmed into a Sale Order!');
      navigate(`/vendor/orders/${newOrder.id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to confirm quotation. Check parameters.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      await orderService.updateOrderStatus(id, newStatus);
      setRecord(prev => ({ ...prev, status: newStatus }));
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePenaltyChange = (days) => {
    setOriginalPenalty(days);
  };

  const setOriginalPenalty = (days) => {
    setPenaltyDays(days);
    const dailyOverdue = record?.product?.overdueCharge || (record?.items?.[0]?.product?.overdueCharge) || 50;
    const calc = parseFloat(days || 0) * parseFloat(dailyOverdue);
    const maxDeposit = parseFloat(record?.securityDepositAmount || 0);
    setPenaltyAmount(Math.min(calc, maxDeposit));
  };

  const handleSettleDeposit = () => {
    setSettled(true);
    setSettlementOpen(false);
    alert('Security deposit refunded and settled successfully!');
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
      <div className="p-6 max-w-4xl mx-auto bg-bg-card rounded-2xl border border-border-main text-center space-y-4 text-text-main">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-text-main">Something went wrong</h2>
        <p className="text-text-muted">{error}</p>
        <button onClick={() => navigate('/vendor/orders')} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover shadow">
          Return to Orders Board
        </button>
      </div>
    );
  }

  const getQuotationSteps = () => {
    const status = record.status;
    return [
      { name: 'Quotation Draft', active: true },
      { name: 'Quotation Sent', active: status === 'SENT' || status === 'CONFIRMED' },
      { name: 'Sale Order Confirmed', active: status === 'CONFIRMED' }
    ];
  };

  const getOrderSteps = () => {
    const status = record.status;
    return [
      { name: 'Confirmed', active: true },
      { name: 'Picked up / Rented', active: ['RENTED', 'OVERDUE', 'RETURNED'].includes(status) },
      { name: 'Returned', active: status === 'RETURNED' }
    ];
  };

  const steps = isQuotation ? getQuotationSteps() : getOrderSteps();
  const clientName = record.client ? `${record.client.firstName} ${record.client.lastName}` : 'Walk-in Customer';

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-text-main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-5">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/vendor/orders')}
            className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl hover:bg-bg-main transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-text-main flex items-center space-x-2">
              <span>{isQuotation ? 'Quotation Details' : 'Sale Order Details'}</span>
              <span className="text-text-muted font-normal">#{record.orderNumber || record.id.slice(0, 8)}</span>
            </h1>
            <p className="text-sm text-text-muted mt-1">Manage status cycles, payments, and settlements.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-bg-card p-2 rounded-xl border border-border-main">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              {idx > 0 && <span className="text-border-main">➔</span>}
              <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                step.active ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-bg-main text-text-muted border border-border-main'
              }`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-4">
            <h2 className="text-lg font-bold text-text-main flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Contact & Delivery</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-bg-main/60 p-4 rounded-xl border border-border-main">
                <span className="text-xs text-text-muted uppercase font-semibold block mb-1">Client Profile</span>
                <span className="text-text-main font-bold block text-base">{clientName}</span>
                <span className="text-text-muted block">{record.client?.email}</span>
                <span className="text-text-muted block">{record.client?.phone}</span>
              </div>

              <div className="bg-bg-main/60 p-4 rounded-xl border border-border-main">
                <span className="text-xs text-text-muted uppercase font-semibold block mb-1">Rental Timeline</span>
                <span className="text-text-main block">
                  <span className="font-semibold text-text-muted">Start:</span> {new Date(record.rentalStartDate || record.items?.[0]?.rentalStart).toLocaleString()}
                </span>
                <span className="text-text-main block">
                  <span className="font-semibold text-text-muted">Return:</span> {new Date(record.scheduledReturnDate || record.items?.[0]?.rentalEnd).toLocaleString()}
                </span>
                {record.actualReturnDate && (
                  <span className="text-emerald-500 block">
                    <span className="font-semibold text-text-muted">Actual Return:</span> {new Date(record.actualReturnDate).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-4">
            <h2 className="text-lg font-bold text-text-main">Itemized lines</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-main text-text-muted text-xs font-bold uppercase tracking-wider pb-2">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3 text-center">Quantity</th>
                    <th className="pb-3 text-right">Daily Rate</th>
                    <th className="pb-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {record.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-text-main font-semibold">{item.product?.name || 'Rentable item'}</td>
                      <td className="py-3 text-center text-text-main">{item.quantity}</td>
                      <td className="py-3 text-right text-text-main">₹{parseFloat(item.unitPrice || item.product?.dailyCharge || item.product?.rentalPrice || 0).toFixed(2)}</td>
                      <td className="py-3 text-right text-text-main font-bold">₹{parseFloat(item.amount || (item.quantity * (item.product?.dailyCharge || 0))).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!isQuotation && (
            <div className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-main flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-cyan-500" />
                  <span>Security Deposit Settlement</span>
                </h2>
                
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  settled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {settled ? 'REFUNDED & CLOSED' : 'HELD IN ESCROW'}
                </span>
              </div>

              <div className="bg-bg-main/60 p-4 rounded-xl border border-border-main grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-xs text-text-muted block mb-1">Held Security Deposit</span>
                  <span className="text-xl font-bold text-text-main">₹{parseFloat(record.securityDepositAmount || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block mb-1">Deducted Penalties</span>
                  <span className="text-xl font-bold text-rose-500">₹{parseFloat(penaltyAmount || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block mb-1">Refund Amount</span>
                  <span className="text-xl font-bold text-emerald-500">
                    ₹{parseFloat(Math.max(0, (record.securityDepositAmount || 0) - penaltyAmount)).toFixed(2)}
                  </span>
                </div>
              </div>

              {!settled && (
                <div className="flex justify-end pt-2">
                  {settlementOpen ? (
                    <div className="bg-bg-main p-4 rounded-xl border border-border-main w-full space-y-4 text-text-main">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-text-main">Refund Calculations</span>
                        <button onClick={() => setSettlementOpen(false)} className="text-text-muted hover:text-text-main"><X className="h-4 w-4" /></button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-text-muted mb-1.5 uppercase font-bold">Late Return Days</label>
                          <input
                            type="number"
                            min="0"
                            value={penaltyDays}
                            onChange={(e) => handlePenaltyChange(parseInt(e.target.value) || 0)}
                            className="w-full bg-bg-card border border-border-main rounded-lg p-2 text-text-main focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-text-muted mb-1.5 uppercase font-bold">Calculated Overdue Penalty</label>
                          <span className="block p-2 bg-bg-card border border-border-main rounded-lg text-rose-500 font-bold">
                            ₹{penaltyAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleSettleDeposit}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition-colors shadow"
                      >
                        Release Refund & Settle
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSettlementOpen(true)}
                      className="px-4 py-2 bg-bg-main hover:bg-bg-card border border-border-main text-text-main text-sm font-bold rounded-xl transition-all"
                    >
                      Process Late Fee Deductions & Settlement
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-4">
            <h2 className="text-lg font-bold text-text-main">Billing Summary</h2>
            
            <div className="space-y-2 border-b border-border-main pb-4 text-sm text-text-muted">
              <div className="flex justify-between">
                <span>Untaxed Amount:</span>
                <span className="text-text-main">₹{parseFloat(record.untaxedAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Amount ({record.taxPercent || 18}%):</span>
                <span className="text-text-main">₹{parseFloat(record.taxAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit (2x):</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">₹{parseFloat(record.securityDepositAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-text-main pt-2">
              <span>Total Price:</span>
              <span className="text-primary font-black">₹{parseFloat(record.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-4">
            <h2 className="text-lg font-bold text-text-main">Workflow Operations</h2>
            
            {isQuotation ? (
              <div className="space-y-3">
                {record.status === 'DRAFT' && (
                  <button
                    onClick={handleSendQuotation}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 bg-bg-main hover:bg-bg-card text-text-main border border-border-main hover:border-text-muted font-bold rounded-xl text-sm transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Quotation to Client</span>
                  </button>
                )}

                <button
                  onClick={handleConfirmQuotation}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/20 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm and Convert to Sale Order</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {record.status === 'PROCESSING' && (
                  <>
                    <Link
                      to={`/vendor/invoices/${id}`}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 bg-bg-main hover:bg-bg-card text-text-main border border-border-main hover:border-text-muted font-bold rounded-xl text-sm text-center transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Create / View Invoice</span>
                    </Link>

                    <button
                      onClick={() => handleUpdateOrderStatus('RENTED')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm transition-colors shadow"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Fulfill Delivery / Mark Rented</span>
                    </button>
                  </>
                )}

                {(record.status === 'RENTED' || record.status === 'OVERDUE') && (
                  <button
                    onClick={() => handleUpdateOrderStatus('RETURNED')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors shadow"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Record Return Check / Check In</span>
                  </button>
                )}

                {record.status === 'PROCESSING' && (
                  <button
                    onClick={() => handleUpdateOrderStatus('CANCELLED')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-550 border border-rose-500/30 hover:border-rose-500/50 font-bold rounded-xl text-sm transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel Order</span>
                  </button>
                )}

                {['RETURNED', 'CANCELLED'].includes(record.status) && (
                  <div className="p-3 bg-bg-main rounded-xl text-text-muted text-xs text-center border border-border-main font-semibold">
                    No further workflow transitions available.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
