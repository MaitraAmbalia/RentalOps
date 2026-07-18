import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings, Layers, User, Key, Save, Plus, Trash2, CheckCircle, RefreshCw, Calendar, Info, ToggleLeft, ShieldOff, Package
} from 'lucide-react';
import { settingsService } from '../../api/settingsService';
import { productService } from '../../api/productService';
import { vendorService } from '../../api/vendorService';

function RupeeIcon({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="m6 13 8.5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c3.667 0 6-1.833 6-5s-2.333-5-6-5" />
    </svg>
  );
}

// Seed initial pricelists
const SEED_PRICELISTS = [
  {
    id: 'pl_1',
    name: 'Standard Price List',
    isSelectable: true,
    rules: [
      { id: 'pr_1', productId: '', productName: 'All Products', priceType: 'DISCOUNT', discountPercent: 10, fixedPrice: 0, minQty: 1, validFrom: '2026-01-01', validTo: '2026-12-31', isSelectable: true },
      { id: 'pr_2', productId: 'prod_1', productName: 'Heavy Duty Excavator', priceType: 'FIXED', discountPercent: 0, fixedPrice: 120, minQty: 5, validFrom: '2026-06-01', validTo: '2026-08-31', isSelectable: true }
    ]
  }
];

export default function VendorSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'pickup';

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('ADMIN'); // default assume admin until loaded

  // 1. Tab: Pickup & Return (formerly Pricing & Policy)
  const [pricingPolicy, setPricingPolicy] = useState({
    lateFeeEnabled: true,
    defaultLateFeeRatePerHour: '0',
    lateFeeGracePeriodMinutes: '0',
    defaultDepositCalcType: 'PERCENT_OF_RENTAL',
    defaultDepositValue: '100',
    defaultTaxPercent: '18'
  });

  // Product Settings tab
  const [productSettings, setProductSettings] = useState({
    warrantyEnabled: false,
    policyDraftEnabled: false,
  });

  // 2. Tab: Attributes State
  const [attributes, setAttributes] = useState([]);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrDisplay, setNewAttrDisplay] = useState('RADIO');
  const [newValueInput, setNewValueInput] = useState('');
  const [selectedAttrId, setSelectedAttrId] = useState('');

  // 3. Tab: User Profile State
  const [vendorProfile, setVendorProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companyProductCategory: '',
    gstNo: '',
    role: 'ADMIN'
  });

  // 4. Tab: Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 5. Tab: Pricelist State
  const [pricelists, setPricelists] = useState([]);
  const [selectedPricelistId, setSelectedPricelistId] = useState('');
  const [newPricelistName, setNewPricelistName] = useState('');
  const [products, setProducts] = useState([]);
  
  // New Rule Form State
  const [ruleForm, setRuleForm] = useState({
    productId: '', // empty = "All Products"
    priceType: 'DISCOUNT', // 'DISCOUNT' or 'FIXED'
    fixedPrice: '0',
    discountPercent: '0',
    minQty: '1',
    validFrom: '',
    validTo: '',
    isSelectable: true
  });

  // Load role on mount
  useEffect(() => {
    vendorService.getProfile().then(p => {
      if (p?.role) setUserRole(p.role);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Always pre-fetch products for the pricelist dropdown if needed
      const prods = await productService.getProducts().catch(() => []);
      setProducts(Array.isArray(prods) ? prods : []);

      if (activeTab === 'pickup') {
        const policy = await settingsService.getSettings();
        if (policy) {
          setPricingPolicy({
            lateFeeEnabled: policy.lateFeeEnabled ?? true,
            defaultLateFeeRatePerHour: policy.defaultLateFeeRatePerHour?.toString() || '0',
            lateFeeGracePeriodMinutes: policy.lateFeeGracePeriodMinutes?.toString() || '0',
            defaultDepositCalcType: policy.defaultDepositCalcType || 'PERCENT_OF_RENTAL',
            defaultDepositValue: policy.defaultDepositValue?.toString() || '100',
            defaultTaxPercent: policy.defaultTaxPercent?.toString() || '18'
          });
          setProductSettings({
            warrantyEnabled: policy.warrantyEnabled ?? false,
            policyDraftEnabled: policy.policyDraftEnabled ?? false,
          });
        }
      } else if (activeTab === 'product-settings') {
        const policy = await settingsService.getSettings();
        if (policy) {
          setProductSettings({
            warrantyEnabled: policy.warrantyEnabled ?? false,
            policyDraftEnabled: policy.policyDraftEnabled ?? false,
          });
        }
      } else if (activeTab === 'attributes') {
        const attrs = await settingsService.getAttributes();
        setAttributes(Array.isArray(attrs) ? attrs : []);
      } else if (activeTab === 'profile') {
        const profile = await settingsService.getProfile();
        if (profile) {
          setVendorProfile({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            companyName: profile.companyName || '',
            companyProductCategory: profile.companyProductCategory || '',
            gstNo: profile.gstNo || '',
            role: profile.role || 'ADMIN'
          });
        }
      } else if (activeTab === 'pricelists') {
        const list = await settingsService.getPricelists();
        setPricelists(list);
        if (list.length > 0 && !selectedPricelistId) {
          setSelectedPricelistId(list[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch settings configurations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        lateFeeEnabled: pricingPolicy.lateFeeEnabled,
        defaultLateFeeRatePerHour: parseFloat(pricingPolicy.defaultLateFeeRatePerHour),
        lateFeeGracePeriodMinutes: parseInt(pricingPolicy.lateFeeGracePeriodMinutes),
        defaultDepositCalcType: pricingPolicy.defaultDepositCalcType,
        defaultDepositValue: parseFloat(pricingPolicy.defaultDepositValue),
        defaultTaxPercent: parseFloat(pricingPolicy.defaultTaxPercent),
        warrantyEnabled: productSettings.warrantyEnabled,
        policyDraftEnabled: productSettings.policyDraftEnabled,
      };
      await settingsService.updateSettings(payload);
      setSuccess('Settings updated successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to save settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveProductSettings = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess('');
    try {
      const policy = await settingsService.getSettings();
      await settingsService.updateSettings({
        lateFeeEnabled: policy.lateFeeEnabled ?? true,
        defaultLateFeeRatePerHour: parseFloat(policy.defaultLateFeeRatePerHour || 0),
        lateFeeGracePeriodMinutes: parseInt(policy.lateFeeGracePeriodMinutes || 0),
        defaultDepositCalcType: policy.defaultDepositCalcType || 'PERCENT_OF_RENTAL',
        defaultDepositValue: parseFloat(policy.defaultDepositValue || 100),
        defaultTaxPercent: parseFloat(policy.defaultTaxPercent || 0),
        warrantyEnabled: productSettings.warrantyEnabled,
        policyDraftEnabled: productSettings.policyDraftEnabled,
      });
      setSuccess('Product settings saved!');
    } catch (err) {
      console.error(err);
      setError('Failed to save product settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateAttribute = async (e) => {
    e.preventDefault();
    if (!newAttrName.trim()) return;
    try {
      const newAttr = await settingsService.createAttribute({
        name: newAttrName,
        displayType: newAttrDisplay
      });
      setAttributes(prev => [...prev, newAttr]);
      setNewAttrName('');
      setSuccess('Product Attribute registered successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to register attribute.');
    }
  };

  const handleDeleteAttribute = async (id) => {
    if (!confirm('Delete this product attribute?')) return;
    try {
      await settingsService.deleteAttribute(id);
      setAttributes(prev => prev.filter(a => a.id !== id));
      if (selectedAttrId === id) setSelectedAttrId('');
      setSuccess('Attribute removed.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete attribute.');
    }
  };

  const handleAddAttributeValue = async (e) => {
    e.preventDefault();
    if (!selectedAttrId || !newValueInput.trim()) return;
    try {
      const newVal = await settingsService.addAttributeValue(selectedAttrId, {
        value: newValueInput.trim(),
        extraPrice: 0
      });
      setAttributes(prev => prev.map(attr => {
        if (attr.id === selectedAttrId) {
          return { ...attr, values: [...(attr.values || []), newVal] };
        }
        return attr;
      }));
      setNewValueInput('');
      setSuccess('Value choice added.');
    } catch (err) {
      console.error(err);
      setError('Failed to add attribute option.');
    }
  };

  const handleDeleteAttributeValue = async (attrId, valueId) => {
    try {
      await settingsService.deleteAttributeValue(attrId, valueId);
      setAttributes(prev => prev.map(attr => {
        if (attr.id === attrId) {
          return { ...attr, values: (attr.values || []).filter(v => v.id !== valueId) };
        }
        return attr;
      }));
      setSuccess('Attribute value option deleted.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete option.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess('');
    try {
      await settingsService.updateProfile(vendorProfile);
      setSuccess('Vendor profile details saved!');
    } catch (err) {
      console.error(err);
      setError('Failed to update vendor profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setSaveLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Security password updated!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError('Failed to update security credentials.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Pricelist Handlers
  const handleCreatePricelist = async (e) => {
    e.preventDefault();
    if (!newPricelistName.trim()) return;
    try {
      const newPl = await settingsService.createPricelist(newPricelistName.trim());
      setPricelists(prev => [...prev, newPl]);
      setSelectedPricelistId(newPl.id);
      setNewPricelistName('');
      setSuccess('Pricelist created successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to create pricelist.');
    }
  };

  const handleAddPriceRule = async (e) => {
    e.preventDefault();
    if (!selectedPricelistId) return;

    let targetProductName = 'All Products';
    if (ruleForm.productId) {
      const prod = products.find(p => p.id === ruleForm.productId);
      if (prod) targetProductName = prod.name;
    }

    const ruleData = {
      productId: ruleForm.productId || null,
      priceType: ruleForm.priceType,
      discountPercent: parseFloat(ruleForm.discountPercent || 0),
      fixedPrice: parseFloat(ruleForm.fixedPrice || 0),
      minQty: parseFloat(ruleForm.minQty || 1),
      validFrom: ruleForm.validFrom || null,
      validTo: ruleForm.validTo || null,
      isSelectable: ruleForm.isSelectable
    };

    try {
      const newRuleObj = await settingsService.createPriceRule(selectedPricelistId, ruleData);
      const ruleWithProductName = {
        ...newRuleObj,
        productName: targetProductName
      };

      setPricelists(prev => prev.map(pl => {
        if (pl.id === selectedPricelistId) {
          return { ...pl, rules: [...(pl.rules || []), ruleWithProductName] };
        }
        return pl;
      }));

      // Reset Form
      setRuleForm({
        productId: '',
        priceType: 'DISCOUNT',
        fixedPrice: '0',
        discountPercent: '0',
        minQty: '1',
        validFrom: '',
        validTo: '',
        isSelectable: true
      });
      setSuccess('Pricing Rule added to list!');
    } catch (err) {
      console.error(err);
      setError('Failed to add pricing rule.');
    }
  };

  const handleDeletePriceRule = async (ruleId) => {
    try {
      await settingsService.deletePriceRule(selectedPricelistId, ruleId);
      setPricelists(prev => prev.map(pl => {
        if (pl.id === selectedPricelistId) {
          return { ...pl, rules: (pl.rules || []).filter(r => r.id !== ruleId) };
        }
        return pl;
      }));
      setSuccess('Pricing rule deleted.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete pricing rule.');
    }
  };

  const currentPricelist = pricelists.find(pl => pl.id === selectedPricelistId) || pricelists[0];

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  if (userRole !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
        <ShieldOff className="h-14 w-14 text-text-muted" />
        <h2 className="text-xl font-bold text-text-main">Access Restricted</h2>
        <p className="text-sm text-text-muted max-w-xs">Only Company Admins can access the Configuration settings. Contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-text-main">Vendor Configuration Hub</h1>
        <p className="text-sm text-text-muted mt-1">Manage core pricing policies, attributes, templates, and profile settings.</p>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap border-b border-border-main bg-bg-card p-1 rounded-xl self-start gap-1">
        <button
          onClick={() => handleTabChange('pickup')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'pickup' ? 'bg-bg-main text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Pickup &amp; Return</span>
        </button>
        <button
          onClick={() => handleTabChange('product-settings')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'product-settings' ? 'bg-bg-main text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Product Settings</span>
        </button>
        <button
          onClick={() => handleTabChange('pricelists')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'pricelists' ? 'bg-bg-main text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <RupeeIcon className="h-4 w-4" />
          <span>Pricelists</span>
        </button>
        <button
          onClick={() => handleTabChange('attributes')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'attributes' ? 'bg-bg-main text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Attributes</span>
        </button>
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'profile' ? 'bg-bg-main text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <User className="h-4 w-4" />
          <span>User Profile</span>
        </button>
        <button
          onClick={() => handleTabChange('password')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'password' ? 'bg-bg-main text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Change Password</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[250px]">
          <RefreshCw className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm">
          
          {/* TAB 1: Pickup & Return */}
          {activeTab === 'pickup' && (
            <form onSubmit={handleSavePricing} className="space-y-6">
              <h2 className="text-lg font-bold text-text-main mb-4">Rental Fee Policies</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Enable Late Returns Penalties</label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setPricingPolicy(prev => ({ ...prev, lateFeeEnabled: !prev.lateFeeEnabled }))}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                        pricingPolicy.lateFeeEnabled ? 'bg-primary' : 'bg-bg-main border border-border-main'
                      }`}
                    >
                      <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-all ${
                        pricingPolicy.lateFeeEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="text-sm font-semibold text-text-main">
                      {pricingPolicy.lateFeeEnabled ? 'Penalties Active' : 'No Overdue Penalties'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Default Late Fee (₹ / Hour)</label>
                  <input
                    type="number"
                    value={pricingPolicy.defaultLateFeeRatePerHour}
                    onChange={(e) => setPricingPolicy(prev => ({ ...prev, defaultLateFeeRatePerHour: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    value={pricingPolicy.lateFeeGracePeriodMinutes}
                    onChange={(e) => setPricingPolicy(prev => ({ ...prev, lateFeeGracePeriodMinutes: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Default Tax rate (GST %)</label>
                  <input
                    type="number"
                    value={pricingPolicy.defaultTaxPercent}
                    onChange={(e) => setPricingPolicy(prev => ({ ...prev, defaultTaxPercent: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Default Deposit Calculation</label>
                  <select
                    value={pricingPolicy.defaultDepositCalcType}
                    onChange={(e) => setPricingPolicy(prev => ({ ...prev, defaultDepositCalcType: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="PERCENT_OF_RENTAL">Percentage of Rent Amount</option>
                    <option value="FIXED">Flat Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Default Deposit Value (% or ₹)</label>
                  <input
                    type="number"
                    value={pricingPolicy.defaultDepositValue}
                    onChange={(e) => setPricingPolicy(prev => ({ ...prev, defaultDepositValue: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all flex items-center space-x-2 shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Pricing Configurations</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Product Settings */}
          {activeTab === 'product-settings' && (
            <form onSubmit={handleSaveProductSettings} className="space-y-6">
              <h2 className="text-lg font-bold text-text-main mb-4">Product Catalog Features</h2>

              <div className="space-y-5 bg-bg-main/60 p-5 rounded-2xl border border-border-main">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="warrantyEnabled"
                        checked={productSettings.warrantyEnabled}
                        onChange={(e) => setProductSettings(prev => ({ ...prev, warrantyEnabled: e.target.checked }))}
                        className="w-4.5 h-4.5 accent-primary rounded cursor-pointer"
                      />
                      <label htmlFor="warrantyEnabled" className="text-sm font-bold text-text-main cursor-pointer">
                        Offer Rental Warranty & Protection Plans
                      </label>
                    </div>
                    <p className="text-xs text-text-muted pl-7">
                      Enables optional warranty coverage add-ons on products during checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('attributes')}
                    className="text-xs font-bold text-primary hover:underline flex items-center space-x-1 shrink-0"
                  >
                    <span>Configure Attributes &rarr;</span>
                  </button>
                </div>

                <div className="border-t border-border-main pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="policyDraftEnabled"
                          checked={productSettings.policyDraftEnabled}
                          onChange={(e) => setProductSettings(prev => ({ ...prev, policyDraftEnabled: e.target.checked }))}
                          className="w-4.5 h-4.5 accent-primary rounded cursor-pointer"
                        />
                        <label htmlFor="policyDraftEnabled" className="text-sm font-bold text-text-main cursor-pointer">
                          Enforce Custom Policy & Terms Draft Per Product
                        </label>
                      </div>
                      <p className="text-xs text-text-muted pl-7">
                        Allow vendor staff to attach custom rental agreement terms directly to individual inventory items.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-primary/20"
                >
                  <Save className="h-4 w-4" />
                  <span>{saveLoading ? 'Saving…' : 'Save Product Settings'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Pricelists & Rules */}
          {activeTab === 'pricelists' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-sm text-text-muted">
              
              {/* Pricelists sidebar selection */}
              <div className="xl:col-span-1 space-y-4">
                <h3 className="text-base font-bold text-text-main uppercase tracking-wider text-xs border-b border-border-main pb-2">Pricelists</h3>
                <div className="space-y-1.5">
                  {pricelists.map(pl => (
                    <button
                      key={pl.id}
                      onClick={() => setSelectedPricelistId(pl.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold transition-all border ${
                        selectedPricelistId === pl.id 
                          ? 'bg-bg-main border-primary text-text-main font-bold' 
                          : 'bg-transparent border-transparent hover:bg-bg-main/60 text-text-muted hover:text-text-main'
                      }`}
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleCreatePricelist} className="pt-4 border-t border-border-main space-y-3">
                  <span className="text-xs text-text-muted uppercase font-bold">New Pricelist</span>
                  <input
                    type="text"
                    required
                    placeholder="Pricelist Name..."
                    value={newPricelistName}
                    onChange={(e) => setNewPricelistName(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2 text-xs text-text-main focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-bg-main hover:bg-bg-main/80 text-text-main border border-border-main rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Pricelist</span>
                  </button>
                </form>
              </div>

              {/* Pricelist detailed rules table */}
              <div className="xl:col-span-2 space-y-4">
                {currentPricelist ? (
                  <>
                    <div className="border-b border-border-main pb-2 flex justify-between items-center">
                      <h3 className="text-base font-extrabold text-text-main">{currentPricelist.name} Rules</h3>
                      <span className="text-xs text-text-muted font-semibold">Active Rules Count: {currentPricelist.rules?.length || 0}</span>
                    </div>

                    <div className="overflow-x-auto bg-bg-main/20 border border-border-main rounded-2xl p-4">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-border-main text-text-muted font-bold uppercase pb-2">
                            <th className="pb-2">Apply On</th>
                            <th className="pb-2 text-center">Min. Qty</th>
                            <th className="pb-2">Validity Limit</th>
                            <th className="pb-2 text-center">Selectable</th>
                            <th className="pb-2 text-right">Price Effect</th>
                            <th className="pb-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-main">
                          {currentPricelist.rules?.map((rule, idx) => (
                            <tr key={idx} className="group">
                              <td className="py-2.5 font-semibold text-text-main">{rule.productName || rule.product?.name || 'All Products'}</td>
                              <td className="py-2.5 text-center text-text-main">{rule.minQty}</td>
                              <td className="py-2.5 text-text-muted">
                                {rule.validFrom && rule.validTo ? `${new Date(rule.validFrom).toLocaleDateString()} to ${new Date(rule.validTo).toLocaleDateString()}` : 'Lifetime'}
                              </td>
                              <td className="py-2.5 text-center">
                                <span className={`inline-block w-2 h-2 rounded-full ${rule.isSelectable ? 'bg-primary' : 'bg-text-muted'}`} />
                              </td>
                              <td className="py-2.5 text-right font-bold text-text-main">
                                {rule.priceType === 'DISCOUNT' ? `${rule.discountPercent}% Discount` : `₹${Number(rule.fixedPrice || 0).toFixed(2)} Fixed`}
                              </td>
                              <td className="py-2.5 text-center">
                                <button
                                  onClick={() => handleDeletePriceRule(rule.id)}
                                  className="text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}

                          {(currentPricelist.rules || []).length === 0 && (
                            <tr>
                              <td colSpan="6" className="py-6 text-center text-text-muted font-semibold italic">
                                No specific rules added yet. Add a rule to this list on the right.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-text-muted font-semibold italic border border-dashed border-border-main rounded-2xl">
                    Select or create a pricelist first.
                  </div>
                )}
              </div>

              {/* Create Pricelist Rules Form */}
              <div className="xl:col-span-1 space-y-4">
                <h3 className="text-base font-bold text-text-main uppercase tracking-wider text-xs border-b border-border-main pb-2">Create Rule</h3>
                <form onSubmit={handleAddPriceRule} className="bg-bg-main/60 p-4 rounded-xl border border-border-main space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Products</label>
                    <select
                      value={ruleForm.productId}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, productId: e.target.value }))}
                      className="w-full bg-bg-card border border-border-main rounded-lg p-2 text-xs text-text-main focus:outline-none"
                    >
                      <option value="">All Products</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Price Type</label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setRuleForm(prev => ({ ...prev, priceType: 'DISCOUNT' }))}
                        className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${
                          ruleForm.priceType === 'DISCOUNT' 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-transparent border-border-main text-text-muted hover:text-text-main'
                        }`}
                      >
                        Discount %
                      </button>
                      <button
                        type="button"
                        onClick={() => setRuleForm(prev => ({ ...prev, priceType: 'FIXED' }))}
                        className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${
                          ruleForm.priceType === 'FIXED' 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-transparent border-border-main text-text-muted hover:text-text-main'
                        }`}
                      >
                        Fixed Price
                      </button>
                    </div>
                  </div>

                  {ruleForm.priceType === 'DISCOUNT' ? (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Discount % on Sales price</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={ruleForm.discountPercent}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, discountPercent: e.target.value }))}
                        className="w-full bg-bg-card border border-border-main rounded-lg p-2 text-xs text-text-main focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Fixed Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={ruleForm.fixedPrice}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, fixedPrice: e.target.value }))}
                        className="w-full bg-bg-card border border-border-main rounded-lg p-2 text-xs text-text-main focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Min Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={ruleForm.minQty}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, minQty: e.target.value }))}
                      className="w-full bg-bg-card border border-border-main rounded-lg p-2 text-xs text-text-main focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <label className="block uppercase font-bold text-text-muted mb-1">Valid From</label>
                      <input
                        type="date"
                        value={ruleForm.validFrom}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, validFrom: e.target.value }))}
                        className="w-full bg-bg-card border border-border-main rounded-lg p-2 text-text-main focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block uppercase font-bold text-text-muted mb-1">Valid To</label>
                      <input
                        type="date"
                        value={ruleForm.validTo}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, validTo: e.target.value }))}
                        className="w-full bg-bg-card border border-border-main rounded-lg p-2 text-text-main focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={ruleForm.isSelectable}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, isSelectable: e.target.checked }))}
                      className="rounded bg-bg-card border-border-main text-primary w-4.5 h-4.5"
                    />
                    <label className="text-[10px] uppercase font-bold text-text-muted">Rule Selectable</label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Add Pricing Rule
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 3: Attributes */}
          {activeTab === 'attributes' && (
            <div className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Attributes creator */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-text-main">Create Product Attributes</h2>
                  <form onSubmit={handleCreateAttribute} className="space-y-4 bg-bg-main/60 p-4 rounded-xl border border-border-main">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Attribute Name (e.g. Brand, Size)</label>
                      <input
                        type="text"
                        value={newAttrName}
                        onChange={(e) => setNewAttrName(e.target.value)}
                        placeholder="Name"
                        className="w-full bg-bg-card border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Display Type</label>
                      <select
                        value={newAttrDisplay}
                        onChange={(e) => setNewAttrDisplay(e.target.value)}
                        className="w-full bg-bg-card border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                      >
                        <option value="RADIO">Radio Buttons</option>
                        <option value="PILLS">Pills Chip View</option>
                        <option value="CHECKBOX">Checkboxes</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-1 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Attribute</span>
                    </button>
                  </form>
                </div>

                {/* Attribute values manager */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-text-main">Attribute Values</h2>
                  <form onSubmit={handleAddAttributeValue} className="space-y-4 bg-bg-main/60 p-4 rounded-xl border border-border-main">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Select Attribute</label>
                      <select
                        value={selectedAttrId}
                        onChange={(e) => setSelectedAttrId(e.target.value)}
                        className="w-full bg-bg-card border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                      >
                        <option value="">Choose attribute...</option>
                        {attributes.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">New Value Option Text (e.g. Red, 15-inch)</label>
                      <input
                        type="text"
                        value={newValueInput}
                        onChange={(e) => setNewValueInput(e.target.value)}
                        placeholder="Value Option"
                        className="w-full bg-bg-card border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-1 py-2 bg-bg-main hover:bg-bg-main/80 text-text-main rounded-xl text-xs font-bold border border-border-main transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Value Option</span>
                    </button>
                  </form>
                </div>

              </div>

              {/* List of attributes */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-text-main">Existing System Attributes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attributes.map(attr => (
                    <div key={attr.id} className="bg-bg-main p-4 rounded-xl border border-border-main flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-text-main">{attr.name}</span>
                          <span className="text-[10px] bg-bg-card text-text-muted px-2 py-0.5 rounded font-bold uppercase border border-border-main">{attr.displayType}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {attr.values?.map(val => (
                            <span key={val.id} className="inline-flex items-center bg-bg-card text-text-main text-xs px-2.5 py-1 rounded-lg border border-border-main space-x-1.5">
                              <span>{val.value}</span>
                              <button 
                                onClick={() => handleDeleteAttributeValue(attr.id, val.id)}
                                className="text-text-muted hover:text-rose-500 transition-colors text-[10px]"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteAttribute(attr.id)}
                        className="text-text-muted hover:text-rose-500 p-1"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: User Settings Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <h2 className="text-lg font-bold text-text-main mb-4">Vendor Profile Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.firstName}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.lastName}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Work Email (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={vendorProfile.email}
                    className="w-full bg-bg-main/60 border border-border-main rounded-xl p-2.5 text-sm text-text-muted/65 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Phone</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.phone}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Company Name</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.companyName}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Line of Business</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.companyProductCategory}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, companyProductCategory: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">GST Number</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.gstNo}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, gstNo: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Current System Role</label>
                  <select
                    value={vendorProfile.role}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                  >
                    <option value="ADMIN">Company Owner (Admin)</option>
                    <option value="VENDOR">Standard Vendor Manager</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Profile Info</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: Change Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <h2 className="text-lg font-bold text-text-main mb-4">Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all"
                >
                  Change Password Security Key
                </button>
              </div>
            </form>
          )}

        </div>
      )}
    </div>
  );
}
