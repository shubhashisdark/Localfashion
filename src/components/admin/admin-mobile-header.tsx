"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const current = NAV.find((n) => (n.href === "/admin" ? pathname === n.href : pathname.startsWith(n.href)));

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-surface sm:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <button onClick={() => setOpen(true)} aria-label="Open admin menu">
          <Menu size={20} />
        </button>
        <p className="text-[13.5px] font-medium text-ink">{current?.label ?? "Admin"}</p>
        <button onClick={handleLogout} aria-label="Logout">
          <LogOut size={18} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-linen">
          <div className="flex h-14 items-center justify-between border-b border-line px-4">
            <p className="font-display text-lg italic">Menu</p>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={20} />
            </button>
          </div>
          <nav className="flex flex-col px-4">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-line-soft py-4 text-[15px] text-ink"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
