// ---------------------------------------------------------------------------
// LOCAL FASHION — domain types
// These mirror the Postgres schema (see /supabase/schema.sql) so the same
// shapes flow from DB -> data layer -> UI without translation.
// ---------------------------------------------------------------------------

export type ProductStatus = "draft" | "published" | "archived";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: "active" | "hidden" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  stock: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  storage_path: string | null;
  display_order: number;
  is_primary: boolean;
  alt_text?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  category_id: string;
  category?: Category;
  featured: boolean;
  status: ProductStatus;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

/** Derived, never stored: a product is sold out when every variant has 0 stock. */
export function isProductSoldOut(product: Pick<Product, "variants">): boolean {
  if (!product.variants.length) return false;
  return product.variants.every((v) => v.stock <= 0);
}

export function isVariantAvailable(variant: Pick<ProductVariant, "stock">): boolean {
  return variant.stock > 0;
}

export function getEffectivePrice(product: Pick<Product, "price" | "sale_price">): number {
  return product.sale_price != null && product.sale_price < product.price
    ? product.sale_price
    : product.price;
}

export function getDiscountPercent(product: Pick<Product, "price" | "sale_price">): number | null {
  if (product.sale_price == null || product.sale_price >= product.price) return null;
  return Math.round(((product.price - product.sale_price) / product.price) * 100);
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string | null;
  discount_text: string | null;
  image_url: string;
  button_text: string;
  target_url: string;
  display_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentProvider = "none" | "razorpay";
export type OrderStatus = "requested" | "confirmed" | "cancelled" | "fulfilled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_provider: PaymentProvider;
  payment_id: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface StoreSettings {
  store_name: string;
  logo_url: string | null;
  whatsapp_number: string; // E.164, e.g. "919876543210"
  phone: string | null;
  email: string | null;
  instagram_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  currency: string; // "INR"
}

// ---- Guest cart -----------------------------------------------------------

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string | null;
  unitPrice: number;
  quantity: number;
  /** stock available for this exact size, used to clamp quantity client-side */
  maxStock: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}
