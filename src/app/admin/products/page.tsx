"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useAdminData } from "@/lib/admin/admin-data-context";
import { createClient } from "@/lib/supabase/client";
import { isProductSoldOut } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { Button, LinkButton } from "@/components/ui/button";

const DEMO_CATEGORIES = [
  ["Dresses", "dresses"],
  ["Shirts", "shirts"],
  ["Jeans", "jeans"],
  ["Tops", "tops"],
  ["Kurtis", "kurtis"],
  ["Sarees", "sarees"],
  ["Accessories", "accessories"],
  ["Outerwear", "outerwear"],
  ["Lounge", "lounge"],
  ["Workwear", "workwear"],
] as const;

const DEMO_PHOTOS = [
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
] as const;

export default function AdminProductsPage() {
  const { products, setProductStatus } = useAdminData();
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  async function loadDemoCatalogue() {
    if (!window.confirm("Add 50 demo products with photos to your catalogue?")) return;
    setSeeding(true);
    setSeedMessage(null);

    try {
      const supabase = createClient();
      const { data: currentCategories, error: categoryReadError } = await supabase
        .from("categories")
        .select("id, slug");
      if (categoryReadError) throw categoryReadError;

      const categoryBySlug = new Map((currentCategories ?? []).map((category) => [category.slug, category.id]));
      const missingCategories = DEMO_CATEGORIES
        .filter(([, slug]) => !categoryBySlug.has(slug))
        .map(([name, slug], index) => ({
          name,
          slug,
          status: "active",
          image_url: DEMO_PHOTOS[index % DEMO_PHOTOS.length],
        }));

      if (missingCategories.length > 0) {
        const { data: createdCategories, error: categoryInsertError } = await supabase
          .from("categories")
          .insert(missingCategories)
          .select("id, slug");
        if (categoryInsertError) throw categoryInsertError;
        for (const category of createdCategories ?? []) categoryBySlug.set(category.slug, category.id);
      }

      const { data: existingDemoProducts, error: productReadError } = await supabase
        .from("products")
        .select("slug")
        .like("slug", "demo-%");
      if (productReadError) throw productReadError;
      const existingSlugs = new Set((existingDemoProducts ?? []).map((product) => product.slug));

      const productRows = Array.from({ length: 50 }, (_, index) => {
        const [categoryName, categorySlug] = DEMO_CATEGORIES[index % DEMO_CATEGORIES.length];
        const name = `${categoryName} ${["Essential", "Studio", "Classic", "Relaxed", "Signature"][index % 5]} ${String(index + 1).padStart(2, "0")}`;
        return {
          name,
          slug: `demo-${categorySlug}-${index + 1}`,
          description: `A considered ${categoryName.toLowerCase()} piece made for everyday wardrobes, with an easy silhouette and polished finish.`,
          price: 799 + (index % 8) * 300,
          sale_price: index % 4 === 0 ? 699 + (index % 5) * 200 : null,
          category_id: categoryBySlug.get(categorySlug),
          featured: index < 8,
          status: "published",
        };
      }).filter((product) => !existingSlugs.has(product.slug));

      if (productRows.length === 0) {
        setSeedMessage("The 50 demo products are already loaded.");
        return;
      }

      const { data: createdProducts, error: productInsertError } = await supabase
        .from("products")
        .insert(productRows)
        .select("id, slug");
      if (productInsertError) throw productInsertError;

      const variants = (createdProducts ?? []).flatMap((product, index) =>
        ["S", "M", "L", "XL"].map((size, sizeIndex) => ({
          product_id: product.id,
          size,
          stock: 4 + ((index + sizeIndex) % 8),
        }))
      );
      const images = (createdProducts ?? []).map((product, index) => ({
        product_id: product.id,
        image_url: DEMO_PHOTOS[index % DEMO_PHOTOS.length],
        storage_path: null,
        display_order: 0,
        is_primary: true,
      }));

      const { error: variantError } = await supabase.from("product_variants").insert(variants);
      if (variantError) throw variantError;
      const { error: imageError } = await supabase.from("product_images").insert(images);
      if (imageError) throw imageError;

      setSeedMessage(`${createdProducts?.length ?? 0} demo products added. Refreshing catalogue…`);
      window.setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setSeedMessage(error instanceof Error ? error.message : "Unable to load demo products.");
    } finally {
      setSeeding(false);
    }
  }

  async function removeDemoCatalogue() {
    if (!window.confirm("Remove the demo products, stock, photos, and unused demo categories?")) return;
    setSeeding(true);
    setSeedMessage(null);

    try {
      const supabase = createClient();
      const { data: demoCategories, error: categoryReadError } = await supabase
        .from("categories")
        .select("id, slug")
        .in("slug", DEMO_CATEGORIES.map(([, slug]) => slug));
      if (categoryReadError) throw categoryReadError;

      const { error: productDeleteError } = await supabase
        .from("products")
        .delete()
        .like("slug", "demo-%");
      if (productDeleteError) throw productDeleteError;

      const demoCategoryIds = (demoCategories ?? []).map((category) => category.id);
      if (demoCategoryIds.length > 0) {
        const { data: remainingProducts, error: remainingProductError } = await supabase
          .from("products")
          .select("category_id")
          .in("category_id", demoCategoryIds);
        if (remainingProductError) throw remainingProductError;

        const usedCategoryIds = new Set((remainingProducts ?? []).map((product) => product.category_id));
        const unusedCategoryIds = demoCategoryIds.filter((id) => !usedCategoryIds.has(id));
        if (unusedCategoryIds.length > 0) {
          const { error: categoryDeleteError } = await supabase
            .from("categories")
            .delete()
            .in("id", unusedCategoryIds);
          if (categoryDeleteError) throw categoryDeleteError;
        }
      }

      setSeedMessage("Demo products and unused demo categories removed. Refreshing catalogue…");
      window.setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setSeedMessage(error instanceof Error ? error.message : "Unable to remove demo products.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl italic text-ink">Products</h1>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void loadDemoCatalogue()} disabled={seeding}>
            {seeding ? "Loading demo…" : "Load 50 demo products"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => void removeDemoCatalogue()} disabled={seeding}>
            Remove demo data
          </Button>
          <LinkButton href="/admin/products/new" size="sm">
            <Plus size={14} /> Add product
          </LinkButton>
        </div>
      </div>

      {seedMessage && <p className="mt-3 text-[13px] text-ink-soft">{seedMessage}</p>}

      <div className="mt-6 overflow-x-auto border border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.08em] text-ink-faint">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const soldOut = isProductSoldOut(p);
              const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
              const primary = p.images.find((i) => i.is_primary) ?? p.images[0];
              return (
                <tr key={p.id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {primary && (
                        <div className="relative h-11 w-9 shrink-0 overflow-hidden bg-linen">
                          <Image src={primary.image_url} alt="" fill sizes="36px" className="object-cover" />
                        </div>
                      )}
                      <span className="truncate text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{p.category?.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-ink-soft">{totalStock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[11px] uppercase tracking-[0.05em]",
                        p.status === "published" && !soldOut && "bg-success/10 text-success",
                        p.status === "published" && soldOut && "bg-ink/10 text-ink-soft",
                        p.status === "draft" && "bg-clay/20 text-ink-soft",
                        p.status === "archived" && "bg-line text-ink-faint"
                      )}
                    >
                      {soldOut && p.status === "published" ? "Sold out" : p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-[12.5px]">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-ink-soft hover:text-ink">
                        Edit
                      </Link>
                      {p.status !== "archived" ? (
                        <button
                          onClick={() => setProductStatus(p.id, "archived")}
                          className="text-ink-faint hover:text-oxblood"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => setProductStatus(p.id, "published")}
                          className="text-ink-faint hover:text-oxblood"
                        >
                          Restore
                        </button>
                      )}
                      {p.status === "draft" && (
                        <button
                          onClick={() => setProductStatus(p.id, "published")}
                          className="text-ink-soft hover:text-ink"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
