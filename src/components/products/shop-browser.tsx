"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category, Product } from "@/types";
import { getEffectivePrice, isProductSoldOut } from "@/types";
import { ProductGrid } from "@/components/products/product-grid";
import { cn } from "@/lib/utils";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

const SIZES = ["S", "M", "L", "XL"];

const PRICE_BANDS = [
  { id: "all", label: "Any price", test: () => true },
  { id: "u1000", label: "Under ₹1,000", test: (p: number) => p < 1000 },
  { id: "1000-2000", label: "₹1,000 – ₹2,000", test: (p: number) => p >= 1000 && p <= 2000 },
  { id: "2000-3000", label: "₹2,000 – ₹3,000", test: (p: number) => p > 2000 && p <= 3000 },
  { id: "3000plus", label: "Above ₹3,000", test: (p: number) => p > 3000 },
] as const;

export function ShopBrowser({
  products,
  categories,
  initialCategorySlug,
}: {
  products: Product[];
  categories: Category[];
  initialCategorySlug?: string;
}) {
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | "all">(
    initialCategorySlug ?? "all"
  );
  const [size, setSize] = useState<string | "all">("all");
  const [priceBand, setPriceBand] = useState<(typeof PRICE_BANDS)[number]["id"]>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const band = PRICE_BANDS.find((b) => b.id === priceBand)!;
    let list = products.filter((p) => {
      const q = query.trim().toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q))
        return false;
      if (categorySlug !== "all" && p.category?.slug !== categorySlug) return false;
      if (size !== "all" && !p.variants.some((v) => v.size === size && v.stock > 0)) return false;
      if (!band.test(getEffectivePrice(p))) return false;
      if (inStockOnly && isProductSoldOut(p)) return false;
      return true;
    });

    list = [...list];
    if (sort === "featured") list.sort((a, b) => Number(b.featured) - Number(a.featured));
    if (sort === "newest")
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sort === "price-asc") list.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    if (sort === "price-desc") list.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));

    return list;
  }, [products, query, categorySlug, size, priceBand, inStockOnly, sort]);

  const activeFilterCount = [
    categorySlug !== "all",
    size !== "all",
    priceBand !== "all",
    inStockOnly,
  ].filter(Boolean).length;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="h-11 w-full border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-faint focus:border-ink sm:max-w-xs"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex h-11 items-center gap-2 border border-line bg-surface px-4 text-[13px] text-ink sm:hidden"
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-oxblood px-1 text-[10px] text-linen">
                {activeFilterCount}
              </span>
            )}
          </button>

          <label className="sr-only" htmlFor="sort">Sort by</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-11 border border-line bg-surface px-3 text-[13px] text-ink"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex gap-8">
        {/* Desktop filter sidebar */}
        <aside className="hidden w-52 shrink-0 sm:block">
          <FilterPanel
            categories={categories}
            categorySlug={categorySlug}
            setCategorySlug={setCategorySlug}
            size={size}
            setSize={setSize}
            priceBand={priceBand}
            setPriceBand={setPriceBand}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-[13px] text-ink-faint">
            {filtered.length} product{filtered.length === 1 ? "" : "s"}
          </p>
          <ProductGrid products={filtered} />
        </div>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-md bg-linen p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg italic">Filters</p>
              <button aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterPanel
              categories={categories}
              categorySlug={categorySlug}
              setCategorySlug={setCategorySlug}
              size={size}
              setSize={setSize}
              priceBand={priceBand}
              setPriceBand={setPriceBand}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
            />
            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-6 h-11 w-full bg-oxblood text-[13px] font-medium text-linen"
            >
              Show {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  categories,
  categorySlug,
  setCategorySlug,
  size,
  setSize,
  priceBand,
  setPriceBand,
  inStockOnly,
  setInStockOnly,
}: {
  categories: Category[];
  categorySlug: string;
  setCategorySlug: (v: string) => void;
  size: string;
  setSize: (v: string) => void;
  priceBand: string;
  setPriceBand: (v: (typeof PRICE_BANDS)[number]["id"]) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.1em] text-ink-faint">Category</p>
        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-start sm:gap-1.5">
          <FilterChip active={categorySlug === "all"} onClick={() => setCategorySlug("all")}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              active={categorySlug === c.slug}
              onClick={() => setCategorySlug(c.slug)}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.1em] text-ink-faint">Size</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={size === "all"} onClick={() => setSize("all")}>All</FilterChip>
          {SIZES.map((s) => (
            <FilterChip key={s} active={size === s} onClick={() => setSize(s)}>{s}</FilterChip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.1em] text-ink-faint">Price</p>
        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-start sm:gap-1.5">
          {PRICE_BANDS.map((b) => (
            <FilterChip key={b.id} active={priceBand === b.id} onClick={() => setPriceBand(b.id)}>
              {b.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-[13px] text-ink">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="h-4 w-4 accent-oxblood"
        />
        In stock only
      </label>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border px-3 py-1.5 text-[12.5px] transition-colors",
        active
          ? "border-ink bg-ink text-linen"
          : "border-line bg-surface text-ink-soft hover:border-ink"
      )}
    >
      {children}
    </button>
  );
}
