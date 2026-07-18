import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, CheckCircle, Clock, Truck, List, Kanban, 
  ChevronRight, RefreshCw, Search, ArrowRightLeft
} from 'lucide-react';
import { orderService } from '../../api/orderService';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
  const [activeTab, setActiveTab] = useState('ongoing'); // 'ongoing' or 'past'
  
  // Filters
  const [timeFilter, setTimeFilter] = useState('all'); // 'today', '7days', '30days', 'all'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', specific status
  const [searchQuery, setSearchQuery] = useState('');
  
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
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const isOngoing = (status) => ['PROCESSING', 'RENTED', 'OVERDUE'].includes(status);
  const isPast = (status) => ['RETURNED', 'CANCELLED'].includes(status);

  const matchesTime = (dateStr, filter) => {
    if (filter === 'all') return true;
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (filter === 'today') {
      return date.toDateString() === now.toDateString();
    } else if (filter === '7days') {
      return diffDays <= 7;
    } else if (filter === '30days') {
      return diffDays <= 30;
    }
    return true;
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'ongoing' && !isOngoing(o.status)) return false;
    if (activeTab === 'past' && !isPast(o.status)) return false;

    if (!matchesTime(o.createdAt || o.rentalStartDate, timeFilter)) return false;

    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      const numMatch = o.orderNumber?.toLowerCase().includes(search);
      const nameMatch = `${o.client?.firstName || ''} ${o.client?.lastName || ''}`.toLowerCase().includes(search);
      if (!numMatch && !nameMatch) return false;
    }

    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'RENTED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'OVERDUE': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'RETURNED': return 'bg-slate-800 text-slate-400 border border-slate-700';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-slate-900 text-slate-500 border border-slate-800';
    }
  };

  const columns = [
    { title: 'Confirmed / Pickups (PROCESSING)', status: 'PROCESSING' },
    { title: 'Out Rented / In Use (RENTED)', status: 'RENTED' },
    { title: 'Overdue Returns (OVERDUE)', status: 'OVERDUE' }
  ];

  return (
    <div className="space-y-6 font-sans text-slate-100">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Quotation & Sale Orders</h1>
          <p className="text-sm text-slate-400 mt-1">Settle rental periods, dispatch couriers, and track return dates.</p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Table view list"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Kanban Board view"
            >
              <Kanban className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Primary Filtering section */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex space-x-2 bg-slate-900 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'ongoing' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ongoing Hire
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'past' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Archived Logs
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="Search ID, Client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-4 py-2 focus:outline-none"
            />
            <Search className="h-3.5 w-3.5 text-slate-550 absolute left-3 top-2.5" />
          </div>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs border border-slate-800 rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <span>Syncing orders ledger...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-slate-950 p-16 rounded-2xl border border-slate-800 text-center text-slate-500">
          No matching rental order logs found.
        </div>
      ) : viewMode === 'list' ? (
        /* Table View */
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">Order Ref</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Rental Duration</th>
                  <th className="p-4 text-center">Fulfillment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Total Price</th>
                  <th className="p-4 text-center">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-xs">
                {filteredOrders.map(o => {
                  const clientName = o.client ? `${o.client.firstName} ${o.client.lastName}` : 'Walk-in customer';
                  return (
                    <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-300">#{o.orderNumber || o.id.slice(0, 8)}</td>
                      <td className="p-4 font-semibold text-slate-200">{clientName}</td>
                      <td className="p-4 text-slate-400">
                        {new Date(o.rentalStartDate).toLocaleDateString()} - {new Date(o.scheduledReturnDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center text-slate-300 capitalize">
                        {o.fulfillmentType?.replace('_', ' ').toLowerCase() || 'Courier'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getStatusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-200">${Number(o.totalAmount || o.estimatedRentalPrice).toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <Link
                          to={`/vendor/orders/${o.id}`}
                          className="text-xs font-bold text-primary hover:underline inline-flex items-center"
                        >
                          <span>Manage</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map(col => {
            const colOrders = filteredOrders.filter(o => o.status === col.status);
            return (
              <div key={col.status} className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">{col.title}</h3>
                  <span className="bg-slate-900 border border-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-bold">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[350px] overflow-y-auto pr-1">
                  {colOrders.map(o => {
                    const clientName = o.client ? `${o.client.firstName} ${o.client.lastName}` : 'Walk-in';
                    return (
                      <div key={o.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 hover:border-slate-750 transition-all text-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-slate-300">#{o.orderNumber || o.id.slice(0, 8)}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {new Date(o.rentalStartDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-slate-200 text-sm">{clientName}</p>
                          <p className="text-slate-400 mt-1">Item: {o.product?.name || 'Rentable gear'}</p>
                          <p className="text-[10px] text-slate-500 capitalize">{o.fulfillmentType?.replace('_', ' ').toLowerCase()}</p>
                        </div>

                        <div className="border-t border-slate-850 pt-3 flex justify-between items-center">
                          <span className="font-bold text-slate-200">${Number(o.totalAmount || o.estimatedRentalPrice).toFixed(2)}</span>
                          
                          <Link
                            to={`/vendor/orders/${o.id}`}
                            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-white rounded-lg border border-slate-800 text-[10px] font-bold"
                          >
                            Details &rarr;
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
