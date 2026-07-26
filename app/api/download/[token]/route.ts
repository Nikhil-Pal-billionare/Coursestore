import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, product_id, download_count")
    .eq("download_token", params.token)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Invalid download link." }, { status: 404 });
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Payment not confirmed for this order." },
      { status: 403 }
    );
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("file_path, file_name")
    .eq("id", order.product_id)
    .single();

  if (productError || !product?.file_path) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  // Generate a short-lived signed URL (5 minutes) to the private file.
  const { data: signedUrlData, error: signError } = await supabase.storage
    .from("product-files")
    .createSignedUrl(product.file_path, 300, {
      download: product.file_name ?? true,
    });

  if (signError || !signedUrlData) {
    return NextResponse.json(
      { error: "Could not generate download link." },
      { status: 500 }
    );
  }

  // Track download count (best-effort, non-blocking on failure)
  await supabase
    .from("orders")
    .update({ download_count: (order.download_count ?? 0) + 1 })
    .eq("id", order.id);

  return NextResponse.redirect(signedUrlData.signedUrl);
}
