"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useAdminData } from "@/lib/admin/admin-data-context";
import { isProductSoldOut } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { LinkButton } from "@/components/ui/button";

export default function AdminProductsPage() {
  const { products, setProductStatus } = useAdminData();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-ink">Products</h1>
        <LinkButton href="/admin/products/new" size="sm">
          <Plus size={14} /> Add product
        </LinkButton>
      </div>

      <div className="mt-6 overflow-x-auto border border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.08em] text-ink-faint">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const soldOut = isProductSoldOut(p);
              const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
              const primary = p.images.find((i) => i.is_primary) ?? p.images[0];
              return (
                <tr key={p.id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {primary && (
                        <div className="relative h-11 w-9 shrink-0 overflow-hidden bg-linen">
                          <Image src={primary.image_url} alt="" fill sizes="36px" className="object-cover" />
                        </div>
                      )}
                      <span className="truncate text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{p.category?.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-ink-soft">{totalStock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[11px] uppercase tracking-[0.05em]",
                        p.status === "published" && !soldOut && "bg-success/10 text-success",
                        p.status === "published" && soldOut && "bg-ink/10 text-ink-soft",
                        p.status === "draft" && "bg-clay/20 text-ink-soft",
                        p.status === "archived" && "bg-line text-ink-faint"
                      )}
                    >
                      {soldOut && p.status === "published" ? "Sold out" : p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-[12.5px]">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-ink-soft hover:text-ink">
                        Edit
                      </Link>
                      {p.status !== "archived" ? (
                        <button
                          onClick={() => setProductStatus(p.id, "archived")}
                          className="text-ink-faint hover:text-oxblood"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => setProductStatus(p.id, "published")}
                          className="text-ink-faint hover:text-oxblood"
                        >
                          Restore
                        </button>
                      )}
                      {p.status === "draft" && (
                        <button
                          onClick={() => setProductStatus(p.id, "published")}
                          className="text-ink-soft hover:text-ink"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
