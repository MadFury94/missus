import { NextRequest, NextResponse } from "next/server";
import { CartAvailabilityError, validateCartAvailability } from "@/lib/woocommerce-shipping";

export async function POST(req: NextRequest) {
    try {
        const { item } = await req.json();
        if (!item || !Number.isInteger(item.productId) || item.productId <= 0 || !Number.isInteger(item.quantity) || item.quantity <= 0) {
            return NextResponse.json({ error: "Choose a product and quantity." }, { status: 400 });
        }
        await validateCartAvailability([item]);
        return NextResponse.json({ available: true });
    } catch (error) {
        if (error instanceof CartAvailabilityError) return NextResponse.json({ error: error.message }, { status: 422 });
        return NextResponse.json({ error: "We could not check availability. Please try again." }, { status: 503 });
    }
}
