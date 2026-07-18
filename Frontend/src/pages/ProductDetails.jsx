import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Shield, Clock, Info, CheckCircle2 } from 'lucide-react';
import { differenceInDays, parseISO, startOfDay, addDays } from 'date-fns';
import { api } from '../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(tomorrow.toISOString().split('T')[0]);
  
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await api.getProductById(id);
      setProduct(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pricing
  let days = 0;
  if (startDate && endDate) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    days = differenceInDays(end, start);
    if (days < 1) days = 1; // minimum 1 day rental
  }

  const rentalPrice = product ? days * product.dailyCharge : 0;
  
  const handleProceedToCheckout = () => {
    // Navigate to checkout passing the booking state
    navigate('/checkout', { 
      state: { 
        product, 
        startDate, 
        endDate, 
        days, 
        rentalPrice 
      } 
    });
  };

  if (loading) {
    return <div className="animate-pulse bg-white p-8 rounded-2xl h-96 shadow-sm border border-slate-100"></div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-slate-500">Product not found.</div>;
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Catalog
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Images Section */}
          <div className="bg-slate-50 p-6 lg:p-12 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 relative">
            <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow-sm border border-white flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> {product.currentStatus}
            </div>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-2xl shadow-slate-200/50" />
            ) : (
              <div className="w-full h-96 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400">No Image</div>
            )}
          </div>

          {/* Details & Booking Widget */}
          <div className="p-6 lg:p-12 flex flex-col h-full">
            <div className="flex-1">
              <div className="flex items-center space-x-2 text-sm font-medium text-primary mb-3">
                <span>{product.category}</span>
                <span>•</span>
                <span className="flex items-center text-slate-500"><Star className="h-4 w-4 text-amber-400 mr-1" fill="currentColor" /> 4.9 (128 reviews)</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">{product.name}</h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">{product.productDefinition}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center text-slate-500 mb-1">
                    <Shield className="h-4 w-4 mr-2" /> <span className="text-sm font-medium">Base Price</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">${product.basePrice}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center text-slate-500 mb-1">
                    <Clock className="h-4 w-4 mr-2" /> <span className="text-sm font-medium">Overdue Charge</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">${product.overdueCharge}<span className="text-sm font-normal text-slate-500">/day</span></p>
                </div>
              </div>

              {/* Specs checklist demo */}
              <div className="space-y-3 mb-10">
                <h3 className="font-semibold text-slate-900 flex items-center"><Info className="h-4 w-4 mr-2 text-slate-400"/> Included in rental</h3>
                <ul className="grid grid-cols-2 gap-2">
                  <li className="flex items-center text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 mr-2 text-primary"/> Comprehensive Insurance</li>
                  <li className="flex items-center text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 mr-2 text-primary"/> Support 24/7</li>
                  <li className="flex items-center text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 mr-2 text-primary"/> Maintenance checks</li>
                </ul>
              </div>
            </div>

            {/* Booking Widget (Sticky at bottom on small screens, normal flow on lg) */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xl shadow-slate-200/50 mt-auto">
              <div className="flex items-end justify-between mb-6 pb-6 border-b border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Daily Rental Rate</p>
                  <p className="text-3xl font-extrabold text-primary">${product.dailyCharge}<span className="text-lg font-medium text-slate-400">/day</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Pick-up Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={today.toISOString().split('T')[0]}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Return Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Total duration</span>
                <span className="text-sm font-bold text-slate-900">{days} {days === 1 ? 'day' : 'days'}</span>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-base font-bold text-slate-900">Total Rental Price</span>
                <span className="text-2xl font-extrabold text-slate-900">${rentalPrice}</span>
              </div>

              <button 
                onClick={handleProceedToCheckout}
                className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/20 transition-all shadow-lg shadow-slate-900/20"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
