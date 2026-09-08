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

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams.get("orderNumber");
    const email = searchParams.get("email");

    if (!orderNumber || !email) {
        return NextResponse.json({ error: "Missing order number or email." }, { status: 400 });
    }

    try {
        // Search for orders by number and email
        const res = await wcFetch(
            `${WC_API_URL}/orders?number=${encodeURIComponent(orderNumber)}&per_page=10`,
            {
                headers: getWCAuth(),
                cache: "no-store",
            }
        );

        if (!res || !res.ok) {
            return NextResponse.json({ error: "Could not search orders." }, { status: 504 });
        }

        const orders = await res.json();

        if (!Array.isArray(orders) || orders.length === 0) {
            return NextResponse.json({ error: "Order not found." }, { status: 404 });
        }

        // Find the order that matches the email
        const order = orders.find((o: any) => {
            const billingEmail = (o.billing as Record<string, string>)?.email ?? "";
            return billingEmail.toLowerCase() === email.toLowerCase();
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found." }, { status: 404 });
        }

        // Extract shipment ID from order meta data
        const shipmentId = (order.meta_data as { key: string; value: string }[])
            ?.find(meta => meta.key === 'shipment_id' || meta.key === '_shipment_id')?.value;

        // Fetch tracking data if shipment ID exists
        let trackingData = null;
        if (shipmentId) {
            trackingData = await getTrackingData(shipmentId);
        }

        return NextResponse.json({
            id: order.id,
            number: order.number,
            status: order.status,
            date_created: order.date_created,
            total: order.total,
            subtotal: order.subtotal,
            total_tax: order.total_tax,
            shipping_total: order.shipping_total,
            discount_total: order.discount_total,
            currency: order.currency,
            payment_method_title: order.payment_method_title,
            transaction_id: order.transaction_id,
            customer_note: order.customer_note,
            meta_data: (order.meta_data as { key: string; value: string }[]) ?? [],
            line_items: (order.line_items as Record<string, unknown>[])?.map((li) => ({
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
                first_name: (order.billing as Record<string, string>)?.first_name,
                last_name: (order.billing as Record<string, string>)?.last_name,
                email: (order.billing as Record<string, string>)?.email,
                phone: (order.billing as Record<string, string>)?.phone,
                address_1: (order.billing as Record<string, string>)?.address_1,
                city: (order.billing as Record<string, string>)?.city,
                state: (order.billing as Record<string, string>)?.state,
                postcode: (order.billing as Record<string, string>)?.postcode,
                country: (order.billing as Record<string, string>)?.country,
            },
            shipping: {
                first_name: (order.shipping as Record<string, string>)?.first_name,
                last_name: (order.shipping as Record<string, string>)?.last_name,
                address_1: (order.shipping as Record<string, string>)?.address_1,
                city: (order.shipping as Record<string, string>)?.city,
                state: (order.shipping as Record<string, string>)?.state,
                postcode: (order.shipping as Record<string, string>)?.postcode,
                country: (order.shipping as Record<string, string>)?.country,
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
                    city: (order.shipping as Record<string, string>)?.city || 'Unknown',
                    state: (order.shipping as Record<string, string>)?.state || 'Unknown',
                    country: (order.shipping as Record<string, string>)?.country || 'Nigeria'
                },
                estimated_delivery_date: trackingData.estimated_delivery_date,
                delivery_date: trackingData.delivery_date,
                events: trackingData.events || []
            } : null
        });

    } catch (error) {
        console.error('Error looking up order:', error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}