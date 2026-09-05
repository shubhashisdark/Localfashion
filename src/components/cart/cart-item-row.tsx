"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import type { CartLine } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";

export function CartItemRow({ line }: { line: CartLine }) {
  const { setQuantity, removeItem } = useCart();
  const subtotal = line.unitPrice * line.quantity;

  return (
    <div className="flex gap-4 border-b border-line-soft py-5">
      <Link href={`/product/${line.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden bg-surface sm:h-28 sm:w-24">
        <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/product/${line.slug}`} className="truncate text-[14.5px] text-ink hover:text-oxblood">
              {line.name}
            </Link>
            {line.size && <p className="mt-0.5 text-[12.5px] text-ink-faint">Size: {line.size}</p>}
          </div>
          <p className="shrink-0 text-[14px] text-ink">{formatPrice(line.unitPrice)}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex h-9 items-center border border-line">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQuantity(line.productId, line.size, line.quantity - 1)}
              className="flex h-full w-8 items-center justify-center text-ink"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-[13px] tabular-nums">{line.quantity}</span>
            <button
              aria-label="Increase quantity"
              disabled={line.quantity >= line.maxStock}
              onClick={() => setQuantity(line.productId, line.size, line.quantity + 1)}
              className="flex h-full w-8 items-center justify-center text-ink disabled:opacity-30"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[13.5px] text-ink-soft">{formatPrice(subtotal)}</span>
            <button
              aria-label={`Remove ${line.name} from cart`}
              onClick={() => removeItem(line.productId, line.size)}
              className="text-ink-faint hover:text-oxblood"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
