import { NextRequest, NextResponse } from "next/server";
import { createShipment, getOriginAddress } from "@/lib/delivery";

// Called internally after Paystack payment verified + WC order created.
// Not exposed to the browser — only called server-to-server from the
// payment callback route.

export async function POST(req: NextRequest) {
    // Require internal secret to prevent external calls
    const authHeader = req.headers.get("x-internal-secret");
    if (authHeader !== process.env.MISSUS_GIFT_CARD_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { rateId, deliveryAddress, items, orderId } = body;

        if (!rateId || !deliveryAddress || !items?.length) {
            return NextResponse.json(
                { error: "rateId, deliveryAddress, and items are required" },
                { status: 400 }
            );
        }

        const result = await createShipment({
            rateId,
            pickupAddress: getOriginAddress(),
            deliveryAddress,
            items,
            orderId,
        });

        if (!result) {
            return NextResponse.json(
                { error: "Shipment creation failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true, shipment: result });
    } catch (err) {
        console.error("[/api/shipping/create]", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
