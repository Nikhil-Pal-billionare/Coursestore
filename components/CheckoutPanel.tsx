"use client";

import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPanel({
  productId,
  title,
  priceInPaise,
}: {
  productId: string;
  title: string;
  priceInPaise: number;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    if (!email) {
      setError("Enter your email to receive the download link.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, buyerEmail: email, buyerName: name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not start checkout.");
        setLoading(false);
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: "INR",
        name: title,
        description: "Digital product purchase",
        order_id: data.razorpayOrderId,
        prefill: { email, name },
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.downloadUrl) {
            setSuccessUrl(verifyData.downloadUrl);
          } else {
            setError(
              "Payment succeeded but verification failed. Contact support with your payment ID: " +
                response.razorpay_payment_id
            );
          }
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
      setLoading(false);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setLoading(false);
    }
  }

  if (successUrl) {
    // The download URL is /api/download/[token] - extract the token so we
    // can link to the matching refund request page for this order.
    const downloadToken = successUrl.split("/").pop();

    return (
      <div className="bg-white border border-green-200 rounded-xl p-6">
        <p className="font-semibold text-green-700">Payment successful!</p>
        <p className="text-sm text-zinc-600 mt-1">
          Your download is ready. We&apos;ve also emailed the link to you.
        </p>
        <a
          href={successUrl}
          className="inline-block mt-4 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Download now
        </a>
        <p className="text-xs text-zinc-400 mt-4">
          Having an issue with this purchase?{" "}
          <a
            href={`/refund/${downloadToken}`}
            className="underline text-zinc-500"
          >
            Request a refund
          </a>
        </p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sticky top-6">
        <p className="text-3xl font-bold text-zinc-900">
          ₹{(priceInPaise / 100).toLocaleString("en-IN")}
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="email"
            required
            placeholder="Your email (for download link)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">
            {error}
          </p>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full mt-4 bg-zinc-900 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-zinc-800 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Buy now"}
        </button>
        <p className="text-xs text-zinc-400 mt-3 text-center">
          Secure payment via Razorpay. Instant download after purchase.
        </p>
      </div>
    </>
  );
}
