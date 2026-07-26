import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields." },
        { status: 400 }
      );
    }

    // Verify signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, download_token, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status !== "paid") {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          razorpay_payment_id,
          razorpay_signature,
          paid_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      downloadUrl: `/api/download/${order.download_token}`,
    });
  } catch (err: any) {
    console.error("verify error", err);
    return NextResponse.json(
      { error: "Verification failed. Please contact support." },
      { status: 500 }
    );
  }
}
