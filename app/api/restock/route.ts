import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, productId, variationId } = await req.json();

        // Validate input
        if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            !Number.isSafeInteger(productId) || productId <= 0 ||
            (variationId !== undefined && (!Number.isSafeInteger(variationId) || variationId <= 0))) {
            return NextResponse.json({ error: "Enter a valid email and select a product option." }, { status: 400 });
        }

        const credentials = process.env.WP_APP_PASSWORD;
        if (!credentials) throw new Error("WordPress connection unavailable");

        const base = (process.env.WP_API_URL || "https://missusoutfits.com/wp-json").replace(/\/$/, "");

        // 1. Save restock notification 
        const restockResponse = await fetch(`${base}/missus/v1/restock`, {
            method: "POST",
            cache: "no-store",
            signal: AbortSignal.timeout(12000),
            headers: {
                Authorization: `Basic ${Buffer.from(credentials.trim()).toString("base64")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                productId,
                variationId
            }),
        });

        const restockResult = await restockResponse.json();

        if (!restockResponse.ok) {
            return NextResponse.json({
                error: [400, 409].includes(restockResponse.status)
                    ? restockResult.message
                    : "Restock signup is temporarily unavailable. Please try again."
            }, { status: [400, 409].includes(restockResponse.status) ? restockResponse.status : 503 });
        }

        if (!restockResult.ok) throw new Error("Subscription was not saved");

        // 2. Try to add to WordPress email marketing (MailChimp, Newsletter, etc.)
        // This is optional and won't fail the restock signup if it doesn't work
        try {
            // Check if MailChimp for WooCommerce is active
            const mailchimpResponse = await fetch(`${base}/wp/v2/mailchimp-for-woocommerce/subscribe`, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${Buffer.from(credentials.trim()).toString("base64")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email_address: email.trim().toLowerCase(),
                    status: "subscribed",
                    tags: ["restock-notification", `product-${productId}`],
                    merge_fields: {
                        SOURCE: "restock_notification",
                        PRODUCT_ID: productId.toString(),
                        ...(variationId && { VARIATION_ID: variationId.toString() })
                    }
                }),
            });

            if (mailchimpResponse.ok) {
                console.log("[restock] Added to MailChimp email marketing");
            }
        } catch (mailchimpError) {
            console.log("[restock] MailChimp not available, trying Newsletter plugin");

            try {
                // Try Newsletter plugin API
                const newsletterResponse = await fetch(`${base}/newsletter/v1/subscribe`, {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${Buffer.from(credentials.trim()).toString("base64")}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        list: "restock-notifications",
                        fields: {
                            product_id: productId,
                            ...(variationId && { variation_id: variationId }),
                            source: "restock_notification"
                        }
                    }),
                });

                if (newsletterResponse.ok) {
                    console.log("[restock] Added to Newsletter plugin");
                }
            } catch (newsletterError) {
                console.log("[restock] Newsletter plugin not available, trying WooCommerce customer creation");

                try {
                    // Create WooCommerce customer with restock metadata
                    const customerResponse = await fetch(`${base.replace('/wp-json', '')}/wp-json/wc/v3/customers`, {
                        method: "POST",
                        headers: {
                            Authorization: `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64")}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: email.trim().toLowerCase(),
                            meta_data: [
                                { key: "_restock_notifications", value: "yes" },
                                { key: "_restock_product_" + productId, value: variationId ? variationId.toString() : "all" },
                                { key: "_marketing_consent", value: "restock_only" }
                            ]
                        }),
                    });

                    if (customerResponse.ok) {
                        console.log("[restock] Created WooCommerce customer with restock preferences");
                    }
                } catch (wcError) {
                    console.log("[restock] WordPress email marketing integration failed, but restock notification saved");
                }
            }
        }

        return NextResponse.json({
            ok: true,
            message: "You'll be notified when this item is back in stock!"
        });

    } catch (error) {
        console.error("[restock] API error:", error);
        return NextResponse.json({
            error: "Could not save your notification request. Please try again."
        }, { status: 503 });
    }
}
