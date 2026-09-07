/**
 * Terminal Africa delivery abstraction layer.
 * All carrier-specific logic lives here — checkout and order routes never
 * touch Terminal Africa directly.
 *
 * Sandbox keys → TERMINAL_BASE_URL = https://sandbox.terminal.africa/v1
 * Live keys    → TERMINAL_BASE_URL = https://api.terminal.africa/v1
 */

const IS_TEST = process.env.TERMINAL_AFRICA_SECRET_KEY?.startsWith("sk_test_");
const BASE_URL = IS_TEST
    ? "https://sandbox.terminal.africa/v1"
    : "https://api.terminal.africa/v1";

function terminalHeaders() {
    return {
        Authorization: `Bearer ${process.env.TERMINAL_AFRICA_SECRET_KEY}`,
        "Content-Type": "application/json",
    };
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface TerminalAddress {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;        // E.164 format e.g. "+2348012345678"
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;     // ISO 3166-1 alpha-3, e.g. "NGA"
    zip: string;
}

export interface ShippingRate {
    rate_id: string;
    carrier_name: string;
    carrier_logo: string;
    amount: number;          // in NGN
    currency: string;
    delivery_time: string;   // e.g. "Within 2 hours"
    pickup_time: string;
    delivery_date: string;   // ISO date
}

export interface ShipmentResult {
    shipment_id: string;
    tracking_id?: string;
    status: string;
    label_url?: string;
}

// ── Origin address (from env) ─────────────────────────────────────────────

export function getOriginAddress(): TerminalAddress {
    return {
        first_name: "Missus",
        last_name: "Outfits",
        email: "hello@missusoutfits.com",
        phone: "+2348000000000",
        line1: process.env.TERMINAL_ORIGIN_ADDRESS || "9 Muri Sodiq Drive",
        city: process.env.TERMINAL_ORIGIN_CITY || "Lagos",
        state: process.env.TERMINAL_ORIGIN_STATE || "Lagos",
        country: "NGA",
        zip: process.env.TERMINAL_ORIGIN_POSTCODE || "106104",
    };
}

// ── Layer 1: Get shipping rates ───────────────────────────────────────────
// Called at checkout to show live rate options to the customer.

export async function getShippingRates(params: {
    deliveryAddress: TerminalAddress;
    items: { name: string; weight: number; value: number; quantity: number }[];
}): Promise<ShippingRate[]> {
    const origin = getOriginAddress();

    const totalWeight = params.items.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
    );
    const totalValue = params.items.reduce(
        (sum, item) => sum + item.value * item.quantity,
        0
    );

    const body = {
        pickup_address: {
            city: origin.city,
            state: origin.state,
            country: "NG",
            zip: origin.zip,
        },
        delivery_address: {
            city: params.deliveryAddress.city,
            state: params.deliveryAddress.state,
            country: "NG",
            zip: params.deliveryAddress.zip || "100001",
        },
        parcel: {
            items: params.items.map((item) => ({
                name: item.name,
                description: "Fashion Item",
                currency: "NGN",
                value: item.value,
                weight: item.weight,
                quantity: item.quantity,
            })),
            weight_unit: "kg",
            total_weight: Math.max(totalWeight, 0.1),
            parcel_value: totalValue,
        },
    };

    try {
        const res = await fetch(`${BASE_URL}/rates/shipment/quotes`, {
            method: "POST",
            headers: terminalHeaders(),
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!data.status || !Array.isArray(data.data)) {
            console.error("[delivery] rates error:", data.message);
            return [];
        }

        // Normalise to our ShippingRate shape, sorted cheapest first
        return (data.data as any[])
            .map((r) => ({
                rate_id: r.rate_id,
                carrier_name: r.carrier_name,
                carrier_logo: r.carrier_logo,
                amount: r.amount,
                currency: r.currency || "NGN",
                delivery_time: r.delivery_time,
                pickup_time: r.pickup_time,
                delivery_date: r.delivery_date,
            }))
            .sort((a, b) => a.amount - b.amount);
    } catch (err) {
        console.error("[delivery] getShippingRates failed:", err);
        return [];
    }
}

// ── Layer 2: Create shipment ──────────────────────────────────────────────
// Called after payment is confirmed. Creates the shipment in Terminal Africa
// and arranges pickup + delivery automatically.

export async function createShipment(params: {
    rateId: string;
    pickupAddress: TerminalAddress;
    deliveryAddress: TerminalAddress;
    items: { name: string; weight: number; value: number; quantity: number }[];
    orderId?: number;
}): Promise<ShipmentResult | null> {
    const totalWeight = params.items.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
    );

    const body = {
        rate_id: params.rateId,
        pickup_address: params.pickupAddress,
        delivery_address: params.deliveryAddress,
        parcel: {
            items: params.items.map((item) => ({
                name: item.name,
                description: "Fashion Item",
                currency: "NGN",
                value: item.value,
                weight: item.weight,
                quantity: item.quantity,
            })),
            weight_unit: "kg",
            total_weight: Math.max(totalWeight, 0.1),
        },
        metadata: {
            wc_order_id: params.orderId,
        },
    };

    try {
        const res = await fetch(`${BASE_URL}/shipments`, {
            method: "POST",
            headers: terminalHeaders(),
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!data.status || !data.data) {
            console.error("[delivery] createShipment error:", data.message);
            return null;
        }

        return {
            shipment_id: data.data.shipment_id,
            tracking_id: data.data.tracking_number ?? data.data.shipment_id,
            status: data.data.status,
            label_url: data.data.label_url,
        };
    } catch (err) {
        console.error("[delivery] createShipment failed:", err);
        return null;
    }
}

// ── Layer 3: Track shipment ───────────────────────────────────────────────

export interface TrackingEvent {
    status: string;
    description: string;
    timestamp: string;
    location?: string;
}

export async function trackShipment(shipmentId: string): Promise<{
    status: string;
    events: TrackingEvent[];
    carrier_tracking_url?: string;
} | null> {
    try {
        const res = await fetch(`${BASE_URL}/shipments/${shipmentId}`, {
            headers: terminalHeaders(),
            next: { revalidate: 120 }, // cache for 2 minutes
        });

        const data = await res.json();
        if (!data.status || !data.data) return null;

        const shipment = data.data;
        const events: TrackingEvent[] = (shipment.events || []).map((e: any) => ({
            status: e.status,
            description: e.description || e.status,
            timestamp: e.created_at || e.timestamp,
            location: e.location,
        }));

        return {
            status: shipment.status,
            events,
            carrier_tracking_url: shipment.extras?.tracking_url,
        };
    } catch (err) {
        console.error("[delivery] trackShipment failed:", err);
        return null;
    }
}
