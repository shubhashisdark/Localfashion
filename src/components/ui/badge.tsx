import { cn } from "@/lib/utils";

type BadgeTone = "sold-out" | "featured" | "sale" | "neutral";

const tones: Record<BadgeTone, string> = {
  "sold-out": "bg-ink text-linen",
  featured: "bg-oxblood text-linen",
  sale: "bg-clay text-ink",
  neutral: "bg-surface text-ink border border-line",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-[10px] font-medium tracking-[0.08em] uppercase",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
