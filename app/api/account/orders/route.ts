import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/wp-fetch";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get("email");
    if (!email) return NextResponse.json({ orders: [] });

    const res = await wcFetch(
        `${WC_API_URL}/orders?billing_email=${encodeURIComponent(email)}&per_page=20&orderby=date&order=desc`,
        { headers: getWCAuth(), cache: "no-store" }
    );

    if (!res || !res.ok) return NextResponse.json({ orders: [] });

    const raw = await res.json();
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
}
