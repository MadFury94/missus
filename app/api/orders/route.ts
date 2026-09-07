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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            cart,
            shipping,
            promoCode,
            promoDiscount,
            selectedRate,
            total,
            paymentMethod,
            paymentStatus = "pending"
        } = body;

        if (!cart || !shipping || !selectedRate) {
            return NextResponse.json(
                { error: "Missing required order data" },
                { status: 400 }
            );
        }

        // Create line items for WooCommerce
        const lineItems = cart.map((item: any) => ({
            product_id: item.productId,
            ...(item.variationId ? { variation_id: item.variationId } : {}),
            quantity: item.quantity,
            ...(item.size ? { meta_data: [{ key: "Size", value: item.size }] } : {}),
        }));

        // Create order in WooCommerce
        const orderPayload = {
            payment_method: paymentMethod === "bank_transfer" ? "bacs" : "paystack",
            payment_method_title: paymentMethod === "bank_transfer" ? "Bank Transfer" : "Paystack",
            set_paid: paymentMethod !== "bank_transfer", // Only set as paid if not bank transfer
            status: paymentMethod === "bank_transfer" ? "on-hold" : "processing",
            billing: {
                first_name: shipping.firstName,
                last_name: shipping.lastName,
                email: shipping.email,
                phone: shipping.phone,
                address_1: shipping.address,
                address_2: shipping.apartment || "",
                city: shipping.city,
                state: shipping.state,
                postcode: shipping.postalCode || "",
                country: "NG",
            },
            shipping: {
                first_name: shipping.firstName,
                last_name: shipping.lastName,
                address_1: shipping.address,
                address_2: shipping.apartment || "",
                city: shipping.city,
                state: shipping.state,
                postcode: shipping.postalCode || "",
                country: "NG",
            },
            line_items: lineItems,
            customer_note: shipping.notes || "",
            shipping_lines: [{
                method_id: selectedRate.carrier_name?.toLowerCase().replace(/\s+/g, '_') || "terminal_africa",
                method_title: selectedRate.carrier_name || "Delivery",
                total: String(selectedRate.amount)
            }],
            meta_data: [
                { key: "_payment_method_type", value: paymentMethod },
                { key: "_delivery_carrier", value: selectedRate.carrier_name },
                { key: "_delivery_rate_id", value: selectedRate.rate_id || "" },
                ...(promoCode ? [
                    { key: "_promo_code", value: promoCode },
                    { key: "_promo_discount", value: String(promoDiscount) },
                ] : []),
                ...(paymentMethod === "bank_transfer" ? [
                    { key: "_bank_transfer_status", value: "customer_claimed" },
                    { key: "_bank_transfer_claimed_at", value: new Date().toISOString() }
                ] : []),
            ],
        };

        const orderRes = await fetch(`${WC_API_URL}/orders`, {
            method: "POST",
            headers: getWCAuth(),
            body: JSON.stringify(orderPayload),
        });

        if (!orderRes.ok) {
            const errorData = await orderRes.json();
            console.error("WooCommerce order creation failed:", errorData);
            return NextResponse.json(
                { error: "Failed to create order in WooCommerce" },
                { status: 500 }
            );
        }

        const orderData = await orderRes.json();

        return NextResponse.json({
            success: true,
            orderId: orderData.id,
            orderNumber: orderData.number,
            message: "Order created successfully"
        });

    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}