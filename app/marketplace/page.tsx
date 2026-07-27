import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BannerCarousel from "@/components/BannerCarousel";

export default async function MarketplacePage() {
  const supabase = createClient();

  const { data: banners } = await supabase
    .from("banners")
    .select("id, image_url, link_url")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, slug, title, description, price_inr, thumbnail_url, profiles(username, display_name)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="font-bold tracking-tight text-zinc-900">
            CourseMarket
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-zinc-900 text-white px-4 py-2 rounded-full hover:bg-zinc-800 transition"
          >
            Start selling
          </Link>
        </div>

        {(banners?.length ?? 0) > 0 && (
          <div className="mb-8">
            <BannerCarousel banners={banners!} />
          </div>
        )}

        <h1 className="text-2xl font-bold text-zinc-900 mb-6">
          Browse all products
        </h1>

        {(products?.length ?? 0) === 0 ? (
          <p className="text-zinc-500">No products available yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products!.map((p: any) => (
              <Link
                key={p.id}
                href={`/${p.profiles?.username}/${p.slug}`}
                className="block bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-video bg-zinc-100">
                  {p.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnail_url}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-900">{p.title}</h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    by @{p.profiles?.username}
                  </p>
                  <p className="mt-2 font-bold text-zinc-900">
                    ₹{(p.price_inr / 100).toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
