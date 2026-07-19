import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, RefreshCw } from 'lucide-react';
import { authService } from '../../api/authService';

export default function VendorSignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    companyProductCategory: '',
    gstNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.vendorSignup(formData);
      alert('Vendor registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete vendor registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-700">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xl shadow-slate-200/50">

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200/50">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Register Vendor Agency</h1>
          <p className="text-xs text-slate-450">Join RentalOps fleet and catalog rental channels.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="vendor@domain.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="text"
                name="phone"
                required
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Min 6 characters..."
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">Company Name</label>
              <input
                type="text"
                name="companyName"
                required
                placeholder="e.g. Acme Rentals"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">Line of Business</label>
              <input
                type="text"
                name="companyProductCategory"
                required
                placeholder="Heavy Machinery, Cameras..."
                value={formData.companyProductCategory}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-555 uppercase tracking-wider mb-1.5">GST Registration No</label>
            <input
              type="text"
              name="gstNo"
              required
              placeholder="e.g. 22AAAAA0000A1Z5"
              value={formData.gstNo}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-855 outline-none"
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
                <span>Registering vendor...</span>
              </>
            ) : (
              <span>Create Business Workspace</span>
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-[10px]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">Log in here</Link>
        </div>

      </div>
    </div>
  );
}
