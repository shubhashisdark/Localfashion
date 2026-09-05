"use client";

import { useAdminData } from "@/lib/admin/admin-data-context";
import { isProductSoldOut } from "@/types";
import { cn } from "@/lib/utils";

export default function AdminInventoryPage() {
  const { products, setVariantStock } = useAdminData();
  const published = products.filter((p) => p.status !== "archived");

  return (
    <div>
      <h1 className="font-display text-2xl italic text-ink">Inventory</h1>
      <p className="mt-1 text-[13.5px] text-ink-soft">
        Update stock per size. A product is marked sold out automatically when every size reaches 0.
      </p>

      <div className="mt-6 overflow-x-auto border border-line bg-surface">
        <table className="w-full min-w-[560px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.08em] text-ink-faint">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Sizes</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {published.map((p) => (
              <tr key={p.id} className="border-b border-line-soft last:border-0">
                <td className="px-4 py-3 text-ink">{p.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    {p.variants.map((v) => (
                      <label key={v.id} className="flex items-center gap-1.5">
                        <span className="w-6 text-[12px] text-ink-faint">{v.size}</span>
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) => setVariantStock(p.id, v.id, Number(e.target.value))}
                          className="w-16 border border-line bg-linen px-2 py-1 text-[13px] focus:border-ink"
                        />
                      </label>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[11px] uppercase tracking-[0.05em]",
                      isProductSoldOut(p) ? "bg-ink/10 text-ink-soft" : "bg-success/10 text-success"
                    )}
                  >
                    {isProductSoldOut(p) ? "Sold out" : "In stock"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
