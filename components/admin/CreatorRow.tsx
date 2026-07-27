"use client";

import { useState } from "react";
import Link from "next/link";

type Creator = {
  id: string;
  username: string;
  display_name: string;
  phone: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  blocked_reason: string | null;
  created_at: string;
};

export default function CreatorRow({
  creator,
  productCount,
}: {
  creator: Creator;
  productCount: number;
}) {
  const [isVerified, setIsVerified] = useState(creator.is_verified);
  const [isBlocked, setIsBlocked] = useState(creator.is_blocked);
  const [loading, setLoading] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [showBlockInput, setShowBlockInput] = useState(false);

  async function toggleVerify() {
    setLoading(true);
    const res = await fetch(`/api/admin/creators/${creator.id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !isVerified }),
    });
    if (res.ok) setIsVerified(!isVerified);
    setLoading(false);
  }

  async function toggleBlock() {
    if (!isBlocked && !showBlockInput) {
      setShowBlockInput(true);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/creators/${creator.id}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isBlocked: !isBlocked,
        reason: blockReason || null,
      }),
    });
    if (res.ok) {
      setIsBlocked(!isBlocked);
      setShowBlockInput(false);
    }
    setLoading(false);
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{creator.display_name}</p>
            <span className="text-zinc-500 text-sm">@{creator.username}</span>
            {isVerified && (
              <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full">
                Verified
              </span>
            )}
            {isBlocked && (
              <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded-full">
                Blocked
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">
            {productCount} product{productCount !== 1 ? "s" : ""} ·{" "}
            {creator.phone ?? "no phone"} · joined{" "}
            {new Date(creator.created_at).toLocaleDateString("en-IN")}
          </p>
          {isBlocked && creator.blocked_reason && (
            <p className="text-sm text-red-400 mt-1">
              Reason: {creator.blocked_reason}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${creator.username}`}
            target="_blank"
            className="text-sm text-brand-500 hover:underline"
          >
            View store
          </Link>
          <button
            onClick={toggleVerify}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50"
          >
            {isVerified ? "Unverify" : "Verify"}
          </button>
          <button
            onClick={toggleBlock}
            disabled={loading}
            className={`text-xs px-3 py-1.5 rounded-full border disabled:opacity-50 ${
              isBlocked
                ? "border-emerald-700 text-emerald-400 hover:bg-emerald-950"
                : "border-red-800 text-red-400 hover:bg-red-950"
            }`}
          >
            {isBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      </div>

      {showBlockInput && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Reason for blocking (visible in payout hold email)"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm outline-none"
          />
          <button
            onClick={toggleBlock}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700"
          >
            Confirm block
          </button>
        </div>
      )}
    </div>
  );
}
