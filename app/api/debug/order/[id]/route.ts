import { NextRequest, NextResponse } from "next/server";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const res = await fetch(`${WC_API_URL}/orders/${id}`, {
            headers: getWCAuth(),
            cache: "no-store"
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const order = await res.json();

        return NextResponse.json({
            id: order.id,
            number: order.number,
            total: order.total,
            shipping_total: order.shipping_total,
            shipping_lines: order.shipping_lines,
            line_items: order.line_items?.map((item: any) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                total: item.total,
            })),
            meta_data: order.meta_data?.filter((m: any) => m.key.startsWith('_delivery') || m.key.startsWith('_shipping')),
        });

    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}