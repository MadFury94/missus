import { NextRequest, NextResponse } from "next/server";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
    };
}

// GET - Get single product
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const response = await fetch(`${WC_API_URL}/products/${params.id}`, {
            headers: getWCAuth(),
        });

        if (!response.ok) {
            throw new Error(`Product not found`);
        }

        const product = await response.json();
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
}

// PUT - Update product
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        const response = await fetch(`${WC_API_URL}/products/${params.id}`, {
            method: "PUT",
            headers: getWCAuth(),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update product");
        }

        const product = await response.json();
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete product
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const response = await fetch(`${WC_API_URL}/products/${params.id}?force=true`, {
            method: "DELETE",
            headers: getWCAuth(),
        });

        if (!response.ok) {
            throw new Error("Failed to delete product");
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
