import { NextRequest, NextResponse } from "next/server";
import { getWooCommerceShippingRates, getFallbackShippingRates } from "@/lib/woocommerce-shipping";
import type { CustomerAddress } from "@/lib/woocommerce-shipping";
import type { CartItem } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { city, state, items, address_1, postcode, country = "NG" } = body;

        console.log("[woocommerce-rates] API called with:", {
            city,
            state,
            itemsCount: items?.length,
            address_1,
            postcode
        });

        // Validate required fields
        if (!city?.trim() || !state?.trim() || !Array.isArray(items)) {
            console.error("[woocommerce-rates] Missing required fields");
            return NextResponse.json(
                { error: "Missing required fields: city, state, items" },
                { status: 400 }
            );
        }

        // Convert to WooCommerce address format
        const shippingAddress: CustomerAddress = {
            address_1: address_1 || city, // Use city as address if not provided
            city: city.trim(),
            state: state.trim(),
            postcode: postcode || "100001", // Default Lagos postcode
            country: country,
        };

        console.log("[woocommerce-rates] Shipping address:", shippingAddress);

        // Convert items to CartItem format if needed
        const cartItems: CartItem[] = items.map((item: any) => ({
            productId: item.productId || item.id,
            name: item.name,
            price: item.price || item.value || 0,
            quantity: item.quantity || 1,
            size: item.size,
            color: item.color,
            image: item.image || "",
            slug: item.slug || "",
            variationId: item.variationId,
        }));

        console.log("[woocommerce-rates] Cart items:", cartItems.length);

        // Get shipping rates from WooCommerce
        console.log("[woocommerce-rates] Calling getWooCommerceShippingRates...");
        const rates = await getWooCommerceShippingRates(shippingAddress, cartItems);

        console.log("[woocommerce-rates] Received rates:", {
            count: rates.length,
            rates: rates.map(r => ({ name: r.carrier_name, amount: r.amount }))
        });

        // If WooCommerce returns no rates, use fallback rates
        if (rates.length === 0) {
            console.warn("[woocommerce-rates] No rates from WooCommerce, using fallback");
            const fallbackRates = getFallbackShippingRates(state);
            console.log("[woocommerce-rates] Fallback rates:", fallbackRates.map(r => ({ name: r.carrier_name, amount: r.amount })));

            return NextResponse.json({
                rates: fallbackRates,
                fallback: true,
                message: "Using fallback rates - WooCommerce shipping zones may need configuration",
                debug: {
                    woocommerceAttempted: true,
                    fallbackUsed: true,
                    address: shippingAddress
                }
            });
        }

        return NextResponse.json({
            rates,
            fallback: false,
            message: `Found ${rates.length} shipping option(s) from configured zones`,
            debug: {
                woocommerceSuccess: true,
                fallbackUsed: false,
                address: shippingAddress
            }
        });

    } catch (error) {
        console.error("[woocommerce-rates] API error:", error);

        // Return fallback rates on any error to prevent checkout from breaking
        try {
            const body = await req.json();
            const fallbackRates = getFallbackShippingRates(body.state || "Lagos");
            console.log("[woocommerce-rates] Error fallback rates:", fallbackRates.map(r => ({ name: r.carrier_name, amount: r.amount })));

            return NextResponse.json({
                rates: fallbackRates,
                fallback: true,
                error: "Failed to fetch WooCommerce rates, using fallback",
                debug: {
                    errorOccurred: true,
                    errorMessage: error.message
                }
            });
        } catch {
            return NextResponse.json({
                error: "Failed to fetch shipping rates"
            }, { status: 500 });
        }
    }
}