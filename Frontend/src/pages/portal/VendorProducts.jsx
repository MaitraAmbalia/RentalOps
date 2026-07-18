import { useState, useEffect } from 'react';
import { 
  Package, Plus, DollarSign, Layers, Eye, ShieldAlert, CheckCircle, 
  HelpCircle, Trash, RefreshCw, X, Image as ImageIcon, ToggleLeft, ToggleRight
} from 'lucide-react';
import { productService } from '../../api/productService';

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  
  // New Product Form State
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
    pickupTime: '',
    returnTime: '',
    paddingTimeMinutes: '',
    lateFeeRatePerHour: '',
    securityDepositCalcType: 'PERCENT_OF_RENTAL',
    securityDepositValue: '',
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodsData, catsData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);
      setProducts(Array.isArray(prodsData) ? prodsData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load products and categories. Please try again.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    // Prepare body matching Zod schema in backend
    const body = {
      name: formData.name,
      categoryId: formData.categoryId || undefined,
      productDefinition: formData.productDefinition || undefined,
      type: formData.type,
      images: formData.images.length > 0 ? formData.images : undefined,
      isPublished: formData.isPublished,
      rentalPrice: parseFloat(formData.rentalPrice),
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
      quantityOnHand: formData.quantityOnHand ? parseInt(formData.quantityOnHand) : 0,
      periodicity: formData.periodicity,
      pickupTime: formData.pickupTime || undefined,
      returnTime: formData.returnTime || undefined,
      paddingTimeMinutes: formData.paddingTimeMinutes ? parseInt(formData.paddingTimeMinutes) : undefined,
      lateFeeRatePerHour: formData.lateFeeRatePerHour ? parseFloat(formData.lateFeeRatePerHour) : undefined,
      securityDepositCalcType: formData.securityDepositCalcType || undefined,
      securityDepositValue: formData.securityDepositValue ? parseFloat(formData.securityDepositValue) : undefined,
    };

    try {
      const newProduct = await productService.createProduct(body);
      setProducts(prev => [newProduct, ...prev]);
      
      // Reset state and close modal
      setIsModalOpen(false);
      setFormData({
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
        pickupTime: '',
        returnTime: '',
        paddingTimeMinutes: '',
        lateFeeRatePerHour: '',
        securityDepositCalcType: 'PERCENT_OF_RENTAL',
        securityDepositValue: '',
      });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        setModalError(err.response.data.errors[firstErrorKey][0]);
      } else {
        setModalError(err.response?.data?.message || 'Failed to create product. Please verify fields.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">Available</span>;
      case 'RENTED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 border border-blue-500/30 text-blue-400">Rented</span>;
      case 'IN_MAINTENANCE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 border border-rose-500/30 text-rose-400">In Maintenance</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/20 border border-slate-500/30 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Rental Catalog</h1>
          <p className="text-slate-400 mt-1">Manage your rental inventory and detailed fee structures.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all font-bold text-sm self-start sm:self-auto hover:scale-[1.02]"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Main product display grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <span>Loading products and categories...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500 text-red-200 p-4 rounded-xl text-center">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-950 p-16 rounded-2xl border border-slate-800 text-center space-y-4">
          <Package className="h-16 w-16 mx-auto text-slate-700" />
          <h2 className="text-xl font-bold text-white">No Products in Catalog</h2>
          <p className="text-slate-500 max-w-sm mx-auto">Get started by creating your first rental item with its specific rental pricing and late fee caps.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all font-bold text-sm"
          >
            Create Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6 hover:border-slate-700 transition-all flex flex-col justify-between">
              {/* Product Top info */}
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-slate-900 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-8 w-8 text-slate-700" />
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(p.currentStatus)}
                    {p.isPublished ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 border border-primary/30 text-primary">Published</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-500">Draft</span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-white text-base truncate" title={p.name}>{p.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.productDefinition || 'No description provided.'}</p>
                  <span className="inline-block text-[11px] text-slate-400 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded font-medium mt-1">
                    {p.category?.name || 'Uncategorized'}
                  </span>
                </div>
              </div>

              {/* Fee Structure Details */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-850 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Base Rental</span>
                  <span className="font-bold text-white block">₹{Number(p.rentalPrice).toLocaleString()} / {p.periodicity}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Cost Price</span>
                  <span className="font-bold text-white block">₹{Number(p.costPrice).toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Late Fee</span>
                  <span className="font-bold text-white block">
                    {p.lateFeeRatePerHour ? `₹${p.lateFeeRatePerHour}/Hr` : 'Default Settings'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Security Deposit</span>
                  <span className="font-bold text-white block">
                    {p.securityDepositValue 
                      ? p.securityDepositCalcType === 'PERCENT_OF_RENTAL'
                        ? `${p.securityDepositValue}% of Rent`
                        : `₹${p.securityDepositValue}`
                      : 'Default Settings'}
                  </span>
                </div>
              </div>

              {/* Inventory Info */}
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-900 pt-4">
                <span>Quantity On Hand: <strong className="text-slate-300 font-bold">{p.quantityOnHand} units</strong></span>
                <span>Type: <strong className="text-slate-300 font-bold uppercase">{p.type}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product sliding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-white">Add New Product</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-slate-300">
              {modalError && (
                <div className="bg-red-500/10 border border-red-500 text-red-200 p-4 rounded-xl">
                  {modalError}
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                    placeholder="e.g. DSLR Camera Body"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select a Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Description</label>
                <textarea
                  name="productDefinition"
                  rows={2}
                  value={formData.productDefinition}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all resize-none"
                  placeholder="Detail variants, condition inspection notes, accessories included..."
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Rental Price (Base)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">₹</span>
                    <input
                      type="number"
                      name="rentalPrice"
                      required
                      min="0"
                      step="any"
                      value={formData.rentalPrice}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                      placeholder="500"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost Price</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">₹</span>
                    <input
                      type="number"
                      name="costPrice"
                      min="0"
                      step="any"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                      placeholder="20000"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantity On Hand</label>
                  <input
                    type="number"
                    name="quantityOnHand"
                    min="0"
                    value={formData.quantityOnHand}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Rental Term Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Periodicity</label>
                  <select
                    name="periodicity"
                    value={formData.periodicity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="HOUR">Hourly</option>
                    <option value="DAY">Daily</option>
                    <option value="NIGHT">Overnight (Night)</option>
                    <option value="WEEK">Weekly</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Late Fee (₹/Hr)</label>
                  <input
                    type="number"
                    name="lateFeeRatePerHour"
                    min="0"
                    step="any"
                    value={formData.lateFeeRatePerHour}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all"
                    placeholder="Override default (e.g. 150)"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="GOODS">GOODS (Rentable Product)</option>
                    <option value="SERVICE">SERVICE (Service line)</option>
                  </select>
                </div>
              </div>

              {/* Security Deposit Config */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Security Deposit override</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Deposit Calculation Type</label>
                    <select
                      name="securityDepositCalcType"
                      value={formData.securityDepositCalcType}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none cursor-pointer"
                    >
                      <option value="PERCENT_OF_RENTAL">Percentage of Rental Price</option>
                      <option value="FIXED">Fixed Amount (INR)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Deposit Value (Amount / %)</label>
                    <input
                      type="number"
                      name="securityDepositValue"
                      min="0"
                      step="any"
                      value={formData.securityDepositValue}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none"
                      placeholder="e.g. 50 (for 50%) or 1000"
                    />
                  </div>
                </div>
              </div>

              {/* Images list Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Images</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="Paste image URL (Unsplash or direct link)"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Add Image
                  </button>
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative w-full h-16 rounded-lg border border-slate-850 overflow-hidden bg-slate-900 group">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-red-650/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-lg"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Publication toggle */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <div className="space-y-0.5">
                  <span className="block text-sm font-bold text-white">Publish Immediately</span>
                  <span className="block text-xs text-slate-500">Make this product visible in the public client catalog.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                  className="text-slate-400 focus:outline-none"
                >
                  {formData.isPublished ? (
                    <ToggleRight className="h-10 w-10 text-primary cursor-pointer" />
                  ) : (
                    <ToggleLeft className="h-10 w-10 text-slate-650 cursor-pointer" />
                  )}
                </button>
              </div>

              {/* Form Actions */}
              <div className="border-t border-slate-800 pt-6 flex justify-end space-x-3 bg-slate-905">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-bold transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all text-xs flex items-center space-x-2"
                >
                  {modalLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{modalLoading ? 'Creating...' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
