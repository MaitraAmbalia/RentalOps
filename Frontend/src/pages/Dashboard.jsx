import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Star, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'All', maxPrice: '' });

  const categories = ['All', 'Heavy Machinery', 'Electronics', 'Vehicles', 'Tools'];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts(filters);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
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
                    onChange={() => handleFilterChange('category', cat)}
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
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Catalog */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Available Rentals</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3,4].map(n => (
              <div key={n} className="bg-white rounded-2xl h-80 border border-slate-100 shadow-sm"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500">Try adjusting your filters to find what you need.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all block">
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                    {product.category}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{product.name}</h3>
                  <div className="flex items-center space-x-4 mb-4 text-sm text-slate-500">
                    <span className="flex items-center"><Star className="h-4 w-4 text-amber-400 mr-1" fill="currentColor" /> 4.9</span>
                    <span className="flex items-center"><Clock className="h-4 w-4 mr-1 text-slate-400" /> Available</span>
                  </div>
                  <div className="flex items-end justify-between">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
