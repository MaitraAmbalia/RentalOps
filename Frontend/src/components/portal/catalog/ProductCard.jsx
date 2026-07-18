import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

export default function ProductCard({ product }) {
  const images = product.images || [];
  const category = product.category?.name || product.category || 'Rental Item';
  const isOutOfStock = product.quantityOnHand === 0 || product.currentStatus === 'IN_MAINTENANCE';
  
  // Render dummy color dots matching variant dots in wireframe
  const variantColors = [
    { name: 'blue', value: '#3b82f6' },
    { name: 'orange', value: '#f97316' }
  ];

  const displayPrice = product.rentalPrice || product.dailyCharge || 0;
  const periodicityLabel = product.periodicity === 'HOUR' ? 'hour' : product.periodicity === 'WEEK' ? 'week' : 'day';

  return (
    <Link 
      to={`/product/${product.id}`} 
      className={`group bg-bg-card rounded-3xl border border-border-main shadow-sm overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full relative ${
        isOutOfStock ? 'opacity-85' : ''
      }`}
    >
      {/* Product Image Area */}
      <div className="aspect-[4/3] bg-bg-main overflow-hidden relative shrink-0">
        {images.length > 0 ? (
          <img 
            src={images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted font-semibold text-xs bg-bg-main">No Image</div>
        )}

        {/* Category tag */}
        <div className="absolute top-3 left-3 bg-bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black text-text-main shadow-sm uppercase tracking-wider">
          {category}
        </div>

        {/* Out of Stock overlay overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Info Card Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base font-extrabold text-text-main line-clamp-1 group-hover:text-blue-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
        </div>

        {/* Dummy Rating and Status */}
        <div className="flex items-center space-x-3 mb-4 text-[11px] text-text-muted font-semibold">
          <span className="flex items-center">
            <Star className="h-3.5 w-3.5 text-amber-400 mr-1" fill="currentColor" /> 
            4.8
          </span>
          <span className="w-1 h-1 rounded-full bg-border-main"></span>
          <span className="flex items-center capitalize">
            <Clock className="h-3.5 w-3.5 mr-1 text-text-muted" /> 
            {product.currentStatus?.toLowerCase() || 'available'}
          </span>
        </div>

        {/* Variant color preview dots (blue and orange sofa indicator details) */}
        <div className="flex items-center space-x-1.5 mb-4">
          {variantColors.map((col, idx) => (
            <span 
              key={idx} 
              style={{ backgroundColor: col.value }}
              className="w-3.5 h-3.5 rounded-full border border-bg-card shadow-sm"
              title={`${col.name} variant`}
            />
          ))}
          <span className="text-[10px] text-text-muted font-bold ml-1">2 Variants</span>
        </div>

        {/* Bottom Price tags and triggers */}
        <div className="mt-auto flex items-end justify-between border-t border-border-main pt-3">
          <div>
            <p className="text-[10px] text-text-muted uppercase font-black tracking-wider mb-0.5">Rental price</p>
            <p className="text-lg font-black text-blue-600">
              ₹{Number(displayPrice).toFixed(2)}
              <span className="text-xs font-semibold text-text-muted"> / per {periodicityLabel}</span>
            </p>
          </div>

          <div className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl group-hover:bg-primary-hover transition-all">
            Rent now
          </div>
        </div>

      </div>
    </Link>
  );
}
