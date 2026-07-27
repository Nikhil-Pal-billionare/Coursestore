import { createClient } from "@/lib/supabase/server";
import AdRequestForm from "@/components/AdRequestForm";

export default async function AdsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, price_inr")
    .eq("creator_id", user!.id)
    .eq("status", "published");

  const { data: requests } = await supabase
    .from("ad_requests")
    .select(
      "id, budget_inr, notes, status, admin_notes, payment_status, created_at, products(title)"
    )
    .eq("creator_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">
        Promote your product
      </h1>
      <p className="text-zinc-600 mb-6">
        We&apos;ll run Meta ads for your product with the budget you choose.
        Pay the budget upfront, and our team will set up and manage the
        campaign for you.
      </p>

      {(products?.length ?? 0) === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 text-center text-zinc-600">
          You need at least one published product before requesting ads.
        </div>
      ) : (
        <AdRequestForm products={products!} />
      )}

      {(requests?.length ?? 0) > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold text-zinc-900 mb-3">
            Your ad requests
          </h2>
          <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
            {requests!.map((r: any) => (
              <div key={r.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">
                      {r.products?.title ?? "-"}
                    </p>
                    <p className="text-sm text-zinc-500">
                      Budget: ₹{(r.budget_inr / 100).toLocaleString("en-IN")}
                      {" · "}
                      Payment: {r.payment_status}
                    </p>
                  </div>
                  <AdStatusBadge status={r.status} />
                </div>
                {r.admin_notes && (
                  <p className="text-sm text-zinc-600 mt-2 bg-zinc-50 rounded-lg p-2">
                    {r.admin_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-blue-50 text-blue-700",
    running: "bg-emerald-50 text-emerald-700",
    completed: "bg-zinc-100 text-zinc-600",
    rejected: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
        colors[status] ?? "bg-zinc-100 text-zinc-600"
      }`}
    >
      {status}
    </span>
  );
}
