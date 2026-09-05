import type { Product } from "@/types";
import { ProductCard } from "@/components/products/product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <p className="font-display text-xl italic text-ink">No products found.</p>
        <p className="text-sm text-ink-soft">Try a different search or filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
