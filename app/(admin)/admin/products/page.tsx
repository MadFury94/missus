"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout, { ABtn, APanel, APanelHeader, ATable, ATr, ATd, StatusDot } from "@/components/admin/AdminLayout";
import Link from "next/link";
import Image from "next/image";

const T = { sans: "var(--font-admin-sans,'Public Sans',sans-serif)", serif: "var(--font-admin-serif,'Fraunces',serif)" };

export default function AdminProducts() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [bulkWorking, setBulkWorking] = useState(false);

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || !isAdmin(u)) { router.push("/admin/login"); return; }
        adminFetch("/api/admin/products?per_page=100")
            .then(r => r.json())
            .then(d => setProducts(Array.isArray(d) ? d : []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [router]);

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    const allIds = filtered.map(p => p.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));

    async function applyBulk() {
        if (!selected.size || !confirm(`Delete ${selected.size} product${selected.size !== 1 ? "s" : ""}? Cannot be undone.`)) return;
        setBulkWorking(true);
        try {
            await Promise.all([...selected].map(id => adminFetch(`/api/admin/products/${id}`, { method: "DELETE" })));
            setProducts(p => p.filter(x => !selected.has(x.id)));
            setSelected(new Set());
        } catch { alert("Some deletions failed."); }
        finally { setBulkWorking(false); }
    }

    if (loading) return <AdminLayout><div style={{ padding: 40, textAlign: "center", fontFamily: T.sans, color: "var(--stone)" }}>Loading…</div></AdminLayout>;

    return (
        <AdminLayout>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>Products</h1>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: "var(--stone)", margin: 0 }}>{products.length} products</p>
            </div>

            <APanel>
                <APanelHeader actions={
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
                            style={{ fontFamily: T.sans, fontSize: 12, border: "1px solid var(--sand-deep)", background: "var(--paper-raised)", color: "var(--ink)", padding: "5px 10px", borderRadius: "var(--admin-radius)", outline: "none", width: 200, transition: "border-color .15s" }}
                            onFocus={e => (e.target.style.borderColor = "var(--wine)")}
                            onBlur={e => (e.target.style.borderColor = "var(--sand-deep)")}
                        />
                        {selected.size > 0 && <ABtn variant="danger" onClick={applyBulk} disabled={bulkWorking}>{bulkWorking ? "Deleting…" : `Delete ${selected.size}`}</ABtn>}
                        <Link href="/admin/products/import"><ABtn variant="secondary">↑ Import CSV</ABtn></Link>
                        <Link href="/admin/products/new"><ABtn variant="primary">+ Add Product</ABtn></Link>
                    </div>
                }>Products</APanelHeader>

                {filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", fontFamily: T.sans, fontSize: 13, color: "var(--stone)" }}>No products found</div>
                ) : (
                    <ATable headers={["", "", "Name", "SKU", "Stock", "Price", "Categories", "Date"]}>
                        {filtered.map(p => (
                            <ATr key={p.id} selected={selected.has(p.id)}>
                                <ATd style={{ width: 36, paddingRight: 4 }}>
                                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => setSelected(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })} style={{ margin: 0, accentColor: "var(--wine)" }} />
                                </ATd>
                                <ATd style={{ width: 48, padding: "8px 8px" }}>
                                    <div style={{ width: 36, height: 46, background: "var(--sand)", position: "relative", overflow: "hidden", borderRadius: "var(--admin-radius)" }}>
                                        {p.images[0] && <Image src={p.images[0].src} alt={p.name} fill style={{ objectFit: "cover" }} sizes="36px" />}
                                    </div>
                                </ATd>
                                <ATd>
                                    <Link href={`/admin/products/${p.id}`} style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: "var(--wine)", textDecoration: "none" }}>{p.name}</Link>
                                    <div style={{ marginTop: 2, display: "flex", gap: 8, fontFamily: T.sans, fontSize: 11 }}>
                                        <Link href={`/admin/products/${p.id}`} style={{ color: "var(--stone)", textDecoration: "none" }}>Edit</Link>
                                        <Link href={`/product/${p.slug}`} target="_blank" style={{ color: "var(--stone)", textDecoration: "none" }}>View ↗</Link>
                                    </div>
                                </ATd>
                                <ATd muted>{p.sku || "—"}</ATd>
                                <ATd><StatusDot status={p.stock_status === "instock" ? "instock" : "outofstock"} /></ATd>
                                <ATd primary>₦{parseInt(p.price || p.regular_price || "0").toLocaleString()}</ATd>
                                <ATd muted>{p.categories?.map((c: any) => c.name).join(", ") || "—"}</ATd>
                                <ATd muted>{new Date(p.date_created).toLocaleDateString()}</ATd>
                            </ATr>
                        ))}
                    </ATable>
                )}
            </APanel>
        </AdminLayout>
    );
}
