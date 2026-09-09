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
    const limit = parseInt(searchParams.get("limit") || "10");

    try {
        // Get recent orders
        const res = await fetch(
            `${WC_API_URL}/orders?per_page=${limit}&orderby=date&order=desc`,
            { headers: getWCAuth(), cache: "no-store" }
        );

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
        }

        const orders = await res.json();

        const orderSummary = orders.map((o: any) => ({
            id: o.id,
            number: o.number,
            total: o.total,
            shipping_total: o.shipping_total,
            transaction_id: o.transaction_id,
            status: o.status,
            date_created: o.date_created,
            customer_email: o.billing?.email,
            line_items: o.line_items?.map((item: any) => ({
                name: item.name,
                total: item.total,
                quantity: item.quantity
            })),
            // Look for Paystack references in metadata
            paystack_refs: o.meta_data
                ?.filter((m: any) => m.key === "_paystack_reference")
                ?.map((m: any) => m.value) || []
        }));

        return NextResponse.json({
            count: orderSummary.length,
            orders: orderSummary
        });

    } catch (error) {
        console.error("Error fetching recent orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}