/**
 * WooCommerce Store API Shipping Integration
 * 
 * This module handles shipping rate calculation through WooCommerce's
 * configured shipping zones instead of calling Terminal Africa directly.
 * 
 * Flow:
 * 1. Update customer address on cart via Store API
 * 2. Fetch cart to get zone-matched shipping_rates
 * 3. Present these rates to customer for selection
 * 
 * Terminal Africa is still used post-checkout for shipment creation
 * and tracking - this only replaces the pre-checkout rate calculation.
 */

import type { CartItem } from "@/types";

const STORE_API = "https://missusoutfits.com/wp-json/wc/store/v1";
const WP_ORIGIN = "https://missusoutfits.com";

// WooCommerce shipping rate structure from Store API
export interface WooCommerceShippingRate {
    rate_id: string;
    name: string;
    description: string;
    delivery_time: string;
    price: string; // Price in minor units (kobo)
    taxes: string;
    instance_id: number;
    method_id: string;
    meta_data: Array<{
        key: string;
        value: string;
    }>;
}

// Our normalized shipping rate interface (matches existing Terminal Africa structure)
export interface ShippingRate {
    rate_id: string;
    carrier_name: string;
    carrier_logo?: string;
    amount: number; // Price in kobo
    currency: string;
    delivery_time: string;
    pickup_time?: string;
    delivery_date?: string;
    method_id: string;
    instance_id: number;
}

// Customer address structure for WooCommerce Store API
export interface CustomerAddress {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode?: string;
    country: string;
    email?: string;
    phone?: string;
}

// Store API cart response structure (simplified, focusing on shipping)
interface StoreAPICartResponse {
    totals: {
        total_items: string;
        total_items_tax: string;
        total_fees: string;
        total_fees_tax: string;
        total_discount: string;
        total_discount_tax: string;
        total_shipping: string;
        total_shipping_tax: string;
        total_price: string;
        total_tax: string;
        currency_code: string;
        currency_symbol: string;
        currency_minor_unit: number;
    };
    shipping_rates: Array<{
        package_id: number;
        name: string;
        destination: {
            address_1: string;
            address_2: string;
            city: string;
            state: string;
            postcode: string;
            country: string;
        };
        items: Array<{
            key: string;
            name: string;
            quantity: number;
        }>;
        shipping_rates: WooCommerceShippingRate[];
    }>;
    items: any[];
}

/**
 * Headers for WooCommerce Store API calls
 * Uses same pattern as existing storeFetch calls with session support
 */
function getStoreAPIHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        "Referer": WP_ORIGIN,
        "Origin": WP_ORIGIN,
    };
}

/**
 * Store API fetch with session and timeout support
 * Based on existing wpFetch pattern but with credentials for cart operations
 */
async function storeApiFetch(
    path: string,
    options: RequestInit = {}
): Promise<Response | null> {
    try {
        const TIMEOUT_MS = process.env.NODE_ENV === "development" ? 8000 : 15000;

        const res = await fetch(`${STORE_API}${path}`, {
            ...options,
            headers: {
                ...getStoreAPIHeaders(),
                ...options.headers,
            },
            credentials: "include", // Important for cart session management
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        return res;
    } catch (err) {
        console.error("[woocommerce-shipping] Store API fetch failed:", path, err instanceof Error ? err.message : err);
        return null;
    }
}

/**
 * Update customer shipping address on the WooCommerce cart
 * This triggers WooCommerce to recalculate shipping based on zones
 */
export async function updateCartShippingAddress(address: CustomerAddress): Promise<boolean> {
    try {
        const response = await storeApiFetch("/cart/update-customer", {
            method: "POST",
            body: JSON.stringify({
                shipping_address: address,
                billing_address: address, // Also update billing for consistency
            }),
        });

        if (!response || !response.ok) {
            console.error("[woocommerce-shipping] Failed to update customer address:", response?.status);
            return false;
        }

        return true;
    } catch (error) {
        console.error("[woocommerce-shipping] Error updating customer address:", error);
        return false;
    }
}

/**
 * Sync local cart items to WooCommerce cart
 * This ensures WooCommerce has the current cart contents for shipping calculation
 */
export async function syncCartToWooCommerce(items: CartItem[]): Promise<boolean> {
    try {
        // First, clear the WooCommerce cart
        const clearResponse = await storeApiFetch("/cart/items", {
            method: "DELETE",
        });

        if (!clearResponse || !clearResponse.ok) {
            console.warn("[woocommerce-shipping] Failed to clear cart, continuing...");
        }

        // Add each item to the WooCommerce cart
        for (const item of items) {
            const addResponse = await storeApiFetch("/cart/add-item", {
                method: "POST",
                body: JSON.stringify({
                    id: item.productId,
                    quantity: item.quantity,
                    variation: item.variationId || undefined,
                }),
            });

            if (!addResponse || !addResponse.ok) {
                console.error("[woocommerce-shipping] Failed to add item to cart:", item.productId);
                // Continue with other items even if one fails
            }
        }

        return true;
    } catch (error) {
        console.error("[woocommerce-shipping] Error syncing cart:", error);
        return false;
    }
}

/**
 * Get shipping rates from WooCommerce based on current cart and customer address
 * Returns the configured shipping zone rates instead of Terminal Africa rates
 */
export async function getWooCommerceShippingRates(
    shippingAddress: CustomerAddress,
    cartItems: CartItem[]
): Promise<ShippingRate[]> {
    try {
        console.log("[woocommerce-shipping] Starting rate fetch for:", {
            city: shippingAddress.city,
            state: shippingAddress.state,
            itemCount: cartItems.length
        });

        // Step 1: Sync local cart to WooCommerce
        console.log("[woocommerce-shipping] Step 1: Syncing cart to WooCommerce...");
        const cartSynced = await syncCartToWooCommerce(cartItems);
        if (!cartSynced) {
            console.warn("[woocommerce-shipping] Cart sync failed, but continuing...");
        }

        // Step 2: Update shipping address on the cart
        console.log("[woocommerce-shipping] Step 2: Updating customer address...");
        const addressUpdated = await updateCartShippingAddress(shippingAddress);
        if (!addressUpdated) {
            console.error("[woocommerce-shipping] Failed to update address");
            return [];
        }

        // Step 3: Fetch cart to get calculated shipping rates
        console.log("[woocommerce-shipping] Step 3: Fetching cart with shipping rates...");
        const cartResponse = await storeApiFetch("/cart");

        console.log("[woocommerce-shipping] Cart response status:", cartResponse?.status);

        if (!cartResponse || !cartResponse.ok) {
            console.error("[woocommerce-shipping] Failed to fetch cart:", cartResponse?.status);
            if (cartResponse) {
                const errorText = await cartResponse.text();
                console.error("[woocommerce-shipping] Cart error response:", errorText);
            }
            return [];
        }

        const cartData: StoreAPICartResponse = await cartResponse.json();
        console.log("[woocommerce-shipping] Cart data received:", {
            hasShippingRates: !!cartData.shipping_rates,
            shippingPackagesCount: cartData.shipping_rates?.length || 0
        });

        // Step 4: Extract and normalize shipping rates
        const shippingRates: ShippingRate[] = [];

        // WooCommerce returns shipping rates grouped by package
        // For most stores, there's typically one package with all shipping options
        for (const shippingPackage of cartData.shipping_rates || []) {
            console.log("[woocommerce-shipping] Processing package:", {
                packageId: shippingPackage.package_id,
                ratesCount: shippingPackage.shipping_rates?.length || 0,
                destination: shippingPackage.destination
            });

            for (const rate of shippingPackage.shipping_rates || []) {
                console.log("[woocommerce-shipping] Processing rate:", {
                    rateId: rate.rate_id,
                    name: rate.name,
                    price: rate.price,
                    deliveryTime: rate.delivery_time
                });

                shippingRates.push({
                    rate_id: rate.rate_id,
                    carrier_name: rate.name,
                    amount: parseInt(rate.price) || 0, // Convert to number (already in kobo from WC)
                    currency: cartData.totals.currency_code || "NGN",
                    delivery_time: rate.delivery_time || rate.description || "",
                    method_id: rate.method_id,
                    instance_id: rate.instance_id,
                });
            }
        }

        console.log("[woocommerce-shipping] Final rates extracted:", {
            count: shippingRates.length,
            rates: shippingRates.map(r => ({ name: r.carrier_name, amount: r.amount }))
        });

        // Sort by price (cheapest first) to match existing behavior
        return shippingRates.sort((a, b) => a.amount - b.amount);

    } catch (error) {
        console.error("[woocommerce-shipping] Error getting shipping rates:", error);
        return [];
    }
}

/**
 * Set the selected shipping method on the WooCommerce cart
 * This is needed so WooCommerce knows which shipping method was chosen
 */
export async function selectShippingMethod(rateId: string): Promise<boolean> {
    try {
        const response = await storeApiFetch("/cart/select-shipping-rate", {
            method: "POST",
            body: JSON.stringify({
                rate_id: rateId,
                package_id: 0, // Typically 0 for the default package
            }),
        });

        if (!response || !response.ok) {
            console.error("[woocommerce-shipping] Failed to select shipping method:", response?.status);
            return false;
        }

        return true;
    } catch (error) {
        console.error("[woocommerce-shipping] Error selecting shipping method:", error);
        return false;
    }
}

/**
 * Get fallback shipping rates when WooCommerce is unavailable
 * Updated to match your actual WooCommerce zones configuration
 */
export function getFallbackShippingRates(state: string): ShippingRate[] {
    const isLagos = state.toLowerCase().includes("lagos");

    if (isLagos) {
        // Lagos Zone rates (from your screenshots)
        return [
            {
                rate_id: "fallback_standard_lagos",
                carrier_name: "Standard Shipping (2-3 Days)",
                amount: 400000, // ₦4,000 in kobo
                currency: "NGN",
                delivery_time: "2-3 business days",
                method_id: "flat_rate",
                instance_id: 1,
            },
            {
                rate_id: "fallback_express_lagos",
                carrier_name: "Express Shipping (Same Day)",
                amount: 600000, // ₦6,000 in kobo
                currency: "NGN",
                delivery_time: "Same day delivery",
                method_id: "flat_rate",
                instance_id: 2,
            },
        ];
    } else {
        // Countrywide Zone rates (from your screenshots - same as Lagos)
        return [
            {
                rate_id: "fallback_standard_countrywide",
                carrier_name: "Standard Shipping (4-7 Days)",
                amount: 400000, // ₦4,000 in kobo (matches your countrywide config)
                currency: "NGN",
                delivery_time: "4-7 business days",
                method_id: "flat_rate",
                instance_id: 1,
            },
            {
                rate_id: "fallback_express_countrywide",
                carrier_name: "Express Shipping (2-3 Days)",
                amount: 600000, // ₦6,000 in kobo (matches your countrywide config)
                currency: "NGN",
                delivery_time: "2-3 business days",
                method_id: "flat_rate",
                instance_id: 2,
            },
        ];
    }
}