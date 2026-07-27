"use client";

import { useState } from "react";

type AdRequest = {
  id: string;
  budget_inr: number;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  payment_status: string;
  created_at: string;
  products: { title: string } | null;
  profiles: { username: string; display_name: string } | null;
};

const STATUSES = ["pending", "approved", "running", "completed", "rejected"];

export default function AdRequestAdminRow({
  request,
}: {
  request: AdRequest;
}) {
  const [status, setStatus] = useState(request.status);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/admin/ads/${request.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-white">
            {request.products?.title ?? "-"}
          </p>
          <p className="text-sm text-zinc-400">
            @{request.profiles?.username ?? "-"} ·{" "}
            {request.profiles?.display_name}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-white">
            ₹{(request.budget_inr / 100).toLocaleString("en-IN")}
          </p>
          <p
            className={`text-xs ${
              request.payment_status === "paid"
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            {request.payment_status}
          </p>
        </div>
      </div>

      {request.notes && (
        <p className="text-sm text-zinc-400 mt-3 bg-zinc-800/50 rounded-lg p-3">
          {request.notes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Internal notes (e.g. ran 7 days, 3.2k reach)"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          className="flex-1 min-w-[200px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm outline-none"
        />
        <button
          onClick={save}
          disabled={saving}
          className="text-sm px-4 py-1.5 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
}
