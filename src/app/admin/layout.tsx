import type { Metadata } from "next";
import { AdminDataProvider } from "@/lib/admin/admin-data-context";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin — Local Fashion" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDataProvider>
      <AdminShell>{children}</AdminShell>
    </AdminDataProvider>
  );
}
