import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { getStoreSettings } from "@/lib/data/store";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const settings = getStoreSettings();

export const metadata: Metadata = {
  title: {
    default: `${settings.store_name} — Fashion from Instagram, made easy to shop`,
    template: `%s — ${settings.store_name}`,
  },
  description:
    "Browse the full Local Fashion collection, pick your size, and order directly on WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-linen text-ink">{children}</body>
    </html>
  );
}
