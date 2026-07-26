"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please upload your product file.");
      return;
    }
    const priceInPaise = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInPaise) || priceInPaise <= 0) {
      setError("Enter a valid price.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const slug = slugify(title) + "-" + Date.now().toString(36);

    // Upload product file to private bucket, path prefixed with user id
    // so storage RLS policies (which check foldername = auth.uid()) apply.
    const filePath = `${user.id}/${slug}/${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("product-files")
      .upload(filePath, file);

    if (uploadError) {
      setError(`File upload failed: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    let thumbnailUrl: string | null = null;
    if (thumbnail) {
      const thumbPath = `${user.id}/${slug}/${thumbnail.name}`;
      const { error: thumbError } = await supabase.storage
        .from("thumbnails")
        .upload(thumbPath, thumbnail);

      if (!thumbError) {
        const { data: publicUrlData } = supabase.storage
          .from("thumbnails")
          .getPublicUrl(thumbPath);
        thumbnailUrl = publicUrlData.publicUrl;
      }
    }

    const { error: insertError } = await supabase.from("products").insert({
      creator_id: user.id,
      slug,
      title,
      description,
      price_inr: priceInPaise,
      file_path: filePath,
      file_name: file.name,
      file_size_bytes: file.size,
      thumbnail_url: thumbnailUrl,
      status: "published",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard/products");
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">
        Add a new product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. Complete Pinterest Growth Course"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="What will buyers get?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Price (INR)
          </label>
          <input
            type="number"
            required
            min="1"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="499"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Thumbnail image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Product file (the course/ebook buyers will download)
          </label>
          <input
            type="file"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
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
          {loading ? "Uploading..." : "Publish product"}
        </button>
      </form>
    </div>
  );
}
