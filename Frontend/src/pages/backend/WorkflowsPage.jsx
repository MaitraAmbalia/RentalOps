import { useState, useEffect } from 'react';
import { 
  Plus, User, Search, RefreshCw, X
} from 'lucide-react';
import { workflowService } from '../../api/workflowService';
import { deliveryPartnerService } from '../../api/deliveryPartnerService';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: ''
  });
  const [onboardLoading, setOnboardLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [wfs, dps] = await Promise.all([
        workflowService.getWorkflows(),
        deliveryPartnerService.getDeliveryPartners()
      ]);
      setWorkflows(Array.isArray(wfs) ? wfs : []);
      setPartners(Array.isArray(dps) ? dps : []);
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
      setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, deliveryId: partnerId, deliveryPartnerName: partnerName } : w));
      alert('Delivery partner assigned successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to assign partner.');
    }
  };

  const handleOnboardPartner = async (e) => {
    e.preventDefault();
    if (!partnerForm.firstName || !partnerForm.lastName || !partnerForm.phone) {
      alert('Please fill out all required fields.');
      return;
    }
    setOnboardLoading(true);
    try {
      const newDp = await deliveryPartnerService.createDeliveryPartner({
        ...partnerForm,
        passwordHash: 'seeded'
      });
      setPartners(prev => [...prev, newDp]);
      setPartnerForm({ firstName: '', lastName: '', phone: '', companyName: '' });
      setOnboardOpen(false);
      alert('Delivery partner onboarded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to onboard partner.');
    } finally {
      setOnboardLoading(false);
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
      const numMatch = wf.orderNumber?.toLowerCase().includes(q) || wf.id?.toLowerCase().includes(q);
      const nameMatch = wf.deliveryPartnerName?.toLowerCase().includes(q);
      if (!numMatch && !nameMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Fulfillment & Workflow Scheduling</h1>
          <p className="text-sm text-slate-400 mt-1">Assign deliveries, inspect return checklists, and track partners.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setOnboardOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard Courier Partner</span>
          </button>
          
          <button
            onClick={fetchData}
            className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-450 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {onboardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-lg font-bold text-white">Onboard Delivery Courier</span>
              <button onClick={() => setOnboardOpen(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleOnboardPartner} className="space-y-4 text-xs text-slate-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">First Name</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.firstName}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-855 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Last Name</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.lastName}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-slate-955 border border-slate-855 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-955 border border-slate-855 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 uppercase font-bold text-[10px]">Courier Agency</label>
                <input
                  type="text"
                  placeholder="DHL, FedEx, Self-Employed"
                  value={partnerForm.companyName}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full bg-slate-955 border border-slate-855 rounded-lg p-2 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={onboardLoading}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm"
              >
                Onboard Fleet Partner
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex space-x-2 bg-slate-900 p-1 rounded-xl">
          <button onClick={() => setTypeFilter('ALL')} className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${typeFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>All Tasks</button>
          <button onClick={() => setTypeFilter('PICKUP')} className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${typeFilter === 'PICKUP' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Pickups</button>
          <button onClick={() => setTypeFilter('RETURN')} className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${typeFilter === 'RETURN' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Returns</button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search schedule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-2 focus:outline-none"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-905 text-slate-200 text-xs border border-slate-800 rounded-xl px-4 py-2 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="LATE">Late Task</option>
            <option value="MISSED">Missed Task</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredWorkflows.map(wf => (
          <div key={wf.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    wf.workflowType === 'PICKUP' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {wf.workflowType} FULFILLMENT
                  </span>
                  <span className="block font-bold text-white text-base">
                    Order Ref: #{wf.orderNumber || wf.orderId.slice(0, 8)}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${getStatusBadge(wf.workflowStatus)}`}>
                  {wf.workflowStatus}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p><span className="font-semibold text-slate-500">Scheduled Date:</span> {new Date(wf.scheduledDate).toLocaleString()}</p>
                {wf.conditionInspectionNotes && <p><span className="font-semibold text-slate-500">Inspection Note:</span> {wf.conditionInspectionNotes}</p>}
                {wf.damageDescription && <p><span className="font-semibold text-slate-500 text-rose-400">Damage Details:</span> {wf.damageDescription}</p>}
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-slate-300 font-semibold">
                  {wf.deliveryPartnerName ? `Assigned: ${wf.deliveryPartnerName}` : 'Unassigned Courier'}
                </span>
              </div>

              {wf.workflowStatus !== 'COMPLETED' && (
                <select
                  value={wf.deliveryId || ''}
                  onChange={(e) => handleAssignPartner(wf.id, e.target.value)}
                  className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-3 py-1.5 cursor-pointer"
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
    </div>
  );
}
