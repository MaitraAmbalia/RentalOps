import ProductCard from './ProductCard';

export default function ProductGrid({ products, initialLoading, isFetching }) {
  if (initialLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div key={n} className="bg-bg-card rounded-3xl h-80 border border-border-main shadow-sm"></div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-bg-card p-12 text-center rounded-3xl border border-border-main shadow-sm">
        <h3 className="text-base font-bold text-text-main mb-1">No products found</h3>
        <p className="text-xs text-text-muted">Try adjusting or clearing your active filters.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
