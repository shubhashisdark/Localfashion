import type {
  Category,
  Product,
  Promotion,
  StoreSettings,
} from "@/types";
import { isProductSoldOut } from "@/types";

/**
 * MOCK DATA LAYER
 * ----------------------------------------------------------------------
 * Every function here has the exact shape the real Supabase-backed version
 * will have (same names, same return types). When Phase 2/3 wires up
 * Supabase, only the *implementation* of these functions changes — nothing
 * that imports from "@/lib/data/store" needs to change.
 *
 * Product photos are placeholders (placehold.co) tinted to the brand
 * palette. Swap them for real photography via the admin image uploader.
 */

const ph = (label: string, w = 900, h = 1150) =>
  `https://placehold.co/${w}x${h}/eee7d8/221f1a?font=playfair-display&text=${encodeURIComponent(
    label
  )}`;

export const storeSettings: StoreSettings = {
  store_name: "Local Fashion",
  logo_url: null,
  whatsapp_number: "919830000000",
  phone: "+91 98300 00000",
  email: "hello@localfashion.in",
  instagram_url: "https://www.instagram.com/local_fashion_in?igsi=YWhpNDd6ZDRhdjg1",
  address: "Gariahat Road",
  city: "Kolkata",
  state: "West Bengal",
  pincode: "700019",
  currency: "INR",
};

export const categories: Category[] = [];
/*
export const categories: Category[] = [
  {
    id: "cat-sarees",
    name: "Sarees",
    slug: "sarees",
    description: "Handpicked drapes for every occasion.",
    image_url: ph("Sarees"),
    status: "active",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "cat-kurtis",
    name: "Kurtis",
    slug: "kurtis",
    description: "Everyday ease, tailored well.",
    image_url: ph("Kurtis"),
    status: "active",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "cat-dresses",
    name: "Dresses",
    slug: "dresses",
    description: "Silhouettes for warm evenings.",
    image_url: ph("Dresses"),
    status: "active",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "cat-tops",
    name: "Tops",
    slug: "tops",
    description: "Layer-ready staples.",
    image_url: ph("Tops"),
    status: "active",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "The finishing details.",
    image_url: ph("Accessories"),
    status: "active",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
];
*/

const SIZES = ["S", "M", "L", "XL"] as const;

function makeVariants(productId: string, stocks: number[]): Product["variants"] {
  return SIZES.map((size, i) => ({
    id: `${productId}-${size}`,
    product_id: productId,
    size,
    stock: stocks[i] ?? 0,
  }));
}

function makeImages(productId: string, label: string, count = 4): Product["images"] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${productId}-img-${i}`,
    product_id: productId,
    image_url: ph(`${label} ${i + 1}`),
    storage_path: null,
    display_order: i,
    is_primary: i === 0,
    alt_text: `${label} — photo ${i + 1}`,
  }));
}

interface SeedProduct {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  salePrice?: number;
  description: string;
  stocks: number[];
  featured?: boolean;
}

const seed: SeedProduct[] = [];
/*
const seed: SeedProduct[] = [
  {
    id: "p-summer-kurti",
    name: "Summer Cotton Kurti",
    categoryId: "cat-kurtis",
    price: 1299,
    salePrice: 999,
    description:
      "A breathable handloom cotton kurti cut for warm days. Straight fit, side slits, and a round neckline finished with contrast piping.",
    stocks: [2, 5, 3, 0],
    featured: true,
  },
  {
    id: "p-banarasi-saree",
    name: "Banarasi Silk Saree",
    categoryId: "cat-sarees",
    price: 4499,
    description:
      "Woven on traditional looms in a soft gold zari border. Comes with an unstitched matching blouse piece.",
    stocks: [4, 4, 2, 1],
    featured: true,
  },
  {
    id: "p-linen-saree",
    name: "Handloom Linen Saree",
    categoryId: "cat-sarees",
    price: 2899,
    salePrice: 2199,
    description:
      "Lightweight linen with a self-textured body and a contrast pallu. Easy to drape, easy to wear all day.",
    stocks: [0, 3, 3, 2],
  },
  {
    id: "p-floral-dress",
    name: "Floral Wrap Dress",
    categoryId: "cat-dresses",
    price: 1899,
    description:
      "A flattering wrap silhouette in a small floral print, finished with a tie waist and flutter sleeves.",
    stocks: [3, 0, 0, 0],
    featured: true,
  },
  {
    id: "p-tiered-dress",
    name: "Tiered Midi Dress",
    categoryId: "cat-dresses",
    price: 2199,
    description: "Airy tiers, a square neckline, and pockets — an easy warm-weather midi.",
    stocks: [5, 5, 4, 3],
  },
  {
    id: "p-block-print-top",
    name: "Block Print Cotton Top",
    categoryId: "cat-tops",
    price: 899,
    salePrice: 699,
    description: "Hand block-printed cotton with a relaxed boxy fit and elbow-length sleeves.",
    stocks: [6, 6, 4, 4],
  },
  {
    id: "p-linen-top",
    name: "Relaxed Linen Top",
    categoryId: "cat-tops",
    price: 1099,
    description: "A boxy linen top with a curved hem — pairs equally well with jeans or a skirt.",
    stocks: [0, 0, 0, 0],
  },
  {
    id: "p-chanderi-kurti",
    name: "Chanderi Embroidered Kurti",
    categoryId: "cat-kurtis",
    price: 1799,
    description: "Chanderi silk-cotton with fine thread embroidery along the yoke.",
    stocks: [2, 0, 3, 1],
  },
  {
    id: "p-jhumka",
    name: "Oxidised Silver Jhumkas",
    categoryId: "cat-accessories",
    price: 499,
    description: "Statement oxidised jhumka earrings with a lightweight build for all-day wear.",
    stocks: [12, 0, 0, 0],
    featured: true,
  },
  {
    id: "p-potli-bag",
    name: "Embroidered Potli Bag",
    categoryId: "cat-accessories",
    price: 799,
    description: "A hand-embroidered potli bag with a drawstring closure and a wrist loop.",
    stocks: [7, 0, 0, 0],
  },
  {
    id: "p-anarkali",
    name: "Festive Anarkali Suit",
    categoryId: "cat-kurtis",
    price: 3299,
    salePrice: 2599,
    description:
      "A flared Anarkali set with delicate gota embroidery, paired with matching churidar and dupatta.",
    stocks: [1, 2, 2, 0],
    featured: true,
  },
  {
    id: "p-organza-dupatta",
    name: "Organza Sequin Dupatta",
    categoryId: "cat-accessories",
    price: 999,
    description: "A sheer organza dupatta finished with fine sequin borders on both edges.",
    stocks: [0, 0, 0, 0],
  },
];
*/

export const products: Product[] = seed.map((s) => ({
  id: s.id,
  name: s.name,
  slug: s.id.replace(/^p-/, ""),
  description: s.description,
  price: s.price,
  sale_price: s.salePrice ?? null,
  category_id: s.categoryId,
  category: categories.find((c) => c.id === s.categoryId),
  featured: !!s.featured,
  status: "published",
  images: makeImages(s.id, s.name),
  variants: makeVariants(s.id, s.stocks),
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
}));

export const promotions: Promotion[] = [];
/*
export const promotions: Promotion[] = [
  {
    id: "promo-festive",
    title: "Festive Edit",
    subtitle: "Anarkalis, sarees & occasion wear",
    discount_text: "UP TO 40% OFF",
    image_url: ph("Festive Edit", 1600, 1000),
    button_text: "Shop the edit",
    target_url: "/category/kurtis",
    display_order: 1,
    is_active: true,
    starts_at: null,
    ends_at: null,
  },
  {
    id: "promo-new",
    title: "New This Week",
    subtitle: "Fresh drops, straight off Instagram",
    discount_text: null,
    image_url: ph("New Arrivals", 1600, 1000),
    button_text: "See what's new",
    target_url: "/shop?sort=newest",
    display_order: 2,
    is_active: true,
    starts_at: null,
    ends_at: null,
  },
];
*/

// ---- Query helpers (mock fallback for the client-side admin provider) ----

export function getPublishedProducts(): Product[] {
  return products.filter((p) => p.status === "published");
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug && p.status === "published");
}

export function getFeaturedProducts(limit = 8): Product[] {
  return getPublishedProducts().filter((p) => p.featured).slice(0, limit);
}

export function getCategories(): Category[] {
  return categories.filter((c) => c.status === "active");
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return [];
  return getPublishedProducts().filter((product) => product.category_id === category.id);
}

export function getActivePromotions(): Promotion[] {
  return promotions.filter((promotion) => promotion.is_active);
}

/**
 * Similar products: same category first, then similar price range,
 * always excluding the current product and sold-out items where possible.
 */
export function getSimilarProducts(product: Product, limit = 4): Product[] {
  const pool = getPublishedProducts().filter((p) => p.id !== product.id);

  const scored = pool.map((p) => {
    let score = 0;
    if (p.category_id === product.category_id) score += 10;
    const priceDelta = Math.abs(p.price - product.price);
    score += Math.max(0, 5 - priceDelta / 400);
    if (!isProductSoldOut(p)) score += 3;
    if (p.featured) score += 1;
    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return getPublishedProducts();
  return getPublishedProducts().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
  );
}

export function getStoreSettings(): StoreSettings {
  return storeSettings;
}
