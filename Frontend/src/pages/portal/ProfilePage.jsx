import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User, MapPin, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { clientService } from '../../api/clientService';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'address', 'password'
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile fields
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    shippingAddress: ''
  });

  // Password fields
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await clientService.getProfile();
      if (data) {
        setProfileForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          shippingAddress: data.shippingAddress || ''
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch client profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess('');
    try {
      await clientService.updateProfile(profileForm);
      setSuccess('Profile configurations saved successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to save profile changes.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSaveLoading(true);
    setError('');
    setSuccess('');
    try {
      await clientService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess('Security credentials updated!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to change security credentials.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-705 font-sans text-xs">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure profile preferences, shipping addresses, and security passwords.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl self-start gap-1 max-w-md shadow-sm border">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'profile' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profile Info</span>
        </button>
        <button
          onClick={() => setActiveTab('address')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'address' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Shipping Location</span>
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'password' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-750'
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Security</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-455 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-455 rounded-xl font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        
        {/* Tab 1: Profile Info */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 mb-4">Profile Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact phone</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={profileForm.email}
                  className="w-full bg-slate-100 text-slate-400 border border-slate-200 rounded-xl p-2.5 text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow"
              >
                <Save className="h-4 w-4" />
                <span>Save Profile details</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Shipping Address */}
        {activeTab === 'address' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 mb-4">Shipping Destination</h2>
            
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Default Delivery Street Address</label>
              <textarea
                rows="3"
                required
                value={profileForm.shippingAddress}
                onChange={(e) => setProfileForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="Building, street, zip, city..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow"
              >
                <Save className="h-4 w-4" />
                <span>Save Address details</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Security Credentials */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <h2 className="text-base font-extrabold text-slate-900 mb-4">Change Security Password</h2>
            
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Old Password</label>
              <input
                type="password"
                required
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow"
              >
                Change Password Key
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
