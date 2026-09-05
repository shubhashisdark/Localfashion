"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("Incorrect email or password.");
      return;
    }

    router.push(searchParams.get("next") ?? "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-2xl italic text-ink">Local Fashion</p>
        <p className="mt-1 text-center text-[12px] uppercase tracking-[0.1em] text-ink-faint">
          Admin login
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <label className="block">
            <span className="mb-1.5 block text-[13px] text-ink">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] text-ink">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink focus:border-ink"
            />
          </label>

          {error && (
            <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[12px] text-ink-faint">
          Admin accounts are created directly in Supabase — there is no public
          sign-up.
        </p>
      </div>
    </div>
  );
}
