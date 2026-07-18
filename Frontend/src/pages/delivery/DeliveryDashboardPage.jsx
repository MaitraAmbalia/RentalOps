import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Calendar, Truck, ArrowRight, RefreshCw, ClipboardCheck
} from 'lucide-react';
import { workflowService } from '../../api/workflowService';

export default function DeliveryDashboardPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('Failed to fetch courier schedules.');
    } finally {
      setLoading(false);
    }
  };

  const activeTasks = tasks.filter(t => t.workflowStatus === 'SCHEDULED' || t.workflowStatus === 'LATE');
  const pastTasks = tasks.filter(t => t.workflowStatus === 'COMPLETED' || t.workflowStatus === 'MISSED');

  return (
    <div className="space-y-6 text-xs text-slate-400 font-sans">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Courier Worklist</h1>
          <p className="text-slate-500 mt-1">Select assigned dispatches to execute verification checklists.</p>
        </div>
        <button
          onClick={fetchTasks}
          className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-850 rounded-xl hover:bg-slate-900 transition-colors"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-455 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="font-extrabold text-white text-xs block uppercase tracking-wider">Active Tasks ({activeTasks.length})</span>
            {activeTasks.length === 0 ? (
              <p className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-slate-550 text-center">No pending pick-up/return dispatches assigned to you.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeTasks.map(t => (
                  <div key={t.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                          t.workflowType === 'PICKUP' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {t.workflowType}
                        </span>
                        <span className="block font-bold text-white text-sm mt-1">Order Ref: #{t.orderNumber || t.orderId.slice(0, 8)}</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        {t.workflowStatus}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-3">
                      <span>Schedule: {new Date(t.scheduledDate).toLocaleString()}</span>
                      
                      <button
                        onClick={() => navigate(`/delivery/tasks/${t.id}`)}
                        className="px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold transition-all flex items-center space-x-1"
                      >
                        <span>Start Checklist</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <span className="font-extrabold text-white text-xs block uppercase tracking-wider">Completed Tasks ({pastTasks.length})</span>
            {pastTasks.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {pastTasks.map(t => (
                  <div key={t.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850/50 flex justify-between items-center text-[10px] text-slate-500">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-300 block">Order Ref: #{t.orderNumber || t.orderId.slice(0, 8)}</span>
                      <span>Completed: {new Date(t.updatedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      {t.workflowStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
