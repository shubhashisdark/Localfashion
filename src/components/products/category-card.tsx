import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/category/${category.slug}`} className="group block shrink-0 w-40 sm:w-auto">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        {category.image_url && (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 40vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {!category.image_url && (
          <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(145deg,#111b42,#07102c)] p-4 transition-colors duration-300 group-hover:bg-[linear-gradient(145deg,#132650,#07102c)]">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-oxblood/30" />
            <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full border border-clay/20" />
            <div className="absolute inset-x-4 bottom-4 border-b border-line pb-3">
              <span className="text-[10px] uppercase tracking-[0.16em] text-clay">Shop the edit</span>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{category.name}</p>
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 font-display text-lg italic text-ink">{category.name}</p>
    </Link>
  );
}
