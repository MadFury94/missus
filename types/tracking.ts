export interface TrackingEvent {
    status: string;
    description: string;
    timestamp: string;
    location?: string;
}

export interface Address {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    city: string;
    state: string;
    postcode?: string;
    country?: string;
    lat?: number;
    lng?: number;
}

export interface ShipmentTracking {
    shipment_id: string;
    status: string;
    carrier_name: string;
    carrier_tracking_number: string;
    carrier_tracking_url?: string;
    address_from: Address;
    address_to: Address;
    estimated_delivery_date?: string;
    delivery_date?: string;
    events: TrackingEvent[];
}

export interface OrderWithTracking {
    id: number;
    number: string;
    status: string;
    date_created: string;
    total: string;
    subtotal: string;
    shipping_total: string;
    currency: string;
    line_items: {
        id: number;
        name: string;
        quantity: number;
        total: string;
        image: string | null;
        meta_data: { key: string; value: string }[];
    }[];
    billing: Address;
    shipping: Address;
    tracking?: ShipmentTracking | null;
}