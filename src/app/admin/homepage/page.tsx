"use client";

import { useAdminData } from "@/lib/admin/admin-data-context";
import Link from "next/link";

export default function AdminHomepagePage() {
  const { products, upsertProduct, categories, setCategoryStatus } = useAdminData();

  function toggleFeatured(id: string) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    upsertProduct({ ...product, featured: !product.featured });
  }

  return (
    <div>
      <h1 className="font-display text-2xl italic text-ink">Homepage</h1>
      <p className="mt-1 max-w-lg text-[13.5px] text-ink-soft">
        Featured products appear in the homepage &quot;Featured pieces&quot; row.
        The hero banner and promotions are managed separately, in{" "}
        <Link href="/admin/promotions" className="underline underline-offset-2">Promotions</Link>.
      </p>

      <section className="mt-8">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Featured products</p>
        <div className="mt-3 divide-y divide-line-soft border border-line bg-surface">
          {products.filter((p) => p.status === "published").map((p) => (
            <label key={p.id} className="flex items-center justify-between px-4 py-3 text-[13.5px]">
              <span className="text-ink">{p.name}</span>
              <input
                type="checkbox"
                checked={p.featured}
                onChange={() => toggleFeatured(p.id)}
                className="h-4 w-4 accent-oxblood"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">
          Categories shown on homepage
        </p>
        <div className="mt-3 divide-y divide-line-soft border border-line bg-surface">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center justify-between px-4 py-3 text-[13.5px]">
              <span className="text-ink">{c.name}</span>
              <input
                type="checkbox"
                checked={c.status === "active"}
                onChange={() => setCategoryStatus(c.id, c.status === "active" ? "hidden" : "active")}
                className="h-4 w-4 accent-oxblood"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
