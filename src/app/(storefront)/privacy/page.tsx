import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/data/store";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const settings = getStoreSettings();
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl italic text-ink">Privacy Policy</h1>
      <div className="mt-8 space-y-5 text-[14.5px] leading-relaxed text-ink-soft">
        <p>
          {settings.store_name} collects the details you provide at checkout —
          name, phone number, and delivery address — solely to fulfil your
          order. This information is shared with us directly via WhatsApp
          when you place an order, and is stored only to keep a record of
          past orders.
        </p>
        <p>
          We do not sell or share your information with third parties. We do
          not run marketing emails or SMS campaigns. Browsing the site does
          not require an account, and your cart is stored only in your own
          browser until checkout.
        </p>
        <p>
          If you would like your order history removed, message us on
          WhatsApp and we&apos;ll action it.
        </p>
        <p className="text-ink-faint">Last updated 2026.</p>
      </div>
    </div>
  );
}
