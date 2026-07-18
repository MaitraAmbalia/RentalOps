import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User, MapPin, Key, CheckCircle, RefreshCw, Shield, Mail, Phone } from 'lucide-react';
import { clientService } from '../../api/clientService';

const inputCls = "w-full bg-bg-main border border-border-main text-text-main rounded-xl p-2.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-text-muted";
const labelCls = "block font-bold text-text-muted text-[10px] uppercase tracking-wider mb-1.5";
const disabledInputCls = "w-full bg-bg-main border border-border-main text-text-muted rounded-xl p-2.5 text-xs outline-none cursor-not-allowed opacity-70";

const TABS = [
  { id: 'profile',  label: 'Profile Info',      Icon: User },
  { id: 'address',  label: 'Shipping Address',   Icon: MapPin },
  { id: 'password', label: 'Security',           Icon: Shield },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', shippingAddress: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => { fetchProfile(); }, []);

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
      setError('Failed to fetch your profile details.');
    } finally {
      setLoading(false);
    }
  };

  const flash = (type, msg) => {
    if (type === 'success') setSuccess(msg);
    else setError(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError(''); setSuccess('');
    try {
      await clientService.updateProfile(profileForm);
      flash('success', 'Profile saved successfully!');
    } catch (err) {
      console.error(err);
      flash('error', 'Failed to save profile changes.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return flash('error', 'New passwords do not match.');
    }
    setSaveLoading(true);
    setError(''); setSuccess('');
    try {
      await clientService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      flash('success', 'Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      flash('error', 'Failed to update password. Check your current password.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-xs text-text-muted font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  const initials = `${profileForm.firstName?.[0] || ''}${profileForm.lastName?.[0] || ''}`.toUpperCase() || 'C';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="flex items-center space-x-5 border-b border-border-main pb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-2xl shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-text-main">
            {profileForm.firstName ? `${profileForm.firstName} ${profileForm.lastName}` : 'Account Settings'}
          </h1>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Manage your profile, shipping address, and security settings.</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-bg-card border border-border-main p-1 rounded-xl self-start max-w-md">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setError(''); setSuccess(''); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === id
                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-bg-card border border-border-main rounded-2xl p-6">

        {/* Tab 1: Profile Info */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <h2 className="text-sm font-extrabold text-text-main border-b border-border-main pb-3">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First Name</label>
                <input
                  type="text" required value={profileForm.firstName}
                  onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                  className={inputCls} placeholder="John"
                />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input
                  type="text" required value={profileForm.lastName}
                  onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                  className={inputCls} placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</span>
                </label>
                <input
                  type="text" value={profileForm.phone}
                  onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                  className={inputCls} placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <label className={labelCls}>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email (Read‑only)</span>
                </label>
                <input type="email" disabled value={profileForm.email} className={disabledInputCls} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit" disabled={saveLoading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-sm shadow-primary/20 transition-colors disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                <span>{saveLoading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Shipping Address */}
        {activeTab === 'address' && (
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <h2 className="text-sm font-extrabold text-text-main border-b border-border-main pb-3">
              Default Shipping Address
            </h2>
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Delivery Address</span>
              </label>
              <textarea
                rows="4" required value={profileForm.shippingAddress}
                onChange={e => setProfileForm(p => ({ ...p, shippingAddress: e.target.value }))}
                className={inputCls} placeholder="Building, street, landmark, city, pin code..."
              />
            </div>
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl text-xs text-text-muted font-medium flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>This address is used as the default delivery destination when you checkout. You can override it per order during checkout.</span>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit" disabled={saveLoading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-sm shadow-primary/20 transition-colors disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                <span>{saveLoading ? 'Saving...' : 'Save Address'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Security */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
            <h2 className="text-sm font-extrabold text-text-main border-b border-border-main pb-3">
              Change Password
            </h2>
            {['oldPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
              <div key={field}>
                <label className={labelCls}>
                  {['Current Password', 'New Password', 'Confirm New Password'][i]}
                </label>
                <input
                  type="password" required
                  value={passwordForm[field]}
                  placeholder={i === 1 ? 'Minimum 6 characters' : ''}
                  onChange={e => setPasswordForm(p => ({ ...p, [field]: e.target.value }))}
                  className={inputCls}
                />
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                type="submit" disabled={saveLoading}
                className="flex items-center space-x-2 w-full justify-center py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-sm shadow-primary/20 transition-colors disabled:opacity-70"
              >
                <Key className="h-4 w-4" />
                <span>{saveLoading ? 'Updating...' : 'Change Password'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
