// Sends transactional emails via Resend (https://resend.com). Sign up for a
// free account, verify a sending domain (or use their default onboarding
// domain for testing), and add RESEND_API_KEY to your environment
// variables. If RESEND_API_KEY isn't set, this silently no-ops so the rest
// of the app keeps working during local development.

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email skipped - no RESEND_API_KEY] to=${to} subject="${subject}"`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "CourseMarket <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to send email:", text);
  }
}

export function payoutHeldEmail(reason: string | null) {
  return `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2>Your payout has been held</h2>
      <p>Your payout for this week has been put on hold due to suspicious activity on your account.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>If you believe this is a mistake, please reply to this email and we'll look into it.</p>
    </div>
  `;
}
