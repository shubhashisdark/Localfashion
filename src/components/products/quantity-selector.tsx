import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  quantity,
  max,
  onChange,
}: {
  quantity: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex h-11 items-center border border-line">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={quantity <= 1}
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className="flex h-full w-10 items-center justify-center text-ink disabled:opacity-30"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-[14px] tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={quantity >= max}
        onClick={() => onChange(Math.min(max, quantity + 1))}
        className="flex h-full w-10 items-center justify-center text-ink disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
