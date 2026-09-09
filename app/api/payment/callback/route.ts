import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import { ensurePaidOrder } from "@/lib/paid-order";
import { findOrderByReference } from "@/lib/order-reference";

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

    console.log("[callback] Processing payment reference:", reference);

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
    let selectedRate: any = null;
    let meta: Record<string, unknown> = {};
    let actualAmountPaid = 0;

    try {
        const txRes = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
        );
        const txData = await txRes.json();
        meta = txData?.data?.metadata ?? {};
        cart = meta.cart as CartItem[] ?? [];
        shipping = meta.shipping as ShippingInfo ?? null;
        promoCode = meta.promoCode as string ?? "";
        promoDiscount = meta.promoDiscount as number ?? 0;
        giftCardCode = meta.giftCardCode as string ?? "";
        giftCardAmount = meta.giftCardAmount as number ?? 0;
        selectedRate = meta.selectedRate ?? null;
        actualAmountPaid = txData?.data?.amount ? (txData.data.amount / 100) : 0;

        console.log("[callback] Payment metadata:", {
            hasCart: !!cart?.length,
            hasShipping: !!shipping,
            hasSelectedRate: !!selectedRate,
            actualAmountPaid,
            cartTotal: cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            selectedRateDetails: selectedRate ? {
                rate_id: selectedRate.rate_id,
                carrier_name: selectedRate.carrier_name,
                amount: selectedRate.amount
            } : null
        });
    } catch (error) {
        console.error("[callback] Failed to fetch payment metadata:", error);
    }

    // 3. Check if order already exists
    let existingOrder = null;
    try {
        existingOrder = await findOrderByReference(reference, WC_API_URL, getWCAuth());
    } catch (error) {
        console.error("[callback] Error checking existing order:", error);
        return NextResponse.json({ error: "Payment received, but order lookup is temporarily unavailable. Please retry this page." }, { status: 503 });
    }

    // Persist the verified payment before presenting a successful confirmation.
    let orderId: number | null = existingOrder?.id ?? null;
    let orderNumber: string | null = existingOrder?.number ?? null;
    let created = false;
    if (!existingOrder) {
        try {
            const result = await ensurePaidOrder(reference);
            orderId = result.order.id;
            orderNumber = result.order.number;
            created = result.created;
        } catch (error) {
            console.error("[callback] Order persistence failed:", error);
            const pending = new URLSearchParams({ status: "success", ref: reference });
            return NextResponse.redirect(new URL(`/checkout/callback?${pending}`, request.url));
        }
    }

    // 6. Send confirmation email (async)
    if (created && shipping && orderId) {
        setImmediate(async () => {
            try {
                const resendKey = process.env.RESEND_API_KEY;
                if (!resendKey) return;

                const itemsHtml = cart.map((item: CartItem) => `
                    <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">
                            ${item.name}${item.size ? ` <span style="color:#888;font-size:12px;">— ${item.size}</span>` : ""}
                            <br><span style="color:#888;font-size:12px;">Qty: ${item.quantity}</span>
                        </td>
                        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#000;text-align:right;font-weight:600;">
                            ₦${(item.price * item.quantity).toLocaleString("en-NG")}
                        </td>
                    </tr>
                `).join("");

                const totalAmount = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
                const shippingCost = selectedRate ? (selectedRate.amount / 100) : 0;
                const finalTotal = totalAmount + shippingCost;

                const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#000;padding:32px 40px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:26px;font-weight:300;">Thank you, ${shipping.firstName}!</h1>
        ${orderNumber ? `<p style="margin:12px 0 0;font-size:13px;opacity:0.7;">Order #${orderNumber}</p>` : ""}
    </div>
    <div style="background:#fff;padding:32px 40px;">
        <p style="margin:0 0 24px;font-size:13px;color:#555;line-height:1.7;">
            Your payment was successful and your order is confirmed.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            ${itemsHtml}
            ${selectedRate ? `
            <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${selectedRate.carrier_name}</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#000;text-align:right;font-weight:600;">₦${shippingCost.toLocaleString("en-NG")}</td>
            </tr>
            ` : ''}
            <tr>
                <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#000;">Total</td>
                <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#000;text-align:right;">₦${finalTotal.toLocaleString("en-NG")}</td>
            </tr>
        </table>
        <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders${orderId ? `/${orderId}` : ""}" 
               style="background:#000;color:#fff;padding:14px 36px;font-size:12px;font-weight:700;text-decoration:none;border-radius:999px;">
                Track My Order
            </a>
        </div>
    </div>
</div>
</body>
</html>`;

                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${resendKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        from: "Missus Outfits <orders@missusoutfits.com>",
                        to: [shipping.email],
                        subject: `Order Confirmed${orderNumber ? ` #${orderNumber}` : ""} — Thank you!`,
                        html,
                    }),
                });
            } catch (error) {
                console.error("[callback] Email failed:", error);
            }
        });
    }

    // 7. Auto-dispatch shipment
    if (created && selectedRate && !selectedRate.method_id && shipping && orderId) {
        setImmediate(async () => {
            try {
                const { createShipment, getOriginAddress } = await import("@/lib/delivery");
                const shipResult = await createShipment({
                    rateId: selectedRate.rate_id,
                    pickupAddress: getOriginAddress(),
                    deliveryAddress: {
                        first_name: shipping.firstName,
                        last_name: shipping.lastName,
                        email: shipping.email,
                        phone: shipping.phone || "+2340000000000",
                        line1: shipping.address,
                        city: shipping.city,
                        state: shipping.state,
                        country: "NGA",
                        zip: "100001",
                    },
                    items: cart.map((item: CartItem) => ({
                        name: item.name,
                        weight: 0.5,
                        value: item.price,
                        quantity: item.quantity,
                    })),
                    orderId,
                });

                if (shipResult?.shipment_id) {
                    await fetch(`${WC_API_URL}/orders/${orderId}`, {
                        method: "PUT",
                        headers: getWCAuth(),
                        body: JSON.stringify({
                            meta_data: [
                                { key: "_terminal_shipment_id", value: shipResult.shipment_id },
                                { key: "_terminal_tracking_id", value: shipResult.tracking_id ?? "" },
                            ],
                        }),
                    });
                }
            } catch (error) {
                console.error("[callback] Shipment creation failed:", error);
            }
        });
    }

    // 8. Build redirect URL
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

    return NextResponse.redirect(
        new URL(`/checkout/callback?${params.toString()}`, request.url)
    );
}
