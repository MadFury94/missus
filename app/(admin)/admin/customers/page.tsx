"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminCustomers() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const user = getCurrentUser();
        if (!user || !isAdmin(user)) { router.push("/admin/login"); return; }
        loadCustomers();
    }, [router, search]);

    async function loadCustomers() {
        setLoading(true);
        setError("");
        try {
            const params = new URLSearchParams({ per_page: "50" });
            if (search) params.set("search", search);
            const res = await adminFetch(`/api/admin/customers?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load customers");
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setSearch(searchInput.trim());
    }

    return (
        <AdminLayout>
            <div style={{ background: "#fff", border: "1px solid #ccd0d4", boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: 400, margin: 0, color: "#23282d" }}>
                        Customers <span style={{ color: "#50575e", fontSize: "16px" }}>({customers.length})</span>
                    </h1>
                    <form onSubmit={handleSearch} style={{ display: "flex", gap: "6px" }}>
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{ padding: "6px 12px", border: "1px solid #8c8f94", borderRadius: "3px", fontSize: "13px", outline: "none", width: "240px" }}
                        />
                        <button type="submit" style={{ padding: "6px 12px", background: "#2271b1", color: "#fff", border: "1px solid #2271b1", borderRadius: "3px", fontSize: "13px", cursor: "pointer" }}>Search</button>
                        {search && <button type="button" onClick={() => { setSearch(""); setSearchInput(""); }} style={{ padding: "6px 10px", background: "#fff", color: "#50575e", border: "1px solid #8c8f94", borderRadius: "3px", fontSize: "13px", cursor: "pointer" }}>Clear</button>}
                    </form>
                </div>

                {error && (
                    <div style={{ margin: "16px 20px", background: "#fef2f2", border: "1px solid #fca5a5", borderLeft: "4px solid #d63638", padding: "12px 16px", fontSize: "13px", color: "#991b1b" }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#50575e" }}>Loading customers…</div>
                ) : customers.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#50575e" }}>{search ? `No customers matching "${search}"` : "No customers found"}</div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#f6f7f7" }}>
                                    {["Name", "Email", "Username", "Orders", "Registered"].map((h) => (
                                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#2c3338", borderBottom: "1px solid #c3c4c7", whiteSpace: "nowrap" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((c) => (
                                    <tr key={String(c.id)} style={{ borderBottom: "1px solid #e8e8e8" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"} onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#2c3338" }}>
                                            {String(c.first_name || "")} {String(c.last_name || "")}
                                            {!c.first_name && !c.last_name && <span style={{ color: "#aaa" }}>—</span>}
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#2271b1" }}>{String(c.email || "—")}</td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#50575e" }}>{String(c.username || "—")}</td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#50575e", textAlign: "center" }}>
                                            {String((c as Record<string, unknown>).orders_count ?? "—")}
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#50575e", whiteSpace: "nowrap" }}>
                                            {c.date_created ? new Date(c.date_created as string).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
