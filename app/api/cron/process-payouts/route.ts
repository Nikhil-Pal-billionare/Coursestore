import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, payoutHeldEmail } from "@/lib/email/send";

// This route is called by Vercel Cron every Monday at 11:00 UTC (6am
// Eastern Standard Time - see vercel.json). It processes all "pending"
// payouts: creators who are NOT blocked get marked "paid" automatically
// (the actual bank transfer is done manually using the bank details on
// file - this only tracks and communicates status). Blocked creators get
// their payout marked "held" and receive an email explaining why.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: pendingPayouts, error } = await supabase
    .from("payouts")
    .select(
      "id, creator_id, amount_inr, profiles(is_blocked, blocked_reason, display_name)"
    )
    .eq("status", "pending");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let paidCount = 0;
  let heldCount = 0;

  for (const payout of pendingPayouts ?? []) {
    const profile = (payout as any).profiles;

    if (profile?.is_blocked) {
      await supabase
        .from("payouts")
        .update({
          status: "held",
          held_reason: profile.blocked_reason ?? "Suspicious activity",
        })
        .eq("id", payout.id);

      // Look up the creator's auth email separately (profiles table
      // doesn't store email directly - it comes from auth.users).
      const { data: authUser } = await supabase.auth.admin.getUserById(
        payout.creator_id
      );
      if (authUser?.user?.email) {
        await sendEmail({
          to: authUser.user.email,
          subject: "Your payout has been held for this week",
          html: payoutHeldEmail(profile.blocked_reason),
        });
      }
      heldCount++;
    } else {
      await supabase
        .from("payouts")
        .update({
          status: "paid",
          processed_at: new Date().toISOString(),
        })
        .eq("id", payout.id);
      paidCount++;
    }
  }

  return NextResponse.json({ success: true, paidCount, heldCount });
}
