import { createClient } from "@/lib/supabase/server";
import type { Category, Product, Promotion } from "@/types";
import { isProductSoldOut } from "@/types";
import { storeSettings } from "@/lib/data/store";

const PRODUCT_SELECT =
  "*, category:categories(*), images:product_images(*), variants:product_variants(*)";

type ProductRow = Product & {
  images?: Product["images"];
  variants?: Product["variants"];
};

function mapProduct(row: ProductRow): Product {
  return {
    ...row,
    price: Number(row.price),
    sale_price: row.sale_price == null ? null : Number(row.sale_price),
    images: row.images ?? [],
    variants: row.variants ?? [],
  };
}

export async function getPublishedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapProduct(row as ProductRow));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as ProductRow) : undefined;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getPublishedProducts();
  return products.filter((product) => product.featured).slice(0, limit);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Category | null) ?? undefined;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];
  return (await getPublishedProducts()).filter((product) => product.category_id === category.id);
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw error;
  const now = Date.now();
  return ((data ?? []) as Promotion[]).filter(
    (promotion) =>
      (!promotion.starts_at || new Date(promotion.starts_at).getTime() <= now) &&
      (!promotion.ends_at || new Date(promotion.ends_at).getTime() >= now)
  );
}

export async function getSimilarProducts(product: Product, limit = 4): Promise<Product[]> {
  const pool = (await getPublishedProducts()).filter((item) => item.id !== product.id);
  const scored = pool.map((item) => {
    let score = 0;
    if (item.category_id === product.category_id) score += 10;
    score += Math.max(0, 5 - Math.abs(item.price - product.price) / 400);
    if (!isProductSoldOut(item)) score += 3;
    if (item.featured) score += 1;
    return { item, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ item }) => item);
}

export function getStoreSettings() {
  return storeSettings;
}
