import { NextRequest, NextResponse } from "next/server";
import { findOrderByReference } from "@/lib/order-reference";
import { ensurePaidOrder } from "@/lib/paid-order";
import { getWooCommerceAuth } from "@/lib/api-helpers";
import { API_ENDPOINTS } from "@/lib/config";

export async function POST(req: NextRequest) {
    const ref = req.nextUrl.searchParams.get("ref");
    if (!ref) return NextResponse.json({ error: "ref required" }, { status: 400 });
    try {
        await ensurePaidOrder(ref);
        return GET(req);
    } catch (error) {
        console.error("[order-recovery]", error);
        return NextResponse.json({ error: "We could not finish saving your order. Please retry or contact support with your payment reference. Do not pay again." }, { status: 503 });
    }
}

// Looks up a WooCommerce order by Paystack transaction reference.
// Used by the confirmation page to show order details without requiring login.

function getWCAuth() {
    return { Authorization: getWooCommerceAuth().authorization, "Content-Type": "application/json" };
}

export async function GET(req: NextRequest) {
    const ref = req.nextUrl.searchParams.get("ref");
    if (!ref) return NextResponse.json({ error: "ref required" }, { status: 400 });

    try {
        const o = await findOrderByReference(ref, API_ENDPOINTS.woocommerce.rest, getWCAuth());
        if (!o) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: o.id,
            number: o.number,
            status: o.status,
            total: o.total,
            currency: o.currency,
            shipping_total: o.shipping_total,
            shipping_lines: (o.shipping_lines ?? []).map((line: { method_title: string; total: string }) => ({
                method_title: line.method_title,
                total: line.total,
            })),
            discount_total: o.discount_total,
            line_items: (o.line_items as Record<string, unknown>[])?.map((li) => ({
                id: li.id,
                name: li.name,
                quantity: li.quantity,
                total: li.total,
                image: (li.image as { src?: string } | null)?.src ?? null,
                meta_data: (li.meta_data as { key: string; value: string }[])
                    ?.filter((m) => !m.key.startsWith("_")) ?? [],
            })),
            billing: {
                first_name: (o.billing as Record<string, string>)?.first_name,
                last_name: (o.billing as Record<string, string>)?.last_name,
                email: (o.billing as Record<string, string>)?.email,
                phone: (o.billing as Record<string, string>)?.phone,
                address_1: (o.billing as Record<string, string>)?.address_1,
                city: (o.billing as Record<string, string>)?.city,
                state: (o.billing as Record<string, string>)?.state,
            },
            shipping: {
                first_name: (o.shipping as Record<string, string>)?.first_name,
                last_name: (o.shipping as Record<string, string>)?.last_name,
                address_1: (o.shipping as Record<string, string>)?.address_1,
                city: (o.shipping as Record<string, string>)?.city,
                state: (o.shipping as Record<string, string>)?.state,
                postcode: (o.shipping as Record<string, string>)?.postcode,
                country: (o.shipping as Record<string, string>)?.country,
            },
        });
    } catch (err) {
        console.error("[order-by-ref]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
