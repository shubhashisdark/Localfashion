"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Promotion } from "@/types";
import { PromotionBanner } from "@/components/promotions/promotion-banner";

export function PromotionCarousel({ promotions }: { promotions: Promotion[] }) {
  const [viewportRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || promotions.length < 2) return;
    const timer = window.setInterval(() => emblaApi.scrollNext(), 5500);
    return () => window.clearInterval(timer);
  }, [emblaApi, promotions.length]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 sm:pt-5 lg:px-8" aria-label="Promotions">
      <div className="relative overflow-hidden border border-line bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
        <div ref={viewportRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {promotions.map((promotion, index) => (
              <div key={promotion.id} className="min-w-0 flex-[0_0_100%]">
                <PromotionBanner promotion={promotion} priority={index === 0} />
              </div>
            ))}
          </div>
        </div>

        {promotions.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous promotion"
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-linen/30 bg-ink/60 text-linen backdrop-blur transition-colors hover:bg-ink sm:left-5"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next promotion"
              onClick={scrollNext}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-linen/30 bg-ink/60 text-linen backdrop-blur transition-colors hover:bg-ink sm:right-5"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-4 right-5 flex items-center gap-1.5" aria-label="Promotion slides">
              {promotions.map((promotion, index) => (
                <button
                  key={promotion.id}
                  type="button"
                  aria-label={`Show promotion ${index + 1}`}
                  aria-current={selectedIndex === index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`h-1.5 transition-all ${selectedIndex === index ? "w-7 bg-oxblood" : "w-1.5 bg-linen/70"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
