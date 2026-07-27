"use client";

import { useState } from "react";

type Refund = {
  id: string;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  orders: {
    id: string;
    buyer_email: string;
    amount_inr: number;
    products: { title: string } | null;
    profiles: { username: string } | null;
  } | null;
};

export default function RefundRow({ refund }: { refund: Refund }) {
  const [status, setStatus] = useState(refund.status);
  const [loading, setLoading] = useState(false);

  async function resolve(newStatus: "approved" | "rejected") {
    setLoading(true);
    const res = await fetch(`/api/admin/refunds/${refund.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setStatus(newStatus);
    setLoading(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-white">
            {refund.orders?.products?.title ?? "-"}
          </p>
          <p className="text-sm text-zinc-400">
            @{refund.orders?.profiles?.username ?? "-"} ·{" "}
            {refund.orders?.buyer_email}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-white">
            ₹{((refund.orders?.amount_inr ?? 0) / 100).toLocaleString("en-IN")}
          </p>
          <StatusBadge status={status} />
        </div>
      </div>

      <p className="text-sm text-zinc-300 mt-3 bg-zinc-800/50 rounded-lg p-3">
        {refund.reason}
      </p>

      {status === "pending" && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => resolve("approved")}
            disabled={loading}
            className="text-sm px-4 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => resolve("rejected")}
            disabled={loading}
            className="text-sm px-4 py-1.5 rounded-full bg-red-800 hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {status === "approved" && (
        <p className="text-xs text-emerald-400 mt-3">
          Approved - process the refund manually in the Razorpay dashboard.
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "text-amber-400",
    approved: "text-emerald-400",
    rejected: "text-red-400",
  };
  return (
    <p className={`text-xs ${colors[status] ?? "text-zinc-400"}`}>{status}</p>
  );
}
