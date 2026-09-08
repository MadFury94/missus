"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface TrackingEvent {
    status: string;
    description: string;
    timestamp: string;
    location?: string;
}

interface OrderResult {
    id: number;
    number: string;
    status: string;
    date_created: string;
    total: string;
    currency: string;
    shipping_total: string;
    line_items: {
        id: number;
        name: string;
        quantity: number;
        total: string;
        image: string | null;
        meta_data: { key: string; value: string }[];
    }[];
    shipping: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        state: string;
    };
    tracking?: {
        status: string;
        events: TrackingEvent[];
        carrier_tracking_url?: string;
    } | null;
    shipment_id?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pending", color: "#92400e", bg: "#fef3c7" },
    processing: { label: "Processing", color: "#1e40af", bg: "#dbeafe" },
    "on-hold": { label: "On Hold", color: "#6b21a8", bg: "#f3e8ff" },
    completed: { label: "Delivered", color: "#065f46", bg: "#d1fae5" },
    cancelled: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2" },
    refunded: { label: "Refunded", color: "#374151", bg: "#f3f4f6" },
    failed: { label: "Failed", color: "#991b1b", bg: "#fee2e2" },
};

export default function TrackOrderPage() {
    const [form, setForm] = useState({ orderNumber: "", email: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<OrderResult | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setResult(null);
        setLoading(true);
        try {
            const res = await fetch(
                `/api/account/orders/lookup?orderNumber=${encodeURIComponent(form.orderNumber.trim())}&email=${encodeURIComponent(form.email.trim())}`,
                { cache: "no-store" }
            );
            const data = await res.json();
            if (!res.ok || data.error) {
                setError(data.error || "Order not found. Please check your order number and email.");
                return;
            }
            setResult(data);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const fmt = (amount: string, currency = "NGN") =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(Number(amount));

    const statusInfo = result ? (STATUS_LABELS[result.status] ?? { label: result.status, color: "#374151", bg: "#f3f4f6" }) : null;