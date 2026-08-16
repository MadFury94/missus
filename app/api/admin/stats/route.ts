import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { wcFetch } from "@/lib/wp-fetch";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth(): Record<string, string> | null {
    if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) return null;
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return { "Authorization": `Basic ${auth}`, "Content-Type": "application/json" };
}

async function wcGet(path: string, headers: Record<string, string>) {
    const res = await wcFetch(`${WC_API_URL}${path}`, { headers, cache: "no-store" });
    if (!res || !res.ok) {
        throw new Error(`WC ${res?.status ?? "timeout"} ${path}`);
    }
    return res;
}

/** Paginate through all orders and sum totals for completed/processing */
async function getTotalRevenue(headers: Record<string, string>): Promise<number> {
    let page = 1;
    let total = 0;
    let fetched = 0;
    let grandTotal = 0;

    // First call to get the total count
    const first = await wcGet(
        `/orders?per_page=100&page=1&status=completed,processing&orderby=date&order=desc`,
        headers
    );
    const firstData: Record<string, unknown>[] = await first.json();
    grandTotal = parseInt(first.headers.get("X-WP-Total") || "0");

    firstData.forEach((o) => { total += parseFloat(String(o.total || "0")); });
    fetched += firstData.length;
    page++;

    // Paginate if there are more
    while (fetched < grandTotal && firstData.length === 100) {
        const res = await wcGet(
            `/orders?per_page=100&page=${page}&status=completed,processing`,
            headers
        );
        const data: Record<string, unknown>[] = await res.json();
        data.forEach((o) => { total += parseFloat(String(o.total || "0")); });
        fetched += data.length;
        page++;
        if (data.length < 100) break;
    }

    return Math.round(total);
}

export async function GET(request: NextRequest) {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const headers = getWCAuth();

    if (!headers) {
        return NextResponse.json({
            products: 0, orders: 0, revenue: 0, customers: 0,
            configured: false,
            error: "WC_CONSUMER_KEY and WC_CONSUMER_SECRET are not set in .env.local",
        });
    }

    try {
        // Counts + revenue in parallel where possible
        const [productsRes, ordersRes, customersRes] = await Promise.all([
            wcGet("/products?per_page=1&status=publish", headers),
            wcGet("/orders?per_page=1", headers),
            wcGet("/customers?per_page=1", headers),
        ]);

        const products = parseInt(productsRes.headers.get("X-WP-Total") || "0");
        const orders = parseInt(ordersRes.headers.get("X-WP-Total") || "0");
        const customers = parseInt(customersRes.headers.get("X-WP-Total") || "0");

        // Revenue — sum all completed + processing order totals
        const revenue = await getTotalRevenue(headers);

        return NextResponse.json({ products, orders, revenue, customers, configured: true });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Stats error:", message);
        return NextResponse.json({
            products: 0, orders: 0, revenue: 0, customers: 0,
            configured: true,
            error: message,
        }, { status: 500 });
    }
}
