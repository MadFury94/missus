import { NextRequest, NextResponse } from "next/server";
import { initializePayment, generateReference } from "@/lib/paystack";

export async function POST(req: NextRequest) {
    try {
        const { email, amount, metadata } = await req.json();
        if (!email || !amount) {
            return NextResponse.json({ error: "email and amount required" }, { status: 400 });
        }
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
