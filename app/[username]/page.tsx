import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function StorefrontPage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, slug, title, description, price_inr, thumbnail_url")
    .eq("creator_id", profile.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-zinc-200 mx-auto overflow-hidden">
            {profile.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mt-4">
            {profile.display_name}
          </h1>
          {profile.bio && (
            <p className="text-zinc-600 mt-1 max-w-md mx-auto">{profile.bio}</p>
          )}
        </div>

        {(products?.length ?? 0) === 0 ? (
          <p className="text-center text-zinc-500">
            No products available yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {products!.map((p) => (
              <Link
                key={p.id}
                href={`/${profile.username}/${p.slug}`}
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
                  {p.description && (
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  <p className="mt-3 font-bold text-zinc-900">
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
