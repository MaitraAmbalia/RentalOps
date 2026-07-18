import { useState, useEffect } from 'react';
import { 
  Plus, User, Search, RefreshCw, X, Shield, Phone
} from 'lucide-react';
import { deliveryPartnerService } from '../../api/deliveryPartnerService';

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await deliveryPartnerService.getDeliveryPartners();
      setPartners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch delivery courier partners.');
    } finally {
      setLoading(false);
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
      alert('Failed to onboard courier.');
    } finally {
      setOnboardLoading(false);
    }
  };

  const filteredPartners = partners.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
      const companyMatch = p.companyName?.toLowerCase().includes(q);
      if (!nameMatch && !companyMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-text-main text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-5 text-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-text-main">Delivery Courier Registry</h1>
          <p className="text-xs text-text-muted mt-1">Manage external dispatch agencies and contract fleet drivers.</p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setOnboardOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all flex items-center space-x-2 font-bold shadow-lg shadow-primary/20 text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard Courier Partner</span>
          </button>
          
          <button
            onClick={fetchPartners}
            className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl hover:bg-bg-main transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {onboardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-main rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-border-main pb-3 text-sm">
              <span className="text-lg font-bold text-text-main">Onboard Delivery Courier</span>
              <button onClick={() => setOnboardOpen(false)} className="text-text-muted hover:text-text-main"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleOnboardPartner} className="space-y-4 text-text-muted">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">First Name</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.firstName}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-lg p-2 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Last Name</label>
                  <input
                    type="text"
                    required
                    value={partnerForm.lastName}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-lg p-2 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-bg-main border border-border-main rounded-lg p-2 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px]">Courier Agency</label>
                <input
                  type="text"
                  placeholder="DHL, FedEx, Self-Employed"
                  value={partnerForm.companyName}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full bg-bg-main border border-border-main rounded-lg p-2 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={onboardLoading}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs transition-all shadow"
              >
                Onboard Fleet Partner
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-bg-card p-5 rounded-2xl border border-border-main flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-main border border-border-main text-text-main placeholder-text-muted/40 text-xs rounded-xl pl-8 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <Search className="h-3.5 w-3.5 text-text-muted absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map(p => (
          <div key={p.id} className="bg-bg-card p-5 rounded-2xl border border-border-main flex items-start gap-4 shadow-sm hover:border-text-muted/30 transition-all">
            <div className="p-3 bg-bg-main border border-border-main rounded-xl text-text-muted">
              <User className="h-6 w-6" />
            </div>
            
            <div className="space-y-1.5 min-w-0 flex-1">
              <span className="font-extrabold text-text-main text-sm block leading-tight">{p.firstName} {p.lastName}</span>
              <p className="text-text-muted font-bold uppercase text-[9px] tracking-wider">{p.companyName || 'Freelance Agent'}</p>
              
              <div className="flex items-center space-x-1.5 text-text-muted pt-1">
                <Phone className="h-3.5 w-3.5" />
                <span>{p.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
