import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, status")
    .eq("creator_id", user!.id);

  const { data: orders } = await supabase
    .from("orders")
    .select("amount_inr, creator_earning_inr, status")
    .eq("creator_id", user!.id)
    .eq("status", "paid");

  const totalSales = orders?.length ?? 0;
  const totalEarnings =
    orders?.reduce((sum, o) => sum + o.creator_earning_inr, 0) ?? 0;
  const publishedCount =
    products?.filter((p) => p.status === "published").length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
        <Link
          href="/dashboard/products/new"
          className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-zinc-800 transition"
        >
          + New product
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total sales" value={totalSales.toString()} />
        <StatCard
          label="Total earnings"
          value={`₹${(totalEarnings / 100).toLocaleString("en-IN")}`}
        />
        <StatCard label="Published products" value={publishedCount.toString()} />
      </div>

      {(products?.length ?? 0) === 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
          <p className="text-zinc-600">
            You haven&apos;t added any products yet.
          </p>
          <Link
            href="/dashboard/products/new"
            className="inline-block mt-3 text-brand-600 font-medium text-sm"
          >
            Add your first product →
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
    </div>
  );
}
