import { createAdminClient } from "@/lib/supabase/admin";
import RefundRow from "@/components/admin/RefundRow";

export default async function AdminRefundsPage() {
  const supabase = createAdminClient();

  const { data: refunds } = await supabase
    .from("refund_requests")
    .select(
      "id, reason, status, admin_notes, created_at, orders(id, buyer_email, amount_inr, products(title), profiles(username))"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Refund requests</h1>
      <div className="space-y-3">
        {refunds?.map((r: any) => (
          <RefundRow key={r.id} refund={r} />
        ))}
        {(refunds?.length ?? 0) === 0 && (
          <p className="text-zinc-500 text-center py-10">
            No refund requests.
          </p>
        )}
      </div>
    </div>
  );
}
