import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Camera, Edit3, ClipboardCheck, AlertTriangle
} from 'lucide-react';
import { workflowService } from '../../api/workflowService';
import { useToast } from '../../context/ToastContext';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError, warning } = useToast();

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

      if (data.checklist) {
        setGoodsChecked(!!data.checklist.goodsChecked);
        setAccessoriesVerified(!!data.checklist.accessoriesVerified);
        setPhotoUploaded(!!data.checklist.photoUploaded);
        setSignatureDone(!!data.checklist.signatureDone);
      } else if (data.workflowStatus === 'COMPLETED') {
        setGoodsChecked(true);
        setAccessoriesVerified(true);
        setPhotoUploaded(true);
        setSignatureDone(true);
      }

      if (data.conditionInspectionNotes) setInspectionNote(data.conditionInspectionNotes);
      if (data.damageReported) setIsDamaged(true);
      if (data.damageDescription) setDamageNotes(data.damageDescription);
    } catch (err) {
      console.error(err);
      setError('Task details could not be parsed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!goodsChecked || !accessoriesVerified || !signatureDone) {
      warning('Please complete all safety verification checkboxes first.');
      return;
    }
    try {
      await workflowService.updateWorkflowStatus(id, 'COMPLETED', {
        checklist: {
          goodsChecked,
          accessoriesVerified,
          photoUploaded,
          signatureDone
        },
        conditionInspectionNotes: inspectionNote,
        damageReported: isDamaged,
        damageDescription: isDamaged ? damageNotes : undefined
      });
      success('Dispatch checklist verified and task marked Completed!');
      navigate('/delivery/dashboard');
    } catch (err) {
      console.error(err);
      toastError('Failed to update task.');
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
        <button onClick={() => navigate('/delivery/dashboard')} className="text-primary hover:underline">Back to dashboard</button>
      </div>
    );
  }

  const isCompleted = task.workflowStatus === 'COMPLETED';

  return (
    <div className="space-y-6 text-xs text-text-muted font-sans pb-10">
      
      <button 
        onClick={() => navigate('/delivery/dashboard')}
        className="flex items-center text-text-muted hover:text-text-main uppercase font-bold tracking-wider"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        <span>Back to Worklist</span>
      </button>

      <div className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-4 shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
              task.workflowType === 'PICKUP' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {task.workflowType} TASK
            </span>
            <h1 className="text-lg font-black text-text-main mt-1">Order Ref: #{task.orderNumber || (task.orderId ? task.orderId.slice(0, 8) : 'N/A')}</h1>
          </div>

          {isCompleted && (
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-extrabold flex items-center space-x-1.5">
              <CheckCircle className="h-4 w-4" />
              <span>COMPLETED</span>
            </span>
          )}
        </div>

        <div className="space-y-1.5 border-t border-border-main pt-3 text-text-muted">
          <p><span className="font-semibold text-text-main">Scheduled Date:</span> {new Date(task.scheduledDate).toLocaleString()}</p>
          <p><span className="font-semibold text-text-main">Task Status:</span> <strong className="text-text-main">{task.workflowStatus}</strong></p>
        </div>
      </div>

      <div className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-4 shadow-md">
        <h2 className="text-sm font-extrabold text-text-main flex items-center space-x-1.5 uppercase tracking-wider">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <span>Fulfillment Inspection Checklist</span>
        </h2>

        <div className="space-y-3">
          <label className={`flex items-center space-x-3 bg-bg-main p-3 rounded-xl border border-border-main ${isCompleted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
            <input 
              type="checkbox" 
              disabled={isCompleted}
              checked={goodsChecked}
              onChange={(e) => setGoodsChecked(e.target.checked)}
              className="rounded bg-bg-card border-border-main text-primary w-4.5 h-4.5"
            />
            <div>
              <span className="font-bold text-text-main block">Product Condition Checked</span>
              <span className="text-[10px] text-text-muted">Ensure the equipment has no surface structural damage.</span>
            </div>
          </label>

          <label className={`flex items-center space-x-3 bg-bg-main p-3 rounded-xl border border-border-main ${isCompleted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
            <input 
              type="checkbox" 
              disabled={isCompleted}
              checked={accessoriesVerified}
              onChange={(e) => setAccessoriesVerified(e.target.checked)}
              className="rounded bg-bg-card border-border-main text-primary w-4.5 h-4.5"
            />
            <div>
              <span className="font-bold text-text-main block">Accessories Verified</span>
              <span className="text-[10px] text-text-muted">Ensure all adapters, cords, and documentation booklets are enclosed.</span>
            </div>
          </label>

          <label className={`flex items-center space-x-3 bg-bg-main p-3 rounded-xl border border-border-main ${isCompleted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
            <input 
              type="checkbox" 
              disabled={isCompleted}
              checked={photoUploaded}
              onChange={(e) => setPhotoUploaded(e.target.checked)}
              className="rounded bg-bg-card border-border-main text-primary w-4.5 h-4.5"
            />
            <div className="flex-1 flex justify-between items-center">
              <div>
                <span className="font-bold text-text-main block">Upload Inspection Photo (Optional)</span>
                <span className="text-[10px] text-text-muted">Capture visual evidence of product state during transfer.</span>
              </div>
              <Camera className="h-5 w-5 text-text-muted" />
            </div>
          </label>

          <label className={`flex items-center space-x-3 bg-bg-main p-3 rounded-xl border border-border-main ${isCompleted ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}>
            <input 
              type="checkbox" 
              disabled={isCompleted}
              checked={signatureDone}
              onChange={(e) => setSignatureDone(e.target.checked)}
              className="rounded bg-bg-card border-border-main text-primary w-4.5 h-4.5"
            />
            <div className="flex-1 flex justify-between items-center">
              <div>
                <span className="font-bold text-text-main block">Digital Hand-off Signature</span>
                <span className="text-[10px] text-text-muted">Sign to authenticate equipment handover verification.</span>
              </div>
              <Edit3 className="h-5 w-5 text-text-muted" />
            </div>
          </label>
        </div>
      </div>

      <div className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-4 shadow-md">
        <h2 className="text-sm font-extrabold text-text-main">Inspection Notes</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-text-muted mb-1.5">General Notes</label>
            <input
              type="text"
              disabled={isCompleted}
              value={inspectionNote}
              onChange={(e) => setInspectionNote(e.target.value)}
              placeholder="e.g. Returned with original package..."
              className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none disabled:opacity-75"
            />
          </div>

          <div className="flex items-center space-x-3 bg-bg-main p-4 rounded-xl border border-border-main">
            <button
              type="button"
              disabled={isCompleted}
              onClick={() => setIsDamaged(!isDamaged)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                isDamaged ? 'bg-rose-600' : 'bg-bg-card border border-border-main'
              } ${isCompleted ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              <div className={`bg-white w-4.5 h-4.5 rounded-full shadow transform transition-all ${
                isDamaged ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <div>
              <span className="font-bold text-text-main block">Report damage found</span>
              <span className="text-[10px] text-text-muted">If checked, penalty calculations will trigger on next steps.</span>
            </div>
          </div>

          {isDamaged && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-rose-500 mb-1.5">Deduction Damage Details</label>
              <textarea
                rows="3"
                disabled={isCompleted}
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                placeholder="Explain specific broken parts or cosmetic scratches..."
                className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none disabled:opacity-75"
              />
            </div>
          )}
        </div>
      </div>

      {isCompleted ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-extrabold text-center flex items-center justify-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Fulfillment Inspection Verified & Submitted</span>
        </div>
      ) : (
        <button
          onClick={handleCompleteTask}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
        >
          Finalize handover & Settle Task
        </button>
      )}

    </div>
  );
}
