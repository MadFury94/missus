"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout, { ABtn, APanel, APanelHeader, ATable, ATr, ATd } from "@/components/admin/AdminLayout";

const T = { sans: "var(--font-admin-sans,'Public Sans',sans-serif)", serif: "var(--font-admin-serif,'Fraunces',serif)" };
type WCCat = { id: number; name: string; slug: string; parent: number; count: number; image: { src: string; alt: string } | null; };

export default function AdminCategories() {
    const router = useRouter();
    const [cats, setCats] = useState<WCCat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || !isAdmin(u)) { router.push("/admin/login"); return; }
        adminFetch("/api/admin/categories")
            .then(r => r.json())
            .then((d: WCCat[]) => setCats(Array.isArray(d) ? d.filter(c => c.slug !== "uncategorized") : []))
            .catch(() => setCats([]))
            .finally(() => setLoading(false));
    }, [router]);

    const parentMap = new Map(cats.map(c => [c.id, c.name]));

    return (
        <AdminLayout>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>Categories</h1>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: "var(--stone)", margin: 0 }}>{cats.length} categories — read-only here, managed in WordPress</p>
            </div>

            <div style={{ background: "rgba(184,137,46,.06)", border: "1px solid rgba(184,137,46,.25)", borderLeft: "3px solid var(--amber)", padding: "8px 14px", marginBottom: 20, borderRadius: "var(--admin-radius)", fontFamily: T.sans, fontSize: 12, color: "var(--ink)" }}>
                Categories are managed in WordPress. Add, edit, or delete categories there — changes appear here automatically.
            </div>

            <APanel>
                <APanelHeader actions={
                    <a href="https://missusoutfits.com/wp-admin/edit-tags.php?taxonomy=product_cat&post_type=product" target="_blank" rel="noreferrer">
                        <ABtn variant="secondary">Manage in WordPress ↗</ABtn>
                    </a>
                }>Categories</APanelHeader>

                {loading ? (
                    <div style={{ padding: 40, textAlign: "center", fontFamily: T.sans, fontSize: 13, color: "var(--stone)" }}>Loading…</div>
                ) : (
                    <ATable headers={["", "Name", "Slug", "Parent", "Products"]}>
                        {cats.map(c => (
                            <ATr key={c.id}>
                                <ATd style={{ width: 52 }}>
                                    {c.image?.src ? (
                                        <div style={{ width: 36, height: 36, position: "relative", overflow: "hidden", background: "var(--sand)", borderRadius: "var(--admin-radius)" }}>
                                            <Image src={c.image.src} alt={c.name} fill style={{ objectFit: "cover" }} sizes="36px" />
                                        </div>
                                    ) : (
                                        <div style={{ width: 36, height: 36, background: "var(--sand)", borderRadius: "var(--admin-radius)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏷</div>
                                    )}
                                </ATd>
                                <ATd primary>{c.name}</ATd>
                                <ATd mono muted>{c.slug}</ATd>
                                <ATd muted>{c.parent ? parentMap.get(c.parent) || `#${c.parent}` : "—"}</ATd>
                                <ATd muted style={{ textAlign: "center" }}>{c.count}</ATd>
                            </ATr>
                        ))}
                    </ATable>
                )}
            </APanel>
        </AdminLayout>
    );
}
