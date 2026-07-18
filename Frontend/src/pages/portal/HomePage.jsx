import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FiltersSidebar from '../../components/portal/catalog/FiltersSidebar';
import ProductGrid from '../../components/portal/catalog/ProductGrid';
import { productService } from '../../api/productService';
import { authService } from '../../api/authService';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'All', maxPrice: '' });
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
    setLoading(true);
    setError('');
    try {
      const data = await productService.getProducts(filters);
      // Ensure we have an array to render
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <FiltersSidebar filters={filters} onFilterChange={handleFilterChange} />
      
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Available Rentals</h1>
        {error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        ) : null}
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
}
