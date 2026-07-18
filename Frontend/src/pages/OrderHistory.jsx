import { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, Truck, RefreshCcw } from 'lucide-react';
import { api } from '../services/api';
import { format, parseISO } from 'date-fns';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getUserOrders(1); // dummy user ID
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActiveOrders = () => orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');
  const getPastOrders = () => orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled');

  const displayedOrders = activeTab === 'active' ? getActiveOrders() : getPastOrders();

  const formatDate = (isoString) => {
    try {
      return format(parseISO(isoString), 'MMM dd, yyyy');
    } catch {
      return isoString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Processing':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getDeliveryStatusColor = (status) => {
    if (status?.includes('Pending')) return 'text-amber-500';
    if (status?.includes('Out on Delivery')) return 'text-blue-500';
    if (status?.includes('Delivered')) return 'text-green-500';
    return 'text-slate-500';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Order History</h1>
          <p className="text-slate-500 mt-2">Track and manage your rental orders.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'active' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'past' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Past Orders
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(n => (
            <div key={n} className="bg-white rounded-2xl h-48 border border-slate-100 shadow-sm animate-pulse"></div>
          ))}
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Package className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No orders found</h3>
          <p className="text-slate-500">You don't have any {activeTab} orders at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
              {/* Product Info */}
              <div className="p-6 md:w-2/5 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order #{order.id.slice(-6)}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{order.productName || order.product?.name}</h3>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{formatDate(order.startDate)} - {formatDate(order.endDate)}</span>
                  </div>
                  <div className="flex items-center text-sm font-semibold text-slate-900">
                    <DollarSign className="h-4 w-4 mr-2 text-slate-400" />
                    <span>${order.totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              <div className="p-6 md:w-3/5 flex flex-col justify-center">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Tracking Status</h4>
                
                <div className="relative">
                  {/* Tracking Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>

                  <div className="space-y-6 relative">
                    {/* Delivery Step */}
                    <div className="flex items-start">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white ${order.deliveryStatus === 'Delivered' ? 'border-green-500 text-green-500' : 'border-primary text-primary'}`}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-slate-900">Delivery</p>
                        <p className={`text-sm font-medium mt-1 ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                          {order.deliveryStatus || 'Pending'}
                        </p>
                      </div>
                    </div>

                    {/* Return Step */}
                    <div className="flex items-start">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white ${order.status === 'Completed' ? 'border-green-500 text-green-500' : 'border-slate-200 text-slate-400'}`}>
                        <RefreshCcw className="h-4 w-4" />
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-bold ${order.status === 'Completed' ? 'text-slate-900' : 'text-slate-500'}`}>Return</p>
                        <p className="text-sm font-medium mt-1 text-slate-400">
                          {order.status === 'Completed' ? 'Returned Successfully' : 'Pending Return'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {order.status === 'Active' && order.deliveryStatus === 'Delivered' && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <button className="text-primary font-medium text-sm hover:underline">
                      Initiate Return early?
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
