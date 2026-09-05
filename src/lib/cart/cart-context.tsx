"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/types";

const STORAGE_KEY = "local-fashion:cart:v1";

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (line: CartLine) => void;
  removeItem: (productId: string, size: string | null) => void;
  setQuantity: (productId: string, size: string | null, quantity: number) => void;
  clear: () => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(productId: string, size: string | null) {
  return `${productId}::${size ?? "-"}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load once on mount (client only — cart is guest/local, never SSR'd).
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time hydration from localStorage, not a render loop
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // corrupted or blocked storage — start with an empty cart rather than crash
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage full/blocked — cart just won't persist this session
    }
  }, [lines, isHydrated]);

  const addItem = useCallback((incoming: CartLine) => {
    setLines((prev) => {
      const key = lineKey(incoming.productId, incoming.size);
      const existing = prev.find((l) => lineKey(l.productId, l.size) === key);
      if (existing) {
        const nextQty = Math.min(existing.quantity + incoming.quantity, incoming.maxStock);
        return prev.map((l) =>
          lineKey(l.productId, l.size) === key ? { ...l, quantity: nextQty, maxStock: incoming.maxStock } : l
        );
      }
      const qty = Math.min(incoming.quantity, incoming.maxStock);
      return [...prev, { ...incoming, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string | null) => {
    setLines((prev) => prev.filter((l) => lineKey(l.productId, l.size) !== lineKey(productId, size)));
  }, []);

  const setQuantity = useCallback((productId: string, size: string | null, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          lineKey(l.productId, l.size) === lineKey(productId, size)
            ? { ...l, quantity: Math.max(0, Math.min(quantity, l.maxStock)) }
            : l
        )
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    [lines]
  );

  const value: CartContextValue = {
    lines,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    setQuantity,
    clear,
    isHydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
