import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayInstance } from "@/lib/razorpay/client";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const { productId, budgetInPaise, notes } = await req.json();

    if (!productId || !budgetInPaise || budgetInPaise < 50000) {
      return NextResponse.json(
        { error: "Invalid product or budget (minimum ₹500)." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Confirm the product belongs to this creator
    const { data: product } = await admin
      .from("products")
      .select("id, creator_id")
      .eq("id", productId)
      .eq("creator_id", user.id)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: budgetInPaise,
      currency: "INR",
      receipt: `ad_${Date.now()}`,
    });

    const { data: adRequest, error: insertError } = await admin
      .from("ad_requests")
      .insert({
        creator_id: user.id,
        product_id: productId,
        budget_inr: budgetInPaise,
        notes: notes ?? null,
        razorpay_order_id: razorpayOrder.id,
        payment_status: "unpaid",
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !adRequest) {
      return NextResponse.json(
        { error: insertError?.message ?? "Could not create ad request." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      adRequestId: adRequest.id,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: budgetInPaise,
    });
  } catch (err: any) {
    console.error("ad create-order error", err);
    return NextResponse.json(
      { error: "Failed to create ad request." },
      { status: 500 }
    );
  }
}
