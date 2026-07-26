import Razorpay from "razorpay";

export function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// Platform commission rate - change this single value to adjust profit margin
// across the entire platform. 0.25 = 25% commission on every sale.
export const PLATFORM_COMMISSION_RATE = 0.25;

export function calculateSplit(amountInPaise: number) {
  const platformFee = Math.round(amountInPaise * PLATFORM_COMMISSION_RATE);
  const creatorEarning = amountInPaise - platformFee;
  return { platformFee, creatorEarning };
}
