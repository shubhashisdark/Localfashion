import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { getDiscountPercent, getEffectivePrice, isProductSoldOut } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = isProductSoldOut(product);
  const price = getEffectivePrice(product);
  const discount = getDiscountPercent(product);
  const primary = product.images.find((i) => i.is_primary) ?? product.images[0];
  const secondary = product.images[1];

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        {primary && (
          <Image
            src={primary.image_url}
            alt={primary.alt_text ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-opacity duration-300 ${
              secondary ? "group-hover:opacity-0" : ""
            } ${soldOut ? "opacity-60 grayscale-[0.3]" : ""}`}
          />
        )}
        {secondary && (
          <Image
            src={secondary.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {soldOut && <Badge tone="sold-out">Sold out</Badge>}
          {!soldOut && discount && <Badge tone="sale">{discount}% off</Badge>}
          {!soldOut && product.featured && <Badge tone="featured">Featured</Badge>}
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[13.5px] text-ink">{product.name}</h3>
          <p className="mt-1 text-[11px] uppercase tracking-[0.06em] text-ink-faint">
            {product.category?.name}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13.5px] text-ink">{formatPrice(price)}</p>
          {product.sale_price != null && (
            <p className="text-[11px] text-ink-faint line-through">
              {formatPrice(product.price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
