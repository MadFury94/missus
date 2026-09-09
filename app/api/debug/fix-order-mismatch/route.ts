import { NextRequest, NextResponse } from "next/server";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

/**
 * This endpoint helps fix order mismatches by analyzing Paystack transactions
 * and creating correct orders when the wrong order gets associated with a payment
 */
export async function POST(request: NextRequest) {
    try {
        const { reference, correctItems, correctShipping } = await request.json();

        if (!reference) {
            return NextResponse.json({ error: "Paystack reference required" }, { status: 400 });
        }

        // 1. Verify the Paystack payment and get the actual details
        console.log("[fix-order] Analyzing payment reference:", reference);

        let paymentData = null;
        try {
            const txRes = await fetch(
                `https://api.paystack.co/transaction/verify/${reference}`,
                { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
            );
            const txData = await txRes.json();
            paymentData = txData?.data;
        } catch (err) {
            return NextResponse.json({ error: "Failed to verify Paystack transaction" }, { status: 400 });
        }

        if (!paymentData) {
            return NextResponse.json({ error: "Invalid payment reference" }, { status: 400 });
        }

        // 2. Find the currently associated order
        const existingRes = await fetch(
            `${WC_API_URL}/orders?transaction_id=${encodeURIComponent(reference)}&per_page=1`,
            { headers: getWCAuth(), cache: "no-store" }
        );

        let existingOrder = null;
        if (existingRes.ok) {
            const existingOrders = await existingRes.json();
            if (existingOrders.length > 0) {
                existingOrder = existingOrders[0];
            }
        }

        // 3. Analyze the mismatch
        const actualAmountPaid = paymentData.amount / 100; // Convert kobo to naira
        const metadata = paymentData.metadata || {};
        const paidCartItems = metadata.cart || correctItems || [];
        const paidShipping = metadata.selectedRate || correctShipping || null;

        const analysis = {
            reference,
            paystack_amount: actualAmountPaid,
            paystack_email: paymentData.customer?.email,
            paystack_cart: paidCartItems.map((item: any) => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            paystack_shipping: paidShipping ? {
                carrier: paidShipping.carrier_name,
                amount: (paidShipping.amount || 0) / 100
            } : null,
            existing_order: existingOrder ? {
                id: existingOrder.id,
                total: existingOrder.total,
                items: existingOrder.line_items?.map((item: any) => ({
                    name: item.name,
                    price: parseFloat(item.price),
                    quantity: item.quantity,
                    total: parseFloat(item.total)
                }))
            } : null,
            mismatch_detected: false
        };

        // Check for mismatches
        if (existingOrder) {
            const orderTotal = parseFloat(existingOrder.total);
            const orderItems = existingOrder.line_items || [];

            // Amount mismatch
            const amountMismatch = Math.abs(orderTotal - actualAmountPaid) > 1;

            // Items mismatch
            const itemsMismatch = paidCartItems.length !== orderItems.length ||
                !paidCartItems.every((paidItem: any) =>
                    orderItems.some((orderItem: any) =>
                        orderItem.name === paidItem.name &&
                        orderItem.quantity === paidItem.quantity
                    )
                );

            analysis.mismatch_detected = amountMismatch || itemsMismatch;

            if (analysis.mismatch_detected) {
                console.error("[fix-order] MISMATCH DETECTED:", {
                    reference,
                    amountMismatch: { paid: actualAmountPaid, order: orderTotal },
                    itemsMismatch: {
                        paid: paidCartItems.map((i: any) => i.name),
                        order: orderItems.map((i: any) => i.name)
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            analysis,
            recommendation: analysis.mismatch_detected
                ? "Order mismatch detected. Consider creating a new order with correct details."
                : "Order matches payment details."
        });

    } catch (error) {
        console.error("[fix-order] Error:", error);
        return NextResponse.json({
            error: "Failed to analyze order mismatch",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

/**
 * GET endpoint to analyze a specific reference without making changes
 */
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const reference = searchParams.get("ref");

    if (!reference) {
        return NextResponse.json({ error: "ref parameter required" }, { status: 400 });
    }

    // Call the POST logic but without making changes
    const req = new Request(request.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference })
    });

    return POST(req as NextRequest);
}