import type { Metadata } from "next";
import Image from "next/image";
import { getStoreSettings } from "@/lib/data/store";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind Local Fashion.",
};

export default function AboutPage() {
  const settings = getStoreSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">About</p>
      <h1 className="mt-1 font-display text-3xl italic text-ink sm:text-4xl">
        {settings.store_name}
      </h1>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-surface">
        <Image
          src="https://placehold.co/1600x900/eee7d8/221f1a?text=Local+Fashion"
          alt="Local Fashion"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink-soft">
        <p>
          {settings.store_name} began on Instagram, sharing pieces we genuinely
          loved wearing — handloom cottons, easy dresses, and the occasional
          festive find. What started as a small page slowly turned into
          something people wanted to shop from directly.
        </p>
        <p>
          This website is that next step. The collection is the same one you
          see on Instagram, now easier to browse: proper photos, sizes you can
          check before you buy, and a straightforward way to place an order —
          no account needed.
        </p>
        <p>
          When you&apos;re ready, ordering still happens the way it always
          has: a quick message on WhatsApp, so you can ask questions and
          confirm details directly with us.
        </p>
      </div>
    </div>
  );
}
