import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminHomePage() {
  const supabase = createAdminClient();

  const [
    { count: creatorCount },
    { count: productCount },
    { data: paidOrders },
    { count: pendingRefunds },
    { count: pendingAds },
    { count: pendingPayouts },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("orders")
      .select("amount_inr, platform_fee_inr")
      .eq("status", "paid"),
    supabase
      .from("refund_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("ad_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("payouts")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const totalRevenue = paidOrders?.reduce((s, o) => s + o.amount_inr, 0) ?? 0;
  const totalCommission =
    paidOrders?.reduce((s, o) => s + o.platform_fee_inr, 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card label="Total creators" value={String(creatorCount ?? 0)} />
        <Card label="Published products" value={String(productCount ?? 0)} />
        <Card
          label="Total GMV"
          value={`₹${(totalRevenue / 100).toLocaleString("en-IN")}`}
        />
        <Card
          label="Platform commission earned"
          value={`₹${(totalCommission / 100).toLocaleString("en-IN")}`}
        />
        <Card
          label="Pending refund requests"
          value={String(pendingRefunds ?? 0)}
          alert={(pendingRefunds ?? 0) > 0}
        />
        <Card
          label="Pending ad requests"
          value={String(pendingAds ?? 0)}
          alert={(pendingAds ?? 0) > 0}
        />
        <Card
          label="Pending payouts this cycle"
          value={String(pendingPayouts ?? 0)}
        />
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        alert
          ? "bg-amber-950/40 border-amber-800"
          : "bg-zinc-900 border-zinc-800"
      }`}
    >
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
