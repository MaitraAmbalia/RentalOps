import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

export default function ResetPasswordConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');
  const email = query.get('email');
  const type = query.get('type');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token || !email || !type) {
      setError('Invalid reset link. Missing parameters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/auth/reset-password/confirm', {
        email,
        token,
        type,
        newPassword
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-700">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xl shadow-slate-200/50">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200/50">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Set New Password</h1>
          <p className="text-xs text-slate-450">Please enter a strong new password for your account.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-650 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 rounded-xl text-xs font-bold">
              Password has been successfully reset!
            </div>
            <Link to="/login" className="inline-block text-xs font-bold text-blue-600 hover:underline">
              Proceed to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-805 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-805 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-1.5 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
