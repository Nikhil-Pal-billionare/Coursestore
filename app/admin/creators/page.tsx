import { createAdminClient } from "@/lib/supabase/admin";
import CreatorRow from "@/components/admin/CreatorRow";

export default async function AdminCreatorsPage() {
  const supabase = createAdminClient();

  const { data: creators } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, phone, is_verified, is_blocked, blocked_reason, created_at"
    )
    .order("created_at", { ascending: false });

  // Get product counts per creator
  const { data: productCounts } = await supabase
    .from("products")
    .select("creator_id");

  const countByCreator: Record<string, number> = {};
  productCounts?.forEach((p) => {
    countByCreator[p.creator_id] = (countByCreator[p.creator_id] ?? 0) + 1;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Creators</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
        {creators?.map((c) => (
          <CreatorRow
            key={c.id}
            creator={c}
            productCount={countByCreator[c.id] ?? 0}
          />
        ))}
        {(creators?.length ?? 0) === 0 && (
          <p className="p-6 text-zinc-500 text-center">No creators yet.</p>
        )}
      </div>
    </div>
  );
}
