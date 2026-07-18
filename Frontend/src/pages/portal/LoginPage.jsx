import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, User, Shield, Truck, RefreshCw } from 'lucide-react';
import { authService } from '../../api/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('CLIENT'); // 'CLIENT', 'VENDOR', 'DELIVERY'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let data;
      if (role === 'CLIENT') {
        data = await authService.clientLogin(email, password);
        if (data && data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('role', 'CLIENT');
        }
        navigate('/dashboard');
      } else if (role === 'VENDOR') {
        data = await authService.vendorLogin(email, password);
        if (data && data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('role', 'VENDOR');
        }
        navigate('/vendor/dashboard');
      } else {
        // For courier/delivery login, it expects phone and password
        data = await authService.partnerLogin(email, password);
        if (data && data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('role', 'DELIVERY');
        }
        navigate('/delivery/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-700">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xl shadow-slate-200/50">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200/50">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Sign in to RentHub</h1>
          <p className="text-xs text-slate-450">Select your system login role to continue.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('CLIENT')}
            className={`py-2 rounded-lg text-[10px] uppercase tracking-wider font-extrabold flex flex-col items-center justify-center space-y-1 transition-all ${
              role === 'CLIENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Client</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('VENDOR')}
            className={`py-2 rounded-lg text-[10px] uppercase tracking-wider font-extrabold flex flex-col items-center justify-center space-y-1 transition-all ${
              role === 'VENDOR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Vendor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('DELIVERY')}
            className={`py-2 rounded-lg text-[10px] uppercase tracking-wider font-extrabold flex flex-col items-center justify-center space-y-1 transition-all ${
              role === 'DELIVERY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Courier</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-550 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block font-bold text-slate-550 uppercase tracking-wider">Password</label>
              <Link to="/reset-password" className="text-[10px] font-bold text-blue-600 hover:underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-blue-600/10 flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In Workspace</span>
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-[10px] space-y-1">
          {role === 'CLIENT' ? (
            <p>
              New Client?{' '}
              <Link to="/signup" className="font-bold text-blue-600 hover:underline">Create a client account</Link>
            </p>
          ) : role === 'VENDOR' ? (
            <p>
              New Vendor?{' '}
              <Link to="/vendor-signup" className="font-bold text-blue-600 hover:underline">Register your business</Link>
            </p>
          ) : (
            <p className="text-slate-400">Courier accounts are registered by vendor fleet managers.</p>
          )}
        </div>

      </div>
    </div>
  );
}
