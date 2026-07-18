import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

export default function DeliveryLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('Please provide phone number and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/auth/delivery/login', {
        phone: phone.trim(),
        password: password.trim(),
      });

      const { accessToken, deliveryPartner } = response;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify({ ...deliveryPartner, role: 'DELIVERY' }));
        navigate('/delivery/dashboard');
      } else {
        setError('Login failed. Invalid token received.');
      }
    } catch (err) {
      console.error('Delivery Login error:', err);
      setError(err.response?.data?.message || 'Invalid phone number or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setPhone('9876543210');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4 font-sans text-text-main">
      <div className="w-full max-w-md bg-bg-card border border-border-main rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-primary/10 border border-primary/20 rounded-2xl text-primary mb-2">
            <Truck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-text-main">Courier Field App</h1>
          <p className="text-xs text-text-muted">Sign in with your registered mobile phone number to access assigned dispatches.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-550 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px] tracking-wider">Mobile Number</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-bg-main border border-border-main text-text-main rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold"
              />
              <Phone className="h-4 w-4 text-text-muted absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-text-muted mb-1.5 uppercase font-bold text-[10px] tracking-wider">Access PIN / Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-main border border-border-main text-text-main rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold"
              />
              <Lock className="h-4 w-4 text-text-muted absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/25"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dispatches'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="border-t border-border-main pt-4 flex flex-col items-center space-y-3">
          <button
            onClick={fillDemoCredentials}
            className="text-[11px] text-primary hover:underline font-bold flex items-center space-x-1"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Use Default Courier Demo Login (9876543210 / password123)</span>
          </button>
          <span className="text-[10px] text-text-muted">Onboarded by Vendor Admin</span>
        </div>
      </div>
    </div>
  );
}
