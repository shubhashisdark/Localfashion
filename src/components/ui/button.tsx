import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] tracking-[0.02em] font-medium transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-oxblood text-linen hover:bg-oxblood-dark",
        secondary: "bg-ink text-linen hover:bg-ink/85",
        outline: "border border-ink text-ink hover:bg-ink hover:text-linen",
        ghost: "text-ink hover:text-oxblood",
        whatsapp: "bg-[#25D366] text-[#062f16] hover:bg-[#1fbd59]",
      },
      size: {
        sm: "h-9 px-3.5 rounded-[var(--radius-sm)] text-xs",
        md: "h-11 px-5 rounded-[var(--radius-sm)]",
        lg: "h-13 px-7 text-sm rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function LinkButton({
  href,
  className,
  variant,
  size,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
} & VariantProps<typeof buttonVariants>) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}
