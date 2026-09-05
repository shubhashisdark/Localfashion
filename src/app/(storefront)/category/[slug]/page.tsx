import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getCategories, getCategoryBySlug, getPublishedProducts } from "@/lib/data/store-server";
import { ShopBrowser } from "@/components/products/shop-browser";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} at Local Fashion.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getPublishedProducts();
  const categories = await getCategories();

  return (
    <div>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-ink-faint transition-colors hover:text-oxblood"
          >
            <ArrowLeft size={14} /> All products
          </Link>
          <div className="mt-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Collection / 01</p>
              <h1 className="mt-3 text-5xl font-semibold tracking-tight text-ink sm:text-7xl">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
                  {category.description}
                </p>
              )}
            </div>
            <p className="flex items-center gap-2 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
              Browse collection <ArrowRight size={14} className="text-oxblood" />
            </p>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ShopBrowser products={products} categories={categories} initialCategorySlug={category.slug} />
      </div>
    </div>
  );
}
