import Image from "next/image";
import Link from "next/link";
import type { Promotion } from "@/types";

export function PromotionBanner({
  promotion,
  priority = false,
  compact = false,
}: {
  promotion: Promotion;
  priority?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={promotion.target_url}
      className={`group relative block w-full overflow-hidden bg-ink ${
        compact ? "aspect-[16/11]" : "aspect-[4/5] sm:aspect-[16/9]"
      }`}
    >
      <Image
        src={promotion.image_url}
        alt={promotion.title}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        {promotion.discount_text && (
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-clay">
            {promotion.discount_text}
          </p>
        )}
        <h2
          className={`mt-2 font-display italic text-linen ${
            compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-5xl"
          }`}
        >
          {promotion.title}
        </h2>
        {promotion.subtitle && (
          <p className="mt-2 max-w-md text-sm text-linen/85">{promotion.subtitle}</p>
        )}
        <span className="mt-5 inline-flex items-center gap-2 border-b border-linen pb-1 text-[13px] tracking-[0.03em] text-linen">
          {promotion.button_text}
        </span>
      </div>
    </Link>
  );
}
