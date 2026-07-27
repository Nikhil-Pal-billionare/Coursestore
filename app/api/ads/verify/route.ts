import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const {
      adRequestId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (
      !adRequestId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Missing verification fields." },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Signature verification failed." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: adRequest, error: fetchError } = await supabase
      .from("ad_requests")
      .select("id, budget_inr")
      .eq("id", adRequestId)
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (fetchError || !adRequest) {
      return NextResponse.json(
        { error: "Ad request not found." },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("ad_requests")
      .update({
        payment_status: "paid",
        amount_paid_inr: adRequest.budget_inr,
        razorpay_payment_id,
      })
      .eq("id", adRequestId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("ad verify error", err);
    return NextResponse.json(
      { error: "Verification failed." },
      { status: 500 }
    );
  }
}
