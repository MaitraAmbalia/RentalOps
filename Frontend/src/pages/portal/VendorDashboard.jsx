import { useState, useEffect } from 'react';
import { 
  ShoppingBag, CheckCircle, Clock, Truck, Store, List, Kanban, 
  Calendar, ChevronRight, Eye, RefreshCw, Search, ArrowRightLeft, User, Phone
} from 'lucide-react';
import { orderService } from '../../api/orderService';
import { useToast } from '../../context/ToastContext';

export default function VendorDashboard() {
  const { error: toastError } = useToast();
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
      // Refresh local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      toastError('Failed to update status. Please check your permissions.');
    }
  };

  // Helper: check if order is ongoing
  const isOngoing = (status) => ['PROCESSING', 'RENTED', 'OVERDUE'].includes(status);

  // Helper: check if order is past
  const isPast = (status) => ['RETURNED', 'CANCELLED'].includes(status);

  // Date check helper
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

  // Metrics calculations
  const ongoingOrders = orders.filter(o => isOngoing(o.status));
  const needPickedUpCount = ongoingOrders.filter(o => o.fulfillmentType === 'COLLECT_FROM_STORE' && o.status === 'PROCESSING').length;
  const toDeliverCount = ongoingOrders.filter(o => o.fulfillmentType === 'HOME_DELIVERY' && o.status === 'PROCESSING').length;
  
  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    // 1. Tab check
    if (activeTab === 'ongoing' && !isOngoing(o.status)) return false;
    if (activeTab === 'past' && !isPast(o.status)) return false;

    // 2. Time Filter
    if (!matchesTime(o.createdAt || o.rentalStartDate, timeFilter)) return false;

    // 3. Status Filter
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    // 4. Search Filter (Order Number or Client Name)
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      const numMatch = o.orderNumber?.toLowerCase().includes(search);
      const nameMatch = `${o.client?.firstName || ''} ${o.client?.lastName || ''}`.toLowerCase().includes(search);
      if (!numMatch && !nameMatch) return false;
    }

    return true;
  });

  // Kanban columns configuration
  const kanbanColumns = activeTab === 'ongoing' 
    ? ['PROCESSING', 'RENTED', 'OVERDUE']
    : ['RETURNED', 'CANCELLED'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROCESSING': return 'bg-blue-500/25 border-blue-500 text-blue-300';
      case 'RENTED': return 'bg-emerald-500/25 border-emerald-500 text-emerald-300';
      case 'OVERDUE': return 'bg-rose-500/25 border-rose-500 text-rose-300';
      case 'RETURNED': return 'bg-slate-500/25 border-slate-500 text-slate-300';
      case 'CANCELLED': return 'bg-gray-500/25 border-gray-500 text-gray-400';
      default: return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const getFulfillmentIcon = (type) => {
    return type === 'HOME_DELIVERY' 
      ? <Truck className="h-4 w-4 text-amber-400" />
      : <Store className="h-4 w-4 text-cyan-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Orders Board</h1>
          <p className="text-slate-400 mt-1">Track rental fulfillment cycles and manage statuses.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors text-sm font-semibold self-start md:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Ongoing */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Ongoing Rentals</span>
            <span className="text-3xl font-extrabold text-white block">{ongoingOrders.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Need Picked Up */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">To Be Picked Up (In-Store)</span>
            <span className="text-3xl font-extrabold text-cyan-400 block">{needPickedUpCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Store className="h-6 w-6 text-cyan-400" />
          </div>
        </div>

        {/* To Deliver */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">To Be Delivered</span>
            <span className="text-3xl font-extrabold text-amber-400 block">{toDeliverCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Truck className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          {/* Ongoing/Past tabs */}
          <div className="flex space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => { setActiveTab('ongoing'); setStatusFilter('all'); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'ongoing' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => { setActiveTab('past'); setStatusFilter('all'); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'past' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Past
            </button>
          </div>

          {/* Search, filters & view toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full bg-slate-900 text-slate-200 text-sm border border-slate-800 rounded-xl pl-9 pr-4 py-2 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Time Filter */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-slate-900 text-slate-200 text-sm border border-slate-800 rounded-xl px-4 py-2 focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer pr-8"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
              <Calendar className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 text-slate-200 text-sm border border-slate-800 rounded-xl px-4 py-2 focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer pr-8"
              >
                <option value="all">All Statuses</option>
                {activeTab === 'ongoing' ? (
                  <>
                    <option value="PROCESSING">Processing</option>
                    <option value="RENTED">Rented</option>
                    <option value="OVERDUE">Overdue</option>
                  </>
                ) : (
                  <>
                    <option value="RETURNED">Returned</option>
                    <option value="CANCELLED">Cancelled</option>
                  </>
                )}
              </select>
              <Clock className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>

            {/* Layout Toggle */}
            <div className="flex border border-slate-800 p-1 rounded-xl bg-slate-900">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-slate-800 text-primary' : 'text-slate-500'}`}
                title="Kanban view"
              >
                <Kanban className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-primary' : 'text-slate-500'}`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Error states */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <span>Loading orders data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500 text-red-200 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-base font-bold">No orders found</p>
            <p className="text-sm mt-1">Try clearing filters or search query.</p>
          </div>
        ) : (
          /* Main view render */
          viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">Order Details</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4">Fulfillment</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Quick Move</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="block font-bold text-white">{o.orderNumber}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">ID: {o.id.substring(0, 8)}...</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4.5 w-4.5 text-slate-500" />
                          <div>
                            <span className="block font-semibold">{o.client?.firstName} {o.client?.lastName}</span>
                            <span className="block text-xs text-slate-500">{o.client?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase">Start</span>
                          <span className="text-xs">{new Date(o.rentalStartDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase">Return</span>
                          <span className="text-xs">{new Date(o.scheduledReturnDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getFulfillmentIcon(o.fulfillmentType)}
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {o.fulfillmentType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Collect In-Store'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-200">
                        ₹{Number(o.totalAmount).toLocaleString()}
                        <span className="block text-[10px] text-slate-500 font-normal">incl. tax & deposit</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="PROCESSING">Processing</option>
                          <option value="RENTED">Rented</option>
                          <option value="OVERDUE">Overdue</option>
                          <option value="RETURNED">Returned</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* KANBAN VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
              {kanbanColumns.map((colStatus) => {
                const colOrders = filteredOrders.filter(o => o.status === colStatus);
                return (
                  <div key={colStatus} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3 min-h-[450px]">
                    {/* Column Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          colStatus === 'PROCESSING' ? 'bg-blue-500' :
                          colStatus === 'RENTED' ? 'bg-emerald-500' :
                          colStatus === 'OVERDUE' ? 'bg-rose-500' :
                          colStatus === 'RETURNED' ? 'bg-slate-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{colStatus}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">{colOrders.length}</span>
                    </div>

                    {/* Column Cards */}
                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px]">
                      {colOrders.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-600 border border-dashed border-slate-800 rounded-lg">
                          No {colStatus.toLowerCase()} orders
                        </div>
                      ) : (
                        colOrders.map(o => (
                          <div key={o.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700/80 hover:shadow-lg transition-all space-y-3 group relative">
                            {/* Card Header */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white block group-hover:text-primary transition-colors">{o.orderNumber}</span>
                              <div className="flex items-center space-x-1.5">
                                {getFulfillmentIcon(o.fulfillmentType)}
                              </div>
                            </div>

                            {/* Client & Price */}
                            <div>
                              <span className="block text-xs font-semibold text-slate-300 truncate">
                                {o.client?.firstName} {o.client?.lastName}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">{o.client?.email}</span>
                            </div>

                            {/* Dates */}
                            <div className="text-[10px] text-slate-400 border-t border-slate-900 pt-2 flex items-center justify-between">
                              <span>{new Date(o.rentalStartDate).toLocaleDateString()}</span>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                              <span>{new Date(o.scheduledReturnDate).toLocaleDateString()}</span>
                            </div>

                            {/* Price and dropdown */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                              <span className="text-xs font-bold text-slate-200">₹{Number(o.totalAmount).toLocaleString()}</span>
                              
                              {/* Quick Move Selector */}
                              <div className="flex items-center space-x-1">
                                <ArrowRightLeft className="h-3 w-3 text-slate-500" />
                                <select
                                  value={o.status}
                                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                  className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer focus:border-primary"
                                >
                                  <option value="PROCESSING">Processing</option>
                                  <option value="RENTED">Rented</option>
                                  <option value="OVERDUE">Overdue</option>
                                  <option value="RETURNED">Returned</option>
                                  <option value="CANCELLED">Cancelled</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
