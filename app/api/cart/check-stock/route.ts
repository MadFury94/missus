import { NextRequest, NextResponse } from "next/server";
import { getProductStock } from "@/lib/product-stock";
import { stockForSelection } from "@/lib/stock-selection";
import type { CartItem } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const { items } = await request.json();
        if (!Array.isArray(items) || items.length > 100 || items.some(item =>
            !item || !Number.isSafeInteger(item.productId) || item.productId <= 0 ||
            (item.variationId !== undefined && (!Number.isSafeInteger(item.variationId) || item.variationId <= 0)) ||
            (item.size !== undefined && typeof item.size !== "string") ||
            (item.color !== undefined && typeof item.color !== "string"))) {
            return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
        }
        const stocks = new Map();
        // Read each product once, even when several sizes are in the cart.
        for (const id of new Set<number>(items.map(item => item.productId))) {
            stocks.set(id, await getProductStock(id));
        }
        const unavailable = items.filter((item: CartItem) => {
            const stock = stocks.get(item.productId);
            if (!stock.available) return true;
            if (stock.variable && item.variationId) {
                return stock.variants.find((variant: { id: number }) => variant.id === item.variationId)?.available === false;
            }
            return stockForSelection(stock, item.size || "", item.color || "")?.available === false;
        });
        return NextResponse.json({ unavailable });
    } catch {
        return NextResponse.json({ error: "We could not check stock. Your cart has not been changed. Please try again." }, { status: 503 });
    }
}
