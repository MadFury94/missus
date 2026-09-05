"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout from "@/components/admin/AdminLayout";

interface GiftCard {
    id: number;
    code: string;
    balance: number;
    initial_balance: number;
    email: string;
    status: "active" | "used" | "disabled" | "expired";
    expires_at: string | null;
    note: string;
    created_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    active: { bg: "#d1fae5", color: "#065f46" },
    used: { bg: "#f3f4f6", color: "#374151" },
    disabled: { bg: "#fee2e2", color: "#991b1b" },
    expired: { bg: "#fef3c7", color: "#92400e" },
};

export default function AdminGiftCards() {
    const router = useRouter();
    const [cards, setCards] = useState<GiftCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ balance: "", email: "", note: "", expires_at: "" });

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || !isAdmin(u)) { router.push("/admin/login"); return; }
        loadCards();
    }, [router]);

    async function loadCards() {
        setLoading(true);
        try {
            const res = await adminFetch("/api/admin/gift-cards");
            const data = await res.json();
            setCards(Array.isArray(data) ? data : (data.cards ?? []));
        } catch {
            setError("Failed to load gift cards.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await adminFetch("/api/admin/gift-cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    balance: parseFloat(form.balance),
                    email: form.email,
                    note: form.note,
                    expires_at: form.expires_at,
                }),
            });
            if (!res.ok) throw new Error("Failed");
            setForm({ balance: "", email: "", note: "", expires_at: "" });
            setShowForm(false);
            loadCards();
        } catch {
            setError("Failed to create gift card.");
        } finally {
            setCreating(false);
        }
    }

    async function handleDisable(id: number) {
        if (!confirm("Disable this gift card?")) return;
        await adminFetch(`/api/admin/gift-cards/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "disabled" }),
        });
        loadCards();
    }

    const sym = "₦";

    return (
        <AdminLayout>
            <div style={{ background: "#fff", border: "1px solid #ccd0d4" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                    <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#23282d" }}>
                        Gift Cards <span style={{ fontSize: "14px", color: "#888", fontWeight: 400 }}>({cards.length})</span>
                    </h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{ background: "#2271b1", color: "#fff", border: "none", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer", borderRadius: "3px" }}
                    >
                        {showForm ? "Cancel" : "+ Create Gift Card"}
                    </button>
                </div>

                {/* Create form */}
                {showForm && (
                    <form onSubmit={handleCreate} style={{ padding: "20px", borderBottom: "1px solid #e8e8e8", background: "#f9f9f9" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "14px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#333" }}>Balance (₦) *</label>
                                <input type="number" min="1" step="0.01" required value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
                                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", fontSize: "13px", borderRadius: "3px" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#333" }}>Recipient Email</label>
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", fontSize: "13px", borderRadius: "3px" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#333" }}>Expiry Date</label>
                                <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", fontSize: "13px", borderRadius: "3px" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "#333" }}>Note</label>
                                <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", fontSize: "13px", borderRadius: "3px" }} />
                            </div>
                        </div>
                        <button type="submit" disabled={creating}
                            style={{ background: creating ? "#999" : "#00a32a", color: "#fff", border: "none", padding: "9px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", borderRadius: "3px" }}>
                            {creating ? "Creating…" : "Generate Gift Card"}
                        </button>
                    </form>
                )}

                {error && <div style={{ margin: "12px 20px", padding: "10px 14px", background: "#fef2f2", borderLeft: "3px solid #dc2626", fontSize: "13px", color: "#991b1b" }}>{error}</div>}

                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>Loading gift cards…</div>
                ) : cards.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>No gift cards yet. Create one above.</div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ background: "#f6f7f7", borderBottom: "1px solid #e0e0e0" }}>
                                    {["Code", "Balance", "Initial", "Email", "Status", "Expires", "Created", ""].map(h => (
                                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#444", whiteSpace: "nowrap" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cards.map(card => {
                                    const sc = STATUS_COLORS[card.status] ?? STATUS_COLORS.active;
                                    return (
                                        <tr key={card.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                            <td style={{ padding: "10px 14px" }}><code style={{ fontSize: "12px", background: "#f5f5f5", padding: "2px 6px", borderRadius: "3px" }}>{card.code}</code></td>
                                            <td style={{ padding: "10px 14px", fontWeight: 700 }}>{sym}{card.balance?.toLocaleString("en-NG")}</td>
                                            <td style={{ padding: "10px 14px", color: "#888" }}>{sym}{card.initial_balance?.toLocaleString("en-NG")}</td>
                                            <td style={{ padding: "10px 14px", color: "#555" }}>{card.email || "—"}</td>
                                            <td style={{ padding: "10px 14px" }}>
                                                <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", background: sc.bg, color: sc.color, textTransform: "capitalize" }}>
                                                    {card.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: "10px 14px", color: "#888" }}>{card.expires_at || "—"}</td>
                                            <td style={{ padding: "10px 14px", color: "#aaa", whiteSpace: "nowrap" }}>{new Date(card.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                                            <td style={{ padding: "10px 14px" }}>
                                                {card.status === "active" && (
                                                    <button onClick={() => handleDisable(card.id)}
                                                        style={{ fontSize: "11px", background: "none", border: "1px solid #e0e0e0", padding: "4px 10px", cursor: "pointer", color: "#dc2626", borderRadius: "3px" }}>
                                                        Disable
                                                    </button>
                                                )}
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
