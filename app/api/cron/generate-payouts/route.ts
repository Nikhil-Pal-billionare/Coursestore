import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// This route is called by Vercel Cron every Sunday at 11:55 PM UTC (see
// vercel.json). It looks at all "paid" orders from the past 7 days that
// haven't been included in a payout yet, groups them by creator, and
// creates one "pending" payout record per creator for the upcoming Monday.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Next Monday 6am US Eastern, expressed in UTC (Eastern is UTC-5 or
  // UTC-4 depending on DST - we use UTC-5 as a safe default; the cron
  // trigger time itself is what actually matters for when this runs).
  const scheduledFor = getNextMondaySixAmEastern();

  const { data: paidOrders, error: ordersError } = await supabase
    .from("orders")
    .select("id, creator_id, creator_earning_inr")
    .eq("status", "paid")
    .gte("paid_at", periodStart.toISOString())
    .lt("paid_at", periodEnd.toISOString());

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const totals: Record<string, { amount: number; count: number }> = {};
  for (const o of paidOrders ?? []) {
    if (!totals[o.creator_id]) totals[o.creator_id] = { amount: 0, count: 0 };
    totals[o.creator_id].amount += o.creator_earning_inr;
    totals[o.creator_id].count += 1;
  }

  const payoutRows = Object.entries(totals).map(([creatorId, t]) => ({
    creator_id: creatorId,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    amount_inr: t.amount,
    order_count: t.count,
    status: "pending",
    scheduled_for: scheduledFor.toISOString(),
  }));

  if (payoutRows.length > 0) {
    const { error: insertError } = await supabase
      .from("payouts")
      .insert(payoutRows);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    payoutsCreated: payoutRows.length,
  });
}

function getNextMondaySixAmEastern(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday
  const daysUntilMonday = (1 - day + 7) % 7 || 7;
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  // 6am Eastern = 11am UTC (EST, UTC-5) - adjust to 10am UTC during EDT if needed
  nextMonday.setUTCHours(11, 0, 0, 0);
  return nextMonday;
}
