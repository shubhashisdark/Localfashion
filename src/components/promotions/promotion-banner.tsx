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
        compact ? "aspect-[16/10]" : "aspect-[5/3] sm:aspect-[16/7]"
      }`}
    >
      <Image
        src={promotion.image_url}
        alt={promotion.title}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,15,18,0.92)_0%,rgba(16,15,18,0.58)_42%,rgba(16,15,18,0.08)_100%)]" />

      <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-end p-5 sm:p-10 lg:p-14">
        {promotion.discount_text && (
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-clay">
            {promotion.discount_text}
          </p>
        )}
        <h2
          className={`mt-2 font-display italic text-linen ${
            compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-5xl lg:text-6xl"
          }`}
        >
          {promotion.title}
        </h2>
        {promotion.subtitle && (
          <p className="mt-2 max-w-md text-sm text-linen/85">{promotion.subtitle}</p>
        )}
          <span className="mt-5 inline-flex w-fit items-center gap-2 bg-oxblood px-4 py-2.5 text-[13px] font-medium tracking-[0.03em] text-linen transition-colors group-hover:bg-oxblood-dark">
          {promotion.button_text}
        </span>
      </div>
    </Link>
  );
}
