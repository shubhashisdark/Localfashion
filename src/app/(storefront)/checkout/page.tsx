"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { customerDetailsSchema } from "@/lib/validations/checkout";
import { buildOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp/order-message";
import { formatPrice } from "@/lib/utils";
import { Button, LinkButton } from "@/components/ui/button";
import { getStoreSettings } from "@/lib/data/store";

const settings = getStoreSettings();

type FormState = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyForm: FormState = { name: "", phone: "", address: "", city: "", state: "", pincode: "" };

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear, isHydrated } = useCart();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const result = customerDetailsSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormState;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (lines.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: result.data,
          items: lines.map((l) => ({
            productId: l.productId,
            slug: l.slug,
            name: l.name,
            image: l.image,
            size: l.size,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            maxStock: l.maxStock,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const message = buildOrderMessage({
        orderId: data.orderId,
        storeName: settings.store_name,
        items: lines,
        customer: result.data,
        currency: settings.currency,
      });
      const link = buildWhatsAppLink(settings, message);
      window.open(link, "_blank", "noopener,noreferrer");
      clear();
      router.push("/");
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isHydrated) return null;

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <ShoppingBag size={32} className="text-ink-faint" />
        <p className="mt-4 font-display text-2xl italic text-ink">Your cart is empty.</p>
        <LinkButton href="/shop" variant="primary" className="mt-6">Continue shopping</LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl italic text-ink sm:text-4xl">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2" noValidate>
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">Your details</p>

          <Field label="Full name" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass(!!errors.name)}
              autoComplete="name"
            />
          </Field>

          <Field label="Phone number" error={errors.phone}>
            <input
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={inputClass(!!errors.phone)}
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>

          <Field label="Address" error={errors.address}>
            <textarea
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className={inputClass(!!errors.address)}
              rows={3}
              autoComplete="street-address"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="City" error={errors.city}>
              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className={inputClass(!!errors.city)}
                autoComplete="address-level2"
              />
            </Field>
            <Field label="State" error={errors.state}>
              <input
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                className={inputClass(!!errors.state)}
                autoComplete="address-level1"
              />
            </Field>
          </div>

          <Field label="Pincode" error={errors.pincode}>
            <input
              value={form.pincode}
              onChange={(e) => updateField("pincode", e.target.value)}
              className={inputClass(!!errors.pincode)}
              autoComplete="postal-code"
              inputMode="numeric"
            />
          </Field>

          {submitError && (
            <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">
              {submitError}
            </p>
          )}

          <Button type="submit" variant="whatsapp" size="lg" disabled={submitting} className="w-full sm:w-auto">
            <MessageCircle size={16} />
            {submitting ? "Preparing your order…" : "Order on WhatsApp"}
          </Button>
        </form>

        <div>
          <div className="border border-line bg-surface p-5">
            <p className="font-display text-lg italic text-ink">Order summary</p>
            <ul className="mt-4 space-y-3">
              {lines.map((l) => (
                <li key={`${l.productId}-${l.size}`} className="flex justify-between text-[13.5px] text-ink-soft">
                  <span className="pr-2">
                    {l.name} {l.size && `(${l.size})`} × {l.quantity}
                  </span>
                  <span className="shrink-0 text-ink">{formatPrice(l.unitPrice * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-4 text-[15px] text-ink">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full border bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-ink ${
    hasError ? "border-danger" : "border-line"
  }`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[12px] text-danger">{error}</span>}
    </label>
  );
}
