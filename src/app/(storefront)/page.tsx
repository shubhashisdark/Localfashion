import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/icons";
import {
  getActivePromotions,
  getCategories,
  getFeaturedProducts,
  getPublishedProducts,
} from "@/lib/data/store-server";
import { getStoreSettings } from "@/lib/data/store";
import { PromotionCarousel } from "@/components/promotions/promotion-carousel";
import { ProductGrid } from "@/components/products/product-grid";
import { CategoryCard } from "@/components/products/category-card";
import { LinkButton } from "@/components/ui/button";

export default async function HomePage() {
  const promotions = await getActivePromotions();
  const featured = await getFeaturedProducts(8);
  const categories = await getCategories();
  const settings = getStoreSettings();
  const newest = (await getPublishedProducts()).slice(0, 4);
  const heroImage = featured[0]?.images.find((image) => image.is_primary)?.image_url;
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
    `Hi ${settings.store_name}, I would like to see your latest collection.`
  )}`;

  return (
    <div>
      {promotions.length > 0 && <PromotionCarousel promotions={promotions} />}
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10 bg-surface">
          {heroImage && (
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#100f12_8%,rgba(16,15,18,0.9)_48%,rgba(16,15,18,0.42))]" />
        </div>
        <div className="mx-auto flex min-h-[30rem] max-w-7xl items-end px-4 pb-10 pt-28 sm:px-6 lg:min-h-[36rem] lg:px-8 lg:pb-14">
          <div className="flex w-full flex-col items-start gap-5 animate-fade-up sm:flex-row sm:items-end sm:justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-clay">Local Fashion / New season</p>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <LinkButton href="/shop" size="lg">Shop now <ArrowRight size={15} /></LinkButton>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-linen/50 px-5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-linen"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">Handpicked</p>
            <h2 className="mt-1 font-display text-2xl italic text-ink sm:text-3xl">
              Featured pieces
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-[13px] text-ink-soft hover:text-oxblood sm:flex"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={featured} />
        <div className="mt-8 flex justify-center sm:hidden">
          <LinkButton href="/shop" variant="outline">Shop all products</LinkButton>
        </div>
      </section>

      {/* Categories rail */}
      <section className="border-y border-line bg-surface/60 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">Browse by</p>
          <h2 className="mt-1 font-display text-2xl italic text-ink sm:text-3xl">Category</h2>
          <div className="no-scrollbar mt-7 flex gap-4 overflow-x-auto sm:grid sm:grid-cols-5 sm:overflow-visible">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Selected collection */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">Just in</p>
            <h2 className="mt-1 font-display text-2xl italic text-ink sm:text-3xl">
              New this week
            </h2>
          </div>
        </div>
        <ProductGrid products={newest} />
      </section>

      {/* Instagram */}
      <section className="border-y border-line bg-ink py-16 text-linen">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <InstagramGlyph width={26} height={26} className="mx-auto text-clay" />
          <h2 className="mt-4 font-display text-2xl italic sm:text-3xl">
            Straight from Instagram
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-linen/75">
            We post new arrivals and restocks on Instagram first — follow along so
            you never miss a drop.
          </p>
          {settings.instagram_url && (
            <Link
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 border-b border-linen pb-1 text-[13px] tracking-[0.03em]"
            >
              @local_fashion_in <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </section>

      {/* Brand / about */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <Image
            src="https://placehold.co/1200x900/eee7d8/221f1a?text=Local+Fashion"
            alt="Local Fashion studio"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            unoptimized
          />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">Our story</p>
          <h2 className="mt-1 font-display text-2xl italic text-ink sm:text-3xl">
            Made for the everyday wardrobe
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Local Fashion started as a small Instagram page sharing pieces we
            loved wearing ourselves. This website is the next step — the same
            collection, easier to browse, with sizes and stock you can check
            before you order.
          </p>
          <LinkButton href="/about" variant="outline" className="mt-6">
            More about us
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
