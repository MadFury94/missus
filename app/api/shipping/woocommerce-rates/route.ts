import { NextRequest, NextResponse } from "next/server";
import { CartAvailabilityError, getWooCommerceShippingRates } from "@/lib/woocommerce-shipping";

export async function POST(req: NextRequest) {
    try {
        const { city, state, items, address_1, postcode, country = "NG", coupon = "" } = await req.json();
        if (typeof city !== "string" || !city.trim() || typeof state !== "string" || !state.trim() || !Array.isArray(items) || !items.length ||
            items.some(item => !Number.isInteger(item.productId) || item.productId <= 0 || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
            return NextResponse.json({ error: "Enter a delivery address and add products to your cart." }, { status: 400 });
        }
        const rates = await getWooCommerceShippingRates({ address_1: address_1 || city, city: city.trim(), state: state.trim(), postcode: postcode || "", country }, items, coupon);
        return NextResponse.json({ rates });
    } catch (error) {
        console.error("[woocommerce-rates]", error);
        if (error instanceof CartAvailabilityError) {
            return NextResponse.json({ error: error.message + " Please update your bag or select another size.", code: "cart_unavailable" }, { status: 422 });
        }
        return NextResponse.json({ error: "Shipping options could not be loaded. Please retry or contact us for delivery assistance." }, { status: 503 });
    }
}
