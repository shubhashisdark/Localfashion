"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";
import { LinkButton } from "@/components/ui/button";

export default function CartPage() {
  const { lines, subtotal, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-8 w-40 animate-pulse bg-line-soft" />
        <div className="mt-8 h-40 animate-pulse bg-line-soft" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <ShoppingBag size={32} className="text-ink-faint" />
        <p className="mt-4 font-display text-2xl italic text-ink">Your cart is empty.</p>
        <LinkButton href="/shop" variant="primary" className="mt-6">
          Continue shopping
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl italic text-ink sm:text-4xl">Your cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {lines.map((line) => (
            <CartItemRow key={`${line.productId}-${line.size}`} line={line} />
          ))}
          <Link href="/shop" className="mt-6 inline-block text-[13px] text-ink-soft underline underline-offset-2 hover:text-ink">
            Continue shopping
          </Link>
        </div>

        <div>
          <CartSummary subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}
