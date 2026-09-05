import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client — safe to use in Client Components.
 * Only ever uses the anon key; Row Level Security enforces what it can do.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
