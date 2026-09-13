import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FiltersSidebar from '../../components/portal/catalog/FiltersSidebar';
import ProductGrid from '../../components/portal/catalog/ProductGrid';
import { productService } from '../../api/productService';
import { authService } from '../../api/authService';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [filters, setFilters] = useState({ category: 'All', brands: [], maxPrice: '', color: '', duration: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await authService.getCurrentUser();
        if (res && res.type === 'VENDOR') {
          navigate('/vendor/dashboard');
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkRole();
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setIsFetching(true);
    setError('');
    try {
      const data = await productService.getProducts(filters);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ category: 'All', brands: [], maxPrice: '', color: '', duration: '' });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <FiltersSidebar 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onResetFilters={handleResetFilters} 
      />
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-main">Available Rentals</h1>
          <span className="text-xs font-semibold text-text-muted bg-bg-card border border-border-main px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
            {isFetching && (
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            )}
            <span>{products.length} {products.length === 1 ? 'item' : 'items'} found</span>
          </span>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        ) : null}

        <ProductGrid 
          products={products} 
          initialLoading={initialLoading} 
          isFetching={isFetching} 
        />
      </div>
    </div>
  );
}
