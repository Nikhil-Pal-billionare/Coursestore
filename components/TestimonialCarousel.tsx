"use client";

import { useState } from "react";

const cards = [
  {
    quote:
      "You set your own price, write your own description, and pick your own thumbnail. It's your storefront, not a listing buried in someone else's catalog.",
    label: "Full control over your store",
  },
  {
    quote:
      "The moment a buyer pays, they get a secure download link automatically. No manual emailing files, no waiting.",
    label: "Automatic delivery",
  },
  {
    quote:
      "Every sale shows you exactly what you earned after the platform fee - no hidden deductions, no surprises at payout time.",
    label: "Transparent earnings",
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const card = cards[index];

  function next() {
    setIndex((i) => (i + 1) % cards.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <svg
          className="w-8 h-8 text-brand-100"
          fill="currentColor"
          viewBox="0 0 32 32"
        >
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
        <span className="text-sm text-zinc-400">
          {index + 1} / {cards.length}
        </span>
      </div>

      <p className="text-xl font-medium text-zinc-900 leading-relaxed">
        &ldquo;{card.quote}&rdquo;
      </p>

      <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500">
          {card.label}
        </span>
        <div className="flex gap-2">
          <button
            onClick={prev}
            aria-label="Previous"
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition"
          >
            ←
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
