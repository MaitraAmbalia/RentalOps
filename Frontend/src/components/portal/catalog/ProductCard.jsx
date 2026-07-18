import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

export default function ProductCard({ product }) {
  // Handle case where product might not have some fields yet
  const images = product.images || [];
  const category = product.category?.name || product.category || 'Uncategorized';
  
  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all block flex flex-col h-full">
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative shrink-0">
        {images.length > 0 ? (
          <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
          {category}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center space-x-4 mb-4 text-sm text-slate-500">
          <span className="flex items-center"><Star className="h-4 w-4 text-amber-400 mr-1" fill="currentColor" /> 4.9</span>
          <span className="flex items-center"><Clock className="h-4 w-4 mr-1 text-slate-400" /> {product.currentStatus || 'Available'}</span>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Daily rate</p>
            <p className="text-xl font-bold text-primary">${product.dailyCharge}<span className="text-sm font-normal text-slate-500">/day</span></p>
          </div>
          <div className="bg-slate-50 text-slate-900 text-sm font-medium px-4 py-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
            Book Now
          </div>
        </div>
      </div>
    </Link>
  );
}
