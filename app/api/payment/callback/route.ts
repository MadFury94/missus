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
    price: number;
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
                ...(item.size ? { meta_data: [{ key: "Size", value: item.size }] } : {}),
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
                        ? [
                            { key: "_promo_code", value: promoCode },
                            { key: "_promo_discount", value: String(promoDiscount) },
                        ]
                        : []),
                ],
            };

            const orderRes = await fetch(`${WC_API_URL}/orders`, {
                method: "POST",
                headers: getWCAuth(),
                body: JSON.stringify(orderPayload),
            });

            const orderData = await orderRes.json();
            const orderId: number | null = orderData?.id ?? null;
            const orderNumber: string | null = orderData?.number ?? null;

            // Redeem gift card after order confirmed
            if (giftCardCode && giftCardAmount > 0 && orderId) {
                try {
                    await redeemGiftCard(giftCardCode, giftCardAmount, orderId);
                } catch (err) {
                    console.error(
                        `[gift-card] Redeem FAILED after payment ${reference} — code: ${giftCardCode}, amount: ${giftCardAmount}`,
                        err
                    );
                }
            }

            // Build redirect with full order context for the confirmation page
            const params = new URLSearchParams({ status: "success", ref: reference });
            if (orderId) params.set("orderId", String(orderId));
            if (orderNumber) params.set("orderNumber", orderNumber);
            if (shipping) {
                params.set("name", `${shipping.firstName} ${shipping.lastName}`);
                params.set("address", shipping.address);
                params.set("city", shipping.city);
                params.set("state", shipping.state);
                params.set("email", shipping.email);
            }

            // Auto-dispatch shipment via Terminal Africa (fire-and-forget)
            // rateId comes from Paystack metadata — set during checkout when customer picks a rate
            const rateId = (() => {
                try {
                    return (JSON.parse(
                        decodeURIComponent(reference.split("-").pop() ?? "")
                    ) as { rateId?: string })?.rateId ?? "";
                } catch { return ""; }
            })();

            // We'll pass the rateId via metadata instead — see checkout flow
            // For now, log so we can verify the pipeline end-to-end
            console.log(`[delivery] Order ${orderId} ready for dispatch. rateId from metadata needed.`);

            return NextResponse.redirect(
                new URL(`/checkout/callback?${params.toString()}`, request.url)
            );
        } catch (err) {
            console.error("WooCommerce order creation failed:", err);
        }
    }

    // Fallback: payment verified but order/metadata unavailable
    return NextResponse.redirect(
        new URL(`/checkout/callback?status=success&ref=${reference}`, request.url)
    );
}
