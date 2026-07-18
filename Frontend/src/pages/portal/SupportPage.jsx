import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle, HelpCircle, Package, MessageSquare } from 'lucide-react';
import { queryService } from '../../api/queryService';
import { orderService } from '../../api/orderService';

const inputCls = "w-full bg-bg-main border border-border-main text-text-main rounded-xl p-2.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-text-muted";
const labelCls = "block font-bold text-text-muted text-[10px] uppercase tracking-wider mb-1.5";

export default function SupportPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(location.state?.orderId || '');
  const [queryType, setQueryType] = useState('DAMAGED_GOOD');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchOrdersList(); }, []);

  const fetchOrdersList = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || !description.trim()) {
      setError('Please select an order and describe the issue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const chosenOrder = orders.find(o => o.id === selectedOrderId);
      await queryService.createQuery({
        orderId: selectedOrderId,
        orderNumber: chosenOrder?.orderNumber || 'SO0000',
        queryType,
        description
      });
      setSuccess(true);
      setDescription('');
    } catch (err) {
      console.error(err);
      setError('Failed to lodge support ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ISSUE_TYPES = [
    { value: 'DAMAGED_GOOD',    label: 'Damaged Product', Icon: AlertTriangle, color: 'rose' },
    { value: 'PRODUCT_MISSING', label: 'Missing Parts',   Icon: HelpCircle,    color: 'amber' },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="flex items-center space-x-3 border-b border-border-main pb-5">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-rose-500/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="h-4.5 w-4.5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-text-main">Lodge Support Dispute</h1>
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">
              Report damaged or missing rental items
            </p>
          </div>
        </div>
      </div>

      {/* Success State */}
      {success && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-500">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span className="font-extrabold text-sm">Dispute Submitted Successfully!</span>
          </div>
          <p className="text-xs text-text-muted font-medium pl-7">
            Your support ticket has been logged. The vendor team will review and respond shortly.
          </p>
          <button
            onClick={() => { setSuccess(false); setSelectedOrderId(''); }}
            className="ml-7 text-xs text-primary font-bold hover:underline"
          >
            Submit another ticket →
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {!success && (
        <div className="bg-bg-card border border-border-main rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Order Selector */}
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1"><Package className="h-3 w-3" /> Select Order</span>
              </label>
              <select
                value={selectedOrderId}
                onChange={e => setSelectedOrderId(e.target.value)}
                className={inputCls}
              >
                <option value="">Choose an order...</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    Order #{o.orderNumber || o.id.slice(0, 8).toUpperCase()} — {o.product?.name || 'Item'}
                  </option>
                ))}
              </select>
              {orders.length === 0 && (
                <p className="text-[10px] text-text-muted mt-1.5 font-medium">
                  No orders found. You can only raise disputes for existing orders.
                </p>
              )}
            </div>

            {/* Issue Type */}
            <div>
              <label className={labelCls}>Dispute Category</label>
              <div className="grid grid-cols-2 gap-3">
                {ISSUE_TYPES.map(({ value, label, Icon, color }) => {
                  const isSelected = queryType === value;
                  const colorMap = {
                    rose:  { border: isSelected ? 'border-rose-500'  : 'border-border-main', bg: isSelected ? 'bg-rose-500/5' : '', icon: 'text-rose-500',  text: isSelected ? 'text-rose-500'  : 'text-text-muted' },
                    amber: { border: isSelected ? 'border-amber-500' : 'border-border-main', bg: isSelected ? 'bg-amber-500/5' : '', icon: 'text-amber-500', text: isSelected ? 'text-amber-500' : 'text-text-muted' },
                  };
                  const c = colorMap[color];
                  return (
                    <label
                      key={value}
                      className={`flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${c.border} ${c.bg}`}
                    >
                      <input
                        type="radio" name="queryType" value={value}
                        checked={isSelected} onChange={() => setQueryType(value)}
                        className="sr-only"
                      />
                      <Icon className={`h-6 w-6 mb-2 ${c.icon}`} />
                      <span className={`font-bold text-xs ${c.text}`}>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Describe the Incident</label>
              <textarea
                rows="5" required
                placeholder="Please describe what was damaged or missing in detail. Include any photos or evidence if possible."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-text-muted mt-1 font-medium">
                {description.length}/500 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedOrderId}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Lodge Dispute Report'}</span>
            </button>

          </form>
        </div>
      )}
    </div>
  );
}
