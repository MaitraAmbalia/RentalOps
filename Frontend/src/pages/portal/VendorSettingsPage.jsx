import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings, Layers, User, Key, Save, Plus, Trash2, CheckCircle, RefreshCw, DollarSign, Calendar, Info, ToggleLeft
} from 'lucide-react';
import { settingsService } from '../../api/settingsService';
import { productService } from '../../api/productService';

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
  const activeTab = searchParams.get('tab') || 'pricing';

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Tab: Pricing & Policy State
  const [pricingPolicy, setPricingPolicy] = useState({
    lateFeeEnabled: true,
    defaultLateFeeRatePerHour: '0',
    lateFeeGracePeriodMinutes: '0',
    defaultDepositCalcType: 'PERCENT_OF_RENTAL',
    defaultDepositValue: '100',
    defaultTaxPercent: '18'
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
  const [selectedPricelistId, setSelectedPricelistId] = useState('pl_1');
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

      if (activeTab === 'pricing') {
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
        // Mock load pricelists
        const stored = localStorage.getItem('vendor_pricelists');
        if (stored) {
          setPricelists(JSON.parse(stored));
        } else {
          setPricelists(SEED_PRICELISTS);
          localStorage.setItem('vendor_pricelists', JSON.stringify(SEED_PRICELISTS));
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
        defaultTaxPercent: parseFloat(pricingPolicy.defaultTaxPercent)
      };
      await settingsService.updateSettings(payload);
      setSuccess('Pricing policies updated successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to save policies settings.');
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
  const handleCreatePricelist = (e) => {
    e.preventDefault();
    if (!newPricelistName.trim()) return;
    const newPl = {
      id: `pl_${Date.now()}`,
      name: newPricelistName.trim(),
      isSelectable: true,
      rules: []
    };
    const updated = [...pricelists, newPl];
    setPricelists(updated);
    localStorage.setItem('vendor_pricelists', JSON.stringify(updated));
    setSelectedPricelistId(newPl.id);
    setNewPricelistName('');
    setSuccess('Pricelist created successfully!');
  };

  const handleAddPriceRule = (e) => {
    e.preventDefault();
    const activePl = pricelists.find(pl => pl.id === selectedPricelistId);
    if (!activePl) return;

    let targetProductName = 'All Products';
    if (ruleForm.productId) {
      const prod = products.find(p => p.id === ruleForm.productId);
      if (prod) targetProductName = prod.name;
    }

    const newRuleObj = {
      id: `pr_${Date.now()}`,
      productId: ruleForm.productId,
      productName: targetProductName,
      priceType: ruleForm.priceType,
      discountPercent: parseFloat(ruleForm.discountPercent || 0),
      fixedPrice: parseFloat(ruleForm.fixedPrice || 0),
      minQty: parseFloat(ruleForm.minQty || 1),
      validFrom: ruleForm.validFrom,
      validTo: ruleForm.validTo,
      isSelectable: ruleForm.isSelectable
    };

    const updatedPls = pricelists.map(pl => {
      if (pl.id === selectedPricelistId) {
        return { ...pl, rules: [...(pl.rules || []), newRuleObj] };
      }
      return pl;
    });

    setPricelists(updatedPls);
    localStorage.setItem('vendor_pricelists', JSON.stringify(updatedPls));
    
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
  };

  const handleDeletePriceRule = (ruleId) => {
    const updatedPls = pricelists.map(pl => {
      if (pl.id === selectedPricelistId) {
        return { ...pl, rules: (pl.rules || []).filter(r => r.id !== ruleId) };
      }
      return pl;
    });
    setPricelists(updatedPls);
    localStorage.setItem('vendor_pricelists', JSON.stringify(updatedPls));
    setSuccess('Pricing rule deleted.');
  };

  const currentPricelist = pricelists.find(pl => pl.id === selectedPricelistId) || pricelists[0];

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Vendor Configuration Hub</h1>
        <p className="text-sm text-slate-400 mt-1">Manage core pricing policies, attributes, templates, and profile settings.</p>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap border-b border-slate-800 bg-slate-950 p-1 rounded-xl self-start gap-1">
        <button
          onClick={() => handleTabChange('pricing')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'pricing' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Pricing & Policy</span>
        </button>
        <button
          onClick={() => handleTabChange('pricelists')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'pricelists' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Pricelists</span>
        </button>
        <button
          onClick={() => handleTabChange('attributes')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'attributes' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Attributes</span>
        </button>
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="h-4 w-4" />
          <span>User Profile</span>
        </button>
        <button
          onClick={() => handleTabChange('password')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'password' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
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
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
          
          {/* TAB 1: Pricing & Policy */}
          {activeTab === 'pricing' && (
            <form onSubmit={handleSavePricing} className="space-y-6">
              <h2 className="text-lg font-bold text-white mb-4">Rental Fee Policies</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Enable Late Returns Penalties</label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setPricingPolicy(prev => ({ ...prev, lateFeeEnabled: !prev.lateFeeEnabled }))}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                        pricingPolicy.lateFeeEnabled ? 'bg-primary' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-all ${
                        pricingPolicy.lateFeeEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                    <span className="text-sm font-semibold text-slate-300">
                      {pricingPolicy.lateFeeEnabled ? 'Penalties Active' : 'No Overdue Penalties'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Default Late Fee ($ / Hour)</label>
                  <input
                    type="number"
                    value={pricingPolicy.defaultLateFeeRatePerHour}
                    onChange={(e) => setPricingPolicy(prev => ({ ...prev, defaultLateFeeRatePerHour: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    value={pricingPolicy.lateFeeGracePeriodMinutes}
                    onChange={(e) => setPricingPolicy(prev => ({ ...prev, lateFeeGracePeriodMinutes: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Default Tax rate (GST %)</label>
                  <input
                    type="number"
                    value={pricingPolicy.defaultTaxPercent}
                    onChange={(e) => setPricingPolicy(prev => ({ ...prev, defaultTaxPercent: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Default Deposit Calculation</label>
                  <select
                    value={pricingPolicy.defaultDepositCalcType}
                    onChange={(e) => setPricingPolicy(prev => ({ ...prev, defaultDepositCalcType: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  >
                    <option value="PERCENT_OF_RENTAL">Percentage of Rent Amount</option>
                    <option value="FIXED">Flat Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Default Deposit Value (% or $)</label>
                  <input
                    type="number"
                    value={pricingPolicy.defaultDepositValue}
                    onChange={(e) => setPricingPolicy(prev => ({ ...prev, defaultDepositValue: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Pricing Configurations</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Pricelists & Rules */}
          {activeTab === 'pricelists' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-sm text-slate-300">
              
              {/* Pricelists sidebar selection */}
              <div className="xl:col-span-1 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs text-slate-450 border-b border-slate-900 pb-2">Pricelists</h3>
                <div className="space-y-1.5">
                  {pricelists.map(pl => (
                    <button
                      key={pl.id}
                      onClick={() => setSelectedPricelistId(pl.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold transition-all border ${
                        selectedPricelistId === pl.id 
                          ? 'bg-slate-900 border-primary text-white font-bold' 
                          : 'bg-transparent border-transparent hover:bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleCreatePricelist} className="pt-4 border-t border-slate-900 space-y-3">
                  <span className="text-xs text-slate-500 uppercase font-bold">New Pricelist</span>
                  <input
                    type="text"
                    required
                    placeholder="Pricelist Name..."
                    value={newPricelistName}
                    onChange={(e) => setNewPricelistName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
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
                    <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                      <h3 className="text-base font-extrabold text-white">{currentPricelist.name} Rules</h3>
                      <span className="text-xs text-slate-500 font-semibold">Active Rules Count: {currentPricelist.rules?.length || 0}</span>
                    </div>

                    <div className="overflow-x-auto bg-slate-900/20 border border-slate-900 rounded-2xl p-4">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase pb-2">
                            <th className="pb-2">Apply On</th>
                            <th className="pb-2 text-center">Min. Qty</th>
                            <th className="pb-2">Validity Limit</th>
                            <th className="pb-2 text-center">Selectable</th>
                            <th className="pb-2 text-right">Price Effect</th>
                            <th className="pb-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {currentPricelist.rules?.map((rule, idx) => (
                            <tr key={idx} className="group">
                              <td className="py-2.5 font-semibold text-slate-200">{rule.productName}</td>
                              <td className="py-2.5 text-center text-slate-300">{rule.minQty}</td>
                              <td className="py-2.5 text-slate-400">
                                {rule.validFrom && rule.validTo ? `${rule.validFrom} to ${rule.validTo}` : 'Lifetime'}
                              </td>
                              <td className="py-2.5 text-center">
                                <span className={`inline-block w-2 h-2 rounded-full ${rule.isSelectable ? 'bg-primary' : 'bg-slate-700'}`} />
                              </td>
                              <td className="py-2.5 text-right font-bold text-white">
                                {rule.priceType === 'DISCOUNT' ? `${rule.discountPercent}% Discount` : `$${rule.fixedPrice?.toFixed(2)} Fixed`}
                              </td>
                              <td className="py-2.5 text-center">
                                <button
                                  onClick={() => handleDeletePriceRule(rule.id)}
                                  className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}

                          {(currentPricelist.rules || []).length === 0 && (
                            <tr>
                              <td colSpan="6" className="py-6 text-center text-slate-550 font-semibold italic">
                                No specific rules added yet. Add a rule to this list on the right.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-slate-500 font-semibold italic border border-dashed border-slate-800 rounded-2xl">
                    Select or create a pricelist first.
                  </div>
                )}
              </div>

              {/* Create Pricelist Rules Form */}
              <div className="xl:col-span-1 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs text-slate-450 border-b border-slate-900 pb-2">Create Rule</h3>
                <form onSubmit={handleAddPriceRule} className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Products</label>
                    <select
                      value={ruleForm.productId}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, productId: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="">All Products</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Price Type</label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setRuleForm(prev => ({ ...prev, priceType: 'DISCOUNT' }))}
                        className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all ${
                          ruleForm.priceType === 'DISCOUNT' 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200'
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
                            : 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Fixed Price
                      </button>
                    </div>
                  </div>

                  {ruleForm.priceType === 'DISCOUNT' ? (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Discount % on Sales price</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={ruleForm.discountPercent}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, discountPercent: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fixed Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={ruleForm.fixedPrice}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, fixedPrice: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Min Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={ruleForm.minQty}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, minQty: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <label className="block uppercase font-bold text-slate-400 mb-1">Valid From</label>
                      <input
                        type="date"
                        value={ruleForm.validFrom}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, validFrom: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block uppercase font-bold text-slate-400 mb-1">Valid To</label>
                      <input
                        type="date"
                        value={ruleForm.validTo}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, validTo: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={ruleForm.isSelectable}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, isSelectable: e.target.checked }))}
                      className="rounded bg-slate-950 border-slate-850 text-primary w-4.5 h-4.5"
                    />
                    <label className="text-[10px] uppercase font-bold text-slate-400">Rule Selectable</label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all"
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
                  <h2 className="text-lg font-bold text-white">Create Product Attributes</h2>
                  <form onSubmit={handleCreateAttribute} className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-850">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Attribute Name (e.g. Brand, Size)</label>
                      <input
                        type="text"
                        value={newAttrName}
                        onChange={(e) => setNewAttrName(e.target.value)}
                        placeholder="Name"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Display Type</label>
                      <select
                        value={newAttrDisplay}
                        onChange={(e) => setNewAttrDisplay(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
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
                  <h2 className="text-lg font-bold text-white">Attribute Values</h2>
                  <form onSubmit={handleAddAttributeValue} className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-850">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Select Attribute</label>
                      <select
                        value={selectedAttrId}
                        onChange={(e) => setSelectedAttrId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                      >
                        <option value="">Choose attribute...</option>
                        {attributes.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">New Value Option Text (e.g. Red, 15-inch)</label>
                      <input
                        type="text"
                        value={newValueInput}
                        onChange={(e) => setNewValueInput(e.target.value)}
                        placeholder="Value Option"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Value Option</span>
                    </button>
                  </form>
                </div>

              </div>

              {/* List of attributes */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white">Existing System Attributes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attributes.map(attr => (
                    <div key={attr.id} className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{attr.name}</span>
                          <span className="text-[10px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded font-bold uppercase">{attr.displayType}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {attr.values?.map(val => (
                            <span key={val.id} className="inline-flex items-center bg-slate-950 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-800 space-x-1.5">
                              <span>{val.value}</span>
                              <button 
                                onClick={() => handleDeleteAttributeValue(attr.id, val.id)}
                                className="text-slate-500 hover:text-rose-400 transition-colors text-[10px]"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteAttribute(attr.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
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
              <h2 className="text-lg font-bold text-white mb-4">Vendor Profile Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.firstName}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.lastName}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Work Email (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={vendorProfile.email}
                    className="w-full bg-slate-900/60 border border-slate-850 rounded-xl p-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Phone</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.phone}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Company Name</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.companyName}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Line of Business</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.companyProductCategory}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, companyProductCategory: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">GST Number</label>
                  <input
                    type="text"
                    required
                    value={vendorProfile.gstNo}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, gstNo: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Current System Role</label>
                  <select
                    value={vendorProfile.role}
                    onChange={(e) => setVendorProfile(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
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
              <h2 className="text-lg font-bold text-white mb-4">Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
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
