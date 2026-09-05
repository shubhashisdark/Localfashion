"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({ categories }: { categories: Category[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-linen/95 backdrop-blur supports-[backdrop-filter]:bg-linen/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        {/* Mobile: menu trigger on the left, one-thumb reachable */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="-ml-2 flex h-10 w-10 items-center justify-center lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link
          href="/"
          className="flex items-center gap-2.5 text-ink"
        >
          <Image src="/local-fashion-logo.svg" alt="" width={34} height={34} className="h-8 w-8" />
          <span className="font-display text-xl italic tracking-tight lg:text-2xl">Local Fashion</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] tracking-[0.03em] text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <span className="cursor-default text-[13px] tracking-[0.03em] text-ink-soft transition-colors group-hover:text-ink">
              Categories
            </span>
            <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 border border-line bg-surface p-2 opacity-0 shadow-[0_12px_30px_-12px_rgba(34,31,26,0.25)] transition-all duration-150 group-hover:visible group-hover:opacity-100">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="block px-3 py-2 text-sm text-ink-soft hover:bg-line-soft hover:text-ink"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/shop"
            aria-label="Search products"
            className="hidden h-10 w-10 items-center justify-center text-ink-soft hover:text-ink lg:flex"
          >
            <Search size={19} />
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative flex h-10 w-10 items-center justify-center text-ink hover:text-oxblood"
          >
            <ShoppingBag size={21} />
            {itemCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-oxblood px-1 text-[10px] font-semibold leading-none text-linen">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={cn(
          "grid overflow-hidden border-t border-line bg-linen transition-[grid-template-rows] duration-200 lg:hidden",
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <nav className="flex flex-col px-4 py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-line-soft py-3.5 text-[15px] text-ink"
              >
                {link.label}
              </Link>
            ))}
            <p className="pt-4 pb-1 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
              Categories
            </p>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                onClick={() => setMenuOpen(false)}
                className="border-b border-line-soft py-3.5 text-[15px] text-ink-soft"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
