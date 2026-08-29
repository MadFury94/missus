import { NextResponse } from "next/server";

// Cache rates in memory for 1 hour — avoids hammering the API
let cached: { rates: Record<string, number>; ts: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const SUPPORTED = ["NGN", "USD", "GBP", "EUR", "CAD", "GHS", "KES", "ZAR"];

export async function GET() {
    try {
        // Return cached if fresh
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            return NextResponse.json({ rates: cached.rates, cached: true });
        }

        const key = process.env.EXCHANGE_RATE_API_KEY;
        if (!key) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        // ExchangeRate-API: base currency NGN
        const res = await fetch(
            `https://v6.exchangerate-api.com/v6/${key}/latest/NGN`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            throw new Error(`ExchangeRate-API error: ${res.status}`);
        }

        const data = await res.json();

        if (data.result !== "success") {
            throw new Error(data["error-type"] ?? "Unknown error");
        }

        // Only keep the currencies we support
        const rates: Record<string, number> = { NGN: 1 };
        for (const code of SUPPORTED) {
            if (data.conversion_rates[code] !== undefined) {
                rates[code] = data.conversion_rates[code];
            }
        }

        cached = { rates, ts: Date.now() };
        return NextResponse.json({ rates, cached: false });

    } catch (err) {
        console.error("[currency]", err);
        // Fallback rates if API fails (approximate as of 2026)
        return NextResponse.json({
            rates: { NGN: 1, USD: 0.00062, GBP: 0.00049, EUR: 0.00057, CAD: 0.00084, GHS: 0.0093, KES: 0.080, ZAR: 0.011 },
            cached: false,
            fallback: true,
        });
    }
}
