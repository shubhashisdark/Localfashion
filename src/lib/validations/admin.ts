import { z } from "zod";

export const productVariantSchema = z.object({
  size: z.string().trim().min(1, "Size is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(150),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  description: z.string().trim().min(10, "Add a short description"),
  price: z.number().positive("Price must be greater than 0"),
  sale_price: z.number().positive().nullable().optional(),
  category_id: z.string().min(1, "Choose a category"),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  variants: z.array(productVariantSchema).min(1, "Add at least one size"),
}).refine(
  (data) => data.sale_price == null || data.sale_price < data.price,
  { message: "Sale price must be lower than the regular price", path: ["sale_price"] }
);

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(300).optional(),
  status: z.enum(["active", "hidden", "archived"]).default("active"),
});

export const promotionFormSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(200).optional(),
  discount_text: z.string().trim().max(60).optional(),
  button_text: z.string().trim().min(2).max(40),
  target_url: z.string().trim().min(1),
  display_order: z.number().int().min(0),
  is_active: z.boolean().default(true),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export const storeSettingsFormSchema = z.object({
  store_name: z.string().trim().min(2).max(120),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^[0-9]{10,15}$/, "Use country code + number, digits only, e.g. 919876543210"),
  phone: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  instagram_url: z.string().trim().url().optional().or(z.literal("")),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  currency: z.string().trim().min(3).max(3).default("INR"),
});
