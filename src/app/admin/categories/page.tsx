"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useAdminData } from "@/lib/admin/admin-data-context";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const { categories, upsertCategory, setCategoryStatus } = useAdminData();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleImageChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setError(null);
    setImageUploading(true);
    const supabase = createClient();
    const path = `categories/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setImageUploading(false);
      return;
    }

    setImageUrl(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`
    );
    setImageUploading(false);
  }

  function handleImageUrl(value: string) {
    setImageUrlInput(value);
    setImageUrl(value.trim() && /^https?:\/\//i.test(value.trim()) ? value.trim() : null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("categories")
      .insert({
        name: name.trim(),
        slug: slugify(name),
        description: description.trim() || null,
        image_url: imageUrl,
        status: "active",
      })
      .select()
      .single();
    if (insertError || !data) {
      setError(insertError?.message ?? "Unable to create category.");
      return;
    }
    upsertCategory(data as Category);
    setName("");
    setDescription("");
    setImageUrl(null);
  }

  async function handleStatusChange(id: string, status: Category["status"]) {
    setError(null);
    setUpdatingId(id);
    try {
      await setCategoryStatus(id, status);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update category visibility.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl italic text-ink">Categories</h1>

      {error && <p className="mt-3 text-[13px] text-danger">{error}</p>}

      <form onSubmit={handleAdd} className="mt-6 flex flex-col gap-4 border border-line bg-surface p-4 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1.5 block text-[13px] text-ink">Category name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-line bg-linen px-3.5 py-2.5 text-[14px] focus:border-ink"
            placeholder="e.g. Winter Wear"
          />
        </label>
        <label className="flex-1">
          <span className="mb-1.5 block text-[13px] text-ink">Description (optional)</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-line bg-linen px-3.5 py-2.5 text-[14px] focus:border-ink"
          />
        </label>
        <label className="block shrink-0">
          <span className="mb-1.5 block text-[13px] text-ink">Category photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => void handleImageChange(event.target.files?.[0])}
            className="block w-full max-w-[220px] text-[12px] text-ink-soft file:mr-2 file:border-0 file:bg-ink file:px-3 file:py-2 file:text-[12px] file:text-linen"
          />
          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Category preview"
              width={48}
              height={48}
              className="mt-2 h-12 w-12 object-cover"
            />
          )}
          <input
            value={imageUrlInput}
            onChange={(event) => handleImageUrl(event.target.value)}
            placeholder="Or paste image URL"
            className="mt-2 w-full max-w-[220px] border border-line bg-linen px-2.5 py-2 text-[12px] focus:border-ink"
          />
        </label>
        <Button type="submit" disabled={imageUploading}>
          <Plus size={14} /> {imageUploading ? "Uploading…" : "Add"}
        </Button>
      </form>

      <div className="mt-6 divide-y divide-line-soft border border-line bg-surface">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3 text-[13.5px]">
            <div>
              <p className="text-ink">{c.name}</p>
              <p className="text-[12px] text-ink-faint">/{c.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "px-2 py-0.5 text-[11px] uppercase tracking-[0.05em]",
                  c.status === "active" ? "bg-success/10 text-success" : "bg-line text-ink-faint"
                )}
              >
                {c.status}
              </span>
              <button
                disabled={updatingId === c.id}
                onClick={() => void handleStatusChange(c.id, c.status === "active" ? "hidden" : "active")}
                className="text-ink-soft hover:text-ink"
              >
                {c.status === "active" ? "Hide" : "Show"}
              </button>
              <button
                onClick={() => void handleStatusChange(c.id, "archived")}
                disabled={updatingId === c.id}
                className="text-ink-faint hover:text-oxblood"
              >
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
