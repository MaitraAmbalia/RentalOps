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
      case 'OPEN': return 'bg-rose-500/20 text-rose-500 border border-rose-500/30';
      case 'IN_PROGRESS': return 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30';
      case 'RESOLVED': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30';
      default: return 'bg-bg-main text-text-muted border border-border-main';
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
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-text-main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-main flex items-center space-x-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <span>Support Tickets & Dispute Resolution</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">Review disputes regarding missing parts or damaged goods.</p>
        </div>

        <button
          onClick={fetchQueries}
          className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl hover:bg-bg-main transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-bg-card p-5 rounded-2xl border border-border-main flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex space-x-2 bg-bg-main p-1 rounded-xl">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === st ? 'bg-bg-card text-text-main border border-border-main shadow-sm' : 'text-text-muted hover:text-text-main'
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
          className="bg-bg-main border border-border-main text-text-main text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      <div className="space-y-4">
        {filteredQueries.map(q => (
          <div key={q.id} className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-bold ${
                  q.queryType === 'DAMAGED_GOOD' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{getQueryTypeLabel(q.queryType)}</span>
                </span>
                
                <span className="text-text-muted text-xs font-mono">
                  Ticket: #{q.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-between sm:justify-start">
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${getStatusBadge(q.status)}`}>
                  {q.status}
                </span>
                <span className="text-[10px] text-text-muted">
                  {new Date(q.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm py-2">
              <div className="md:col-span-2 space-y-2">
                <span className="text-xs text-text-muted uppercase font-bold block">Incident Report Description</span>
                <p className="text-text-main bg-bg-main/60 p-4 rounded-xl border border-border-main text-sm leading-relaxed">
                  "{q.description}"
                </p>
              </div>

              <div className="bg-bg-main/30 p-4 rounded-xl border border-border-main/50 space-y-2.5 text-xs text-text-muted self-stretch md:self-auto">
                <span className="text-xs text-text-muted uppercase font-bold block mb-1">Customer / Order Reference</span>
                <p><span className="font-semibold text-text-muted">Customer Name:</span> <span className="text-text-main">{q.clientName}</span></p>
                <p><span className="font-semibold text-text-muted">Contact Email:</span> <span className="text-text-main">{q.clientEmail}</span></p>
                <p><span className="font-semibold text-text-muted">Order Reference:</span> <span className="text-text-main">#{q.orderNumber || q.orderId.slice(0, 8)}</span></p>
              </div>
            </div>

            {q.status !== 'RESOLVED' && (
              <div className="border-t border-border-main pt-4 flex flex-wrap items-center justify-end gap-2 text-xs">
                {q.status === 'OPEN' && (
                  <button
                    onClick={() => handleStatusChange(q.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 bg-bg-main hover:bg-bg-card text-text-main border border-border-main rounded-lg transition-colors"
                  >
                    Mark In Progress
                  </button>
                )}

                <button
                  onClick={() => handleResolve(q.id)}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow"
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
