import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayInstance, calculateSplit } from "@/lib/razorpay/client";

export async function POST(req: NextRequest) {
  try {
    const { productId, buyerEmail, buyerName } = await req.json();

    if (!productId || !buyerEmail) {
      return NextResponse.json(
        { error: "Missing product or buyer email." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, creator_id, price_inr, status")
      .eq("id", productId)
      .single();

    if (productError || !product || product.status !== "published") {
      return NextResponse.json(
        { error: "Product not found or unavailable." },
        { status: 404 }
      );
    }

    const { platformFee, creatorEarning } = calculateSplit(product.price_inr);

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: product.price_inr, // paise
      currency: "INR",
      // Razorpay receipt max length is 40 chars
      receipt: `rcpt_${Date.now()}`,
    });

    const { error: insertError } = await supabase.from("orders").insert({
      product_id: product.id,
      creator_id: product.creator_id,
      buyer_email: buyerEmail,
      buyer_name: buyerName ?? null,
      amount_inr: product.price_inr,
      platform_fee_inr: platformFee,
      creator_earning_inr: creatorEarning,
      razorpay_order_id: razorpayOrder.id,
      status: "pending",
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: product.price_inr,
    });
  } catch (err: any) {
    console.error("create-order error", err);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
