import { Filter } from 'lucide-react';

export default function FiltersSidebar({ filters, onFilterChange }) {
  const categories = ['All', 'Cameras', 'Laptops', 'Lighting', 'Audio'];
  const brands = ['Apple', 'Dell', 'Sony', 'Canon', 'Rode', 'Aputure'];
  const colors = [
    { name: 'Light Blue', value: '#38bdf8' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' }
  ];

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

  return (
    <aside className="w-full md:w-68 flex-shrink-0">
      <div 
        style={{ maxHeight: 'calc(100vh - 8rem)' }}
        className="bg-bg-card p-6 rounded-3xl border border-border-main shadow-sm sticky top-24 space-y-6 overflow-y-auto"
      >
        
        {/* Header */}
        <div className="flex items-center space-x-2 border-b border-border-main pb-3">
          <Filter className="h-4.5 w-4.5 text-text-muted" />
          <h2 className="text-base font-extrabold text-text-main">Filters</h2>
        </div>

        {/* Category Radio Group */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Category</h3>
          <div className="space-y-2 text-sm text-text-main">
            {categories.map(cat => (
              <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={(filters.category || 'All') === cat}
                  onChange={() => onFilterChange('category', cat)}
                  className="h-4.5 w-4.5 text-primary focus:ring-primary border-border-main"
                />
                <span className="font-medium text-text-main">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand Checkbox List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Brand</h3>
          <div className="space-y-2 text-sm text-text-main">
            {brands.map(brand => {
              const isChecked = filters.brands?.includes(brand) || false;
              return (
                <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleBrandChange(brand, e.target.checked)}
                    className="h-4.5 w-4.5 rounded text-primary focus:ring-primary border-border-main"
                  />
                  <span className="font-medium text-text-main">{brand}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Color Dot Palette */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Color</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map(col => {
              const isSelected = filters.color === col.name;
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => handleColorChange(col.name)}
                  style={{ backgroundColor: col.value }}
                  className={`w-6 h-6 rounded-full border-2 transition-all transform hover:scale-110 ${
                    isSelected ? 'border-primary ring-2 ring-primary/50 scale-105' : 'border-transparent hover:border-border-main'
                  }`}
                  title={col.name}
                />
              );
            })}
          </div>
        </div>

        {/* Duration Select Dropdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Duration</h3>
          <select
            value={filters.duration || ''}
            onChange={(e) => onFilterChange('duration', e.target.value)}
            className="w-full bg-bg-main border border-border-main rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">All Duration</option>
            <option value="1M">1 Month</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
            <option value="2Y">2 Years</option>
            <option value="3Y">3 Years</option>
          </select>
        </div>

        {/* Price Slider Range */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Price Range</h3>
          <div className="space-y-2">
            <input
              type="range"
              min="13"
              max="10000"
              value={filters.maxPrice || 10000}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              className="w-full h-1 bg-border-main rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between items-center text-[10px] text-text-muted font-semibold">
              <span>₹13</span>
              <span>Max: ₹{filters.maxPrice || 10000}</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
