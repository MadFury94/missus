import { NextRequest, NextResponse } from "next/server";
import { checkGiftCard, giftCardDiscountFor } from "@/lib/giftCards";

// TODO: replace with wherever your existing coupon validation logic lives —
// this is a placeholder showing where it plugs in, not a real implementation.
async function checkCoupon(code: string): Promise<{
  code: string;
  amount_off?: number;
  percent_off?: number;
} | null> {
  // ...your existing WooCommerce coupon-check REST call goes here, unchanged...
  return null;
}

export async function POST(req: NextRequest) {
  const { code, cartTotal } = await req.json();

  if (!code || typeof cartTotal !== "number") {
    return NextResponse.json(
      { error: "code and cartTotal are required" },
      { status: 400 }
    );
  }

  // 1. Try as a gift card first
  const giftCard = await checkGiftCard(code);
  if (giftCard) {
    if (giftCard.status !== "active") {
      return NextResponse.json(
        { error: "This gift card has already been fully used." },
        { status: 400 }
      );
    }
    const amountOff = giftCardDiscountFor(giftCard, cartTotal);
    return NextResponse.json({
      type: "gift_card",
      code: giftCard.code,
      amount_off: amountOff,
      remaining_after_use: giftCard.balance - amountOff,
      currency: giftCard.currency,
      symbol: giftCard.symbol,
    });
  }

  // 2. Fall back to existing coupon logic
  const coupon = await checkCoupon(code);
  if (coupon) {
    return NextResponse.json({ type: "coupon", ...coupon });
  }

  return NextResponse.json({ error: "Invalid code." }, { status: 404 });
}
