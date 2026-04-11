import { NextResponse } from "next/server";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
    };
}

export async function GET() {
    try {
        // Fetch products count
        const productsRes = await fetch(`${WC_API_URL}/products?per_page=1`, {
            headers: getWCAuth(),
        });
        const productsTotal = productsRes.headers.get("X-WP-Total") || "0";

        // Fetch orders
        const ordersRes = await fetch(`${WC_API_URL}/orders?per_page=100`, {
            headers: getWCAuth(),
        });
        const orders = await ordersRes.json();
        const ordersTotal = ordersRes.headers.get("X-WP-Total") || "0";

        // Calculate revenue from completed orders
        const revenue = Array.isArray(orders)
            ? orders
                .filter((order: any) => order.status === "completed" || order.status === "processing")
                .reduce((sum: number, order: any) => sum + parseFloat(order.total || "0"), 0)
            : 0;

        // Fetch customers count
        const customersRes = await fetch(`${WC_API_URL}/customers?per_page=1`, {
            headers: getWCAuth(),
        });
        const customersTotal = customersRes.headers.get("X-WP-Total") || "0";

        return NextResponse.json({
            products: parseInt(productsTotal),
            orders: parseInt(ordersTotal),
            revenue: Math.round(revenue),
            customers: parseInt(customersTotal),
        });
    } catch (error: any) {
        console.error("Failed to fetch stats:", error);
        return NextResponse.json(
            { error: error.message, products: 0, orders: 0, revenue: 0, customers: 0 },
            { status: 500 }
        );
    }
}
