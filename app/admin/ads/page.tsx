import { createAdminClient } from "@/lib/supabase/admin";
import AdRequestAdminRow from "@/components/admin/AdRequestAdminRow";

export default async function AdminAdsPage() {
  const supabase = createAdminClient();

  const { data: requests } = await supabase
    .from("ad_requests")
    .select(
      "id, budget_inr, notes, status, admin_notes, payment_status, created_at, products(title), profiles(username, display_name)"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ad requests</h1>
      <div className="space-y-3">
        {requests?.map((r: any) => (
          <AdRequestAdminRow key={r.id} request={r} />
        ))}
        {(requests?.length ?? 0) === 0 && (
          <p className="text-zinc-500 text-center py-10">
            No ad requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
