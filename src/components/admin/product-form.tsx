"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useAdminData } from "@/lib/admin/admin-data-context";
import { createClient } from "@/lib/supabase/client";
import { productFormSchema } from "@/lib/validations/admin";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Product, ProductImage, ProductVariant, ProductStatus } from "@/types";

interface FormState {
  name: string;
  slug: string;
  description: string;
  price: string;
  sale_price: string;
  category_id: string;
  featured: boolean;
  status: ProductStatus;
  variants: { size: string; stock: string }[];
  images: ProductImage[];
}

function toFormState(product?: Product): FormState {
  if (!product) {
    return {
      name: "",
      slug: "",
      description: "",
      price: "",
      sale_price: "",
      category_id: "",
      featured: false,
      status: "draft",
      variants: [{ size: "S", stock: "0" }, { size: "M", stock: "0" }, { size: "L", stock: "0" }],
      images: [],
    };
  }
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: String(product.price),
    sale_price: product.sale_price != null ? String(product.sale_price) : "",
    category_id: product.category_id,
    featured: product.featured,
    status: product.status,
    variants: product.variants.map((v) => ({ size: v.size, stock: String(v.stock) })),
    images: product.images,
  };
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const { categories, upsertProduct } = useAdminData();
  const [form, setForm] = useState<FormState>(toFormState(product));
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateVariant(index: number, field: "size" | "stock", value: string) {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  }

  function addVariant() {
    setForm((f) => ({ ...f, variants: [...f.variants, { size: "", stock: "0" }] }));
  }

  function removeVariant(index: number) {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      category_id: form.category_id,
      featured: form.featured,
      status: form.status,
      variants: form.variants
        .filter((v) => v.size.trim())
        .map((v) => ({ size: v.size.trim(), stock: Math.max(0, Number(v.stock) || 0) })),
    };

    const result = productFormSchema.safeParse(payload);
    if (!result.success) {
      setErrors(result.error.issues.map((i) => i.message));
      return;
    }
    if (form.images.length === 0) {
      setErrors(["Add at least one product photo."]);
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const productPayload = {
        name: result.data.name,
        slug: result.data.slug,
        description: result.data.description,
        price: result.data.price,
        sale_price: result.data.sale_price ?? null,
        category_id: result.data.category_id,
        featured: result.data.featured,
        status: result.data.status,
        updated_at: new Date().toISOString(),
      };

      const { data: savedProduct, error: productError } = product
        ? await supabase.from("products").update(productPayload).eq("id", product.id).select().single()
        : await supabase.from("products").insert(productPayload).select().single();
      if (productError || !savedProduct) throw productError ?? new Error("Product was not saved.");

      if (product) {
        const { error: deleteVariantsError } = await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", savedProduct.id);
        if (deleteVariantsError) throw deleteVariantsError;

        const { error: deleteImagesError } = await supabase
          .from("product_images")
          .delete()
          .eq("product_id", savedProduct.id);
        if (deleteImagesError) throw deleteImagesError;
      }

      const { data: savedVariants, error: variantsError } = await supabase
        .from("product_variants")
        .insert(result.data.variants.map((variant) => ({
          product_id: savedProduct.id,
          size: variant.size,
          stock: variant.stock,
        })))
        .select();
      if (variantsError) throw variantsError;

      const { data: savedImages, error: imagesError } = await supabase
        .from("product_images")
        .insert(form.images.map((image, index) => ({
          product_id: savedProduct.id,
          image_url: image.image_url,
          storage_path: image.storage_path,
          display_order: index,
          is_primary: image.is_primary,
        })))
        .select();
      if (imagesError) throw imagesError;

      const finalProduct: Product = {
        id: savedProduct.id,
        name: savedProduct.name,
        slug: savedProduct.slug,
        description: savedProduct.description,
        price: Number(savedProduct.price),
        sale_price: savedProduct.sale_price == null ? null : Number(savedProduct.sale_price),
        category_id: savedProduct.category_id,
        category: categories.find((category) => category.id === savedProduct.category_id),
        featured: savedProduct.featured,
        status: savedProduct.status,
        images: (savedImages ?? []).map((image) => ({ ...image, alt_text: null })),
        variants: (savedVariants ?? []) as ProductVariant[],
        created_at: savedProduct.created_at,
        updated_at: savedProduct.updated_at,
      };

      upsertProduct(finalProduct);
      router.push("/admin/products");
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Unable to save product."]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {errors.length > 0 && (
        <div className="space-y-1 border border-danger/30 bg-danger/5 px-4 py-3">
          {errors.map((err) => (
            <p key={err} className="text-[13px] text-danger">{err}</p>
          ))}
        </div>
      )}

      <section>
        <p className="mb-3 text-[11px] uppercase tracking-[0.1em] text-ink-faint">Photos</p>
        <ImageUploader images={form.images} onChange={(imgs) => update("images", imgs)} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[13px] text-ink">Product name</span>
          <input
            value={form.name}
            onChange={(e) => {
              update("name", e.target.value);
              if (!slugTouched) update("slug", slugify(e.target.value));
            }}
            className="w-full border border-line bg-surface px-3.5 py-2.5 text-[14px] focus:border-ink"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[13px] text-ink">Slug</span>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", slugify(e.target.value));
            }}
            className="w-full border border-line bg-surface px-3.5 py-2.5 text-[14px] font-mono focus:border-ink"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[13px] text-ink">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="w-full border border-line bg-surface px-3.5 py-2.5 text-[14px] focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] text-ink">Price (₹)</span>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full border border-line bg-surface px-3.5 py-2.5 text-[14px] focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] text-ink">Sale price (₹, optional)</span>
          <input
            type="number"
            min={0}
            value={form.sale_price}
            onChange={(e) => update("sale_price", e.target.value)}
            className="w-full border border-line bg-surface px-3.5 py-2.5 text-[14px] focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] text-ink">Category</span>
          <select
            value={form.category_id}
            onChange={(e) => update("category_id", e.target.value)}
            className="w-full border border-line bg-surface px-3.5 py-2.5 text-[14px] focus:border-ink"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] text-ink">Status</span>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value as ProductStatus)}
            className="w-full border border-line bg-surface px-3.5 py-2.5 text-[14px] focus:border-ink"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update("featured", e.target.checked)}
            className="h-4 w-4 accent-oxblood"
          />
          <span className="text-[13.5px] text-ink">Mark as featured</span>
        </label>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Sizes & stock</p>
          <button type="button" onClick={addVariant} className="flex items-center gap-1 text-[12.5px] text-ink-soft hover:text-ink">
            <Plus size={13} /> Add size
          </button>
        </div>
        <div className="space-y-2">
          {form.variants.map((v, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={v.size}
                onChange={(e) => updateVariant(idx, "size", e.target.value)}
                placeholder="Size"
                className="w-24 border border-line bg-surface px-3 py-2 text-[13.5px] focus:border-ink"
              />
              <input
                type="number"
                min={0}
                value={v.stock}
                onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                placeholder="Stock"
                className="w-28 border border-line bg-surface px-3 py-2 text-[13.5px] focus:border-ink"
              />
              <button
                type="button"
                aria-label="Remove size"
                onClick={() => removeVariant(idx)}
                className="text-ink-faint hover:text-oxblood"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : product ? "Save changes" : "Publish product"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
