import { Filter } from 'lucide-react';

export default function FiltersSidebar({ filters, onFilterChange }) {
  const categories = ['All', 'Heavy Machinery', 'Electronics', 'Vehicles', 'Tools'];

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-24">
        <div className="flex items-center space-x-2 mb-6">
          <Filter className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat}
                  onChange={() => onFilterChange('category', cat)}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300"
                />
                <span className="text-sm text-slate-700">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Max Daily Price</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">$</span>
            <input
              type="number"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
