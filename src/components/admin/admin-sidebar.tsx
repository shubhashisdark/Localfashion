"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  Megaphone,
  Home,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/promotions", label: "Promotions", icon: Megaphone },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-surface sm:flex sm:flex-col">
      <div className="px-5 py-6">
        <p className="font-display text-lg italic text-ink">Local Fashion</p>
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Admin</p>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-[13.5px] transition-colors",
                active ? "bg-ink text-linen" : "text-ink-soft hover:bg-line-soft hover:text-ink"
              )}
            >
              <Icon size={16} /> {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="m-3 flex items-center gap-2.5 border-t border-line-soft px-3 py-3 text-[13.5px] text-ink-soft hover:text-oxblood"
      >
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );
}
