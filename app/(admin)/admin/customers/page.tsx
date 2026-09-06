"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout, { ABtn, APanel, APanelHeader, ATable, ATr, ATd } from "@/components/admin/AdminLayout";

const T = { sans: "var(--font-admin-sans,'Public Sans',sans-serif)", serif: "var(--font-admin-serif,'Fraunces',serif)" };

export default function AdminCustomers() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || !isAdmin(u)) { router.push("/admin/login"); return; }
        loadCustomers();
    }, [router, search]);

    async function loadCustomers() {
        setLoading(true); setError("");
        try {
            const params = new URLSearchParams({ per_page: "50" });
            if (search) params.set("search", search);
            const res = await adminFetch(`/api/admin/customers?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) { setError(err instanceof Error ? err.message : "Failed to load customers"); setCustomers([]); }
        finally { setLoading(false); }
    }

    return (
        <AdminLayout>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>Customers</h1>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: "var(--stone)", margin: 0 }}>{customers.length} customers</p>
            </div>

            <APanel>
                <APanelHeader actions={
                    <form onSubmit={e => { e.preventDefault(); setSearch(searchInput.trim()); }} style={{ display: "flex", gap: 6 }}>
                        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search name or email…"
                            style={{ fontFamily: T.sans, fontSize: 12, border: "1px solid var(--sand-deep)", background: "var(--paper-raised)", color: "var(--ink)", padding: "5px 10px", borderRadius: "var(--admin-radius)", outline: "none", width: 220, transition: "border-color .15s" }}
                            onFocus={e => (e.target.style.borderColor = "var(--wine)")}
                            onBlur={e => (e.target.style.borderColor = "var(--sand-deep)")}
                        />
                        <ABtn type="submit" variant="primary">Search</ABtn>
                        {search && <ABtn variant="secondary" onClick={() => { setSearch(""); setSearchInput(""); }}>Clear</ABtn>}
                    </form>
                }>Customers</APanelHeader>

                {error && <div style={{ margin: "12px 20px", padding: "8px 12px", background: "rgba(166,67,47,.06)", borderLeft: "3px solid var(--rust)", fontFamily: T.sans, fontSize: 12, color: "var(--rust)" }}>{error}</div>}

                {loading ? (
                    <div style={{ padding: 40, textAlign: "center", fontFamily: T.sans, fontSize: 13, color: "var(--stone)" }}>Loading customers…</div>
                ) : customers.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", fontFamily: T.sans, fontSize: 13, color: "var(--stone)" }}>{search ? `No customers matching "${search}"` : "No customers found"}</div>
                ) : (
                    <ATable headers={["Name", "Email", "Username", "Orders", "Registered"]}>
                        {customers.map(c => (
                            <ATr key={String(c.id)}>
                                <ATd primary>{String(c.first_name || "")} {String(c.last_name || "")}{!c.first_name && !c.last_name ? "—" : ""}</ATd>
                                <ATd style={{ color: "var(--wine)" }}>{String(c.email || "—")}</ATd>
                                <ATd muted>{String(c.username || "—")}</ATd>
                                <ATd muted style={{ textAlign: "center" }}>{String((c as Record<string, unknown>).orders_count ?? "—")}</ATd>
                                <ATd muted>{c.date_created ? new Date(c.date_created as string).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}</ATd>
                            </ATr>
                        ))}
                    </ATable>
                )}
            </APanel>
        </AdminLayout>
    );
}
