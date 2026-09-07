import { NextRequest, NextResponse } from "next/server";
import { trackShipment } from "@/lib/delivery";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Shipment ID required" }, { status: 400 });
    }

    const result = await trackShipment(id);

    if (!result) {
        return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    return NextResponse.json(result);
}
