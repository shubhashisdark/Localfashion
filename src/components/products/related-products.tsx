import type { Product } from "@/types";
import { ProductCard } from "@/components/products/product-card";

export function RelatedProducts({
  products,
  title = "You may also like",
}: {
  products: Product[];
  title?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-line py-12">
      <h2 className="font-display text-2xl italic text-ink sm:text-3xl">{title}</h2>
      <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto sm:grid sm:grid-cols-4 sm:overflow-visible">
        {products.map((p) => (
          <div key={p.id} className="w-40 shrink-0 sm:w-auto">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
