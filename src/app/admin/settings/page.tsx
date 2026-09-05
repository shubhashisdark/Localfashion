"use client";

import { useState } from "react";
import { useAdminData } from "@/lib/admin/admin-data-context";
import { storeSettingsFormSchema } from "@/lib/validations/admin";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useAdminData();
  const [form, setForm] = useState(settings);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = storeSettingsFormSchema.safeParse({
      ...form,
      email: form.email ?? "",
      instagram_url: form.instagram_url ?? "",
    });
    if (!result.success) {
      setErrors(result.error.issues.map((i) => i.message));
      return;
    }
    setErrors([]);
    updateSettings({ ...form, ...result.data, email: result.data.email || null, instagram_url: result.data.instagram_url || null });
    setSaved(true);
  }

  return (
    <div>
      <h1 className="font-display text-2xl italic text-ink">Settings</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4">
        {errors.length > 0 && (
          <div className="space-y-1 border border-danger/30 bg-danger/5 px-4 py-3">
            {errors.map((err) => <p key={err} className="text-[13px] text-danger">{err}</p>)}
          </div>
        )}

        <Field label="Store name">
          <input value={form.store_name} onChange={(e) => update("store_name", e.target.value)} className={inputClass} />
        </Field>

        <Field label="WhatsApp number" hint="Country code + number, digits only, e.g. 919876543210">
          <input value={form.whatsapp_number} onChange={(e) => update("whatsapp_number", e.target.value)} className={inputClass} />
        </Field>

        <Field label="Phone (displayed on site)">
          <input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
        </Field>

        <Field label="Email">
          <input value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} className={inputClass} />
        </Field>

        <Field label="Instagram URL">
          <input value={form.instagram_url ?? ""} onChange={(e) => update("instagram_url", e.target.value)} className={inputClass} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="City">
            <input value={form.city ?? ""} onChange={(e) => update("city", e.target.value)} className={inputClass} />
          </Field>
          <Field label="State">
            <input value={form.state ?? ""} onChange={(e) => update("state", e.target.value)} className={inputClass} />
          </Field>
        </div>

        <Field label="Address">
          <input value={form.address ?? ""} onChange={(e) => update("address", e.target.value)} className={inputClass} />
        </Field>

        <Field label="Pincode">
          <input value={form.pincode ?? ""} onChange={(e) => update("pincode", e.target.value)} className={inputClass} />
        </Field>

        <Field label="Currency">
          <input value={form.currency} onChange={(e) => update("currency", e.target.value)} className={inputClass} maxLength={3} />
        </Field>

        <div className="flex items-center gap-3">
          <Button type="submit">Save settings</Button>
          {saved && <span className="text-[13px] text-success">Saved for this session.</span>}
        </div>
      </form>
    </div>
  );
}

const inputClass = "w-full border border-line bg-surface px-3.5 py-2.5 text-[14px] focus:border-ink";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-ink-faint">{hint}</span>}
    </label>
  );
}
