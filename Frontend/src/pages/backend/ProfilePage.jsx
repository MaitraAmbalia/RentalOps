import { useState, useEffect } from 'react';
import { Save, User, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { vendorService } from '../../api/vendorService';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password'
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile Form fields
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companyProductCategory: '',
    gstNo: ''
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
      const data = await vendorService.getProfile();
      if (data) {
        setProfileForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          companyName: data.companyName || '',
          companyProductCategory: data.companyProductCategory || '',
          gstNo: data.gstNo || ''
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch vendor configurations.');
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
      await vendorService.updateProfile(profileForm);
      setSuccess('Profile credentials updated successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to update vendor credentials.');
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
      await vendorService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess('Workspace password updated successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to adjust security password key.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-400 font-sans text-xs">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white">Vendor Workspace Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Configure company categories, phone numbers, and dashboard security passwords.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-xl self-start border border-slate-800 max-w-sm">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <User className="h-4 w-4" />
          <span>General Info</span>
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'password' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Security Key</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-455 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
        
        {/* Tab 1: Profile Info */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h2 className="text-base font-bold text-white mb-4">Workspace Settings</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-855 rounded-xl p-2.5 text-sm text-white outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-855 rounded-xl p-2.5 text-sm text-white outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.companyName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-855 rounded-xl p-2.5 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1.5">GST Registration No</label>
                <input
                  type="text"
                  required
                  value={profileForm.gstNo}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, gstNo: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-855 rounded-xl p-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-855 rounded-xl p-2.5 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1.5">Category Scope</label>
                <input
                  type="text"
                  required
                  value={profileForm.companyProductCategory}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, companyProductCategory: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-855 rounded-xl p-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1.5">Email address (Read Only)</label>
              <input
                type="email"
                disabled
                value={profileForm.email}
                className="w-full bg-slate-900/60 text-slate-500 border border-slate-850 rounded-xl p-2.5 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center space-x-1.5 shadow"
              >
                <Save className="h-4 w-4" />
                <span>Save Workspace profile</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security credentials */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <h2 className="text-base font-bold text-white mb-4">Workspace Password Settings</h2>
            
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1.5">Old Password</label>
              <input
                type="password"
                required
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-855 rounded-xl p-2.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1.5">New Password</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-855 rounded-xl p-2.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-855 rounded-xl p-2.5 text-sm text-white outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow"
              >
                Change Workspace Password
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
