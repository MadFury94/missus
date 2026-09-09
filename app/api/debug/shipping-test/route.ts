import { NextRequest, NextResponse } from "next/server";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
        return NextResponse.json({ error: "Missing orderId parameter" }, { status: 400 });
    }

    try {
        const res = await fetch(`${WC_API_URL}/orders/${orderId}`, {
            headers: getWCAuth(),
            cache: "no-store"
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const order = await res.json();

        // Extract shipping-related information
        const shippingInfo = {
            order_id: order.id,
            order_number: order.number,
            total: order.total,
            shipping_total: order.shipping_total,
            shipping_lines: order.shipping_lines,
            meta_data: order.meta_data?.filter((m: any) =>
                m.key.startsWith('_delivery') ||
                m.key.startsWith('_shipping') ||
                m.key.startsWith('_paystack')
            ),
            // Analyze shipping payment
            analysis: {
                has_shipping_total: parseFloat(order.shipping_total || "0") > 0,
                has_shipping_lines: order.shipping_lines?.length > 0,
                shipping_metadata: {
                    carrier: order.meta_data?.find((m: any) => m.key === "_delivery_carrier")?.value,
                    amount_paid: order.meta_data?.find((m: any) => m.key === "_shipping_amount_paid")?.value,
                    method_paid: order.meta_data?.find((m: any) => m.key === "_shipping_method_paid")?.value,
                    rate_id: order.meta_data?.find((m: any) => m.key === "_delivery_rate_id")?.value,
                },
                calculated_shipping: (() => {
                    // Check WooCommerce shipping_total first
                    const wcShipping = parseFloat(order.shipping_total || "0");
                    if (wcShipping > 0) return wcShipping;

                    // Check metadata for actual paid amount
                    const metaAmount = order.meta_data?.find((m: any) => m.key === "_shipping_amount_paid")?.value;
                    if (metaAmount) return parseInt(metaAmount) / 100; // Convert kobo to naira

                    // Check if carrier was selected (indicates shipping was paid)
                    const carrier = order.meta_data?.find((m: any) => m.key === "_delivery_carrier")?.value;
                    if (carrier) return 4000; // Default estimate

                    return 0;
                })()
            }
        };

        return NextResponse.json(shippingInfo);

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}