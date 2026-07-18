import { useState, useEffect } from 'react';
import { Save, User, CheckCircle, RefreshCw } from 'lucide-react';
import { vendorService } from '../../api/vendorService';

export default function ProfilePage() {
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

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');

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

  const handleUpdateField = async (fieldName, value) => {
    setSaveLoading(true);
    setError('');
    setSuccess('');
    try {
      const updatedForm = { ...profileForm, [fieldName]: value };
      await vendorService.updateProfile(updatedForm);
      setProfileForm(updatedForm);
      setSuccess(`${getFieldLabel(fieldName)} updated successfully!`);
      setEditingField(null);
    } catch (err) {
      console.error(err);
      setError(`Failed to update ${getFieldLabel(fieldName)}.`);
    } finally {
      setSaveLoading(false);
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'firstName': return 'First Name';
      case 'lastName': return 'Last Name';
      case 'companyName': return 'Company Name';
      case 'gstNo': return 'GST Registration No';
      case 'phone': return 'Contact Phone';
      case 'companyProductCategory': return 'Category Scope';
      default: return field;
    }
  };

  const startEditing = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setTempValue(currentValue);
    setError('');
    setSuccess('');
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
  };

  const saveField = async (fieldName) => {
    if (tempValue.trim() === '') {
      setError('Value cannot be empty.');
      return;
    }
    await handleUpdateField(fieldName, tempValue.trim());
  };

  const renderProfileField = (fieldName, value) => {
    const isEditing = editingField === fieldName;
    const label = getFieldLabel(fieldName);

    if (isEditing) {
      return (
        <div className="p-4 bg-bg-main border border-primary/45 rounded-xl transition-all space-y-3 shadow-sm">
          <label className="block text-[10px] uppercase tracking-wider text-primary font-extrabold">
            Update {label}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="flex-1 bg-bg-card border border-border-main text-text-main rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              autoFocus
            />
            <button
              onClick={() => saveField(fieldName)}
              disabled={saveLoading}
              className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs transition-colors shrink-0 shadow-sm"
            >
              Save
            </button>
            <button
              onClick={cancelEditing}
              className="px-3.5 py-2 bg-bg-card hover:bg-bg-main text-text-muted hover:text-text-main border border-border-main rounded-xl font-bold text-xs transition-colors shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 bg-bg-main/30 border border-border-main/50 rounded-xl flex justify-between items-center hover:border-border-main hover:bg-bg-main/50 transition-all duration-150">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-text-muted font-extrabold">
            {label}
          </span>
          <span className="text-sm font-semibold text-text-main mt-1 block">
            {value || <em className="text-text-muted font-normal">Not configured</em>}
          </span>
        </div>
        <button
          onClick={() => startEditing(fieldName, value)}
          className="px-3 py-1.5 bg-bg-card hover:bg-bg-main text-text-main rounded-xl border border-border-main/70 font-semibold text-xs hover:border-primary/50 transition-colors"
        >
          Change
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-text-muted font-sans text-xs">
      
      <div>
        <h1 className="text-2xl font-extrabold text-text-main">Vendor Workspace Profile</h1>
        <p className="text-sm text-text-muted mt-1">Configure company categories, phone numbers, and credentials.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-bg-card p-6 rounded-2xl border border-border-main">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-main">
            <h2 className="text-base font-bold text-text-main flex items-center space-x-2">
              <User className="h-4.5 w-4.5 text-primary" />
              <span>Workspace Settings</span>
            </h2>
            <span className="text-[10px] text-text-muted bg-bg-main/50 px-2.5 py-1 rounded-lg border border-border-main">
              Click Change next to any field to update it.
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderProfileField('firstName', profileForm.firstName)}
            {renderProfileField('lastName', profileForm.lastName)}
            {renderProfileField('companyName', profileForm.companyName)}
            {renderProfileField('gstNo', profileForm.gstNo)}
            {renderProfileField('phone', profileForm.phone)}
            {renderProfileField('companyProductCategory', profileForm.companyProductCategory)}
          </div>

          {/* Read-only Email Field at the bottom */}
          <div className="p-4 bg-bg-main/20 border border-border-main/50 rounded-xl flex items-center justify-between mt-6 opacity-75">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-text-muted font-extrabold">
                Email address (Read Only)
              </span>
              <span className="text-sm font-semibold text-text-muted mt-1 block">
                {profileForm.email}
              </span>
            </div>
            <span className="px-2.5 py-0.5 bg-bg-card border border-border-main rounded text-[10px] text-text-muted font-bold uppercase select-none">
              Read Only
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
