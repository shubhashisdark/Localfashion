# Local Fashion

A mobile-first fashion e-commerce site for an Instagram-based fashion
business. Customers browse, pick a size, and order on WhatsApp — no
customer accounts, no payment gateway in V1.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase
(Postgres + Auth + Storage) · WhatsApp click-to-chat.

---

## What's here right now

The site runs today against realistic **mock data** (`src/lib/data/store.ts`)
so you can see and click through the entire experience without setting up a
database first. Every data-access function in that file has the exact name
and shape it will have once wired to Supabase — swapping the implementation
is a matter of editing that one file's internals, not the pages that call it.

Similarly, the admin panel's edits (add a product, change stock, create a
promotion…) are held in memory for your current browser session via
`src/lib/admin/admin-data-context.tsx`, so the whole admin UI is fully
interactive today. Each mutation function has a `// TODO (Phase 2/3)`
comment showing exactly which Supabase call replaces it once your project
is connected.

### Done
- Homepage (hero/promo banners, featured products, categories, Instagram
  section, brand story)
- Shop page with search, category/size/price/in-stock filters, sorting
- Category pages
- Product detail page: gallery (thumbnails, desktop hover-zoom, mobile
  swipe + counter, fullscreen lightbox), size selector with sold-out
  states, quantity stepper, add-to-cart, direct WhatsApp order, similar
  products
- Guest cart (localStorage-persisted), cart page, checkout with customer
  details form
- WhatsApp order message generation (full cart + direct single-product)
- `/api/orders` — validates the order, re-checks stock server-side, creates
  an order id (persists to Supabase automatically once configured)
- About / Contact / Privacy / Terms
- Admin: login (Supabase Auth), dashboard, products (list/add/edit/
  archive/publish), image uploader (drag-drop, reorder, primary image),
  categories, inventory (per-size stock), promotions, homepage controls
  (featured products, category visibility), store settings
- `/admin/*` protected server-side via middleware + Supabase session
- Full Postgres schema with Row Level Security (`supabase/schema.sql`)
- SEO basics: per-product metadata, canonical URLs, Open Graph, JSON-LD
  product structured data

### Not yet wired up (by design — see `supabase/schema.sql` and the TODOs)
- Actual Supabase reads/writes (the app currently runs on mock/in-memory
  data everywhere; the schema, RLS policies, and client setup are ready —
  see **Connecting Supabase** below)
- Sitemap.xml / robots.txt generation
- Razorpay (intentionally out of scope for V1 — see schema's
  `payment_status` / `payment_provider` columns, which exist for this)

---

## Getting started locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The site works immediately on mock data — no
environment variables required to browse it.

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com) (the free tier
   is fine for testing — see the note on free tiers below).
2. In the SQL editor, run `supabase/schema.sql`. This creates every table,
   the derived sold-out view, and all Row Level Security policies.
3. Create your first admin: **Authentication → Users → Add user**, then in
   the SQL editor:
   ```sql
   insert into admin_users (id) values ('<the-user-uuid-you-just-created>');
   ```
4. **Storage → New bucket** named `product-images`, set it **Public**, then
   run the commented-out storage policies at the bottom of `schema.sql`.
5. Copy `.env.example` to `.env.local` and fill in your project's URL and
   anon key (Project Settings → API).
6. Replace the contents of `src/lib/data/store.ts`'s query functions with
   real Supabase queries (the function signatures already match what the
   rest of the app expects), and do the same for the mutation functions in
   `src/lib/admin/admin-data-context.tsx`.

## A note on free tiers

Supabase's and Vercel's free tiers are great for testing but come with
limits (e.g. a paused-after-inactivity free Postgres project, storage/
bandwidth caps). Check current terms on both providers before relying on
this for real, ongoing commercial traffic — and note that a paused-project
scenario should fail gracefully (show a friendly error) rather than break
the site, which is worth testing before launch.

## Deployment

Any Next.js host works; Vercel's free tier is the natural low-cost choice
for V1 testing:

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same environment variables from `.env.local`.
4. Deploy.

## Project structure

```
src/
  app/
    (storefront)/        customer-facing routes (/, /shop, /product/[slug], /cart, /checkout, ...)
    admin/                admin panel (protected by middleware.ts)
    api/orders/           order submission endpoint
  components/
    ui/, layout/, products/, cart/, promotions/, admin/
  lib/
    data/store.ts         mock data + the query functions to swap for Supabase
    admin/                in-memory admin mutations (swap for Supabase writes)
    supabase/              browser + server Supabase clients
    whatsapp/              WhatsApp message builders
    validations/           Zod schemas (checkout + admin forms)
    cart/                  guest cart context
  types/                  domain types shared by the mock layer and the future DB layer
supabase/schema.sql        full schema + RLS policies (+ commented storage policies)
```

## Before going live

- Replace mock data / in-memory admin state with real Supabase calls (see above)
- Create your real admin account; remove any test accounts
- Set your real WhatsApp number, Instagram URL, and address in
  `/admin/settings` (or directly in the `store_settings` row)
- Replace placeholder product photography
- Re-check Supabase and hosting free-tier limits against your expected traffic
- Verify HTTPS and your custom domain
- Add `sitemap.xml` / `robots.txt` once the real product catalogue exists
