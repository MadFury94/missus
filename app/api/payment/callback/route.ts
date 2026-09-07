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
    let meta: Record<string, unknown> = {};

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

            // Send branded confirmation email (fire-and-forget)
            if (shipping && orderId) {
                (async () => {
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

                        const totalAmount = cart.reduce(
                            (sum: number, item: CartItem) => sum + item.price * item.quantity, 0
                        );

                        const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo -->
        <tr>
          <td style="padding:0 0 28px;text-align:center;">
            <img src="https://missusoutfits.com/wp-content/uploads/missus-logo.webp" alt="MISSUS" height="36" style="filter:invert(0);" />
          </td>
        </tr>

        <!-- Header card -->
        <tr>
          <td style="background:#000;padding:32px 40px;text-align:center;">
            <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.15);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
              <span style="color:#fff;font-size:22px;">✓</span>
            </div>
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.5);">Order Confirmed</p>
            <h1 style="margin:0;font-size:26px;font-weight:300;color:#fff;letter-spacing:-.01em;">Thank you, ${shipping.firstName}!</h1>
            ${orderNumber ? `<p style="margin:12px 0 0;font-size:13px;color:rgba(255,255,255,.5);">Order #${orderNumber}</p>` : ""}
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:32px 40px;">

            <p style="margin:0 0 24px;font-size:13px;color:#555;line-height:1.7;">
              Your payment was successful and your order is confirmed. We&apos;ll get your items packed and dispatched shortly.
            </p>

            <!-- Items -->
            <h3 style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#aaa;">Items Ordered</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              ${itemsHtml}
              <tr>
                <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#000;">Total</td>
                <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#000;text-align:right;">₦${totalAmount.toLocaleString("en-NG")}</td>
              </tr>
            </table>

            <!-- Delivery address -->
            <h3 style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#aaa;">Shipping To</h3>
            <p style="margin:0 0 24px;font-size:13px;color:#333;line-height:1.7;">
              ${shipping.firstName} ${shipping.lastName}<br>
              ${shipping.address}<br>
              ${shipping.city}, ${shipping.state}<br>
              Nigeria
            </p>

            <!-- What's next -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;padding:20px;margin-bottom:28px;">
              <tr><td>
                <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#aaa;">What Happens Next</p>
                <p style="margin:0 0 8px;font-size:13px;color:#555;padding-left:14px;border-left:2px solid #000;">We&apos;ll pack your order within 24 hours.</p>
                <p style="margin:0 0 8px;font-size:13px;color:#555;padding-left:14px;border-left:2px solid #ddd;">Lagos: same-day delivery · Nationwide: 2–5 days.</p>
                <p style="margin:0;font-size:13px;color:#555;padding-left:14px;border-left:2px solid #ddd;">You&apos;ll get a tracking update once dispatched.</p>
              </td></tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders${orderId ? `/${orderId}` : ""}"
                     style="display:inline-block;background:#000;color:#fff;padding:14px 36px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;border-radius:999px;">
                    Track My Order
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;color:#aaa;">Questions? Reply to this email or <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color:#000;">contact us</a>.</p>
            <p style="margin:0;font-size:11px;color:#ccc;">© ${new Date().getFullYear()} Missus Outfits · Lagos, Nigeria</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
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
                                subject: `Order Confirmed${orderNumber ? ` #${orderNumber}` : ""} — Thank you, ${shipping.firstName}!`,
                                html,
                            }),
                        });
                    } catch (err) {
                        console.error("[email] Confirmation email failed:", err);
                    }
                })();
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

            // Auto-dispatch shipment via Terminal Africa using the rate selected at checkout
            const selectedRateId: string = (meta as Record<string, unknown>).selectedRateId as string ?? "";

            if (selectedRateId && shipping && orderId) {
                (async () => {
                    try {
                        const { createShipment, getOriginAddress } = await import("@/lib/delivery");
                        const shipResult = await createShipment({
                            rateId: selectedRateId,
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

                        // Store shipment ID on the WC order so tracking works in /account/orders/[id]
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
                    } catch (err) {
                        console.error("[delivery] auto-dispatch failed:", err);
                    }
                })();
            }

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
