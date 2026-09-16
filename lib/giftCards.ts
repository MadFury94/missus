// Server-only. Never import this from a client component — GIFT_CARD_SECRET
import { API_ENDPOINTS } from "./config";

// must never reach the browser bundle.

const GIFT_CARD_SECRET = process.env.MISSUS_GIFT_CARD_SECRET ?? "";

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
 * Read-only balance/status check. Safe to call from any server-side code.
 */
export async function checkGiftCard(code: string): Promise<GiftCardCheckResult | null> {
    try {
        const res = await fetch(
            `${API_ENDPOINTS.custom.giftCards}/gift-cards/check?code=${encodeURIComponent(code)}`,
            { cache: "no-store" }
        );
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

/**
 * Actually deducts balance. Call ONLY after Paystack confirms payment.
 * Throws on failure — caller MUST catch.
 */
export async function redeemGiftCard(
    code: string,
    amount: number,
    orderId?: number
): Promise<GiftCardRedeemResult> {
    const res = await fetch(`${API_ENDPOINTS.custom.giftCards}/gift-cards/redeem`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Missus-Secret": GIFT_CARD_SECRET,
        },
        body: JSON.stringify({ code, amount, order_id: orderId }),
        cache: "no-store",
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(err.message || `Gift card redemption failed (${res.status})`);
    }

    return res.json();
}

/**
 * The discount a gift card contributes to a given cart total.
 * A card can be used for less than its full balance.
 */
export function giftCardDiscountFor(giftCard: GiftCardCheckResult, cartTotal: number): number {
    return Math.min(giftCard.balance, cartTotal);
}
