"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAdminData } from "@/lib/admin/admin-data-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Promotion } from "@/types";

const DEMO_PROMOTION_IMAGE =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85";

const emptyDraft = {
  title: "",
  subtitle: "",
  discount_text: "",
  button_text: "Shop now",
  target_url: "/shop",
  image_url: DEMO_PROMOTION_IMAGE,
};

export default function AdminPromotionsPage() {
  const { promotions, upsertPromotion, deletePromotion } = useAdminData();
  const [draft, setDraft] = useState(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleImageChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setError(null);
    setUploading(true);
    const supabase = createClient();
    const path = `promotions/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
    setDraft((current) => ({ ...current, image_url: imageUrl }));
    setUploading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    setError(null);
    setSaving(true);

    const promotion: Promotion = {
      id: `promo-${Date.now()}`,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || null,
      discount_text: draft.discount_text.trim() || null,
      image_url: draft.image_url,
      button_text: draft.button_text.trim() || "Shop now",
      target_url: draft.target_url.trim() || "/shop",
      display_order: promotions.length + 1,
      is_active: true,
      starts_at: null,
      ends_at: null,
    };
    try {
      await upsertPromotion(promotion);
      setDraft(emptyDraft);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Promotion could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function loadDemoPromotion() {
    setDraft({
      title: "The New Season Edit",
      subtitle: "Everyday silhouettes, considered details, made to move with you.",
      discount_text: "NEW ARRIVALS",
      button_text: "Shop the edit",
      target_url: "/shop",
      image_url: DEMO_PROMOTION_IMAGE,
    });
  }

  async function toggleActive(promo: Promotion) {
    setError(null);
    try {
      await upsertPromotion({ ...promo, is_active: !promo.is_active });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Promotion could not be updated.");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deletePromotion(id);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Promotion could not be deleted.");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl italic text-ink">Promotions</h1>
      <p className="mt-1 text-[13.5px] text-ink-soft">
        Active promotions appear on the homepage automatically, in display order.
      </p>
      {error && <p className="mt-3 border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">{error}</p>}

      <form onSubmit={handleAdd} className="mt-6 grid gap-3 border border-line bg-surface p-4 sm:grid-cols-2">
        <label>
          <span className="mb-1.5 block text-[13px] text-ink">Title</span>
          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className="w-full border border-line bg-linen px-3.5 py-2.5 text-[14px] focus:border-ink"
            placeholder="Festive Collection"
          />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-[13px] text-ink">Promotion photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => void handleImageChange(event.target.files?.[0])}
            className="block w-full text-[12px] text-ink-soft file:mr-2 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-[12px] file:text-linen"
          />
          {draft.image_url && (
            <Image
              src={draft.image_url}
              alt="Promotion preview"
              width={320}
              height={120}
              className="mt-3 h-28 w-full max-w-sm object-cover"
            />
          )}
          <input
            value={draft.image_url}
            onChange={(event) => setDraft((current) => ({ ...current, image_url: event.target.value }))}
            placeholder="Or paste image URL"
            className="mt-2 w-full max-w-sm border border-line bg-linen px-3 py-2 text-[12px] focus:border-ink"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[13px] text-ink">Discount text</span>
          <input
            value={draft.discount_text}
            onChange={(e) => setDraft((d) => ({ ...d, discount_text: e.target.value }))}
            className="w-full border border-line bg-linen px-3.5 py-2.5 text-[14px] focus:border-ink"
            placeholder="UP TO 50% OFF"
          />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-[13px] text-ink">Subtitle</span>
          <input
            value={draft.subtitle}
            onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
            className="w-full border border-line bg-linen px-3.5 py-2.5 text-[14px] focus:border-ink"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[13px] text-ink">Button text</span>
          <input
            value={draft.button_text}
            onChange={(e) => setDraft((d) => ({ ...d, button_text: e.target.value }))}
            className="w-full border border-line bg-linen px-3.5 py-2.5 text-[14px] focus:border-ink"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[13px] text-ink">Links to</span>
          <input
            value={draft.target_url}
            onChange={(e) => setDraft((d) => ({ ...d, target_url: e.target.value }))}
            className="w-full border border-line bg-linen px-3.5 py-2.5 text-[14px] focus:border-ink"
            placeholder="/category/kurtis"
          />
        </label>
        <div className="sm:col-span-2">
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving || uploading}><Plus size={14} /> {saving ? "Saving…" : "Add promotion"}</Button>
            <Button type="button" variant="outline" onClick={loadDemoPromotion} disabled={saving || uploading}>
              Use demo promotion
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-6 divide-y divide-line-soft border border-line bg-surface">
        {promotions.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 px-4 py-3 text-[13.5px]">
            <div className="min-w-0">
              <p className="truncate text-ink">{p.title}</p>
              <p className="truncate text-[12px] text-ink-faint">
                {p.discount_text} → {p.target_url}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <label className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                <input
                  type="checkbox"
                  checked={p.is_active}
                  onChange={() => void toggleActive(p)}
                  className="h-4 w-4 accent-oxblood"
                />
                Active
              </label>
              <button
                aria-label="Delete promotion"
                onClick={() => void handleDelete(p.id)}
                className="text-ink-faint hover:text-oxblood"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
