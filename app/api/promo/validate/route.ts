import { NextRequest, NextResponse } from "next/server";
import { checkGiftCard, giftCardDiscountFor } from "@/lib/giftCards";

// Fallback promo codes if WooCommerce is unavailable
const PROMO_CODES_FALLBACK: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {
    SPRING20: { type: "fixed", value: 2000, label: "₦2,000 off" },
    MISSUS10: { type: "percent", value: 10, label: "10% off" },
    NEWGIRL: { type: "percent", value: 15, label: "15% off" },
};

function getFallbackPromoCodes() {
    let extra: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {};
    try {
        const raw = process.env.PROMO_CODES_JSON;
        if (raw) extra = JSON.parse(raw);
    } catch { /* malformed JSON — ignore */ }
    return { ...PROMO_CODES_FALLBACK, ...extra };
}

async function validateWooCommerceCoupon(code: string, subtotal: number) {
    try {
        const consumerKey = process.env.WC_CONSUMER_KEY;
        const consumerSecret = process.env.WC_CONSUMER_SECRET;
        const apiUrl = process.env.WC_API_URL;

        if (!consumerKey || !consumerSecret || !apiUrl) {
            console.log("[promo] WooCommerce credentials not found, using fallback codes");
            return null;
        }

        // Get coupon details from WooCommerce
        const couponResponse = await fetch(`${apiUrl}/coupons?code=${encodeURIComponent(code)}`, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!couponResponse.ok) {
            console.log(`[promo] WooCommerce coupon API error: ${couponResponse.status}`);
            return null;
        }

        const coupons = await couponResponse.json();
        const coupon = coupons.find((c: any) => c.code.toUpperCase() === code.toUpperCase());

        if (!coupon) {
            console.log(`[promo] Coupon "${code}" not found in WooCommerce`);
            return null;
        }

        console.log(`[promo] Found WooCommerce coupon:`, {
            code: coupon.code,
            status: coupon.status,
            discount_type: coupon.discount_type,
            amount: coupon.amount,
            minimum_amount: coupon.minimum_amount,
            maximum_amount: coupon.maximum_amount,
            usage_limit: coupon.usage_limit,
            usage_count: coupon.usage_count,
            date_expires: coupon.date_expires
        });

        // Check if coupon is active and valid
        if (coupon.status !== 'publish') {
            return { valid: false, error: "This discount code is no longer active." };
        }

        // Check expiry date
        if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
            return { valid: false, error: "This discount code has expired." };
        }

        // Check minimum amount
        const minimumAmount = coupon.minimum_amount ? parseFloat(coupon.minimum_amount) : 0;
        if (minimumAmount > 0 && minimumAmount > subtotal) {
            return {
                valid: false,
                error: `Minimum order of ₦${minimumAmount.toLocaleString('en-NG')} required for this discount.`
            };
        }

        // Check maximum amount (only if it's actually set and greater than 0)
        const maximumAmount = coupon.maximum_amount ? parseFloat(coupon.maximum_amount) : 0;
        console.log(`[promo] Maximum amount check: coupon.maximum_amount="${coupon.maximum_amount}", parsed=${maximumAmount}, subtotal=${subtotal}`);
        if (maximumAmount > 0 && maximumAmount < subtotal) {
            return {
                valid: false,
                error: `This discount code is only valid for orders under ₦${maximumAmount.toLocaleString('en-NG')}.`
            };
        }

        // Check usage limits
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return { valid: false, error: "This discount code has reached its usage limit." };
        }

        // Calculate discount amount
        let discount = 0;
        let discountType = "fixed";
        let label = coupon.description || `${coupon.amount} discount`;

        if (coupon.discount_type === 'percent') {
            discount = Math.round((subtotal * parseFloat(coupon.amount)) / 100);
            discountType = "percent";
            label = `${coupon.amount}% off`;
        } else if (coupon.discount_type === 'fixed_cart') {
            discount = parseFloat(coupon.amount) * 100; // Convert to kobo/cents
            discountType = "fixed";
            label = `₦${parseFloat(coupon.amount).toLocaleString('en-NG')} off`;
        } else {
            // Handle other WooCommerce discount types if needed
            discount = parseFloat(coupon.amount) * 100;
            label = coupon.description || `₦${parseFloat(coupon.amount).toLocaleString('en-NG')} off`;
        }

        return {
            valid: true,
            type: "woocommerce_coupon",
            code: coupon.code,
            discount: Math.min(discount, subtotal), // Don't allow discount greater than subtotal
            label,
            coupon_id: coupon.id
        };

    } catch (error) {
        console.error("[promo] WooCommerce coupon validation error:", error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { code, subtotal, cart } = await request.json();

        if (!code || typeof subtotal !== "number") {
            return NextResponse.json({ valid: false, error: "Invalid request." }, { status: 400 });
        }

        const normalized = String(code).trim().toUpperCase();

        // Check if cart has any items that should exclude discount codes
        if (cart && Array.isArray(cart)) {
            const hasIneligibleItems = cart.some((item: any) => {
                // Check if item is on sale (price < regularPrice)
                const isOnSale = item.price < item.regularPrice;

                // Check if item is a gift card or gift box (by name or slug)
                const isGiftItem = item.name?.toLowerCase().includes('gift') ||
                    item.slug?.toLowerCase().includes('gift') ||
                    item.name?.toLowerCase().includes('box');

                return isOnSale || isGiftItem;
            });

            if (hasIneligibleItems) {
                return NextResponse.json({
                    valid: false,
                    error: "Discount codes cannot be applied to sale items, gift cards, or gift boxes."
                });
            }
        }

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
                label: `Gift card (₦${giftCard.balance.toLocaleString("en-NG")} balance)`,
                remaining_after_use: giftCard.balance - discount,
            });
        }

        // ── 2. Try WooCommerce coupon ─────────────────────────────────────
        const wcCoupon = await validateWooCommerceCoupon(normalized, subtotal);
        if (wcCoupon !== null) {
            return NextResponse.json(wcCoupon);
        }

        // ── 3. Fall back to local promo codes ─────────────────────────────
        const promoCodes = getFallbackPromoCodes();
        const promo = promoCodes[normalized];
        if (!promo) {
            return NextResponse.json({
                valid: false,
                error: "Invalid discount code. Please check and try again."
            });
        }

        const discount =
            promo.type === "percent"
                ? Math.round((subtotal * promo.value) / 100)
                : promo.value;

        return NextResponse.json({
            valid: true,
            type: "local_promo",
            code: normalized,
            discount: Math.min(discount, subtotal), // Don't allow discount greater than subtotal
            label: promo.label,
        });

    } catch (error) {
        console.error("[promo] Validation error:", error);
        return NextResponse.json({
            valid: false,
            error: "Unable to validate code right now. Please try again."
        }, { status: 500 });
    }
}
