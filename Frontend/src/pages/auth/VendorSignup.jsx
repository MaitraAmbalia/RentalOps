import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Mail, Lock, Building, Layers, FileText, ArrowRight } from 'lucide-react';
import { authService } from '../../api/authService';

export default function VendorSignup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyProductCategory: '',
    gstNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.vendorSignup(formData);
      // Backend registration might return { success: true, vendor: {...} } 
      // or automatically login the vendor and return accessToken.
      // Let's check what the response looks like:
      // If it doesn't return accessToken but just the registered vendor, 
      // we can automatically log them in or redirect them to login page.
      const token = res.accessToken || res.token || res.data?.token || res.data?.accessToken;
      if (token) {
        localStorage.setItem('token', token);
        navigate('/dashboard');
      } else {
        // If the registration doesn't login automatically, let's login them automatically:
        try {
          const loginRes = await authService.vendorLogin(formData.email, formData.password);
          const loginToken = loginRes.accessToken || loginRes.token || loginRes.data?.token || loginRes.data?.accessToken;
          if (loginToken) {
            localStorage.setItem('token', loginToken);
          }
          navigate('/dashboard');
        } catch (loginErr) {
          // Fallback to login page if auto-login fails
          navigate('/vendor-login');
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        setError(err.response.data.errors[firstErrorKey][0]);
      } else {
        setError(err.response?.data?.message || 'Failed to create vendor account. Please verify input data.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Store className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-extrabold text-white">Join RentHub as a Vendor</h2>
        <p className="mt-2 text-sm text-slate-400">
          Already have a partner account?{' '}
          <Link to="/vendor-login" className="font-medium text-primary hover:text-primary-hover">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-700">
          {error && (
            <div className="mb-6 bg-red-500/25 border border-red-500 text-red-200 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSignup}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">First Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    required
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Last Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    required
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Work Email</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="vendor@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Company Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    required
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Prime Rentals Inc."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Primary Product Category</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Layers className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="companyProductCategory"
                    required
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Electronics & Media"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">GST Registration Number</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  name="gstNo"
                  required
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="29GGGGG1314R9Z9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-600 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-75"
              >
                {loading ? 'Creating Vendor Profile...' : 'Complete Registration'} <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
