import { useState, useEffect } from 'react';
import { 
  Plus, User, Search, RefreshCw, X, Calendar, CheckCircle2, AlertTriangle, Truck
} from 'lucide-react';
import { workflowService } from '../../api/workflowService';
import { deliveryPartnerService } from '../../api/deliveryPartnerService';
import { orderService } from '../../api/orderService';
import { useToast } from '../../context/ToastContext';

export default function WorkflowsPage() {
  const { success, error: toastError, warning } = useToast();
  const [workflows, setWorkflows] = useState([]);
  const [partners, setPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const [partnerForm, setPartnerForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    password: 'password123'
  });
  const [onboardLoading, setOnboardLoading] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    orderId: '',
    workflowType: 'PICKUP',
    deliveryId: '',
    scheduledDate: new Date().toISOString().slice(0, 16)
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [wfs, dps, ords] = await Promise.all([
        workflowService.getWorkflows(),
        deliveryPartnerService.getDeliveryPartners(),
        orderService.getOrders()
      ]);
      setWorkflows(Array.isArray(wfs) ? wfs : []);
      setPartners(Array.isArray(dps) ? dps : []);
      setOrders(Array.isArray(ords) ? ords : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch schedule data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPartner = async (workflowId, partnerId) => {
    const partner = partners.find(p => p.id === partnerId);
    const partnerName = partner ? `${partner.firstName} ${partner.lastName}` : '';
    try {
      await workflowService.updateWorkflowStatus(workflowId, 'SCHEDULED', {
        deliveryId: partnerId,
        deliveryPartnerName: partnerName
      });
      setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, deliveryId: partnerId, deliveryPartnerName: partnerName, deliveryPartner: partner } : w));
      success('Delivery partner assigned successfully!');
    } catch (err) {
      console.error(err);
      toastError('Failed to assign partner.');
    }
  };

  const handleOnboardPartner = async (e) => {
    e.preventDefault();
    if (!partnerForm.firstName || !partnerForm.lastName || !partnerForm.phone) {
      warning('Please fill out all required fields.');
      return;
    }
    setOnboardLoading(true);
    try {
      const newDp = await deliveryPartnerService.createDeliveryPartner(partnerForm);
      setPartners(prev => [...prev, newDp]);
      setPartnerForm({ firstName: '', lastName: '', phone: '', companyName: '', password: 'password123' });
      setOnboardOpen(false);
      success(`Delivery partner onboarded! Login Password: ${partnerForm.password}`);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to onboard partner.');
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleScheduleWorkflow = async (e) => {
    e.preventDefault();
    if (!scheduleForm.orderId) {
      warning('Please select an order to schedule.');
      return;
    }
    setScheduleLoading(true);
    try {
      const newWf = await workflowService.createWorkflow({
        orderId: scheduleForm.orderId,
        workflowType: scheduleForm.workflowType,
        deliveryId: scheduleForm.deliveryId || undefined,
        scheduledDate: scheduleForm.scheduledDate ? new Date(scheduleForm.scheduledDate).toISOString() : new Date().toISOString()
      });
      setWorkflows(prev => [newWf, ...prev]);
      setScheduleModalOpen(false);
      setScheduleForm({
        orderId: '',
        workflowType: 'PICKUP',
        deliveryId: '',
        scheduledDate: new Date().toISOString().slice(0, 16)
      });
      success('Workflow task scheduled successfully!');
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to schedule task.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'LATE': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'MISSED': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const filteredWorkflows = workflows.filter(wf => {
    if (typeFilter !== 'ALL' && wf.workflowType !== typeFilter) return false;
    if (statusFilter !== 'ALL' && wf.workflowStatus !== statusFilter) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = wf.orderNumber?.toLowerCase().includes(q) || wf.orderId?.toLowerCase().includes(q) || wf.id?.toLowerCase().includes(q);
      const nameMatch = wf.deliveryPartnerName?.toLowerCase().includes(q) || (wf.deliveryPartner && `${wf.deliveryPartner.firstName} ${wf.deliveryPartner.lastName}`.toLowerCase().includes(q));
      if (!numMatch && !nameMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-text-main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-main">Fulfillment & Logistics Scheduling</h1>
          <p className="text-sm text-text-muted mt-1">Schedule equipment pickups & returns, assign courier drivers, and verify handover checklists.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-lg shadow-primary/20"
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule Task</span>
          </button>

          <button
            onClick={() => setOnboardOpen(true)}
            className="px-4 py-2 bg-bg-card border border-border-main hover:bg-bg-main text-text-main text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span>Onboard Courier</span>
          </button>
          
          <button
            onClick={fetchData}
            className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl hover:bg-bg-main transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-550 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-main rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <span className="text-base font-bold text-text-main flex items-center space-x-2">
                <Truck className="h-5 w-5 text-primary" />
                <span>Schedule Pickup / Return Task</span>
              </span>
              <button onClick={() => setScheduleModalOpen(false)} className="text-text-muted hover:text-text-main"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleScheduleWorkflow} className="space-y-4 text-xs text-text-muted">
              <div>
                <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Select Order</label>
                <select
                  required
                  value={scheduleForm.orderId}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, orderId: e.target.value }))}
                  className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-text-main focus:outline-none focus:border-primary"
                >
                  <option value="">Choose an active order...</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      #{o.orderNumber || o.id.slice(0, 8)} - {o.client?.firstName || 'Client'} ({o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Workflow Type</label>
                  <select
                    value={scheduleForm.workflowType}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, workflowType: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-text-main focus:outline-none focus:border-primary"
                  >
                    <option value="PICKUP">PICKUP (Dispatch)</option>
                    <option value="RETURN">RETURN (Retrieval)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Scheduled Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2 text-text-main focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Assign Courier (Optional)</label>
                <select
                  value={scheduleForm.deliveryId}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, deliveryId: e.target.value }))}
                  className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-text-main focus:outline-none focus:border-primary"
                >
                  <option value="">Assign later...</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} {p.companyName ? `(${p.companyName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={scheduleLoading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
              >
                {scheduleLoading ? 'Scheduling...' : 'Create Fulfillment Task'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Onboard Modal */}
      {onboardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-main rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-border-main pb-3">
              <span className="text-base font-bold text-text-main">Onboard Courier Partner</span>
              <button onClick={() => setOnboardOpen(false)} className="text-text-muted hover:text-text-main"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleOnboardPartner} className="space-y-4 text-xs text-text-muted">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">First Name</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.firstName}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2 text-text-main"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Last Name</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.lastName}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2 text-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Phone Number (Login ID)</label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-bg-main border border-border-main rounded-xl p-2 text-text-main"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Courier Agency / Company</label>
                <input
                  type="text"
                  placeholder="FedEx, DHL, Independent Fleet"
                  value={partnerForm.companyName}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full bg-bg-main border border-border-main rounded-xl p-2 text-text-main"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Access Password / PIN</label>
                <input
                  type="password"
                  required
                  placeholder="password123"
                  value={partnerForm.password}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-bg-main border border-border-main rounded-xl p-2 text-text-main font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={onboardLoading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                {onboardLoading ? 'Registering...' : 'Onboard Courier Driver'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-bg-card p-5 rounded-2xl border border-border-main flex flex-wrap items-center justify-between gap-4 text-xs shadow-sm">
        <div className="flex space-x-2 bg-bg-main p-1 rounded-xl">
          <button onClick={() => setTypeFilter('ALL')} className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${typeFilter === 'ALL' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}>All Tasks</button>
          <button onClick={() => setTypeFilter('PICKUP')} className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${typeFilter === 'PICKUP' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}>Pickups</button>
          <button onClick={() => setTypeFilter('RETURN')} className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${typeFilter === 'RETURN' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}>Returns</button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search order or courier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-bg-main border border-border-main text-text-main text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-primary"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg-main text-text-main text-xs border border-border-main rounded-xl px-4 py-2 cursor-pointer focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="LATE">Late Task</option>
            <option value="MISSED">Missed Task</option>
          </select>
        </div>
      </div>

      {/* Task Cards */}
      {loading ? (
        <div className="py-12 text-center text-text-muted">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="py-16 text-center bg-bg-card border border-border-main rounded-2xl space-y-3">
          <p className="text-text-muted font-semibold text-sm">No pickup or return tasks match your filter criteria.</p>
          <button onClick={() => setScheduleModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs">
            Schedule First Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredWorkflows.map(wf => (
            <div key={wf.id} className="bg-bg-card p-6 rounded-2xl border border-border-main flex flex-col justify-between space-y-4 hover:border-text-muted/30 transition-all shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      wf.workflowType === 'PICKUP' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {wf.workflowType} FULFILLMENT
                    </span>
                    <span className="block font-bold text-text-main text-base">
                      Order Ref: #{wf.order?.orderNumber || wf.orderNumber || wf.orderId?.slice(0, 8)}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${getStatusBadge(wf.workflowStatus)}`}>
                    {wf.workflowStatus}
                  </span>
                </div>

                <div className="text-xs text-text-muted space-y-1">
                  <p><span className="font-semibold text-text-main">Client:</span> {wf.order?.client ? `${wf.order.client.firstName} ${wf.order.client.lastName}` : 'Customer'}</p>
                  <p><span className="font-semibold text-text-main">Scheduled Date:</span> {new Date(wf.scheduledDate).toLocaleString()}</p>
                  {wf.conditionInspectionNotes && <p><span className="font-semibold text-text-main">Inspection Note:</span> {wf.conditionInspectionNotes}</p>}
                  {wf.damageDescription && <p><span className="font-semibold text-rose-500">Damage Details:</span> {wf.damageDescription}</p>}
                </div>
              </div>

              <div className="border-t border-border-main pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-text-muted" />
                  <span className="text-text-main font-semibold">
                    {wf.deliveryPartner ? `${wf.deliveryPartner.firstName} ${wf.deliveryPartner.lastName}` : wf.deliveryPartnerName ? `Assigned: ${wf.deliveryPartnerName}` : 'Unassigned Courier'}
                  </span>
                </div>

                {wf.workflowStatus !== 'COMPLETED' && (
                  <select
                    value={wf.deliveryId || ''}
                    onChange={(e) => handleAssignPartner(wf.id, e.target.value)}
                    className="bg-bg-main text-text-main border border-border-main rounded-lg px-3 py-1.5 cursor-pointer focus:outline-none focus:border-primary text-xs font-semibold"
                  >
                    <option value="">Assign courier...</option>
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} {p.companyName ? `(${p.companyName})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
