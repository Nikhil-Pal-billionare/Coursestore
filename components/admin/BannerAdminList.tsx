"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Banner = {
  id: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
};

export default function BannerAdminList({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleActive(id: string, current: boolean) {
    setLoadingId(id);
    await fetch(`/api/admin/banners/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setLoadingId(null);
    router.refresh();
  }

  async function deleteBanner(id: string) {
    if (!confirm("Delete this banner?")) return;
    setLoadingId(id);
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    setLoadingId(null);
    router.refresh();
  }

  if (banners.length === 0) {
    return <p className="text-zinc-500 text-sm">No banners uploaded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {banners.map((b) => (
        <div
          key={b.id}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.image_url}
            alt=""
            className="w-32 h-16 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-400 truncate">
              {b.link_url || "no link"}
            </p>
            <p
              className={`text-xs ${
                b.is_active ? "text-emerald-400" : "text-zinc-500"
              }`}
            >
              {b.is_active ? "Active" : "Hidden"}
            </p>
          </div>
          <button
            onClick={() => toggleActive(b.id, b.is_active)}
            disabled={loadingId === b.id}
            className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50"
          >
            {b.is_active ? "Hide" : "Show"}
          </button>
          <button
            onClick={() => deleteBanner(b.id)}
            disabled={loadingId === b.id}
            className="text-xs px-3 py-1.5 rounded-full border border-red-800 text-red-400 hover:bg-red-950 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
