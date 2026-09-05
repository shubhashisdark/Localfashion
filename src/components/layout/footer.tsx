import Link from "next/link";
import { InstagramGlyph } from "@/components/ui/icons";
import type { StoreSettings, Category } from "@/types";

export function Footer({
  settings,
  categories,
}: {
  settings: StoreSettings;
  categories: Category[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-linen">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-xl italic text-ink">{settings.store_name}</p>
            <p className="mt-3 max-w-[22ch] text-sm leading-relaxed text-ink-soft">
              Fashion from Instagram, now easy to browse and order.
            </p>
            {settings.instagram_url && (
              <Link
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-oxblood"
              >
                <InstagramGlyph width={16} height={16} />
                Follow us
              </Link>
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li><Link href="/shop" className="hover:text-ink">All products</Link></li>
              {categories.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="hover:text-ink">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Company</p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li><Link href="/about" className="hover:text-ink">About</Link></li>
              <li><Link href="/contact" className="hover:text-ink">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-ink">Privacy policy</Link></li>
              <li><Link href="/terms" className="hover:text-ink">Terms</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Reach us</p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              {settings.phone && <li>{settings.phone}</li>}
              {settings.email && <li>{settings.email}</li>}
              {settings.city && settings.state && (
                <li>{settings.city}, {settings.state}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line-soft pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {settings.store_name}. All rights reserved.</p>
          <p>Orders are placed via WhatsApp.</p>
        </div>
      </div>
    </footer>
  );
}
