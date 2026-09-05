import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import { redeemGiftCard } from "@/lib/giftCards";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
    };
}

interface CartItem {
    productId: number;
    variationId?: number;
    name: string;
    slug: string;
    image: string;
    price: number;       // naira
    regularPrice: number;
    quantity: number;
    size?: string;
    color?: string;
}

interface ShippingInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    notes?: string;
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
        return NextResponse.redirect(new URL("/checkout?error=missing_reference", request.url));
    }

    // 1. Verify payment with Paystack
    const paid = await verifyPayment(reference);
    if (!paid) {
        return NextResponse.redirect(
            new URL(`/checkout/callback?status=failed&ref=${reference}`, request.url)
        );
    }

    // 2. Fetch full transaction details to get metadata (cart + shipping)
    let cart: CartItem[] = [];
    let shipping: ShippingInfo | null = null;
    let promoCode = "";
    let promoDiscount = 0;
    let giftCardCode = "";
    let giftCardAmount = 0;

    try {
        const txRes = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
        );
        const txData = await txRes.json();
        const meta = txData?.data?.metadata ?? {};
        cart = meta.cart ?? [];
        shipping = meta.shipping ?? null;
        promoCode = meta.promoCode ?? "";
        promoDiscount = meta.promoDiscount ?? 0;
        giftCardCode = meta.giftCardCode ?? "";
        giftCardAmount = meta.giftCardAmount ?? 0;
    } catch {
        // metadata unavailable — order creation will be partial
    }

    // 3. Create order in WooCommerce
    if (cart.length > 0 && shipping) {
        try {
            const lineItems = cart.map((item: CartItem) => ({
                product_id: item.productId,
                ...(item.variationId ? { variation_id: item.variationId } : {}),
                quantity: item.quantity,
                ...(item.size
                    ? { meta_data: [{ key: "Size", value: item.size }] }
                    : {}),
            }));

            const orderPayload = {
                payment_method: "paystack",
                payment_method_title: "Paystack",
                set_paid: true,
                transaction_id: reference,
                status: "processing",
                billing: {
                    first_name: shipping.firstName,
                    last_name: shipping.lastName,
                    email: shipping.email,
                    phone: shipping.phone,
                    address_1: shipping.address,
                    city: shipping.city,
                    state: shipping.state,
                    country: "NG",
                },
                shipping: {
                    first_name: shipping.firstName,
                    last_name: shipping.lastName,
                    address_1: shipping.address,
                    city: shipping.city,
                    state: shipping.state,
                    country: "NG",
                },
                line_items: lineItems,
                customer_note: shipping.notes || "",
                meta_data: [
                    { key: "_paystack_reference", value: reference },
                    ...(promoCode
                        ? [{ key: "_promo_code", value: promoCode },
                        { key: "_promo_discount", value: String(promoDiscount) }]
                        : []),
                ],
            };

            const orderRes = await fetch(`${WC_API_URL}/orders`, {
                method: "POST",
                headers: getWCAuth(),
                body: JSON.stringify(orderPayload),
            });

            // Redeem gift card AFTER order is confirmed — atomic balance deduct
            if (giftCardCode && giftCardAmount > 0) {
                try {
                    const order = await orderRes.json();
                    await redeemGiftCard(giftCardCode, giftCardAmount, order?.id);
                } catch (err) {
                    // Payment already succeeded — log loudly but don't break the redirect.
                    // A human needs to reconcile this manually.
                    console.error(
                        `[gift-card] Redeem FAILED after payment ${reference} — code: ${giftCardCode}, amount: ${giftCardAmount}`,
                        err
                    );
                }
            }
        } catch (err) {
            // Log but don't block the redirect — payment already succeeded
            console.error("WooCommerce order creation failed:", err);
        }
    }

    // 4. Redirect to success page
    return NextResponse.redirect(
        new URL(`/checkout/callback?status=success&ref=${reference}`, request.url)
    );
}
