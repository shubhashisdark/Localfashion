import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getPublishedProducts,
  getSimilarProducts,
} from "@/lib/data/store-server";
import { getStoreSettings } from "@/lib/data/store";
import { getDiscountPercent, getEffectivePrice, isProductSoldOut } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductPurchasePanel } from "@/components/products/product-purchase-panel";
import { RelatedProducts } from "@/components/products/related-products";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const price = getEffectivePrice(product);
  const image = product.images.find((i) => i.is_primary)?.image_url;

  return {
    title: product.name,
    description: product.description.slice(0, 155),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: image ? [{ url: image }] : undefined,
    },
    other: {
      "product:price:amount": String(price),
      "product:price:currency": "INR",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const settings = getStoreSettings();
  const similar = await getSimilarProducts(product, 4);
  const soldOut = isProductSoldOut(product);
  const price = getEffectivePrice(product);
  const discount = getDiscountPercent(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.image_url),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price,
      availability: soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- structured data script, not navigation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-[12.5px] text-ink-faint">
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        <ChevronRight size={12} />
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-ink">
              {product.category.name}
            </Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="truncate text-ink-soft">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.category && (
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-1.5 font-display text-3xl italic text-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-xl text-ink">{formatPrice(price)}</span>
            {product.sale_price != null && (
              <>
                <span className="text-[15px] text-ink-faint line-through">
                  {formatPrice(product.price)}
                </span>
                {discount && <Badge tone="sale">{discount}% off</Badge>}
              </>
            )}
            {soldOut && <Badge tone="sold-out">Sold out</Badge>}
          </div>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
            {product.description}
          </p>

          <div className="mt-8 border-t border-line pt-6">
            <ProductPurchasePanel product={product} settings={settings} />
          </div>

          <dl className="mt-8 space-y-1.5 border-t border-line pt-6 text-[13px] text-ink-soft">
            <div className="flex justify-between">
              <dt>Category</dt>
              <dd className="text-ink">{product.category?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Availability</dt>
              <dd className="text-ink">{soldOut ? "Sold out" : "In stock"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <RelatedProducts products={similar} />
    </div>
  );
}
