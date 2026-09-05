"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Star, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

let localIdCounter = 0;

export function ImageUploader({
  images,
  onChange,
}: {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setUploading(true);

    const supabaseConfigured =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      const newImages: ProductImage[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        let imageUrl: string;
        let storagePath: string | null = null;

        if (supabaseConfigured) {
          // Real upload path: Admin -> Supabase Storage -> product_images.
          const supabase = createClient();
          const path = `products/${Date.now()}-${file.name}`;
          const { error } = await supabase.storage.from("product-images").upload(path, file);
          if (error) throw error;
          imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path
            .split("/")
            .map(encodeURIComponent)
            .join("/")}`;
          storagePath = path;
        } else {
          // No Storage configured yet: local object URL, session-only preview.
          imageUrl = URL.createObjectURL(file);
        }

        localIdCounter += 1;
        newImages.push({
          id: `local-${localIdCounter}`,
          product_id: "",
          image_url: imageUrl,
          storage_path: storagePath,
          display_order: images.length + newImages.length,
          is_primary: images.length === 0 && newImages.length === 0,
          alt_text: file.name,
        });
      }

      onChange([...images, ...newImages]);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(id: string) {
    const next = images.filter((i) => i.id !== id).map((img, idx) => ({ ...img, display_order: idx }));
    if (next.length > 0 && !next.some((i) => i.is_primary)) next[0].is_primary = true;
    onChange(next);
  }

  function addImageUrl() {
    const url = imageUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      setUploadError("Enter a valid image URL starting with http:// or https://.");
      return;
    }
    localIdCounter += 1;
    onChange([
      ...images,
      {
        id: `url-${localIdCounter}`,
        product_id: "",
        image_url: url,
        storage_path: null,
        display_order: images.length,
        is_primary: images.length === 0,
        alt_text: "Product image",
      },
    ]);
    setImageUrl("");
    setUploadError(null);
  }

  function setPrimary(id: string) {
    onChange(images.map((img) => ({ ...img, is_primary: img.id === id })));
  }

  function moveImage(id: string, direction: -1 | 1) {
    const index = images.findIndex((i) => i.id === id);
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, idx) => ({ ...img, display_order: idx })));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-center",
          dragActive ? "border-ink bg-line-soft" : "border-line"
        )}
      >
        <Upload size={20} className="text-ink-faint" />
        <p className="text-[13px] text-ink-soft">
          {uploading ? "Uploading…" : "Drag photos here, or click to select"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploadError && <p className="mt-2 text-[12.5px] text-danger">{uploadError}</p>}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="Paste image URL"
          aria-label="Product image URL"
          className="min-w-0 flex-1 border border-line bg-surface px-3 py-2 text-[13px] focus:border-ink"
        />
        <button type="button" onClick={addImageUrl} className="border border-ink px-3 py-2 text-[12px] text-ink hover:bg-ink hover:text-linen">
          Add URL
        </button>
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, idx) => (
            <div key={img.id} className="group relative aspect-[4/5] overflow-hidden border border-line bg-linen">
              <Image src={img.image_url} alt={img.alt_text ?? ""} fill sizes="150px" className="object-cover" />
              {img.is_primary && (
                <span className="absolute left-1 top-1 bg-oxblood px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-linen">
                  Primary
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink/70 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Set as primary image"
                  onClick={() => setPrimary(img.id)}
                  className="flex h-6 w-6 items-center justify-center text-linen"
                >
                  <Star size={13} fill={img.is_primary ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  aria-label="Move left"
                  disabled={idx === 0}
                  onClick={() => moveImage(img.id, -1)}
                  className="flex h-6 w-6 items-center justify-center text-linen disabled:opacity-30"
                >
                  <GripVertical size={13} />
                </button>
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => removeImage(img.id)}
                  className="flex h-6 w-6 items-center justify-center text-linen"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
