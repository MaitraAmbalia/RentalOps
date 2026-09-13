import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Shield, ShieldCheck, Clock, Info, CheckCircle2, Heart, ShoppingCart, X, FileText, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { productService } from '../../api/productService';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../api/endpoints';
import { calculateProductDeposit } from '../../utils/depositHelper';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, isWishlisted } = useCart();
  const { success } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date Helpers
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const addDaysStr = (dateStr, numDays = 1) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + numDays);
    return d.toISOString().split('T')[0];
  };

  // Rental Picker State
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(addDaysStr(getTodayStr(), 1));
  const [quantity, setQuantity] = useState(1);
  const [dateError, setDateError] = useState('');

  // Variant Modal State
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleStartDateChange = (val) => {
    const today = getTodayStr();
    const cleanStart = val < today ? today : val;
    setStartDate(cleanStart);
    setDateError('');

    // Automatically push end date forward if start date is on or after current end date
    if (cleanStart >= endDate) {
      setEndDate(addDaysStr(cleanStart, 1));
    }
  };

  const handleEndDateChange = (val) => {
    const minEnd = addDaysStr(startDate, 1);
    if (val <= startDate) {
      setEndDate(minEnd);
      setDateError('Return date must be after pickup date.');
    } else {
      setEndDate(val);
      setDateError('');
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await productService.getProductById(id);
      setProduct(data);
      
      if (data.attributes?.length > 0) {
        const initial = {};
        data.attributes.forEach(attr => {
          if (attr.values?.length > 0) {
            initial[attr.id] = attr.values[0].value;
          }
        });
        setSelectedVariants(initial);
      }
    } catch (err) {
      console.error(err);
      setError('Product details could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 1;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const days = calculateDays();
  const basePrice = product ? product.rentalPrice || product.dailyCharge || 0 : 0;
  const totalPrice = basePrice * quantity * days;
  const securityDeposit = calculateProductDeposit(product, basePrice);

  const handleWishlistToggle = () => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCartClick = () => {
    const today = getTodayStr();
    if (startDate < today) {
      setDateError('Pickup date cannot be in the past.');
      return;
    }
    if (endDate <= startDate) {
      setDateError('Return date must be after pickup date.');
      return;
    }
    if (product.attributes?.length > 0) {
      setVariantModalOpen(true);
    } else {
      finalizeAddToCart();
    }
  };

  const finalizeAddToCart = () => {
    addToCart(product, quantity, selectedVariants, startDate, endDate);
    setVariantModalOpen(false);
    success('Product added to shopping cart!');
    navigate('/cart');
  };

  const handleRfqClick = () => {
    navigate('/orders', {
      state: {
        openRfq: true,
        categoryId: product.categoryId,
        rfqQuantity: quantity,
        rfqRentalStart: startDate,
        rfqRentalEnd: endDate,
        rfqDescription: `Custom request based on product: ${product.name}`
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 text-slate-500 font-bold space-y-4">
        <p>{error || 'Product not found.'}</p>
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">Return to dashboard</button>
      </div>
    );
  }

  const isOutOfStock = product.quantityOnHand === 0;
  const periodicityLabel = product.periodicity === 'HOUR' ? 'hour' : product.periodicity === 'WEEK' ? 'week' : 'day';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" /> 
        <span>Back to Catalog</span>
      </button>

      {/* Detail Layout Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Product Image Display */}
        <div className="bg-slate-50 p-8 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100 min-h-[350px]">
          {product.images?.length > 0 ? (
            <img 
              src={getImageUrl(product.images[0])} 
              alt={product.name} 
              className="max-h-[350px] w-full object-contain rounded-2xl" 
            />
          ) : (
            <Package className="h-28 w-28 text-slate-300" />
          )}

          {isOutOfStock && (
            <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
              Out of stock
            </span>
          )}
        </div>

        <div className="p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-xs font-black text-primary uppercase tracking-widest block">
                  {product.category?.name || 'Catalog Item'}
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{product.name}</h1>
              </div>

              <button
                onClick={handleWishlistToggle}
                className={`p-2.5 rounded-full border transition-all ${
                  isWishlisted(product.id)
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className="h-5 w-5" fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              {product.productDefinition || 'No detailed specifications entered for this equipment catalog index.'}
            </p>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px] mb-0.5">Pickup Hours</span>
                <span className="font-extrabold text-slate-900">{product.pickupTime || '10:00 AM'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block uppercase tracking-wider text-[10px] mb-0.5">Return Deadline</span>
                <span className="font-extrabold text-slate-900">{product.returnTime || '07:00 PM'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 font-bold block mb-1">Periodicity Price</span>
                <span className="font-black text-slate-900 text-sm">₹{basePrice} / {periodicityLabel}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 font-bold block mb-1">Overdue Penalty</span>
                <span className="font-black text-slate-900 text-sm">
                  {product.lateFeeRatePerHour ? `₹${product.lateFeeRatePerHour}/Hr` : 'Grace Defaults'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-primary" />
                  <span>Pickup Date</span>
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  min={getTodayStr()}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-primary transition-all cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-primary" />
                  <span>Return Date</span>
                </label>
                <input 
                  type="date" 
                  value={endDate}
                  min={addDaysStr(startDate, 1)}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-primary transition-all cursor-pointer"
                />
              </div>
            </div>

            {dateError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl text-center">
                {dateError}
              </div>
            )}

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Order Quantity</span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-slate-800 rounded-lg transition-colors"
                >
                  -
                </button>
                <span className="font-bold text-slate-900 w-6 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-slate-800 rounded-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 py-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">Duration Scheduled:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">{days} {days === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-600">Refundable Security Deposit:</span>
                <span className="font-bold text-slate-900">₹{(securityDeposit * quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-100 pt-2 font-black text-slate-900">
                <span>Total Payable:</span>
                <span className="text-primary text-base">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Psychological Reassurance / Escrow Trust Card */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-xs">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900 block">100% Refundable Security Deposit</span>
                <span className="text-[11px] text-emerald-700 leading-snug block mt-0.5">
                  Deposits are held safely in escrow and automatically credited back to your original payment method within 24 hours of return inspection.
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCartClick}
              disabled={isOutOfStock}
              className={`w-full py-3.5 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md ${
                isOutOfStock 
                  ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                  : 'bg-primary hover:bg-primary-hover shadow-primary/20 hover:scale-[1.01]'
              }`}
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              <span>Rent Now</span>
            </button>

            <button
              onClick={handleRfqClick}
              className="w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <FileText className="h-4.5 w-4.5" />
              <span>Request Custom Quote (RFQ)</span>
            </button>
          </div>
        </div>
      </div>

      {variantModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-base font-extrabold text-slate-900">Configure Product Options</span>
              <button onClick={() => setVariantModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {product.attributes?.map(attr => (
                <div key={attr.id} className="space-y-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{attr.name}</span>
                  <div className="flex flex-wrap gap-2">
                    {attr.values?.map(val => {
                      const isSelected = selectedVariants[attr.id] === val.value;
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [attr.id]: val.value }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            isSelected
                              ? 'bg-primary border-primary text-white font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {val.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 flex space-x-2">
              <button
                onClick={() => setVariantModalOpen(false)}
                className="flex-1 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={finalizeAddToCart}
                className="flex-1 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all"
              >
                Configure & Add
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
