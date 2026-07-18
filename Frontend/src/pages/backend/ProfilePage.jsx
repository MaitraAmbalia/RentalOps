import { useState, useEffect, useRef } from 'react';
import { User, Camera, Save, Lock, Building2, Mail, Phone, MapPin, FileText, Shield, Eye, EyeOff } from 'lucide-react';
import { vendorService } from '../../api/vendorService';
import axiosInstance from '../../api/axiosInstance';

export default function ProfilePageBackend() {
  const [activeTab, setActiveTab] = useState('web'); // 'web' | 'security'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileRef = useRef(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companyProductCategory: '',
    gstNo: '',
    address: '',
    companyLogo: '',
    role: 'ADMIN',
  });

  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await vendorService.getProfile();
        if (data) setProfile(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axiosInstance.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.url || res;
      setProfile(prev => ({ ...prev, companyLogo: url }));
      await vendorService.updateProfile({ companyLogo: url });
      showToast('Logo updated successfully');
    } catch (err) {
      showToast('Failed to upload logo', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { email, role, createdAt, updatedAt, id, companyLogo, ...editableFields } = profile;
      await vendorService.updateProfile(editableFields);
      showToast('Profile updated successfully');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwords.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSaving(true);
    try {
      await vendorService.changePassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
      showToast('Password changed successfully');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-2xl transition-all animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-rose-500/90 text-white' : 'bg-emerald-500/90 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border-main pb-5">
        <h1 className="text-2xl font-extrabold text-text-main flex items-center space-x-2">
          <User className="h-6 w-6 text-primary" />
          <span>User Profile</span>
        </h1>
        <p className="text-sm text-text-muted mt-1">Manage your personal information and workspace security.</p>
      </div>

      {/* Logo + Identity Card */}
      <div className="bg-bg-card rounded-2xl border border-border-main p-6 flex items-center gap-6">
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
            {profile.companyLogo ? (
              <img src={profile.companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-primary uppercase">{(profile.firstName || 'V')[0]}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingLogo}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary border-2 border-bg-card flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
            title="Upload Company Logo"
          >
            {uploadingLogo ? (
              <div className="w-3.5 h-3.5 border-t border-white rounded-full animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>
        <div>
          <p className="text-lg font-extrabold text-text-main">{profile.firstName} {profile.lastName}</p>
          <p className="text-xs text-text-muted font-semibold">{profile.email}</p>
          <span className={`mt-2 inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
            profile.role === 'ADMIN' ? 'bg-primary/15 text-primary' : 'bg-bg-main text-text-muted border border-border-main'
          }`}>
            {profile.role === 'ADMIN' ? '⭐ Company Owner (Admin)' : 'Vendor Manager'}
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-bg-card border border-border-main rounded-2xl p-1 w-fit">
        {[
          { key: 'web', label: 'Web Information', icon: Building2 },
          { key: 'security', label: 'Security', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Web Information Tab */}
      {activeTab === 'web' && (
        <form onSubmit={handleProfileSave} className="bg-bg-card rounded-2xl border border-border-main p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">First Name</label>
              <input
                type="text"
                required
                value={profile.firstName}
                onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Last Name</label>
              <input
                type="text"
                required
                value={profile.lastName}
                onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5 flex items-center gap-1">
                <Mail className="h-3 w-3" /> Work Email (Read Only)
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full bg-bg-main/50 border border-border-main/50 rounded-xl px-3.5 py-2.5 text-sm text-text-muted cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5 flex items-center gap-1">
                <Phone className="h-3 w-3" /> Phone
              </label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Company Name
              </label>
              <input
                type="text"
                required
                value={profile.companyName}
                onChange={e => setProfile(p => ({ ...p, companyName: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">Line of Business</label>
              <input
                type="text"
                value={profile.companyProductCategory}
                onChange={e => setProfile(p => ({ ...p, companyProductCategory: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5 flex items-center gap-1">
                <FileText className="h-3 w-3" /> GST Registration No.
              </label>
              <input
                type="text"
                value={profile.gstNo}
                onChange={e => setProfile(p => ({ ...p, gstNo: e.target.value }))}
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main font-mono focus:border-primary focus:outline-none transition-colors"
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Company Address
              </label>
              <input
                type="text"
                value={profile.address || ''}
                onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                placeholder="Street, City, State"
                className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving…' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="bg-bg-card rounded-2xl border border-border-main p-6 space-y-5">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-text-main">Change Password</h2>
          </div>

          {[
            { key: 'oldPassword', label: 'Current Password', show: showOld, toggle: () => setShowOld(v => !v) },
            { key: 'newPassword', label: 'New Password', show: showNew, toggle: () => setShowNew(v => !v) },
            { key: 'confirmPassword', label: 'Confirm New Password', show: showConfirm, toggle: () => setShowConfirm(v => !v) },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-1.5">{field.label}</label>
              <div className="relative">
                <input
                  type={field.show ? 'text' : 'password'}
                  required
                  value={passwords[field.key]}
                  onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full bg-bg-main border border-border-main rounded-xl px-3.5 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none transition-colors pr-10"
                />
                <button type="button" onClick={field.toggle} className="absolute right-3 top-3 text-text-muted hover:text-text-main">
                  {field.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              <Lock className="h-4 w-4" />
              <span>{saving ? 'Updating…' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
