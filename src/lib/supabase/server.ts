import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server client — for Server Components, Route Handlers, and Server Actions.
 * Uses the anon key + the request's cookies, so RLS policies apply exactly
 * as they would for that signed-in (or anonymous) user. Never import the
 * service-role key here or anywhere that ships to the client.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component sometimes; middleware
            // refreshes the session there instead, so this can be ignored.
          }
        },
      },
    }
  );
}
