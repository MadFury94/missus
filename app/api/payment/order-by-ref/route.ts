import { NextRequest, NextResponse } from "next/server";

// Looks up a WooCommerce order by Paystack transaction reference.
// Used by the confirmation page to show order details without requiring login.

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

export async function GET(req: NextRequest) {
    const ref = req.nextUrl.searchParams.get("ref");
    if (!ref) return NextResponse.json({ error: "ref required" }, { status: 400 });

    try {
        // Search WC orders by transaction ID (which is the Paystack reference)
        const res = await fetch(
            `${WC_API_URL}/orders?transaction_id=${encodeURIComponent(ref)}&per_page=1`,
            { headers: getWCAuth(), cache: "no-store" }
        );
        if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const orders = await res.json();
        if (!Array.isArray(orders) || orders.length === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const o = orders[0];
        return NextResponse.json({
            id: o.id,
            number: o.number,
            status: o.status,
            total: o.total,
            currency: o.currency,
            shipping_total: o.shipping_total,
            discount_total: o.discount_total,
            line_items: (o.line_items as Record<string, unknown>[])?.map((li) => ({
                id: li.id,
                name: li.name,
                quantity: li.quantity,
                total: li.total,
                image: (li.image as { src?: string } | null)?.src ?? null,
                meta_data: (li.meta_data as { key: string; value: string }[])
                    ?.filter((m) => !m.key.startsWith("_")) ?? [],
            })),
            billing: {
                first_name: (o.billing as Record<string, string>)?.first_name,
                last_name: (o.billing as Record<string, string>)?.last_name,
                email: (o.billing as Record<string, string>)?.email,
                phone: (o.billing as Record<string, string>)?.phone,
                address_1: (o.billing as Record<string, string>)?.address_1,
                city: (o.billing as Record<string, string>)?.city,
                state: (o.billing as Record<string, string>)?.state,
            },
            shipping: {
                first_name: (o.shipping as Record<string, string>)?.first_name,
                last_name: (o.shipping as Record<string, string>)?.last_name,
                address_1: (o.shipping as Record<string, string>)?.address_1,
                city: (o.shipping as Record<string, string>)?.city,
                state: (o.shipping as Record<string, string>)?.state,
            },
        });
    } catch (err) {
        console.error("[order-by-ref]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
