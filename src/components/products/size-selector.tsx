import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types";

export function SizeSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: ProductVariant[];
  selected: string | null;
  onSelect: (size: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Size</p>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {variants.map((v) => {
          const available = v.stock > 0;
          const isSelected = selected === v.size;
          return (
            <button
              key={v.id}
              type="button"
              disabled={!available}
              aria-pressed={isSelected}
              aria-label={
                available ? `Size ${v.size}` : `Size ${v.size}, sold out`
              }
              onClick={() => available && onSelect(v.size)}
              className={cn(
                "relative flex h-11 min-w-11 items-center justify-center border px-3 text-[13px] transition-colors",
                !available &&
                  "cursor-not-allowed border-line text-ink-faint line-through decoration-1",
                available && !isSelected && "border-line text-ink hover:border-ink",
                available && isSelected && "border-ink bg-ink text-linen"
              )}
            >
              {v.size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
