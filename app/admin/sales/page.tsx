import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminSalesPage() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, buyer_email, buyer_name, amount_inr, platform_fee_inr, creator_earning_inr, status, created_at, paid_at, products(title), profiles(username, display_name)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sales monitor</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-zinc-500 text-left border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Creator</th>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Platform fee</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders?.map((o: any) => (
              <tr key={o.id}>
                <td className="px-4 py-3">{o.products?.title ?? "-"}</td>
                <td className="px-4 py-3 text-zinc-400">
                  @{o.profiles?.username ?? "-"}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {o.buyer_email}
                  {o.buyer_name ? ` (${o.buyer_name})` : ""}
                </td>
                <td className="px-4 py-3">
                  ₹{(o.amount_inr / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  ₹{(o.platform_fee_inr / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(o.created_at).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(orders?.length ?? 0) === 0 && (
          <p className="p-6 text-zinc-500 text-center">No orders yet.</p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "bg-emerald-950 text-emerald-400",
    pending: "bg-amber-950 text-amber-400",
    failed: "bg-red-950 text-red-400",
    refunded: "bg-zinc-800 text-zinc-400",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        colors[status] ?? "bg-zinc-800 text-zinc-400"
      }`}
    >
      {status}
    </span>
  );
}
