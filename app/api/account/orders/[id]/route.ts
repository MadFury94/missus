import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/wp-fetch";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
const TERMINAL_AFRICA_API_KEY = process.env.TERMINAL_AFRICA_SECRET_KEY;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

async function getTrackingData(shipmentId: string) {
    if (!TERMINAL_AFRICA_API_KEY || !shipmentId) {
        return null;
    }

    try {
        const response = await fetch(`https://api.terminal.africa/v1/shipments/track/${shipmentId}`, {
            headers: {
                'Authorization': `Bearer ${TERMINAL_AFRICA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('Terminal Africa tracking API error:', response.status);
            return null;
        }

        const trackingData = await response.json();
        return trackingData.data || trackingData;
    } catch (error) {
        console.error('Error fetching tracking data:', error);
        return null;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const email = request.nextUrl.searchParams.get("email");

    if (!email || !id) {
        return NextResponse.json({ error: "Missing parameters." }, { status: 400 });
    }

    const res = await wcFetch(`${WC_API_URL}/orders/${id}`, {
        headers: getWCAuth(),
        cache: "no-store",
    });

    if (!res) return NextResponse.json({ error: "Could not reach server." }, { status: 504 });
    if (!res.ok) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const o = await res.json();

    // Security: verify the order belongs to the requesting email
    const billingEmail = (o.billing as Record<string, string>)?.email ?? "";
    if (billingEmail.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Extract shipment ID from order meta data
    const shipmentId = (o.meta_data as { key: string; value: string }[])
        ?.find(meta => meta.key === 'shipment_id' || meta.key === '_shipment_id')?.value;

    // Fetch tracking data if shipment ID exists
    let trackingData = null;
    if (shipmentId) {
        trackingData = await getTrackingData(shipmentId);
    }

    return NextResponse.json({
        id: o.id,
        number: o.number,
        status: o.status,
        date_created: o.date_created,
        total: o.total,
        subtotal: o.subtotal,
        total_tax: o.total_tax,
        shipping_total: o.shipping_total,
        discount_total: o.discount_total,
        currency: o.currency,
        payment_method_title: o.payment_method_title,
        transaction_id: o.transaction_id,
        customer_note: o.customer_note,
        meta_data: (o.meta_data as { key: string; value: string }[]) ?? [],
        line_items: (o.line_items as Record<string, unknown>[])?.map((li) => ({
            id: li.id,
            name: li.name,
            quantity: li.quantity,
            price: li.price,
            total: li.total,
            sku: li.sku,
            image: (li.image as { src?: string } | null)?.src ?? null,
            meta_data: (li.meta_data as { key: string; value: string }[])?.filter(
                (m) => !m.key.startsWith("_")
            ) ?? [],
        })),
        billing: {
            first_name: (o.billing as Record<string, string>)?.first_name,
            last_name: (o.billing as Record<string, string>)?.last_name,
            email: (o.billing as Record<string, string>)?.email,
            phone: (o.billing as Record<string, string>)?.phone,
            address_1: (o.billing as Record<string, string>)?.address_1,
            city: (o.billing as Record<string, string>)?.city,
            state: (o.billing as Record<string, string>)?.state,
            postcode: (o.billing as Record<string, string>)?.postcode,
            country: (o.billing as Record<string, string>)?.country,
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
        tracking: trackingData ? {
            shipment_id: shipmentId,
            status: trackingData.status || 'pending',
            carrier_name: trackingData.carrier_name || 'Carrier',
            carrier_tracking_number: trackingData.carrier_tracking_number || trackingData.tracking_number || '',
            carrier_tracking_url: trackingData.carrier_tracking_url || trackingData.tracking_url,
            address_from: trackingData.address_from || {
                city: 'Lagos',
                state: 'Lagos',
                country: 'Nigeria'
            },
            address_to: trackingData.address_to || {
                city: (o.shipping as Record<string, string>)?.city || 'Unknown',
                state: (o.shipping as Record<string, string>)?.state || 'Unknown',
                country: (o.shipping as Record<string, string>)?.country || 'Nigeria'
            },
            estimated_delivery_date: trackingData.estimated_delivery_date,
            delivery_date: trackingData.delivery_date,
            events: trackingData.events || []
        } : null
    });
}
