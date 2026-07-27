import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { token, reason } = await req.json();

    if (!token || !reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a valid reason (at least 10 characters)." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // The download token proves this person actually completed a paid
    // order - this is the only "authentication" a buyer has, since buyers
    // don't have accounts.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, refund_requested")
      .eq("download_token", token)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (order.status !== "paid") {
      return NextResponse.json(
        { error: "This order was never completed, so it can't be refunded." },
        { status: 400 }
      );
    }

    if (order.refund_requested) {
      return NextResponse.json(
        { error: "A refund request has already been submitted for this order." },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from("refund_requests")
      .insert({
        order_id: order.id,
        reason: reason.trim(),
        status: "pending",
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    await supabase
      .from("orders")
      .update({ refund_requested: true })
      .eq("id", order.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("refund-request error", err);
    return NextResponse.json(
      { error: "Failed to submit refund request." },
      { status: 500 }
    );
  }
}
