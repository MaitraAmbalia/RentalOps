import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Trash, RefreshCw, Edit2 
} from 'lucide-react';
import { productService } from '../../api/productService';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const prodsData = await productService.getProducts();
      setProducts(Array.isArray(prodsData) ? prodsData : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load product inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.createProduct({ id, isDeleted: true });
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Product deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">Available</span>;
      case 'RENTED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 border border-blue-500/30 text-blue-400">Rented</span>;
      case 'IN_MAINTENANCE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 border border-rose-500/30 text-rose-400">In Maintenance</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/20 border border-slate-500/30 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Rental Catalog & Inventory</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your rental inventory, pricing plans, and metadata.</p>
        </div>
        <button
          onClick={() => navigate('/vendor/products/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all font-bold text-sm self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Product</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <span>Loading products and categories...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-xl text-center">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-950 p-16 rounded-2xl border border-slate-800 text-center space-y-4">
          <Package className="h-16 w-16 mx-auto text-slate-700" />
          <h2 className="text-xl font-bold text-white">No Products in Catalog</h2>
          <p className="text-slate-500 max-w-sm mx-auto">Get started by creating your first rental item with its specific rental pricing and late fee caps.</p>
          <button
            onClick={() => navigate('/vendor/products/new')}
            className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all font-bold text-sm"
          >
            Create Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6 hover:border-slate-700 transition-all flex flex-col justify-between">
              
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-850 shrink-0 overflow-hidden flex items-center justify-center">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-8 w-8 text-slate-700" />
                  )}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getStatusBadge(p.currentStatus)}
                      {p.isPublished ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary">Published</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-850 border border-slate-800 text-slate-500">Draft</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => navigate(`/vendor/products/${p.id}`)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-855 border border-slate-855 rounded-lg transition-colors"
                        title="Edit product info"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-900 hover:bg-rose-500/10 border border-slate-855 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-extrabold text-white text-base truncate" title={p.name}>{p.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.productDefinition || 'No description provided.'}</p>
                </div>
              </div>

              <div className="bg-slate-900/40 rounded-xl border border-slate-855 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-400">
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Base Rental</span>
                  <span className="font-bold text-slate-200 block">${Number(p.rentalPrice).toLocaleString()} / {p.periodicity}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Cost Price</span>
                  <span className="font-bold text-slate-200 block">${Number(p.costPrice).toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Late Fee</span>
                  <span className="font-bold text-slate-200 block">
                    {p.lateFeeRatePerHour ? `$${p.lateFeeRatePerHour}/Hr` : 'Default Policy'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Deposit Escrow</span>
                  <span className="font-bold text-slate-200 block">
                    {p.securityDepositValue 
                      ? p.securityDepositCalcType === 'PERCENT_OF_RENTAL'
                        ? `${p.securityDepositValue}% of Rental`
                        : `$${p.securityDepositValue}`
                      : 'Default Policy'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-900 pt-4">
                <span>Quantity On Hand: <strong className="text-slate-300 font-bold">{p.quantityOnHand} units</strong></span>
                <span>Category Type: <strong className="text-slate-300 font-bold uppercase">{p.type}</strong></span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
