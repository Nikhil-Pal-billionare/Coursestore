import { createClient } from "@/lib/supabase/server";

export default async function CreatorPayoutsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: payouts } = await supabase
    .from("payouts")
    .select("id, amount_inr, order_count, status, scheduled_for, processed_at")
    .eq("creator_id", user!.id)
    .order("scheduled_for", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Payouts</h1>
      <p className="text-zinc-600 mb-6">
        Payouts are calculated every Sunday for the past week&apos;s sales
        and paid out the following Monday.
      </p>

      {(payouts?.length ?? 0) === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-zinc-600">
          No payouts yet. Your first one will appear here after your first
          week with sales.
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
          {payouts!.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-900">
                  ₹{(p.amount_inr / 100).toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-zinc-500">
                  {p.order_count} order{p.order_count !== 1 ? "s" : ""} ·
                  scheduled {new Date(p.scheduled_for).toLocaleDateString("en-IN")}
                </p>
              </div>
              <PayoutBadge status={p.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PayoutBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-blue-50 text-blue-700",
    paid: "bg-emerald-50 text-emerald-700",
    held: "bg-red-50 text-red-700",
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
