"use client";

/**
 * ADMIN DATA CONTEXT — Phase-2/3 bridge
 * ----------------------------------------------------------------------
 * The public site reads from `@/lib/data/store` (server-rendered, from the
 * DB once Supabase is wired). The admin panel needs to *mutate* that data.
 * Until real Supabase credentials are configured, this context holds admin
 * edits in memory for the current browser session, seeded from the same
 * mock data, so every admin screen is fully interactive today.
 *
 * To wire up real persistence: replace each method body with the matching
 * Supabase call (see the TODO above each one) — the function signatures
 * and the screens that call them do not need to change.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product, Promotion, StoreSettings } from "@/types";
import {
  categories as seedCategories,
  products as seedProducts,
  promotions as seedPromotions,
  storeSettings as seedSettings,
} from "@/lib/data/store";

interface AdminDataValue {
  products: Product[];
  categories: Category[];
  promotions: Promotion[];
  settings: StoreSettings;

  upsertProduct: (product: Product) => void;
  setProductStatus: (id: string, status: Product["status"]) => void;
  setVariantStock: (productId: string, variantId: string, stock: number) => void;

  upsertCategory: (category: Category) => void;
  setCategoryStatus: (id: string, status: Category["status"]) => Promise<void>;

  upsertPromotion: (promotion: Promotion) => Promise<Promotion>;
  deletePromotion: (id: string) => Promise<void>;

  updateSettings: (next: StoreSettings) => void;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [promotions, setPromotions] = useState<Promotion[]>(seedPromotions);
  const [settings, setSettings] = useState<StoreSettings>(seedSettings);

  useEffect(() => {
    async function loadAdminData() {
      const supabase = createClient();
      const [productResult, categoryResult, promotionResult, settingsResult] = await Promise.all([
        supabase
          .from("products")
          .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
        supabase.from("promotions").select("*").order("display_order"),
        supabase.from("store_settings").select("*").eq("id", true).maybeSingle(),
      ]);

      if (!productResult.error && productResult.data) {
        setProducts(
          productResult.data.map((product) => ({
            ...product,
            price: Number(product.price),
            sale_price: product.sale_price == null ? null : Number(product.sale_price),
            images: product.images ?? [],
            variants: product.variants ?? [],
          })) as Product[]
        );
      }
      if (!categoryResult.error && categoryResult.data) setCategories(categoryResult.data as Category[]);
      if (!promotionResult.error && promotionResult.data) setPromotions(promotionResult.data as Promotion[]);
      if (!settingsResult.error && settingsResult.data) setSettings(settingsResult.data as StoreSettings);
    }

    void loadAdminData();
  }, []);

  const upsertProduct = useCallback((product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev];
    });
    void createClient().from("products").update({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      sale_price: product.sale_price,
      category_id: product.category_id,
      featured: product.featured,
      status: product.status,
      updated_at: new Date().toISOString(),
    }).eq("id", product.id);
  }, []);

  const setProductStatus = useCallback((id: string, status: Product["status"]) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    void createClient().from("products").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  }, []);

  const setVariantStock = useCallback((productId: string, variantId: string, stock: number) => {
    const clamped = Math.max(0, Math.floor(stock));
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, stock: clamped } : v)) }
          : p
      )
    );
      void createClient().from("product_variants").update({ stock: clamped, updated_at: new Date().toISOString() }).eq("id", variantId).eq("product_id", productId);
  }, []);

  const upsertCategory = useCallback((category: Category) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === category.id);
      return exists ? prev.map((c) => (c.id === category.id ? category : c)) : [...prev, category];
    });
    void createClient().from("categories").update({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.image_url,
      status: category.status,
      updated_at: new Date().toISOString(),
    }).eq("id", category.id);
  }, []);

  const setCategoryStatus = useCallback(async (id: string, status: Category["status"]): Promise<void> => {
    const { error } = await createClient()
      .from("categories")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }, []);

  const upsertPromotion = useCallback(async (promotion: Promotion): Promise<Promotion> => {
    const supabase = createClient();
    const payload = {
      title: promotion.title,
      subtitle: promotion.subtitle,
      discount_text: promotion.discount_text,
      image_url: promotion.image_url,
      button_text: promotion.button_text,
      target_url: promotion.target_url,
      display_order: promotion.display_order,
      is_active: promotion.is_active,
      starts_at: promotion.starts_at,
      ends_at: promotion.ends_at,
      updated_at: new Date().toISOString(),
    };
    const query = promotion.id.startsWith("promo-")
      ? supabase.from("promotions").insert(payload)
      : supabase.from("promotions").update(payload).eq("id", promotion.id);
    const { data, error } = await query.select().single();
    if (error || !data) throw error ?? new Error("Promotion could not be saved.");
    const saved = data as Promotion;
    setPromotions((prev) => {
      const exists = prev.some((p) => p.id === promotion.id || p.id === saved.id);
      return exists
        ? prev.map((p) => (p.id === promotion.id || p.id === saved.id ? saved : p))
        : [saved, ...prev];
    });
    return saved;
  }, []);

  const deletePromotion = useCallback(async (id: string): Promise<void> => {
    const { error } = await createClient().from("promotions").delete().eq("id", id);
    if (error) throw error;
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateSettings = useCallback((next: StoreSettings) => {
    setSettings(next);
    void createClient().from("store_settings").upsert({
      id: true,
      store_name: next.store_name,
      logo_url: next.logo_url,
      whatsapp_number: next.whatsapp_number,
      phone: next.phone,
      email: next.email,
      instagram_url: next.instagram_url,
      address: next.address,
      city: next.city,
      state: next.state,
      pincode: next.pincode,
      currency: next.currency,
      updated_at: new Date().toISOString(),
    });
  }, []);

  const value = useMemo<AdminDataValue>(
    () => ({
      products,
      categories,
      promotions,
      settings,
      upsertProduct,
      setProductStatus,
      setVariantStock,
      upsertCategory,
      setCategoryStatus,
      upsertPromotion,
      deletePromotion,
      updateSettings,
    }),
    [products, categories, promotions, settings, upsertProduct, setProductStatus, setVariantStock, upsertCategory, setCategoryStatus, upsertPromotion, deletePromotion, updateSettings]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData(): AdminDataValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}
