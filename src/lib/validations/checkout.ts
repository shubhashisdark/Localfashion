import { z } from "zod";

export const customerDetailsSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter your full address").max(300),
  city: z.string().trim().min(2, "Enter your city").max(100),
  state: z.string().trim().min(2, "Enter your state").max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{4,10}$/, "Enter a valid pincode"),
});

export type CustomerDetailsInput = z.infer<typeof customerDetailsSchema>;

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  size: z.string().nullable(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  maxStock: z.number().int().nonnegative(),
});

export const placeOrderSchema = z.object({
  customer: customerDetailsSchema,
  items: z.array(cartLineSchema).min(1, "Your cart is empty"),
});
