import { NextResponse } from "next/server";

const STORE_API = "https://missusoutfits.com/wp-json/wc/store/v1";

export async function GET() {
    try {
        console.log("[debug] Testing WooCommerce Store API connection...");

        // Test 1: Check if Store API is accessible
        const cartResponse = await fetch(`${STORE_API}/cart`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://missusoutfits.com",
                "Origin": "https://missusoutfits.com",
            },
            credentials: "include",
        });

        const cartStatus = cartResponse.status;
        let cartData = null;

        if (cartResponse.ok) {
            try {
                cartData = await cartResponse.json();
            } catch (e) {
                console.log("[debug] Failed to parse cart JSON");
            }
        } else {
            const errorText = await cartResponse.text();
            console.log("[debug] Cart API error:", errorText);
        }

        // Test 2: Try to add a test product to cart
        let addItemStatus = null;
        let addItemError = null;

        try {
            const addResponse = await fetch(`${STORE_API}/cart/add-item`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Referer": "https://missusoutfits.com",
                    "Origin": "https://missusoutfits.com",
                },
                credentials: "include",
                body: JSON.stringify({
                    id: 1, // Assuming product ID 1 exists
                    quantity: 1,
                }),
            });

            addItemStatus = addResponse.status;
            if (!addResponse.ok) {
                addItemError = await addResponse.text();
            }
        } catch (e) {
            addItemError = e instanceof Error ? e.message : "Unknown error";
        }

        // Test 3: Try to update customer address
        let updateAddressStatus = null;
        let updateAddressError = null;

        try {
            const updateResponse = await fetch(`${STORE_API}/cart/update-customer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Referer": "https://missusoutfits.com",
                    "Origin": "https://missusoutfits.com",
                },
                credentials: "include",
                body: JSON.stringify({
                    shipping_address: {
                        city: "Lagos",
                        state: "Lagos",
                        country: "NG",
                        postcode: "100001",
                        address_1: "Test Street"
                    },
                }),
            });

            updateAddressStatus = updateResponse.status;
            if (!updateResponse.ok) {
                updateAddressError = await updateResponse.text();
            }
        } catch (e) {
            updateAddressError = e instanceof Error ? e.message : "Unknown error";
        }

        return NextResponse.json({
            storeApiUrl: STORE_API,
            tests: {
                cartAccess: {
                    status: cartStatus,
                    success: cartResponse.ok,
                    hasShippingRates: !!cartData?.shipping_rates,
                    currency: cartData?.totals?.currency_code,
                },
                addItem: {
                    status: addItemStatus,
                    success: addItemStatus === 200 || addItemStatus === 201,
                    error: addItemError,
                },
                updateAddress: {
                    status: updateAddressStatus,
                    success: updateAddressStatus === 200 || updateAddressStatus === 201,
                    error: updateAddressError,
                },
            },
            debug: {
                environment: process.env.NODE_ENV,
                timestamp: new Date().toISOString(),
            }
        });

    } catch (error) {
        return NextResponse.json({
            error: "Debug test failed",
            message: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
