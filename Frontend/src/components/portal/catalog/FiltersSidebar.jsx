import { useState, useEffect, useRef } from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';

export default function FiltersSidebar({ filters, onFilterChange, onResetFilters }) {
  const categories = ['All', 'Cameras', 'Laptops', 'Lighting', 'Audio', 'Drones & Gimbals'];
  const brands = ['Sony', 'Canon', 'Apple', 'Dell', 'DJI', 'Rode', 'Aputure', 'Fujifilm', 'Shure', 'Sennheiser'];
  const colors = [
    { name: 'Light Blue', value: '#38bdf8' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' }
  ];

  // Local state for price range to enable smooth dragging without page refresh/flicker
  const [localPrice, setLocalPrice] = useState(filters.maxPrice || 4000);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalPrice(filters.maxPrice || 4000);
  }, [filters.maxPrice]);

  const handlePriceChange = (e) => {
    const val = e.target.value;
    setLocalPrice(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onFilterChange('maxPrice', val);
    }, 250);
  };

  const handlePriceMouseUp = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onFilterChange('maxPrice', localPrice);
  };

  const handleBrandChange = (brand, checked) => {
    const activeBrands = filters.brands ? [...filters.brands] : [];
    if (checked) {
      activeBrands.push(brand);
    } else {
      const idx = activeBrands.indexOf(brand);
      if (idx > -1) activeBrands.splice(idx, 1);
    }
    onFilterChange('brands', activeBrands);
  };

  const handleColorChange = (colorName) => {
    onFilterChange('color', filters.color === colorName ? '' : colorName);
  };

  const isAnyFilterActive = 
    (filters.category && filters.category !== 'All') ||
    (filters.brands && filters.brands.length > 0) ||
    Boolean(filters.maxPrice) ||
    Boolean(filters.color) ||
    Boolean(filters.duration);

  return (
    <aside className="w-full md:w-68 flex-shrink-0">
      <div 
        style={{ maxHeight: 'calc(100vh - 8rem)' }}
        className="bg-bg-card p-6 rounded-3xl border border-border-main shadow-sm sticky top-24 space-y-6 overflow-y-auto"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-main pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <h2 className="text-sm font-bold text-text-main">Filters</h2>
          </div>
          {isAnyFilterActive && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-semibold text-primary hover:text-primary-hover flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Category Radio Group */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Category</h3>
          <div className="space-y-2 text-xs text-text-main">
            {categories.map(cat => (
              <label key={cat} className="flex items-center space-x-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={(filters.category || 'All') === cat}
                  onChange={() => onFilterChange('category', cat)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border-main cursor-pointer"
                />
                <span className={`transition-colors ${(filters.category || 'All') === cat ? 'font-bold text-primary' : 'text-text-main group-hover:text-primary'}`}>
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand Checkbox List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Brand</h3>
          <div className="space-y-2 text-xs text-text-main">
            {brands.map(brand => {
              const isChecked = filters.brands?.includes(brand) || false;
              return (
                <label key={brand} className="flex items-center space-x-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleBrandChange(brand, e.target.checked)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary border-border-main cursor-pointer"
                  />
                  <span className={`transition-colors ${isChecked ? 'font-bold text-primary' : 'text-text-main group-hover:text-primary'}`}>
                    {brand}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Color Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Color</h3>
            {filters.color && (
              <button
                type="button"
                onClick={() => onFilterChange('color', '')}
                className="text-[10px] text-primary hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            {colors.map(col => {
              const isSelected = filters.color === col.name;
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => handleColorChange(col.name)}
                  style={{ backgroundColor: col.value }}
                  className={`w-7 h-7 rounded-full border-2 transition-all transform flex items-center justify-center cursor-pointer ${
                    isSelected 
                      ? 'border-primary ring-2 ring-primary/40 scale-110 shadow-sm' 
                      : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  title={`${col.name} ${isSelected ? '(Selected)' : ''}`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-white drop-shadow-sm" />}
                </button>
              );
            })}
          </div>
          {filters.color && (
            <p className="text-[11px] font-semibold text-text-muted mt-2 flex items-center gap-1.5">
              <span>Filtered by:</span>
              <span className="font-bold text-text-main">{filters.color}</span>
            </p>
          )}
        </div>

        {/* Duration Select Dropdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Duration</h3>
          <select
            value={filters.duration || ''}
            onChange={(e) => onFilterChange('duration', e.target.value)}
            className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">All Durations</option>
            <option value="1M">1 Month</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
            <option value="2Y">2 Years</option>
            <option value="3Y">3 Years</option>
          </select>
        </div>

        {/* Price Slider Range (Smooth & Debounced) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Price Range</h3>
            {filters.maxPrice && (
              <button
                type="button"
                onClick={() => onFilterChange('maxPrice', '')}
                className="text-[10px] text-primary hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="200"
              max="4000"
              step="50"
              value={localPrice}
              onChange={handlePriceChange}
              onMouseUp={handlePriceCommit}
              onTouchEnd={handlePriceCommit}
              className="w-full h-1.5 bg-border-main rounded-lg appearance-none cursor-pointer accent-primary transition-all"
            />
            <div className="flex justify-between items-center text-[11px] text-text-muted font-medium">
              <span>₹200</span>
              <span className="font-bold text-text-main">
                {filters.maxPrice || localPrice < 4000 ? `Up to ₹${localPrice}` : 'Up to ₹4,000+'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
