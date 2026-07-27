import { createAdminClient } from "@/lib/supabase/admin";
import BannerUploadForm from "@/components/admin/BannerUploadForm";
import BannerAdminList from "@/components/admin/BannerAdminList";

export default async function AdminBannersPage() {
  const supabase = createAdminClient();

  const { data: banners } = await supabase
    .from("banners")
    .select("id, image_url, link_url, display_order, is_active")
    .order("display_order", { ascending: true });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Homepage banners</h1>
      <BannerUploadForm />
      <div className="mt-8">
        <BannerAdminList banners={banners ?? []} />
      </div>
    </div>
  );
}
