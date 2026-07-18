import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Calendar, Truck, ArrowRight, RefreshCw, 
  CheckCircle2, Clock, MapPin, Phone, User, Search,
  AlertTriangle, ShieldCheck, ToggleLeft, ToggleRight
} from 'lucide-react';
import { workflowService } from '../../api/workflowService';
import { deliveryPartnerService } from '../../api/deliveryPartnerService';

export default function DeliveryDashboardPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PICKUP, RETURN, COMPLETED
  const [agentStatus, setAgentStatus] = useState('AVAILABLE');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await workflowService.getWorkflows();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assigned courier dispatches.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const userStr = localStorage.getItem('user');
    const userObj = userStr ? JSON.parse(userStr) : null;
    if (!userObj?.id) return;

    setStatusUpdating(true);
    const newStatus = agentStatus === 'AVAILABLE' ? 'OUT_ON_DELIVERY' : 'AVAILABLE';
    try {
      await deliveryPartnerService.updateDeliveryPartnerStatus(userObj.id, newStatus);
      setAgentStatus(newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Metrics
  const activeTasks = tasks.filter(t => t.workflowStatus === 'SCHEDULED' || t.workflowStatus === 'LATE');
  const pickupCount = activeTasks.filter(t => t.workflowType === 'PICKUP').length;
  const returnCount = activeTasks.filter(t => t.workflowType === 'RETURN').length;
  const completedCount = tasks.filter(t => t.workflowStatus === 'COMPLETED').length;

  // Filtered Tasks
  const filteredTasks = tasks.filter(t => {
    const matchesTab = 
      activeTab === 'ALL' ? (t.workflowStatus === 'SCHEDULED' || t.workflowStatus === 'LATE') :
      activeTab === 'PICKUP' ? (t.workflowType === 'PICKUP' && (t.workflowStatus === 'SCHEDULED' || t.workflowStatus === 'LATE')) :
      activeTab === 'RETURN' ? (t.workflowType === 'RETURN' && (t.workflowStatus === 'SCHEDULED' || t.workflowStatus === 'LATE')) :
      activeTab === 'COMPLETED' ? (t.workflowStatus === 'COMPLETED') : true;

    const queryStr = searchQuery.toLowerCase();
    const orderNo = (t.orderNumber || t.orderId || '').toString().toLowerCase();
    const clientName = t.order?.client ? `${t.order.client.firstName} ${t.order.client.lastName}`.toLowerCase() : '';
    const matchesSearch = !searchQuery || orderNo.includes(queryStr) || clientName.includes(queryStr);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 text-xs text-text-muted font-sans pb-12">
      
      {/* Header Banner */}
      <div className="bg-bg-card p-5 rounded-2xl border border-border-main shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-primary/10 text-primary rounded-lg">
              <Truck className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-black text-text-main">Courier Field Console</h1>
          </div>
          <p className="text-text-muted mt-1">Real-time task dispatching, verification checklists, & logistics synchronization.</p>
        </div>

        {/* Status Toggle & Refresh */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleStatus}
            disabled={statusUpdating}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 border transition-all ${
              agentStatus === 'AVAILABLE'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${agentStatus === 'AVAILABLE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{agentStatus === 'AVAILABLE' ? 'Available for Dispatch' : 'Out on Delivery'}</span>
          </button>

          <button
            onClick={fetchTasks}
            title="Refresh Tasks"
            className="p-2.5 text-text-muted hover:text-text-main bg-bg-main border border-border-main rounded-xl hover:bg-bg-card transition-colors"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-bg-card p-4 rounded-xl border border-border-main space-y-1">
          <div className="flex justify-between items-center text-text-muted">
            <span className="font-extrabold uppercase text-[10px] tracking-wider">Active Tasks</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-text-main">{activeTasks.length}</div>
          <span className="text-[10px] text-text-muted">Pending execution</span>
        </div>

        <div className="bg-bg-card p-4 rounded-xl border border-border-main space-y-1">
          <div className="flex justify-between items-center text-text-muted">
            <span className="font-extrabold uppercase text-[10px] tracking-wider">Pickups</span>
            <Package className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{pickupCount}</div>
          <span className="text-[10px] text-text-muted">Customer deliveries</span>
        </div>

        <div className="bg-bg-card p-4 rounded-xl border border-border-main space-y-1">
          <div className="flex justify-between items-center text-text-muted">
            <span className="font-extrabold uppercase text-[10px] tracking-wider">Returns</span>
            <RefreshCw className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{returnCount}</div>
          <span className="text-[10px] text-text-muted">Item pick-ups</span>
        </div>

        <div className="bg-bg-card p-4 rounded-xl border border-border-main space-y-1">
          <div className="flex justify-between items-center text-text-muted">
            <span className="font-extrabold uppercase text-[10px] tracking-wider">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{completedCount}</div>
          <span className="text-[10px] text-text-muted">Handover verified</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-bg-card p-2 rounded-xl border border-border-main">
        <div className="flex items-center space-x-1 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: `Active (${activeTasks.length})` },
            { id: 'PICKUP', label: `Pickups (${pickupCount})` },
            { id: 'RETURN', label: `Returns (${returnCount})` },
            { id: 'COMPLETED', label: `Completed (${completedCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all text-xs whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-text-muted hover:text-text-main hover:bg-bg-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search order ref or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-main border border-border-main rounded-lg pl-9 pr-3 py-2 text-xs text-text-main outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Task List */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="h-7 w-7 animate-spin mx-auto text-primary" />
          <p className="text-text-muted font-bold">Fetching latest task dispatches...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 bg-bg-card rounded-2xl border border-border-main text-center space-y-3">
          <ShieldCheck className="h-10 w-10 text-text-muted mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-text-main">No Dispatches Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">There are no active fulfillment tasks matching your current filter selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map(t => {
            const client = t.order?.client;
            const clientName = client ? `${client.firstName} ${client.lastName}` : 'Customer';

            return (
              <div 
                key={t.id} 
                className="bg-bg-card p-5 rounded-2xl border border-border-main hover:border-primary/40 transition-all shadow-md flex flex-col space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        t.workflowType === 'PICKUP' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {t.workflowType === 'PICKUP' ? '📦 Delivery Pickup' : '🔄 Rental Return'}
                      </span>

                      <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                        t.workflowStatus === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        t.workflowStatus === 'LATE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {t.workflowStatus}
                      </span>
                    </div>

                    <h3 className="font-black text-text-main text-base mt-2">Order Ref: #{t.orderNumber || (t.orderId ? t.orderId.slice(0, 8) : 'N/A')}</h3>
                  </div>

                  <div className="text-right text-text-muted text-[11px]">
                    <div className="flex items-center space-x-1 justify-end">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{new Date(t.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[10px] font-bold text-text-main">{new Date(t.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Customer info preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-bg-main p-3 rounded-xl border border-border-main text-[11px]">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <span className="text-text-muted block text-[9px] uppercase font-bold">Customer</span>
                      <span className="font-bold text-text-main">{clientName}</span>
                    </div>
                  </div>

                  {client?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-text-muted block text-[9px] uppercase font-bold">Contact</span>
                        <a href={`tel:${client.phone}`} className="font-bold text-emerald-400 hover:underline">{client.phone}</a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-border-main/50">
                  <span className="text-text-muted text-[10px]">
                    {t.order?.items ? `${t.order.items.length} item(s) to verify` : 'Verification checklist required'}
                  </span>

                  <button
                    onClick={() => navigate(`/delivery/tasks/${t.id}`)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-md shadow-primary/20 flex items-center space-x-2"
                  >
                    <span>{t.workflowStatus === 'COMPLETED' ? 'View Checklist' : 'Start Inspection'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
