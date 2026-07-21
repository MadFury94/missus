import { NextRequest, NextResponse } from "next/server";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

/**
 * GET /api/account/orders?email=...
 * Looks up WooCommerce orders by billing email.
 * No admin auth needed — the email acts as the identity claim.
 * We only return safe, customer-facing fields.
 */
export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get("email");
    if (!email) return NextResponse.json({ orders: [] });

    try {
        const res = await fetch(
            `${WC_API_URL}/orders?billing_email=${encodeURIComponent(email)}&per_page=20&orderby=date&order=desc`,
            { headers: getWCAuth(), cache: "no-store" }
        );
        if (!res.ok) return NextResponse.json({ orders: [] });

        const raw = await res.json();

        // Strip sensitive data — only return what the customer needs
        const orders = raw.map((o: Record<string, unknown>) => ({
            id: o.id,
            number: o.number,
            status: o.status,
            date_created: o.date_created,
            total: o.total,
            currency: o.currency,
            line_items: (o.line_items as Record<string, unknown>[])?.map((li) => ({
                id: li.id,
                name: li.name,
                quantity: li.quantity,
                total: li.total,
                image: (li.image as { src?: string } | null)?.src ?? null,
            })),
            shipping: {
                first_name: (o.shipping as Record<string, unknown>)?.first_name,
                last_name: (o.shipping as Record<string, unknown>)?.last_name,
                address_1: (o.shipping as Record<string, unknown>)?.address_1,
                city: (o.shipping as Record<string, unknown>)?.city,
                state: (o.shipping as Record<string, unknown>)?.state,
            },
        }));

        return NextResponse.json({ orders });
    } catch {
        return NextResponse.json({ orders: [] });
    }
}
