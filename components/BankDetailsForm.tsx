"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  phone: string | null;
} | null;

export default function BankDetailsForm({ profile }: { profile: Profile }) {
  const supabase = createClient();

  const [accountName, setAccountName] = useState(
    profile?.bank_account_name ?? ""
  );
  const [accountNumber, setAccountNumber] = useState(
    profile?.bank_account_number ?? ""
  );
  const [ifsc, setIfsc] = useState(profile?.bank_ifsc ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        bank_account_name: accountName,
        bank_account_number: accountNumber,
        bank_ifsc: ifsc.toUpperCase(),
        phone,
      })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Phone number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="+91XXXXXXXXXX"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Account holder name
        </label>
        <input
          type="text"
          required
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Bank account number
        </label>
        <input
          type="text"
          required
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          IFSC code
        </label>
        <input
          type="text"
          required
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 uppercase"
          placeholder="e.g. HDFC0001234"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-zinc-800 transition disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save bank details"}
      </button>
    </form>
  );
}
