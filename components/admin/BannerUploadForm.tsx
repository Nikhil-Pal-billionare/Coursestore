"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BannerUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("linkUrl", linkUrl);

    const res = await fetch("/api/admin/banners", {
      method: "POST",
      body: formData,
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed.");
      return;
    }

    setFile(null);
    setLinkUrl("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3"
    >
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Banner image (recommended 1200x400px, landscape)
        </label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Link URL (optional - where clicking the banner goes)
        </label>
        <input
          type="text"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="/some-username or https://..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-brand-600 hover:bg-brand-700 text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Add banner"}
      </button>
    </form>
  );
}
