"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <div className="min-h-screen bg-linen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-linen">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminMobileHeader />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
