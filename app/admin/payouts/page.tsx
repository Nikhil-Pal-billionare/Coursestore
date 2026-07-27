import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminPayoutsPage() {
  const supabase = createAdminClient();

  const { data: payouts } = await supabase
    .from("payouts")
    .select(
      "id, amount_inr, order_count, status, held_reason, scheduled_for, processed_at, profiles(username, display_name, bank_account_name, bank_account_number, bank_ifsc)"
    )
    .order("scheduled_for", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Payouts</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Payout batches are generated automatically every Sunday night and
        processed every Monday at 6am Eastern. Non-blocked creators are
        auto-marked &quot;paid&quot; here - you still need to send the actual
        bank transfer manually using the account details shown below.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-zinc-500 text-left border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 font-medium">Creator</th>
              <th className="px-4 py-3 font-medium">Bank details</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Scheduled for</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {payouts?.map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  @{p.profiles?.username ?? "-"}
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs">
                  {p.profiles?.bank_account_name ? (
                    <>
                      {p.profiles.bank_account_name}
                      <br />
                      {p.profiles.bank_account_number} ·{" "}
                      {p.profiles.bank_ifsc}
                    </>
                  ) : (
                    "Not provided"
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  ₹{(p.amount_inr / 100).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-zinc-400">{p.order_count}</td>
                <td className="px-4 py-3">
                  <PayoutStatusBadge status={p.status} />
                  {p.status === "held" && p.held_reason && (
                    <p className="text-xs text-red-400 mt-0.5">
                      {p.held_reason}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(p.scheduled_for).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(payouts?.length ?? 0) === 0 && (
          <p className="p-6 text-zinc-500 text-center">
            No payouts generated yet.
          </p>
        )}
      </div>
    </div>
  );
}

function PayoutStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-950 text-amber-400",
    approved: "bg-blue-950 text-blue-400",
    paid: "bg-emerald-950 text-emerald-400",
    held: "bg-red-950 text-red-400",
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
