"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, MessageCircle, Check } from "lucide-react";
import type { Product } from "@/types";
import { getEffectivePrice, isProductSoldOut } from "@/types";
import { SizeSelector } from "@/components/products/size-selector";
import { QuantitySelector } from "@/components/products/quantity-selector";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { buildDirectItemMessage, buildWhatsAppLink } from "@/lib/whatsapp/order-message";
import type { StoreSettings } from "@/types";

export function ProductPurchasePanel({
  product,
  settings,
}: {
  product: Product;
  settings: StoreSettings;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const soldOut = isProductSoldOut(product);
  const hasSizes = product.variants.length > 1 || product.variants.some((v) => v.size !== "One Size");

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.size === selectedSize);
  const maxStock = selectedVariant?.stock ?? 0;
  const price = getEffectivePrice(product);
  const needsSizeFirst = hasSizes && !selectedSize;

  const primaryImage = useMemo(
    () => product.images.find((i) => i.is_primary)?.image_url ?? product.images[0]?.image_url ?? "",
    [product.images]
  );

  function handleAddToCart() {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: primaryImage,
      size: selectedVariant.size,
      unitPrice: price,
      quantity,
      maxStock: selectedVariant.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  function handleWhatsAppOrder() {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    const message = buildDirectItemMessage({
      storeName: settings.store_name,
      item: {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: primaryImage,
        size: selectedVariant.size,
        unitPrice: price,
        quantity,
        maxStock: selectedVariant.stock,
      },
      currency: settings.currency,
    });
    window.open(buildWhatsAppLink(settings, message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      {soldOut ? (
        <div className="border border-line bg-surface p-4 text-sm text-ink-soft">
          This product is currently sold out. Check back soon, or explore similar
          pieces below.
        </div>
      ) : (
        <>
          {hasSizes && (
            <SizeSelector
              variants={product.variants}
              selected={selectedSize}
              onSelect={(s) => {
                setSelectedSize(s);
                setQuantity(1);
              }}
            />
          )}

          <div>
            <p className="mb-2.5 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
              Quantity
            </p>
            <QuantitySelector
              quantity={quantity}
              max={Math.max(1, maxStock)}
              onChange={setQuantity}
            />
            {selectedVariant && selectedVariant.stock <= 3 && (
              <p className="mt-2 text-[12px] text-oxblood">
                Only {selectedVariant.stock} left in size {selectedVariant.size}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              disabled={needsSizeFirst}
              onClick={handleAddToCart}
            >
              {justAdded ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Add to cart
                </>
              )}
            </Button>
            <Button
              variant="whatsapp"
              size="lg"
              className="flex-1"
              disabled={needsSizeFirst}
              onClick={handleWhatsAppOrder}
            >
              <MessageCircle size={16} /> Order on WhatsApp
            </Button>
          </div>

          {needsSizeFirst && (
            <p className="text-[12.5px] text-ink-faint">Select a size to continue.</p>
          )}

          {justAdded && (
            <button
              onClick={() => router.push("/cart")}
              className="text-[13px] text-ink-soft underline underline-offset-2 hover:text-ink"
            >
              View cart
            </button>
          )}
        </>
      )}
    </div>
  );
}
