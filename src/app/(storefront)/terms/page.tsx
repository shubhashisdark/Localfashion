import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/data/store";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  const settings = getStoreSettings();
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl italic text-ink">Terms</h1>
      <div className="mt-8 space-y-5 text-[14.5px] leading-relaxed text-ink-soft">
        <p>
          Browsing {settings.store_name} and adding items to your cart does
          not place an order. An order is only confirmed once you send it to
          us via WhatsApp and we reply confirming availability, delivery, and
          payment.
        </p>
        <p>
          Product availability is shown on each product page and is checked
          again before your order is confirmed. Occasionally a size may sell
          out between browsing and confirmation — if that happens, we will
          let you know on WhatsApp and offer alternatives or a refund where
          payment was already made.
        </p>
        <p>
          Prices are listed in Indian Rupees (₹) and are subject to change
          without notice. Delivery timelines and charges are confirmed
          directly with you on WhatsApp.
        </p>
        <p className="text-ink-faint">Last updated 2026.</p>
      </div>
    </div>
  );
}
