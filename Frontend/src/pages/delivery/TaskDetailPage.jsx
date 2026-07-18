import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Camera, Edit3, ClipboardCheck, AlertTriangle
} from 'lucide-react';
import { workflowService } from '../../api/workflowService';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Checklist verification states
  const [goodsChecked, setGoodsChecked] = useState(false);
  const [accessoriesVerified, setAccessoriesVerified] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);
  
  const [inspectionNote, setInspectionNote] = useState('');
  const [isDamaged, setIsDamaged] = useState(false);
  const [damageNotes, setDamageNotes] = useState('');

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await workflowService.getWorkflowById(id);
      setTask(data);
      if (data.conditionInspectionNotes) setInspectionNote(data.conditionInspectionNotes);
    } catch (err) {
      console.error(err);
      setError('Task details could not be parsed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!goodsChecked || !accessoriesVerified || !signatureDone) {
      alert('Please complete all safety verification checkboxes first.');
      return;
    }
    try {
      await workflowService.updateWorkflowStatus(id, 'COMPLETED', {
        conditionInspectionNotes: inspectionNote,
        damageDescription: isDamaged ? damageNotes : undefined
      });
      alert('Dispatch checklist verified and task marked Completed!');
      navigate('/delivery/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to update task.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-20 text-slate-500 font-bold space-y-4">
        <p>{error || 'Task not found.'}</p>
        <button onClick={() => navigate('/delivery/dashboard')} className="text-blue-600 hover:underline">Back to dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-slate-400 font-sans">
      
      <button 
        onClick={() => navigate('/delivery/dashboard')}
        className="flex items-center text-slate-500 hover:text-white uppercase font-bold tracking-wider"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        <span>Back to Worklist</span>
      </button>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
            task.workflowType === 'PICKUP' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {task.workflowType} TASK
          </span>
          <h1 className="text-lg font-black text-white mt-1">Order Ref: #{task.orderNumber || task.orderId.slice(0, 8)}</h1>
        </div>

        <div className="space-y-1.5 border-t border-slate-900 pt-3 text-slate-455">
          <p><span className="font-semibold text-slate-400">Scheduled Date:</span> {new Date(task.scheduledDate).toLocaleString()}</p>
          <p><span className="font-semibold text-slate-400">Task Status:</span> <strong className="text-slate-200">{task.workflowStatus}</strong></p>
        </div>
      </div>

      <div className="bg-slate-955 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-extrabold text-white flex items-center space-x-1.5 uppercase tracking-wider">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <span>Fulfillment Inspection Checklist</span>
        </h2>

        <div className="space-y-3">
          <label className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-855 cursor-pointer">
            <input 
              type="checkbox" 
              checked={goodsChecked}
              onChange={(e) => setGoodsChecked(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-primary w-4.5 h-4.5"
            />
            <div>
              <span className="font-bold text-slate-200 block">Product Condition Checked</span>
              <span className="text-[10px] text-slate-500">Ensure the equipment has no surface structural damage.</span>
            </div>
          </label>

          <label className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-855 cursor-pointer">
            <input 
              type="checkbox" 
              checked={accessoriesVerified}
              onChange={(e) => setAccessoriesVerified(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-primary w-4.5 h-4.5"
            />
            <div>
              <span className="font-bold text-slate-200 block">Accessories Verified</span>
              <span className="text-[10px] text-slate-500">Ensure all adapters, cords, and documentation booklets are enclosed.</span>
            </div>
          </label>

          <label className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-855 cursor-pointer">
            <input 
              type="checkbox" 
              checked={photoUploaded}
              onChange={(e) => setPhotoUploaded(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-primary w-4.5 h-4.5"
            />
            <div className="flex-1 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">Upload Inspection Photo (Optional)</span>
                <span className="text-[10px] text-slate-500">Capture visual evidence of product state during transfer.</span>
              </div>
              <Camera className="h-5 w-5 text-slate-500" />
            </div>
          </label>

          <label className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-855 cursor-pointer">
            <input 
              type="checkbox" 
              checked={signatureDone}
              onChange={(e) => setSignatureDone(e.target.checked)}
              className="rounded bg-slate-955 border-slate-800 text-primary w-4.5 h-4.5"
            />
            <div className="flex-1 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200 block">Digital Hand-off Signature</span>
                <span className="text-[10px] text-slate-500">Sign to authenticate equipment handover verification.</span>
              </div>
              <Edit3 className="h-5 w-5 text-slate-500" />
            </div>
          </label>
        </div>
      </div>

      <div className="bg-slate-955 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-extrabold text-white">Inspection Notes</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">General Notes</label>
            <input
              type="text"
              value={inspectionNote}
              onChange={(e) => setInspectionNote(e.target.value)}
              placeholder="e.g. Returned with original package..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/60 p-4 rounded-xl border border-slate-855">
            <button
              type="button"
              onClick={() => setIsDamaged(!isDamaged)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                isDamaged ? 'bg-rose-600' : 'bg-slate-800'
              }`}
            >
              <div className={`bg-white w-4.5 h-4.5 rounded-full shadow transform transition-all ${
                isDamaged ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <div>
              <span className="font-bold text-slate-200 block">Report damage found</span>
              <span className="text-[10px] text-slate-500">If checked, penalty calculations will trigger on next steps.</span>
            </div>
          </div>

          {isDamaged && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 text-rose-455">Deduction Damage Details</label>
              <textarea
                rows="3"
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                placeholder="Explain specific broken parts or cosmetic scratches..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleCompleteTask}
        className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
      >
        Finalize handover & Settle Task
      </button>

    </div>
  );
}
