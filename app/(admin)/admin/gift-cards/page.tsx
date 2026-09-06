"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout, { ABtn, AInput, APanel, APanelHeader, ATable, ATr, ATd, StatusDot } from "@/components/admin/AdminLayout";

const T = { sans: "var(--font-admin-sans,'Public Sans',sans-serif)", serif: "var(--font-admin-serif,'Fraunces',serif)" };

interface GiftCard { id: number; code: string; balance: number; initial_balance: number; email: string; status: "active" | "used" | "disabled" | "expired"; expires_at: string | null; note: string; created_at: string; }

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
        } catch { setError("Failed to load gift cards."); }
        finally { setLoading(false); }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault(); setCreating(true);
        try {
            const res = await adminFetch("/api/admin/gift-cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ balance: parseFloat(form.balance), email: form.email, note: form.note, expires_at: form.expires_at }) });
            if (!res.ok) throw new Error("Failed");
            setForm({ balance: "", email: "", note: "", expires_at: "" }); setShowForm(false); loadCards();
        } catch { setError("Failed to create gift card."); }
        finally { setCreating(false); }
    }

    async function handleDisable(id: number) {
        if (!confirm("Disable this gift card?")) return;
        await adminFetch(`/api/admin/gift-cards/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "disabled" }) });
        loadCards();
    }

    return (
        <AdminLayout>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>Gift Cards</h1>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: "var(--stone)", margin: 0 }}>{cards.length} cards</p>
            </div>

            {/* Create form */}
            {showForm && (
                <APanel style={{ marginBottom: 20 }}>
                    <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--sand)" }}>
                        <span style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>New Gift Card</span>
                    </div>
                    <form onSubmit={handleCreate} style={{ padding: 20 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "0 16px" }}>
                            <AInput label="Balance (₦) *" value={form.balance} onChange={v => setForm(f => ({ ...f, balance: v }))} type="number" required min="1" step="0.01" />
                            <AInput label="Recipient Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
                            <AInput label="Expiry Date" value={form.expires_at} onChange={v => setForm(f => ({ ...f, expires_at: v }))} type="date" />
                            <AInput label="Note" value={form.note} onChange={v => setForm(f => ({ ...f, note: v }))} />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <ABtn type="submit" variant="primary" disabled={creating}>{creating ? "Creating…" : "Generate Card"}</ABtn>
                            <ABtn variant="secondary" onClick={() => setShowForm(false)}>Cancel</ABtn>
                        </div>
                    </form>
                </APanel>
            )}

            <APanel>
                <APanelHeader actions={!showForm ? <ABtn variant="primary" onClick={() => setShowForm(true)}>+ New Gift Card</ABtn> : undefined}>
                    Gift Cards
                </APanelHeader>

                {error && <div style={{ margin: "12px 20px", padding: "8px 12px", background: "rgba(166,67,47,.06)", borderLeft: "3px solid var(--rust)", fontFamily: T.sans, fontSize: 12, color: "var(--rust)" }}>{error}</div>}

                {loading ? (
                    <div style={{ padding: 40, textAlign: "center", fontFamily: T.sans, fontSize: 13, color: "var(--stone)" }}>Loading gift cards…</div>
                ) : cards.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", fontFamily: T.sans, fontSize: 13, color: "var(--stone)" }}>No gift cards yet.</div>
                ) : (
                    <ATable headers={["Code", "Balance", "Initial", "Email", "Status", "Expires", "Created", ""]}>
                        {cards.map(card => (
                            <ATr key={card.id}>
                                <ATd mono primary>{card.code}</ATd>
                                <ATd primary>₦{card.balance?.toLocaleString("en-NG")}</ATd>
                                <ATd muted>₦{card.initial_balance?.toLocaleString("en-NG")}</ATd>
                                <ATd muted>{card.email || "—"}</ATd>
                                <ATd><StatusDot status={card.status} /></ATd>
                                <ATd muted>{card.expires_at || "—"}</ATd>
                                <ATd muted>{new Date(card.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</ATd>
                                <ATd>
                                    {card.status === "active" && (
                                        <ABtn variant="danger" onClick={() => handleDisable(card.id)}>Disable</ABtn>
                                    )}
                                </ATd>
                            </ATr>
                        ))}
                    </ATable>
                )}
            </APanel>
        </AdminLayout>
    );
}
