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
    const ref = searchParams.get("ref");
    const email = searchParams.get("email");

    if (!ref && !email) {
        return NextResponse.json({ error: "Either ref or email parameter required" }, { status: 400 });
    }

    try {
        // Search by transaction ID (Paystack reference)
        if (ref) {
            const refRes = await fetch(
                `${WC_API_URL}/orders?transaction_id=${encodeURIComponent(ref)}&per_page=10`,
                { headers: getWCAuth(), cache: "no-store" }
            );

            if (refRes.ok) {
                const refOrders = await refRes.json();

                // Also search by meta data for the reference
                const metaRes = await fetch(
                    `${WC_API_URL}/orders?meta_key=_paystack_reference&meta_value=${encodeURIComponent(ref)}&per_page=10`,
                    { headers: getWCAuth(), cache: "no-store" }
                );

                let metaOrders = [];
                if (metaRes.ok) {
                    metaOrders = await metaRes.json();
                }

                return NextResponse.json({
                    search_ref: ref,
                    by_transaction_id: refOrders.map((o: any) => ({
                        id: o.id,
                        number: o.number,
                        total: o.total,
                        shipping_total: o.shipping_total,
                        transaction_id: o.transaction_id,
                        line_items: o.line_items?.map((item: any) => ({
                            name: item.name,
                            total: item.total,
                            quantity: item.quantity
                        })),
                        billing: { email: o.billing?.email }
                    })),
                    by_meta_data: metaOrders.map((o: any) => ({
                        id: o.id,
                        number: o.number,
                        total: o.total,
                        shipping_total: o.shipping_total,
                        transaction_id: o.transaction_id,
                        line_items: o.line_items?.map((item: any) => ({
                            name: item.name,
                            total: item.total,
                            quantity: item.quantity
                        })),
                        billing: { email: o.billing?.email }
                    }))
                });
            }
        }

        // Search by email
        if (email) {
            const emailRes = await fetch(
                `${WC_API_URL}/orders?customer=${encodeURIComponent(email)}&per_page=10&orderby=date&order=desc`,
                { headers: getWCAuth(), cache: "no-store" }
            );

            if (emailRes.ok) {
                const emailOrders = await emailRes.json();

                return NextResponse.json({
                    search_email: email,
                    recent_orders: emailOrders.map((o: any) => ({
                        id: o.id,
                        number: o.number,
                        total: o.total,
                        shipping_total: o.shipping_total,
                        transaction_id: o.transaction_id,
                        date_created: o.date_created,
                        line_items: o.line_items?.map((item: any) => ({
                            name: item.name,
                            total: item.total,
                            quantity: item.quantity
                        })),
                        billing: { email: o.billing?.email }
                    }))
                });
            }
        }

        return NextResponse.json({ error: "No orders found" }, { status: 404 });

    } catch (error) {
        console.error("Error searching orders:", error);
        return NextResponse.json({ error: "Failed to search orders" }, { status: 500 });
    }
}