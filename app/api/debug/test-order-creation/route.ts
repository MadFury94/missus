import { NextRequest, NextResponse } from "next/server";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
    };
}

export async function POST(req: NextRequest) {
    try {
        // Test creating an order with shipping_lines (same structure as updated callback)
        const selectedRate = {
            rate_id: "fallback_standard_countrywide",
            carrier_name: "Standard Shipping (4-7 Days)",
            amount: 400000, // ₦4,000 in kobo
            method_id: "flat_rate",
            instance_id: 1,
            delivery_time: "4-7 business days"
        };

        const orderPayload = {
            payment_method: "paystack",
            payment_method_title: "Paystack (Test)",
            set_paid: false, // Don't actually mark as paid for test
            transaction_id: `TEST-${Date.now()}`,
            status: "pending",
            billing: {
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                phone: "1234567890",
                address_1: "Test Address",
                city: "Lagos",
                state: "Lagos",
                country: "NG",
            },
            shipping: {
                first_name: "Test",
                last_name: "User",
                address_1: "Test Address",
                city: "Lagos",
                state: "Lagos",
                country: "NG",
            },
            line_items: [{
                product_id: 1, // Replace with actual product ID if needed
                quantity: 1,
            }],
            // This is the key part - shipping_lines
            shipping_lines: [{
                method_id: selectedRate.method_id || "flat_rate",
                method_title: selectedRate.carrier_name || "Shipping",
                total: String((selectedRate.amount || 0) / 100), // Convert kobo to naira
                ...(selectedRate.instance_id !== undefined ? { instance_id: selectedRate.instance_id } : {}),
            }],
            meta_data: [
                { key: "_delivery_carrier", value: selectedRate.carrier_name },
                { key: "_delivery_rate_id", value: selectedRate.rate_id || "" },
                { key: "_delivery_method_id", value: selectedRate.method_id || "" },
                { key: "_delivery_instance_id", value: String(selectedRate.instance_id || "") },
                { key: "_delivery_time", value: selectedRate.delivery_time || "" },
                { key: "_shipping_source", value: "fallback" },
            ],
        };

        console.log("Creating test order with payload:", JSON.stringify(orderPayload, null, 2));

        const orderRes = await fetch(`${WC_API_URL}/orders`, {
            method: "POST",
            headers: getWCAuth(),
            body: JSON.stringify(orderPayload),
        });

        if (!orderRes.ok) {
            const errorData = await orderRes.json();
            console.error("WooCommerce order creation failed:", errorData);
            return NextResponse.json({
                error: "Failed to create test order",
                details: errorData
            }, { status: 500 });
        }

        const orderData = await orderRes.json();

        return NextResponse.json({
            success: true,
            message: "Test order created successfully",
            orderId: orderData.id,
            orderNumber: orderData.number,
            shipping_total: orderData.shipping_total,
            shipping_lines: orderData.shipping_lines,
            total: orderData.total,
            debugUrl: `/api/debug/order/${orderData.id}`
        });

    } catch (error) {
        console.error("Test order creation error:", error);
        return NextResponse.json({
            error: "Failed to create test order",
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
