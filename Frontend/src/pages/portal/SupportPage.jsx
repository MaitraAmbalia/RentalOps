import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';
import { queryService } from '../../api/queryService';
import { orderService } from '../../api/orderService';

export default function SupportPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(location.state?.orderId || '');
  const [queryType, setQueryType] = useState('DAMAGED_GOOD'); // 'DAMAGED_GOOD', 'PRODUCT_MISSING'
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrdersList();
  }, []);

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
      alert('Please fill out all fields.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const chosenOrder = orders.find(o => o.id === selectedOrderId);
      await queryService.createQuery({
        orderId: selectedOrderId,
        orderNumber: chosenOrder ? chosenOrder.orderNumber : 'SO0000',
        queryType,
        description
      });
      setSuccess(true);
      setDescription('');
    } catch (err) {
      console.error(err);
      setError('Failed to lodge support ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-slate-705 font-sans text-xs">
      
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-205 pb-5">
        <button 
          onClick={() => navigate('/orders')}
          className="p-2 text-slate-400 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Lodge Support Dispute</h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Dispute missing accessories or product damage</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-650 rounded-xl font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <div>
            <p className="font-bold text-slate-850">Dispute ticket lodged successfully!</p>
            <p className="text-[10px] text-slate-500 font-normal">Our vendor team will inspect and message resolution soon.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-455 rounded-xl font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Order Selector */}
          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Order Reference</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none"
            >
              <option value="">Choose Order...</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  Order #{o.orderNumber || o.id.slice(0, 8)} ({o.product?.name || 'Item'})
                </option>
              ))}
            </select>
          </div>

          {/* Issue Type */}
          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dispute Category</label>
            <div className="grid grid-cols-2 gap-4">
              <label 
                className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  queryType === 'DAMAGED_GOOD' ? 'border-rose-600 bg-rose-50/20' : 'border-slate-200 hover:border-slate-250'
                }`}
              >
                <input 
                  type="radio" 
                  name="queryType" 
                  value="DAMAGED_GOOD" 
                  checked={queryType === 'DAMAGED_GOOD'} 
                  onChange={() => setQueryType('DAMAGED_GOOD')} 
                  className="sr-only" 
                />
                <AlertTriangle className={`h-6 w-6 mb-2 ${queryType === 'DAMAGED_GOOD' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className={`font-bold text-xs ${queryType === 'DAMAGED_GOOD' ? 'text-rose-600' : 'text-slate-700'}`}>Damaged Product</span>
              </label>

              <label 
                className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                  queryType === 'PRODUCT_MISSING' ? 'border-amber-600 bg-amber-50/20' : 'border-slate-200 hover:border-slate-250'
                }`}
              >
                <input 
                  type="radio" 
                  name="queryType" 
                  value="PRODUCT_MISSING" 
                  checked={queryType === 'PRODUCT_MISSING'} 
                  onChange={() => setQueryType('PRODUCT_MISSING')} 
                  className="sr-only" 
                />
                <HelpCircle className={`h-6 w-6 mb-2 ${queryType === 'PRODUCT_MISSING' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className={`font-bold text-xs ${queryType === 'PRODUCT_MISSING' ? 'text-amber-600' : 'text-slate-700'}`}>Missing Parts</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Explain incident details</label>
            <textarea
              rows="4"
              required
              placeholder="Describe what accessories were missing, or what damages occurred during rental..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow"
          >
            Lodge Dispute Report
          </button>

        </form>
      </div>

    </div>
  );
}
