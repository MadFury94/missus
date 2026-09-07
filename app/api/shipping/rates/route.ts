import { NextRequest, NextResponse } from "next/server";
import { getShippingRates } from "@/lib/delivery";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { city, state, zip, items } = body;

        if (!city || !state) {
            return NextResponse.json(
                { error: "city and state are required" },
                { status: 400 }
            );
        }

        const rates = await getShippingRates({
            deliveryAddress: {
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                line1: "",
                city,
                state,
                country: "NGA",
                zip: zip || "100001",
            },
            items: items?.length
                ? items
                : [{ name: "Fashion Item", weight: 0.5, value: 15000, quantity: 1 }],
        });

        // If Terminal Africa is unreachable or returns no rates, fall back to
        // flat rates so checkout never breaks
        if (rates.length === 0) {
            return NextResponse.json({
                rates: [
                    {
                        rate_id: "flat_standard",
                        carrier_name: "Standard Delivery",
                        carrier_logo: "",
                        amount: city.toLowerCase().includes("lagos") ? 2500 : 5000,
                        currency: "NGN",
                        delivery_time: city.toLowerCase().includes("lagos")
                            ? "Same day – 24 hours"
                            : "2–5 business days",
                        pickup_time: "Within 2 hours",
                        delivery_date: "",
                    },
                ],
                fallback: true,
            });
        }

        return NextResponse.json({ rates, fallback: false });
    } catch (err) {
        console.error("[/api/shipping/rates]", err);
        return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
    }
}
