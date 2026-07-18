import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Calendar, DollarSign, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { orderService } from '../../api/orderService';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your rental order history.');
    } finally {
      setLoading(false);
    }
  };

  const getActiveOrders = () => orders.filter(o => o.status === 'PROCESSING' || o.status === 'RENTED' || o.status === 'OVERDUE');
  const getPastOrders = () => orders.filter(o => o.status === 'RETURNED' || o.status === 'CANCELLED');

  const displayedOrders = activeTab === 'active' ? getActiveOrders() : getPastOrders();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PROCESSING': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'RENTED': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'OVERDUE': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'RETURNED': return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'CANCELLED': return 'bg-rose-100 text-rose-700 border border-rose-200';
      default: return 'bg-slate-100 text-slate-655 border border-slate-205';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-700 font-sans">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Orders & Rentals</h1>
          <p className="text-sm text-slate-500 mt-1">Review active hire periods and secure deposit statuses.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'active' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-550 hover:text-slate-700'
              }`}
            >
              Active Orders
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'past' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-550 hover:text-slate-700'
              }`}
            >
              Past Orders
            </button>
          </div>
          
          <button
            onClick={fetchOrders}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-455 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white rounded-3xl h-44 border border-slate-150 shadow-sm animate-pulse" />
          ))}
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-150 shadow-sm space-y-4">
          <Package className="h-16 w-16 mx-auto text-slate-350" />
          <h2 className="text-lg font-bold text-slate-900">No Orders Found</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">You do not have any orders under this category. Visit the catalog to rent gears.</p>
          <Link 
            to="/dashboard" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow"
          >
            Go to Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((o) => (
            <div 
              key={o.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-950 text-sm">Order #{o.orderNumber || o.id.slice(0, 8)}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Created on: {new Date(o.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400 block font-bold">Total Amount</span>
                  <span className="font-black text-slate-900 text-sm">${Number(o.totalAmount || o.estimatedRentalPrice).toFixed(2)}</span>
                </div>
              </div>

              {/* Booking Dates range */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">Pickup Date</span>
                    <span className="font-bold text-slate-800">{new Date(o.rentalStartDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">Return Date</span>
                    <span className="font-bold text-slate-800">{new Date(o.scheduledReturnDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[9px]">Fulfillment</span>
                    <span className="font-bold text-slate-855 capitalize">{o.fulfillmentType?.replace('_', ' ').toLowerCase() || 'Delivery'}</span>
                  </div>
                </div>
              </div>

              {/* Product link details and Edit triggers */}
              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-400 font-bold">Item:</span>
                  <span className="font-bold text-slate-800">{o.product?.name || 'Rent Equipment'}</span>
                  {o.quantity > 1 && (
                    <span className="bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded text-[10px]">
                      {o.quantity} Units
                    </span>
                  )}
                </div>

                <Link
                  to={`/account/orders/${o.id}`}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
