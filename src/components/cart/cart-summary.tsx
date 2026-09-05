import { formatPrice } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";

export function CartSummary({ subtotal }: { subtotal: number }) {
  return (
    <div className="border border-line bg-surface p-5">
      <p className="font-display text-lg italic text-ink">Order summary</p>
      <div className="mt-4 flex items-center justify-between text-[14px] text-ink-soft">
        <span>Subtotal</span>
        <span className="text-ink">{formatPrice(subtotal)}</span>
      </div>
      <p className="mt-1 text-[12px] text-ink-faint">
        Delivery is arranged directly with the store over WhatsApp.
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-line-soft pt-4 text-[15px] text-ink">
        <span>Total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <LinkButton href="/checkout" variant="primary" size="lg" className="mt-5 w-full">
        Proceed to checkout
      </LinkButton>
    </div>
  );
}
