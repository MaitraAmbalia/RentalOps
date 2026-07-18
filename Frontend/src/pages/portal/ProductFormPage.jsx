import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Layers, DollarSign, Save, Image as ImageIcon, Plus, Trash2, CheckCircle
} from 'lucide-react';
import { productService } from '../../api/productService';
import { settingsService } from '../../api/settingsService';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'attributes', 'sales'
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Categories and Attributes lists
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [globalLateFeeEnabled, setGlobalLateFeeEnabled] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    productDefinition: '',
    type: 'GOODS', // 'GOODS' or 'SERVICE'
    images: [],
    isPublished: true,
    rentalPrice: '',
    costPrice: '',
    quantityOnHand: '',
    
    // Rental Settings
    periodicity: 'DAY', // 'HOUR', 'DAY', 'NIGHT', 'WEEK'
    pickupTime: '10:00',
    returnTime: '19:00',
    paddingTimeMinutes: '0',
    lateFeeRatePerHour: '',
    securityDepositCalcType: 'PERCENT_OF_RENTAL',
    securityDepositValue: ''
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  
  // Selected Attribute Values for variation configuring
  const [selectedAttrValues, setSelectedAttrValues] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch categories, attributes, global late fee settings
      const [cats, attrs, policy] = await Promise.all([
        settingsService.getCategories().catch(() => []),
        settingsService.getAttributes().catch(() => []),
        settingsService.getSettings().catch(() => ({ lateFeeEnabled: true }))
      ]);

      setCategories(Array.isArray(cats) ? cats : []);
      setAttributes(Array.isArray(attrs) ? attrs : []);
      setGlobalLateFeeEnabled(policy.lateFeeEnabled ?? true);

      // 2. Fetch product details if in edit mode
      if (isEditMode) {
        const prod = await productService.getProductById(id);
        if (prod) {
          setFormData({
            name: prod.name || '',
            categoryId: prod.categoryId || '',
            productDefinition: prod.productDefinition || '',
            type: prod.type || 'GOODS',
            images: prod.images || [],
            isPublished: prod.isPublished ?? true,
            rentalPrice: prod.rentalPrice?.toString() || '',
            costPrice: prod.costPrice?.toString() || '0',
            quantityOnHand: prod.quantityOnHand?.toString() || '0',
            
            periodicity: prod.periodicity || 'DAY',
            pickupTime: prod.pickupTime || '10:00',
            returnTime: prod.returnTime || '19:00',
            paddingTimeMinutes: prod.paddingTimeMinutes?.toString() || '0',
            lateFeeRatePerHour: prod.lateFeeRatePerHour?.toString() || '',
            securityDepositCalcType: prod.securityDepositCalcType || 'PERCENT_OF_RENTAL',
            securityDepositValue: prod.securityDepositValue?.toString() || ''
          });

          // Map linked variant attributes to selected state
          const initialSelection = {};
          prod.attributes?.forEach(link => {
            initialSelection[link.attributeId] = true;
          });
          setSelectedAttrValues(initialSelection);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch initial form configurations.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()]
      }));
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAttributeCheck = (attrId, checked) => {
    setSelectedAttrValues(prev => ({
      ...prev,
      [attrId]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess('');

    // Form validation
    if (!formData.name.trim()) {
      setError('Product name is required.');
      setSaveLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId || undefined,
        productDefinition: formData.productDefinition || undefined,
        type: formData.type,
        images: formData.images,
        isPublished: formData.isPublished,
        rentalPrice: parseFloat(formData.rentalPrice || 0),
        costPrice: parseFloat(formData.costPrice || 0),
        quantityOnHand: parseInt(formData.quantityOnHand || 0),
        
        periodicity: formData.periodicity,
        pickupTime: formData.pickupTime || undefined,
        returnTime: formData.returnTime || undefined,
        paddingTimeMinutes: formData.paddingTimeMinutes ? parseInt(formData.paddingTimeMinutes) : undefined,
        lateFeeRatePerHour: formData.lateFeeRatePerHour ? parseFloat(formData.lateFeeRatePerHour) : undefined,
        securityDepositCalcType: formData.securityDepositCalcType,
        securityDepositValue: formData.securityDepositValue ? parseFloat(formData.securityDepositValue) : undefined
      };

      if (isEditMode) {
        await productService.createProduct({ id, ...payload }); // Backend uses PATCH /products/:id or similar
        setSuccess('Product configurations updated successfully!');
      } else {
        await productService.createProduct(payload);
        setSuccess('New product registered successfully!');
      }

      setTimeout(() => navigate('/vendor/products'), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving product configuration.');
    } finally {
      setSaveLoading(false);
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/vendor/products')}
            className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {isEditMode ? `Edit Product: ${formData.name}` : 'Register New Product'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">Configure pricing scales, attribute scopes, and deposits.</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saveLoading}
          className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-primary/20"
        >
          <Save className="h-4 w-4" />
          <span>{isEditMode ? 'Update Product' : 'Register Product'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold flex items-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 p-1 rounded-xl self-start">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'general' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>General Information</span>
        </button>
        <button
          onClick={() => setActiveTab('attributes')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'attributes' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Attributes & Variants</span>
        </button>
        {formData.type === 'GOODS' && (
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'sales' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Sales & Rental</span>
          </button>
        )}
      </div>

      {/* Form Content Cards */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
        
        {/* TAB 1: General Info */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Core properties */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Computers, Camera Kits..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="">Select Category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Product Type</label>
                  <div className="flex space-x-4 bg-slate-900 p-1.5 rounded-xl border border-slate-850">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'GOODS' }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formData.type === 'GOODS' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Goods (Rentable Item)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'SERVICE' }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formData.type === 'SERVICE' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Service (Warranty, Deposit, Downpayment)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Quantity on Hand</label>
                    <input
                      type="number"
                      name="quantityOnHand"
                      value={formData.quantityOnHand}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Cost Price ($)</label>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Base Sales Price ($ / Periodicity)</label>
                  <input
                    type="number"
                    name="rentalPrice"
                    required
                    value={formData.rentalPrice}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Publish Status</label>
                  <div className="flex items-center space-x-3 bg-slate-900 p-3 rounded-xl border border-slate-850">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                        formData.isPublished ? 'bg-primary' : 'bg-slate-850'
                      }`}
                    >
                      <div className={`bg-white w-4.5 h-4.5 rounded-full shadow transform transition-all ${
                        formData.isPublished ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                    <div className="text-xs">
                      <span className="font-semibold text-slate-300 block">
                        {formData.isPublished ? 'Visible to Customers' : 'Draft / Private'}
                      </span>
                      <span className="text-slate-500">Only Admin holds access permissions to update publication.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Images and definition */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Description / Definition</label>
                  <textarea
                    name="productDefinition"
                    rows="4"
                    value={formData.productDefinition}
                    onChange={handleInputChange}
                    placeholder="Describe specific properties of the rentable item..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Product Images</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Image URL..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-all"
                    >
                      Add URL
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-800 h-20">
                        <img src={img} alt="Product preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-rose-900/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.images.length === 0 && (
                      <div className="col-span-3 border border-dashed border-slate-800 rounded-lg p-4 text-center text-slate-600 text-xs flex flex-col items-center justify-center space-y-1">
                        <ImageIcon className="h-6 w-6" />
                        <span>No images added yet.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: Attributes & Variants */}
        {activeTab === 'attributes' && (
          <div className="space-y-6">
            <div className="border-b border-slate-900 pb-3">
              <h2 className="text-lg font-bold text-white">Configurable Attributes & Variants</h2>
              <p className="text-xs text-slate-400 mt-1">Check attributes allowed on this product and map potential variant values.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {attributes.map(attr => {
                const isChecked = !!selectedAttrValues[attr.id];
                return (
                  <div key={attr.id} className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleAttributeCheck(attr.id, e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-primary focus:ring-primary w-4.5 h-4.5"
                      />
                      <div>
                        <span className="font-bold text-white text-sm">{attr.name}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded ml-2">
                          {attr.displayType}
                        </span>
                      </div>
                    </div>

                    {isChecked && (
                      <div className="flex flex-wrap gap-1.5 pt-2 pl-7 border-l border-slate-800">
                        {attr.values?.map(val => (
                          <span key={val.id} className="bg-slate-950 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-800">
                            {val.value}
                          </span>
                        ))}
                        {(attr.values || []).length === 0 && (
                          <span className="text-xs text-slate-650 italic">No values configured in settings.</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {attributes.length === 0 && (
                <div className="col-span-2 text-center p-8 bg-slate-900/60 border border-slate-850 text-slate-500 text-xs font-semibold rounded-xl">
                  Go to Settings ➔ Attributes to create configurable options.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Sales / Rental */}
        {activeTab === 'sales' && formData.type === 'GOODS' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white mb-4">Rental Scheduling & Deposit Policy</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Rental periods config */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Periodicity</label>
                  <select
                    name="periodicity"
                    value={formData.periodicity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  >
                    <option value="HOUR">Hours (Daytime Rental)</option>
                    <option value="DAY">Daily rate per 24 hours</option>
                    <option value="NIGHT">Overnight (Return next day)</option>
                    <option value="WEEK">Weekly rate scale</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Default Pickup Time</label>
                    <input
                      type="text"
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleInputChange}
                      placeholder="10:00 AM"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Default Return Time</label>
                    <input
                      type="text"
                      name="returnTime"
                      value={formData.returnTime}
                      onChange={handleInputChange}
                      placeholder="19:00 PM"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Padding Buffer time (Minutes between rentals)</label>
                  <input
                    type="number"
                    name="paddingTimeMinutes"
                    value={formData.paddingTimeMinutes}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>
              </div>

              {/* Fees and Deposits */}
              <div className="space-y-4 bg-slate-900/40 p-5 rounded-xl border border-slate-850">
                <span className="text-xs text-slate-500 uppercase font-bold block mb-2">Deposit & Penalty Escrow</span>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Security Deposit Calculation</label>
                  <select
                    name="securityDepositCalcType"
                    value={formData.securityDepositCalcType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="PERCENT_OF_RENTAL">Percentage of Rent Amount</option>
                    <option value="FIXED">Flat Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Security Deposit Value</label>
                  <input
                    type="number"
                    name="securityDepositValue"
                    value={formData.securityDepositValue}
                    onChange={handleInputChange}
                    placeholder="200 for 200% / Flat price"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                  />
                </div>

                {globalLateFeeEnabled ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Overdue Penalty rate ($ / Hour)</label>
                    <input
                      type="number"
                      name="lateFeeRatePerHour"
                      value={formData.lateFeeRatePerHour}
                      onChange={handleInputChange}
                      placeholder="Leave blank to use global default"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 rounded-lg text-slate-500 text-xs border border-slate-850 font-semibold leading-relaxed">
                    Late return fees are currently deactivated in global configurations. Enable them in Settings ➔ Pricing to override hourly penalties here.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
