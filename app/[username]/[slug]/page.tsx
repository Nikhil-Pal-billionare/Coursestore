import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutPanel from "@/components/CheckoutPanel";

export default async function ProductPage({
  params,
}: {
  params: { username: string; slug: string };
}) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) notFound();

  const { data: product } = await supabase
    .from("products")
    .select("id, title, description, price_inr, thumbnail_url, status")
    .eq("creator_id", profile.id)
    .eq("slug", params.slug)
    .maybeSingle();

  if (!product || product.status !== "published") notFound();

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-6 py-16 grid sm:grid-cols-2 gap-10">
        <div>
          <div className="aspect-video bg-zinc-100 rounded-xl overflow-hidden">
            {product.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.thumbnail_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mt-5">
            {product.title}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            by {profile.display_name}
          </p>
          {product.description && (
            <p className="text-zinc-600 mt-4 whitespace-pre-line">
              {product.description}
            </p>
          )}
        </div>

        <div>
          <CheckoutPanel
            productId={product.id}
            title={product.title}
            priceInPaise={product.price_inr}
          />
        </div>
      </div>
    </main>
  );
}
