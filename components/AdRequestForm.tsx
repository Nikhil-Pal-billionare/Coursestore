"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function AdRequestForm({
  products,
}: {
  products: { id: string; title: string; price_inr: number }[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const budgetInPaise = Math.round(parseFloat(budget) * 100);
    if (isNaN(budgetInPaise) || budgetInPaise < 50000) {
      setError("Minimum ad budget is ₹500.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/ads/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, budgetInPaise, notes }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create ad request.");
        setLoading(false);
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: "Ad campaign budget",
        description: "Meta ads promotion budget",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/ads/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adRequestId: data.adRequestId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            router.refresh();
          } else {
            setError(
              "Payment succeeded but confirmation failed. Contact support with payment ID: " +
                response.razorpay_payment_id
            );
          }
          setLoading(false);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: { color: "#18181b" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Which product?
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Ad budget (INR) - minimum ₹500
          </label>
          <input
            type="number"
            required
            min="500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="2000"
          />
          <p className="text-xs text-zinc-500 mt-1">
            This is the full budget we&apos;ll spend running Meta ads for your
            product. We&apos;ll reach out to confirm targeting before we
            launch the campaign.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Notes (target audience, goals, anything we should know)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
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
          {loading ? "Processing..." : "Pay budget & request campaign"}
        </button>
      </form>
    </>
  );
}
