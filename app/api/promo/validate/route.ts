import { NextRequest, NextResponse } from "next/server";
import { checkGiftCard, giftCardDiscountFor } from "@/lib/giftCards";

// Promo codes live server-side only — never shipped to the browser.
// Add codes to PROMO_CODES_JSON in .env.local to manage without redeploying:
// PROMO_CODES_JSON='{"SUMMER25":{"type":"percent","value":25,"label":"25% off"}}'
const PROMO_CODES_STATIC: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {
    SPRING20: { type: "fixed", value: 2000, label: "₦2,000 off" },
    MISSUS10: { type: "percent", value: 10, label: "10% off" },
    NEWGIRL: { type: "percent", value: 15, label: "15% off" },
};

function getPromoCodes() {
    let extra: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {};
    try {
        const raw = process.env.PROMO_CODES_JSON;
        if (raw) extra = JSON.parse(raw);
    } catch { /* malformed JSON — ignore */ }
    return { ...PROMO_CODES_STATIC, ...extra };
}

export async function POST(request: NextRequest) {
    try {
        const { code, subtotal } = await request.json();

        if (!code || typeof subtotal !== "number") {
            return NextResponse.json({ valid: false, error: "Invalid request." }, { status: 400 });
        }

        const normalized = String(code).trim().toUpperCase();

        // ── 1. Try as a gift card first ──────────────────────────────────
        const giftCard = await checkGiftCard(normalized);
        if (giftCard) {
            if (giftCard.status !== "active" || giftCard.balance <= 0) {
                return NextResponse.json({
                    valid: false,
                    error: "This gift card has no remaining balance.",
                });
            }
            const discount = giftCardDiscountFor(giftCard, subtotal);
            return NextResponse.json({
                valid: true,
                type: "gift_card",
                code: giftCard.code,
                discount,
                label: `Gift card (${giftCard.symbol}${giftCard.balance.toLocaleString("en-NG")} balance)`,
                remaining_after_use: giftCard.balance - discount,
            });
        }

        // ── 2. Fall back to promo code ────────────────────────────────────
        const promo = getPromoCodes()[normalized];
        if (!promo) {
            return NextResponse.json({ valid: false, error: "Invalid promo code." });
        }

        const discount =
            promo.type === "percent"
                ? Math.round((subtotal * promo.value) / 100)
                : promo.value;

        return NextResponse.json({
            valid: true,
            type: "promo",
            code: normalized,
            discount,
            label: promo.label,
        });

    } catch {
        return NextResponse.json({ valid: false, error: "Server error." }, { status: 500 });
    }
}
