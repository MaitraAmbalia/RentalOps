import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Layers, DollarSign, Save, Image as ImageIcon, CheckCircle
} from 'lucide-react';
import { productService } from '../../api/productService';
import { settingsService } from '../../api/settingsService';

const BRAND_OPTIONS = ['Apple', 'Dell', 'Sony', 'Canon', 'Rode', 'Aputure'];
const COLOR_OPTIONS = ['Light Blue', 'Purple', 'Orange', 'Amber'];
const DURATION_OPTIONS = ['1M', '6M', '1Y', '2Y', '3Y'];

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [globalLateFeeEnabled, setGlobalLateFeeEnabled] = useState(true);
  const [defaultPricelist, setDefaultPricelist] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    productDefinition: '',
    type: 'GOODS',
    images: [],
    isPublished: true,
    rentalPrice: '',
    costPrice: '',
    quantityOnHand: '',
    
    periodicity: 'DAY',
    pickupTime: '10:00',
    returnTime: '19:00',
    paddingTimeMinutes: '0',
    lateFeeRatePerHour: '',
    securityDepositCalcType: 'PERCENT_OF_RENTAL',
    securityDepositValue: '',
    brand: '',
    color: '',
    duration: ''
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedAttrValues, setSelectedAttrValues] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [cats, attrs, policy, lists] = await Promise.all([
        settingsService.getCategories().catch(() => []),
        settingsService.getAttributes().catch(() => []),
        settingsService.getSettings().catch(() => ({ lateFeeEnabled: true })),
        settingsService.getPricelists().catch(() => [])
      ]);

      setCategories(Array.isArray(cats) ? cats : []);
      setAttributes(Array.isArray(attrs) ? attrs : []);
      setGlobalLateFeeEnabled(policy.lateFeeEnabled ?? true);

      const priceListArray = Array.isArray(lists) ? lists : [];
      const matched = priceListArray.find(pl => pl.id === policy?.defaultPriceListId) || priceListArray[0];
      setDefaultPricelist(matched || null);

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
            securityDepositValue: prod.securityDepositValue?.toString() || '',
            brand: prod.brand || '',
            color: prod.color || '',
            duration: prod.duration || ''
          });

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

    // Compulsory field validations
    if (!formData.name.trim()) {
      setError('Product Name is compulsory.');
      setActiveTab('general');
      setSaveLoading(false);
      return;
    }

    if (!formData.categoryId) {
      setError('Category selection is compulsory.');
      setActiveTab('general');
      setSaveLoading(false);
      return;
    }

    if (!formData.rentalPrice || parseFloat(formData.rentalPrice) <= 0) {
      setError('Base Sales/Rental Price is compulsory and must be greater than 0.');
      setActiveTab('general');
      setSaveLoading(false);
      return;
    }

    if (formData.quantityOnHand === '' || parseInt(formData.quantityOnHand) < 0) {
      setError('Quantity on Hand is compulsory.');
      setActiveTab('general');
      setSaveLoading(false);
      return;
    }

    if (formData.type === 'GOODS' && (formData.securityDepositValue === '' || parseFloat(formData.securityDepositValue) < 0)) {
      setError('Security Deposit Value is compulsory for rentable items.');
      setActiveTab('sales');
      setSaveLoading(false);
      return;
    }

    if (formData.type === 'GOODS') {
      if (!formData.brand) {
        setError('Brand is compulsory.');
        setActiveTab('general');
        setSaveLoading(false);
        return;
      }
      if (!formData.color) {
        setError('Color is compulsory.');
        setActiveTab('general');
        setSaveLoading(false);
        return;
      }
      if (!formData.duration) {
        setError('Duration is compulsory.');
        setActiveTab('general');
        setSaveLoading(false);
        return;
      }
    }

    try {
      const selectedAttributesList = Object.keys(selectedAttrValues)
        .filter(attrId => selectedAttrValues[attrId])
        .map(attrId => ({ attributeId: attrId }));

      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        productDefinition: formData.productDefinition ? formData.productDefinition.trim() : undefined,
        type: formData.type,
        images: formData.images,
        isPublished: formData.isPublished,
        rentalPrice: parseFloat(formData.rentalPrice),
        costPrice: parseFloat(formData.costPrice || 0),
        quantityOnHand: parseInt(formData.quantityOnHand),
        attributes: selectedAttributesList,
        
        periodicity: formData.periodicity,
        pickupTime: formData.pickupTime || undefined,
        returnTime: formData.returnTime || undefined,
        paddingTimeMinutes: formData.paddingTimeMinutes ? parseInt(formData.paddingTimeMinutes) : undefined,
        lateFeeRatePerHour: formData.lateFeeRatePerHour ? parseFloat(formData.lateFeeRatePerHour) : undefined,
        securityDepositCalcType: formData.securityDepositCalcType,
        securityDepositValue: formData.securityDepositValue ? parseFloat(formData.securityDepositValue) : undefined,

        brand: formData.type === 'GOODS' ? formData.brand : undefined,
        color: formData.type === 'GOODS' ? formData.color : undefined,
        duration: formData.type === 'GOODS' ? formData.duration : undefined
      };

      if (isEditMode) {
        await productService.updateProduct(id, payload);
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
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-text-main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-5">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/vendor/products')}
            className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl hover:bg-bg-main transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-text-main">
              {isEditMode ? `Edit Product: ${formData.name}` : 'Register New Product'}
            </h1>
            <p className="text-sm text-text-muted mt-1">Configure pricing scales, attribute scopes, and deposits.</p>
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
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-sm font-semibold flex items-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex border border-border-main bg-bg-card p-1 rounded-xl self-start">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'general' ? 'bg-bg-main text-text-main border border-border-main shadow-sm' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>General Information</span>
        </button>
        <button
          onClick={() => setActiveTab('attributes')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'attributes' ? 'bg-bg-main text-text-main border border-border-main shadow-sm' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Attributes & Variants</span>
        </button>
        {formData.type === 'GOODS' && (
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'sales' ? 'bg-bg-main text-text-main border border-border-main shadow-sm' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Sales & Rental</span>
          </button>
        )}
      </div>

      <div className="bg-bg-card p-6 rounded-2xl border border-border-main">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                    Product Name <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Computers, Camera Kits..."
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                    Category <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="">Select Category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {formData.type === 'GOODS' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                        Brand <span className="text-rose-500 font-extrabold">*</span>
                      </label>
                      <select
                        name="brand"
                        required
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      >
                        <option value="">Select Brand...</option>
                        {BRAND_OPTIONS.map(br => (
                          <option key={br} value={br}>{br}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                        Color <span className="text-rose-500 font-extrabold">*</span>
                      </label>
                      <select
                        name="color"
                        required
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      >
                        <option value="">Select Color...</option>
                        {COLOR_OPTIONS.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                        Duration <span className="text-rose-500 font-extrabold">*</span>
                      </label>
                      <select
                        name="duration"
                        required
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      >
                        <option value="">Select Duration...</option>
                        {DURATION_OPTIONS.map(dur => (
                          <option key={dur} value={dur}>{dur}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Product Type</label>
                  <div className="flex space-x-4 bg-bg-main p-1.5 rounded-xl border border-border-main">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'GOODS' }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formData.type === 'GOODS' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      Goods (Rentable Item)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'SERVICE' }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formData.type === 'SERVICE' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      Service (Warranty, Deposit, Downpayment)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                      Quantity on Hand <span className="text-rose-500 font-extrabold">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantityOnHand"
                      required
                      value={formData.quantityOnHand}
                      onChange={handleInputChange}
                      className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Cost Price (₹)</label>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                    Base Sales / Daily Rental Price (₹) <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <input
                    type="number"
                    name="rentalPrice"
                    required
                    value={formData.rentalPrice}
                    onChange={handleInputChange}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  
                  <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-primary flex items-center space-x-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Default Price List: {defaultPricelist ? defaultPricelist.name : 'Standard Price List'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate('/vendor/settings?tab=pricelists')}
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        Manage Pricelists ➔
                      </button>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      This new product automatically inherits active rules & quantity discount tiers defined in your vendor default price list.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Publish Status</label>
                  <div className="flex items-center space-x-3 bg-bg-main p-3 rounded-xl border border-border-main">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                        formData.isPublished ? 'bg-primary' : 'bg-border-main'
                      }`}
                    >
                      <div className={`bg-white w-4.5 h-4.5 rounded-full shadow transform transition-all ${
                        formData.isPublished ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                    <div className="text-xs text-text-muted">
                      <span className="font-semibold text-text-main block">
                        {formData.isPublished ? 'Visible to Customers' : 'Draft / Private'}
                      </span>
                      <span>Only Admin holds access permissions to update publication.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Description / Definition</label>
                  <textarea
                    name="productDefinition"
                    rows="4"
                    value={formData.productDefinition}
                    onChange={handleInputChange}
                    placeholder="Describe specific properties of the rentable item..."
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Product Images</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Image URL..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-3 bg-bg-card hover:bg-bg-main text-text-main border border-border-main rounded-xl text-xs font-bold transition-all"
                    >
                      Add URL
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-border-main h-20">
                        <img src={img} alt="Product preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-rose-900/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attributes' && (
          <div className="space-y-6">
            <div className="border-b border-border-main pb-3">
              <h2 className="text-lg font-bold text-text-main">Configurable Attributes & Variants</h2>
              <p className="text-xs text-text-muted mt-1">Check attributes allowed on this product and map potential variant values.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {attributes.map(attr => {
                const isChecked = !!selectedAttrValues[attr.id];
                return (
                  <div key={attr.id} className="bg-bg-main/30 p-4 rounded-xl border border-border-main/70 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleAttributeCheck(attr.id, e.target.checked)}
                        className="rounded bg-bg-card border-border-main text-primary focus:ring-primary w-4.5 h-4.5"
                      />
                      <div>
                        <span className="font-bold text-text-main text-sm">{attr.name}</span>
                        <span className="text-[10px] uppercase font-bold text-text-muted bg-bg-card border border-border-main px-2 py-0.5 rounded ml-2">
                          {attr.displayType}
                        </span>
                      </div>
                    </div>

                    {isChecked && (
                      <div className="flex flex-wrap gap-1.5 pt-2 pl-7 border-l border-border-main">
                        {attr.values?.map(val => (
                          <span key={val.id} className="bg-bg-card text-text-muted text-xs px-2.5 py-1 rounded-lg border border-border-main">
                            {val.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'sales' && formData.type === 'GOODS' && (
          <div className="space-y-6 text-text-muted">
            <h2 className="text-lg font-bold text-text-main mb-4">Rental Scheduling & Deposit Policy</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Periodicity</label>
                  <select
                    name="periodicity"
                    value={formData.periodicity}
                    onChange={handleInputChange}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="HOUR">Hours (Daytime Rental)</option>
                    <option value="DAY">Daily rate per 24 hours</option>
                    <option value="NIGHT">Overnight (Return next day)</option>
                    <option value="WEEK">Weekly rate scale</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Default Pickup Time</label>
                    <input
                      type="text"
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleInputChange}
                      placeholder="10:00 AM"
                      className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Default Return Time</label>
                    <input
                      type="text"
                      name="returnTime"
                      value={formData.returnTime}
                      onChange={handleInputChange}
                      placeholder="19:00 PM"
                      className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Padding Buffer time (Minutes)</label>
                  <input
                    type="number"
                    name="paddingTimeMinutes"
                    value={formData.paddingTimeMinutes}
                    onChange={handleInputChange}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4 bg-bg-main/30 p-5 rounded-xl border border-border-main/70">
                <span className="text-xs text-text-muted uppercase font-bold block mb-2 font-sans">Deposit & Penalty Escrow</span>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Security Deposit Calculation</label>
                  <select
                    name="securityDepositCalcType"
                    value={formData.securityDepositCalcType}
                    onChange={handleInputChange}
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="PERCENT_OF_RENTAL">Percentage of Rent Amount</option>
                    <option value="FIXED">Flat Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                    Security Deposit Value <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <input
                    type="number"
                    name="securityDepositValue"
                    required
                    value={formData.securityDepositValue}
                    onChange={handleInputChange}
                    placeholder="200 for 200% / Flat price"
                    className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {globalLateFeeEnabled ? (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Overdue Penalty rate (₹ / Hour)</label>
                    <input
                      type="number"
                      name="lateFeeRatePerHour"
                      value={formData.lateFeeRatePerHour}
                      onChange={handleInputChange}
                      placeholder="Leave blank to use global default"
                      className="w-full bg-bg-main border border-border-main rounded-xl p-2.5 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-bg-card rounded-lg text-text-muted text-xs border border-border-main font-semibold leading-relaxed">
                    Late return fees are currently deactivated in global configurations.
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
