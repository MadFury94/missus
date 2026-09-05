// Server-only. Never import this from a client component — GIFT_CARD_SECRET
// must never reach the browser bundle.

const WP_API_BASE = process.env.WP_API_BASE!; // e.g. https://missusoutfits.com/wp-json/missus/v1
const GIFT_CARD_SECRET = process.env.MISSUS_GIFT_CARD_SECRET!; // same value as wp-config.php

export interface GiftCardCheckResult {
  code: string;
  balance: number;
  initial_balance: number;
  currency: string;
  symbol: string;
  expiry: string | null;
  status: "active" | "used";
}

export interface GiftCardRedeemResult {
  success: boolean;
  remaining_balance: number;
}

/**
 * Read-only balance/status check. Safe to call from any server-side code
 * (an API route, a server component, etc.) — no secret required, this hits
 * the public /gift-cards/check endpoint.
 */
export async function checkGiftCard(
  code: string
): Promise<GiftCardCheckResult | null> {
  const res = await fetch(
    `${WP_API_BASE}/gift-cards/check?code=${encodeURIComponent(code)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

/**
 * Actually deducts balance. Call this ONLY after Paystack confirms payment,
 * from the payment callback handler — never from a route the browser can
 * trigger directly, since it moves real money value.
 *
 * Throws on failure (insufficient balance, card not found, concurrent
 * redemption race lost). Caller MUST catch this — see note in the payment
 * callback integration below about what to do if it fails after payment
 * already succeeded.
 */
export async function redeemGiftCard(
  code: string,
  amount: number,
  orderId?: number
): Promise<GiftCardRedeemResult> {
  const res = await fetch(`${WP_API_BASE}/gift-cards/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Missus-Secret": GIFT_CARD_SECRET,
    },
    body: JSON.stringify({ code, amount, order_id: orderId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `Gift card redemption failed (${res.status})`);
  }

  return res.json();
}

/**
 * The discount a gift card actually contributes to a given cart total.
 * A gift card can be used for less than its full balance — never assume
 * the whole balance is deducted.
 */
export function giftCardDiscountFor(
  giftCard: GiftCardCheckResult,
  cartTotal: number
): number {
  return Math.min(giftCard.balance, cartTotal);
}
