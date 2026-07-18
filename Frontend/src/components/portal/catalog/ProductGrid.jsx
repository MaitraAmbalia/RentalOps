import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div key={n} className="bg-white rounded-2xl h-80 border border-slate-100 shadow-sm"></div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-2">No products found</h3>
        <p className="text-slate-500">Try adjusting your filters to find what you need.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
