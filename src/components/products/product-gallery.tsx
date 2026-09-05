"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { ProductImage } from "@/types";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<{ backgroundPosition: string } | null>(null);
  const touchStartX = useRef<number | null>(null);

  const current = sorted[index] ?? sorted[0];
  if (!current) return null;

  const go = (delta: number) => {
    setIndex((i) => (i + delta + sorted.length) % sorted.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ backgroundPosition: `${x}% ${y}%` });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) go(delta > 0 ? -1 : 1);
    touchStartX.current = null;
  };

  return (
    <div>
      <div className="flex gap-3">
        {/* Desktop thumbnail rail */}
        <div className="hidden w-16 shrink-0 flex-col gap-2 sm:flex">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1} of ${sorted.length}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-[4/5] overflow-hidden border transition-colors",
                i === index ? "border-ink" : "border-line hover:border-ink-faint"
              )}
            >
              <Image src={img.image_url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div className="relative min-w-0 flex-1">
          <div
            className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-surface"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomStyle(null)}
            onClick={() => setLightboxOpen(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={current.image_url}
              alt={current.alt_text ?? productName}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 55vw"
              className="object-cover"
            />
            {/* Desktop hover-zoom lens */}
            {zoomStyle && (
              <div
                className="pointer-events-none absolute inset-0 hidden bg-no-repeat sm:block"
                style={{
                  backgroundImage: `url(${current.image_url})`,
                  backgroundSize: "220%",
                  ...zoomStyle,
                }}
              />
            )}

            <span className="pointer-events-none absolute right-3 top-3 hidden items-center gap-1 bg-linen/90 px-2 py-1 text-[11px] text-ink sm:flex">
              <ZoomIn size={13} /> Zoom
            </span>

            {sorted.length > 1 && (
              <span className="absolute bottom-3 right-3 bg-ink/70 px-2 py-0.5 text-[11px] text-linen sm:hidden">
                {index + 1} / {sorted.length}
              </span>
            )}

            {sorted.length > 1 && (
              <>
                <button
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-linen/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-linen/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Mobile thumbnail row */}
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto sm:hidden">
            {sorted.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setIndex(i)}
                aria-label={`View photo ${i + 1} of ${sorted.length}`}
                className={cn(
                  "relative aspect-square w-16 shrink-0 overflow-hidden border",
                  i === index ? "border-ink" : "border-line"
                )}
              >
                <Image src={img.image_url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} photos`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            aria-label="Close"
            className="absolute right-4 top-4 text-linen"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={26} />
          </button>
          <div
            className="relative h-full w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={current.image_url}
              alt={current.alt_text ?? productName}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {sorted.length > 1 && (
            <>
              <button
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-linen sm:left-8"
              >
                <ChevronLeft size={30} />
              </button>
              <button
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-linen sm:right-8"
              >
                <ChevronRight size={30} />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[13px] text-linen/80">
                {index + 1} / {sorted.length}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
