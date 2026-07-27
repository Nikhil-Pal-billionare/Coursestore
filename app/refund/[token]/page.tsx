"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function RefundRequestPage() {
  const params = useParams();
  const token = params.token as string;

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (reason.trim().length < 10) {
      setError("Please describe the issue in a bit more detail.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/refund-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, reason }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not submit refund request.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="font-semibold text-zinc-900 text-lg">
            Refund request submitted
          </p>
          <p className="text-sm text-zinc-600 mt-2">
            We&apos;ll review it and get back to you. You don&apos;t need to
            do anything else.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-zinc-900">Request a refund</h1>
        <p className="text-sm text-zinc-600 mt-1">
          Tell us what went wrong. We review every request manually.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              What&apos;s the issue?
            </label>
            <textarea
              required
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. the file won't open, content doesn't match the description, wrong product, etc."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-zinc-800 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit refund request"}
          </button>
        </form>
      </div>
    </main>
  );
}
