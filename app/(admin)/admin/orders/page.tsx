"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout from "@/components/admin/AdminLayout";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    pending: { bg: "#fef3c7", color: "#92400e" },
    processing: { bg: "#dbeafe", color: "#1e40af" },
    "on-hold": { bg: "#f3e8ff", color: "#6b21a8" },
    completed: { bg: "#d1fae5", color: "#065f46" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
    refunded: { bg: "#f3f4f6", color: "#374151" },
    failed: { bg: "#fee2e2", color: "#991b1b" },
};

export default function AdminOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const user = getCurrentUser();
        if (!user || !isAdmin(user)) { router.push("/admin/login"); return; }
        loadOrders();
    }, [router, statusFilter]);

    async function loadOrders() {
        setLoading(true);
        setError("");
        try {
            const params = new URLSearchParams({ per_page: "50" });
            if (statusFilter) params.set("status", statusFilter);
            const res = await adminFetch(`/api/admin/orders?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load orders");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AdminLayout>
            <div style={{ background: "#fff", border: "1px solid #ccd0d4", boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: 400, margin: 0, color: "#23282d" }}>
                        Orders <span style={{ color: "#50575e", fontSize: "16px" }}>({orders.length})</span>
                    </h1>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: "6px 10px", border: "1px solid #8c8f94", borderRadius: "3px", fontSize: "13px", outline: "none" }}
                    >
                        <option value="">All Statuses</option>
                        {Object.keys(STATUS_COLORS).map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div style={{ margin: "16px 20px", background: "#fef2f2", border: "1px solid #fca5a5", borderLeft: "4px solid #d63638", padding: "12px 16px", fontSize: "13px", color: "#991b1b" }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#50575e" }}>Loading orders…</div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#50575e" }}>No orders found</div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#f6f7f7" }}>
                                    {["Order", "Date", "Status", "Customer", "Items", "Total"].map((h) => (
                                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#2c3338", borderBottom: "1px solid #c3c4c7", whiteSpace: "nowrap" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const sc = STATUS_COLORS[order.status as string] ?? { bg: "#f3f4f6", color: "#374151" };
                                    const billing = order.billing as Record<string, string> | undefined;
                                    const lineItems = order.line_items as unknown[] | undefined;
                                    return (
                                        <tr key={String(order.id)} style={{ borderBottom: "1px solid #e8e8e8" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"} onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                                            <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#2271b1" }}>#{String(order.number)}</td>
                                            <td style={{ padding: "10px 14px", fontSize: "13px", color: "#50575e", whiteSpace: "nowrap" }}>
                                                {new Date(order.date_created as string).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td style={{ padding: "10px 14px" }}>
                                                <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "99px", background: sc.bg, color: sc.color, textTransform: "capitalize" }}>
                                                    {String(order.status)}
                                                </span>
                                            </td>
                                            <td style={{ padding: "10px 14px", fontSize: "13px", color: "#2c3338" }}>
                                                {billing ? `${billing.first_name} ${billing.last_name}` : "—"}
                                                {billing?.email && <div style={{ fontSize: "11px", color: "#767676" }}>{billing.email}</div>}
                                            </td>
                                            <td style={{ padding: "10px 14px", fontSize: "13px", color: "#50575e" }}>
                                                {lineItems?.length ?? 0} item{(lineItems?.length ?? 0) !== 1 ? "s" : ""}
                                            </td>
                                            <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 700, color: "#2c3338", whiteSpace: "nowrap" }}>
                                                ₦{parseFloat(String(order.total || "0")).toLocaleString("en-NG")}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
