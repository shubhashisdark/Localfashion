import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { placeOrderSchema } from "@/lib/validations/checkout";
import { products } from "@/lib/data/store";

/**
 * POST /api/orders
 *
 * Phase 2/3 note: once Supabase is configured (NEXT_PUBLIC_SUPABASE_URL +
 * key envs present), swap the in-memory branch below for real inserts into
 * `orders` / `order_items` using the server Supabase client, inside a
 * transaction/RPC that also decrements `product_variants.stock`. The
 * request/response contract (and the stock re-validation above it) stays
 * the same either way, so nothing calling this route needs to change.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = placeOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { customer, items } = parsed.data;

  // Server-side stock re-validation — never trust the client's cart alone.
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.status !== "published") {
      return NextResponse.json(
        { error: `"${item.name}" is no longer available.` },
        { status: 409 }
      );
    }
    const variant = product.variants.find((v) => v.size === item.size);
    if (!variant || variant.stock < item.quantity) {
      return NextResponse.json(
        {
          error: `Only ${variant?.stock ?? 0} left of "${item.name}"${
            item.size ? ` in size ${item.size}` : ""
          }. Please update your cart.`,
        },
        { status: 409 }
      );
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const orderId = randomUUID();

  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseConfigured) {
    // TODO (Phase 2/3): insert into `orders` + `order_items` via the server
    // Supabase client here, with product/price snapshots, then return the
    // real generated order id below instead of the random one.
  }

  return NextResponse.json({
    orderId,
    subtotal,
    total: subtotal,
    customer,
    persisted: supabaseConfigured,
  });
}
