import type { Metadata } from "next";
import { getCategories, getPublishedProducts } from "@/lib/data/store-server";
import { ShopBrowser } from "@/components/products/shop-browser";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full Local Fashion collection.",
};

export default async function ShopPage() {
  const products = await getPublishedProducts();
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">Everything</p>
      <h1 className="mt-1 font-display text-3xl italic text-ink sm:text-4xl">Shop</h1>
      <div className="mt-8">
        <ShopBrowser products={products} categories={categories} />
      </div>
    </div>
  );
}
