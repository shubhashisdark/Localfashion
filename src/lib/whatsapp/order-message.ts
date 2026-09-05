import type { CartLine, CustomerDetails, StoreSettings } from "@/types";
import { formatPrice } from "@/lib/utils";

interface BuildOrderMessageArgs {
  orderId?: string;
  storeName: string;
  items: CartLine[];
  customer: CustomerDetails;
  currency?: string;
}

/**
 * Builds the plain-text WhatsApp order message. Kept as pure text
 * generation (no DB access) so it can be reused for both the full-cart
 * checkout flow and a direct "Order on WhatsApp" from a single product page.
 */
export function buildOrderMessage({
  orderId,
  storeName,
  items,
  customer,
  currency = "INR",
}: BuildOrderMessageArgs): string {
  const lines: string[] = [];

  lines.push(`Hello ${storeName},`);
  lines.push("");
  lines.push("I would like to order:");
  lines.push("");

  items.forEach((item, index) => {
    const subtotal = item.unitPrice * item.quantity;
    lines.push(`${index + 1}. ${item.name}`);
    if (item.size) lines.push(`   Size: ${item.size}`);
    lines.push(`   Quantity: ${item.quantity}`);
    lines.push(`   Price: ${formatPrice(item.unitPrice, currency)}`);
    lines.push(`   Subtotal: ${formatPrice(subtotal, currency)}`);
    lines.push("");
  });

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  if (orderId) lines.push(`Order ID: ${orderId}`);
  lines.push(`Total: ${formatPrice(total, currency)}`);
  lines.push("");
  lines.push("Customer Details:");
  lines.push("");
  lines.push(`Name: ${customer.name}`);
  lines.push(`Phone: ${customer.phone}`);
  lines.push(`Address: ${customer.address}`);
  lines.push(`City: ${customer.city}`);
  lines.push(`State: ${customer.state}`);
  lines.push(`Pincode: ${customer.pincode}`);
  lines.push("");
  lines.push("Thank you.");

  return lines.join("\n");
}

/**
 * Direct "Order on WhatsApp" from a product page, before checkout details
 * exist yet. Still carries size/quantity/price so stock isn't ambiguous —
 * the owner can ask for name/address/pincode in the chat itself.
 */
export function buildDirectItemMessage({
  storeName,
  item,
  currency = "INR",
}: {
  storeName: string;
  item: CartLine;
  currency?: string;
}): string {
  const lines: string[] = [];
  const subtotal = item.unitPrice * item.quantity;

  lines.push(`Hello ${storeName},`);
  lines.push("");
  lines.push("I would like to order:");
  lines.push("");
  lines.push(`${item.name}`);
  if (item.size) lines.push(`Size: ${item.size}`);
  lines.push(`Quantity: ${item.quantity}`);
  lines.push(`Price: ${formatPrice(item.unitPrice, currency)}`);
  lines.push(`Subtotal: ${formatPrice(subtotal, currency)}`);
  lines.push("");
  lines.push("Please share the delivery details you need from me.");

  return lines.join("\n");
}

/** Builds a wa.me click-to-chat link with the message URL-encoded. */
export function buildWhatsAppLink(settings: Pick<StoreSettings, "whatsapp_number">, message: string): string {
  const digitsOnly = settings.whatsapp_number.replace(/[^0-9]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
