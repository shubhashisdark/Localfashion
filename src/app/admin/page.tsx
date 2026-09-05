"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdminData } from "@/lib/admin/admin-data-context";
import { isProductSoldOut } from "@/types";

export default function AdminDashboardPage() {
  const { products } = useAdminData();

  const stats = useMemo(() => {
    const published = products.filter((p) => p.status === "published");
    const soldOut = published.filter((p) => isProductSoldOut(p));
    const lowStock = published.filter((p) => {
      const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
      return totalStock > 0 && totalStock <= 5;
    });
    return {
      total: products.length,
      available: published.length - soldOut.length,
      soldOut: soldOut.length,
      lowStock,
      recent: [...products]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    };
  }, [products]);

  return (
    <div>
      <h1 className="font-display text-2xl italic text-ink">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total products" value={stats.total} />
        <StatCard label="Available" value={stats.available} />
        <StatCard label="Sold out" value={stats.soldOut} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Recent products</p>
          <ul className="mt-3 divide-y divide-line-soft border border-line bg-surface">
            {stats.recent.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3 text-[13.5px]">
                <span className="truncate text-ink">{p.name}</span>
                <Link href={`/admin/products/${p.id}/edit`} className="shrink-0 text-ink-faint hover:text-oxblood">
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Low stock</p>
          <ul className="mt-3 divide-y divide-line-soft border border-line bg-surface">
            {stats.lowStock.length === 0 && (
              <li className="px-4 py-3 text-[13.5px] text-ink-faint">Nothing running low.</li>
            )}
            {stats.lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3 text-[13.5px]">
                <span className="truncate text-ink">{p.name}</span>
                <Link href="/admin/inventory" className="shrink-0 text-ink-faint hover:text-oxblood">
                  Manage stock
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line bg-surface p-5">
      <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">{label}</p>
      <p className="mt-2 font-display text-3xl italic text-ink">{value}</p>
    </div>
  );
}
