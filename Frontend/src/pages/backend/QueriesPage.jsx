import { useState, useEffect } from 'react';
import { 
  HelpCircle, Search, RefreshCw, AlertTriangle, ClipboardCheck
} from 'lucide-react';
import { queryService } from '../../api/queryService';

export default function QueriesPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await queryService.getQueries();
      setQueries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch support query tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    if (!confirm('Are you sure you want to mark this support ticket as resolved?')) return;
    try {
      await queryService.resolveQuery(id, 'RESOLVED');
      setQueries(prev => prev.map(q => q.id === id ? { ...q, status: 'RESOLVED' } : q));
      alert('Support query resolved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to resolve support ticket.');
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await queryService.resolveQuery(id, nextStatus);
      setQueries(prev => prev.map(q => q.id === id ? { ...q, status: nextStatus } : q));
    } catch (err) {
      console.error(err);
      alert('Failed to update ticket status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'IN_PROGRESS': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'RESOLVED': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const getQueryTypeLabel = (type) => {
    switch (type) {
      case 'PRODUCT_MISSING': return 'Missing Accessories';
      case 'DAMAGED_GOOD': return 'Damaged Products';
      default: return 'Other Inquiry';
    }
  };

  const filteredQueries = queries.filter(q => {
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      const numMatch = q.orderNumber?.toLowerCase().includes(s) || q.id?.toLowerCase().includes(s);
      const nameMatch = q.clientName?.toLowerCase().includes(s) || q.clientEmail?.toLowerCase().includes(s);
      if (!numMatch && !nameMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <span>Support Tickets & Dispute Resolution</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review disputes regarding missing parts or damaged goods.</p>
        </div>

        <button
          onClick={fetchQueries}
          className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-450 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex space-x-2 bg-slate-900 p-1 rounded-xl">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === st ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Tickets' : st}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-2 focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        {filteredQueries.map(q => (
          <div key={q.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-bold ${
                  q.queryType === 'DAMAGED_GOOD' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{getQueryTypeLabel(q.queryType)}</span>
                </span>
                
                <span className="text-slate-500 text-xs font-mono">
                  Ticket: #{q.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-between sm:justify-start">
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${getStatusBadge(q.status)}`}>
                  {q.status}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(q.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm py-2">
              <div className="md:col-span-2 space-y-2">
                <span className="text-xs text-slate-500 uppercase font-bold block">Incident Report Description</span>
                <p className="text-slate-200 bg-slate-900/60 p-4 rounded-xl border border-slate-850 text-sm leading-relaxed">
                  "{q.description}"
                </p>
              </div>

              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 space-y-2.5 text-xs text-slate-400 self-stretch md:self-auto">
                <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Customer / Order Reference</span>
                <p><span className="font-semibold text-slate-300">Customer Name:</span> {q.clientName}</p>
                <p><span className="font-semibold text-slate-300">Contact Email:</span> {q.clientEmail}</p>
                <p><span className="font-semibold text-slate-300">Order Reference:</span> #{q.orderNumber || q.orderId.slice(0, 8)}</p>
              </div>
            </div>

            {q.status !== 'RESOLVED' && (
              <div className="border-t border-slate-900 pt-4 flex flex-wrap items-center justify-end gap-2 text-xs">
                {q.status === 'OPEN' && (
                  <button
                    onClick={() => handleStatusChange(q.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-855 text-slate-300 border border-slate-800 rounded-lg transition-colors"
                  >
                    Mark In Progress
                  </button>
                )}

                <button
                  onClick={() => handleResolve(q.id)}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  <span>Mark Resolved & Close Ticket</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
