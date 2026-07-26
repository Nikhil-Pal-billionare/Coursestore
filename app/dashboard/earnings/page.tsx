import { createClient } from "@/lib/supabase/server";

export default async function EarningsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, buyer_email, amount_inr, platform_fee_inr, creator_earning_inr, status, paid_at, products(title)"
    )
    .eq("creator_id", user!.id)
    .eq("status", "paid")
    .order("paid_at", { ascending: false });

  const totalEarnings =
    orders?.reduce((sum, o) => sum + o.creator_earning_inr, 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Earnings</h1>
      <p className="text-zinc-600 mb-6">
        Total earned:{" "}
        <span className="font-semibold text-zinc-900">
          ₹{(totalEarnings / 100).toLocaleString("en-IN")}
        </span>
      </p>

      {(orders?.length ?? 0) === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-zinc-600">
          No sales yet.
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium">Buyer</th>
                <th className="px-4 py-2 font-medium">Sale price</th>
                <th className="px-4 py-2 font-medium">Platform fee</th>
                <th className="px-4 py-2 font-medium">You earned</th>
                <th className="px-4 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders!.map((o: any) => (
                <tr key={o.id}>
                  <td className="px-4 py-2 text-zinc-900">
                    {o.products?.title ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-zinc-600">{o.buyer_email}</td>
                  <td className="px-4 py-2 text-zinc-900">
                    ₹{(o.amount_inr / 100).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">
                    ₹{(o.platform_fee_inr / 100).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-2 font-medium text-green-700">
                    ₹{(o.creator_earning_inr / 100).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">
                    {o.paid_at
                      ? new Date(o.paid_at).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
