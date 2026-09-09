import { NextRequest, NextResponse } from "next/server";
import { initializePayment, generateReference } from "@/lib/paystack";
import { getWooCommerceShippingRates } from "@/lib/woocommerce-shipping";

export async function POST(req: NextRequest) {
    try {
        const { email, amount, metadata } = await req.json();
        if (!email || !amount) {
            return NextResponse.json({ error: "email and amount required" }, { status: 400 });
        }
        const shipping = metadata?.shipping;
        if (!shipping || !Array.isArray(metadata.cart) || !metadata.cart.length || !metadata.selectedRate) {
            return NextResponse.json({ error: "Choose a shipping method before paying." }, { status: 400 });
        }
        const rates = await getWooCommerceShippingRates({
            address_1: shipping.address, city: shipping.city, state: shipping.state,
            postcode: shipping.postalCode || "", country: shipping.country || "NG",
        }, metadata.cart, metadata.giftCardCode ? "" : metadata.promoCode || "");
        const rate = rates.find(rate => rate.rate_id === metadata.selectedRate.rate_id);
        if (!rate || rate.amount !== metadata.selectedRate.amount) {
            return NextResponse.json({ error: "Shipping options have changed. Please select a current shipping method." }, { status: 409 });
        }
        const subtotal = metadata.cart.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
        if (Math.round(amount * 100) !== Math.round((subtotal - Number(metadata.promoDiscount || 0)) * 100) + rate.amount) {
            return NextResponse.json({ error: "Your checkout total has changed. Please refresh and try again." }, { status: 409 });
        }
        metadata.selectedRate = rate;
        const reference = generateReference();

        // Derive the callback URL from the incoming request's own origin.
        // This works correctly on localhost, Vercel preview URLs, and the live domain
        // without any env var changes between environments.
        const origin = req.nextUrl.origin; // e.g. http://localhost:3000 or https://missus.vercel.app
        const callbackUrl = `${origin}/api/payment/callback`;

        const result = await initializePayment({ email, amount, reference, callbackUrl, metadata });
        if (!result?.status) {
            return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
        }
        return NextResponse.json(result.data);
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
