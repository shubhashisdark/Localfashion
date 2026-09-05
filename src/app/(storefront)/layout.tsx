import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/lib/cart/cart-context";
import { getCategories } from "@/lib/data/store-server";
import { getStoreSettings } from "@/lib/data/store";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  const settings = getStoreSettings();

  return (
    <div className="storefront-theme">
      <CartProvider>
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} categories={categories} />
      </CartProvider>
    </div>
  );
}
