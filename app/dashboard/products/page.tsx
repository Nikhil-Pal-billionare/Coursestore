import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, price_inr, status, thumbnail_url")
    .eq("creator_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
        <Link
          href="/dashboard/products/new"
          className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-zinc-800 transition"
        >
          + New product
        </Link>
      </div>

      {(products?.length ?? 0) === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-zinc-600">
          No products yet.
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
          {products!.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-zinc-100 flex-shrink-0 overflow-hidden">
                  {p.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium text-zinc-900">{p.title}</p>
                  <p className="text-sm text-zinc-500">
                    ₹{(p.price_inr / 100).toLocaleString("en-IN")} ·{" "}
                    <span
                      className={
                        p.status === "published"
                          ? "text-green-600"
                          : "text-amber-600"
                      }
                    >
                      {p.status}
                    </span>
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/products/${p.id}/edit`}
                className="text-sm font-medium text-brand-600"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
