"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAdminData } from "@/lib/admin/admin-data-context";
import { Button } from "@/components/ui/button";
import type { Promotion } from "@/types";

const emptyDraft = {
  title: "",
  subtitle: "",
  discount_text: "",
  button_text: "Shop now",
  target_url: "/shop",
};

export default function AdminPromotionsPage() {
  const { promotions, upsertPromotion, deletePromotion } = useAdminData();
  const [draft, setDraft] = useState(emptyDraft);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;

    const promotion: Promotion = {
      id: `promo-${Date.now()}`,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || null,
      discount_text: draft.discount_text.trim() || null,
      image_url: `https://placehold.co/1600x1000/eee7d8/221f1a?text=${encodeURIComponent(draft.title)}`,
      button_text: draft.button_text.trim() || "Shop now",
      target_url: draft.target_url.trim() || "/shop",
      display_order: promotions.length + 1,
      is_active: true,
      starts_at: null,
      ends_at: null,
    };
    upsertPromotion(promotion);
    setDraft(emptyDraft);
  }

  function toggleActive(promo: Promotion) {
    upsertPromotion({ ...promo, is_active: !promo.is_active });
  }

  return (
    <div>
      <h1 className="font-display text-2xl italic text-ink">Promotions</h1>
      <p className="mt-1 text-[13.5px] text-ink-soft">
        Active promotions appear on the homepage automatically, in display order.
      </p>

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
          <Button type="submit"><Plus size={14} /> Add promotion</Button>
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
                  onChange={() => toggleActive(p)}
                  className="h-4 w-4 accent-oxblood"
                />
                Active
              </label>
              <button
                aria-label="Delete promotion"
                onClick={() => deletePromotion(p.id)}
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
