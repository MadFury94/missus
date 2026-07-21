import { NextRequest, NextResponse } from "next/server";
import { initializePayment, generateReference } from "@/lib/paystack";

export async function POST(req: NextRequest) {
    try {
        const { email, amount, metadata } = await req.json();
        if (!email || !amount) {
            return NextResponse.json({ error: "email and amount required" }, { status: 400 });
        }
        const reference = generateReference();
        const callbackUrl =
            process.env.NEXT_PUBLIC_PAYSTACK_CALLBACK_URL ||
            `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/callback`;

        const result = await initializePayment({ email, amount, reference, callbackUrl, metadata });
        if (!result?.status) {
            return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
        }
        return NextResponse.json(result.data);
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
