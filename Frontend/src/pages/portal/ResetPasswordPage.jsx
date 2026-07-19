import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, RefreshCw } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password/request', { email });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-700">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xl shadow-slate-200/50">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200/50">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Reset Password</h1>
          <p className="text-xs text-slate-450">We will send recovery links to access your workspace.</p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 rounded-xl text-xs font-bold">
              Check your inbox for a recovery link!
            </div>
            <Link to="/login" className="inline-block text-xs font-bold text-blue-600 hover:underline">
              Back to login screen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">Registered Email</label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-805 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Sending email...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
