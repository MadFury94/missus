"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout, { APanel, APanelHeader, ATable, ATr, ATd, StatusDot } from "@/components/admin/AdminLayout";

const T = { sans: "var(--font-admin-sans,'Public Sans',sans-serif)", serif: "var(--font-admin-serif,'Fraunces',serif)" };

export default function AdminOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || !isAdmin(u)) { router.push("/admin/login"); return; }
        loadOrders();
    }, [router, statusFilter]);

    async function loadOrders() {
        setLoading(true); setError("");
        try {
            const params = new URLSearchParams({ per_page: "50" });
            if (statusFilter) params.set("status", statusFilter);
            const res = await adminFetch(`/api/admin/orders?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setOrders(Array.isArray(await res.json()) ? await res.clone().json() : []);
        } catch (err) { setError(err instanceof Error ? err.message : "Failed to load orders"); setOrders([]); }
        finally { setLoading(false); }
    }

    const STATUSES = ["pending", "processing", "on-hold", "completed", "cancelled", "refunded", "failed"];

    return (
        <AdminLayout>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>Orders</h1>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: "var(--stone)", margin: 0 }}>{orders.length} orders</p>
            </div>

            <APanel>
                <APanelHeader actions={
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        style={{ fontFamily: T.sans, fontSize: 12, border: "1px solid var(--sand-deep)", background: "var(--paper-raised)", color: "var(--ink)", padding: "5px 10px", borderRadius: "var(--admin-radius)", outline: "none", cursor: "pointer" }}>
                        <option value="">All statuses</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                }>Orders</APanelHeader>

                {error && <div style={{ margin: "12px 20px", padding: "8px 12px", background: "rgba(166,67,47,.06)", borderLeft: "3px solid var(--rust)", fontFamily: T.sans, fontSize: 12, color: "var(--rust)" }}>{error}</div>}

                {loading ? (
                    <div style={{ padding: 40, textAlign: "center", fontFamily: T.sans, fontSize: 13, color: "var(--stone)" }}>Loading orders…</div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", fontFamily: T.sans, fontSize: 13, color: "var(--stone)" }}>No orders found</div>
                ) : (
                    <ATable headers={["Order", "Date", "Status", "Customer", "Items", "Total"]}>
                        {orders.map(order => {
                            const billing = order.billing as Record<string, string> | undefined;
                            const lineItems = order.line_items as unknown[] | undefined;
                            return (
                                <ATr key={String(order.id)}>
                                    <ATd primary style={{ color: "var(--wine)" }}>#{String(order.number)}</ATd>
                                    <ATd muted>{new Date(order.date_created as string).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</ATd>
                                    <ATd><StatusDot status={String(order.status)} /></ATd>
                                    <ATd>
                                        <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{billing ? `${billing.first_name} ${billing.last_name}` : "—"}</div>
                                        {billing?.email && <div style={{ fontFamily: T.sans, fontSize: 11, color: "var(--stone)" }}>{billing.email}</div>}
                                    </ATd>
                                    <ATd muted>{lineItems?.length ?? 0} item{(lineItems?.length ?? 0) !== 1 ? "s" : ""}</ATd>
                                    <ATd primary>₦{parseFloat(String(order.total || "0")).toLocaleString("en-NG")}</ATd>
                                </ATr>
                            );
                        })}
                    </ATable>
                )}
            </APanel>
        </AdminLayout>
    );
}
