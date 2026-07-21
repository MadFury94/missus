"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout from "@/components/admin/AdminLayout";

type WCCategory = {
    id: number;
    name: string;
    slug: string;
    parent: number;
    count: number;
    image: { src: string; alt: string } | null;
    description: string;
};

export default function AdminCategories() {
    const router = useRouter();
    const [categories, setCategories] = useState<WCCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getCurrentUser();
        if (!user || !isAdmin(user)) { router.push("/admin/login"); return; }
        loadCategories();
    }, [router]);

    async function loadCategories() {
        setLoading(true);
        try {
            const res = await adminFetch("/api/admin/categories");
            if (!res.ok) throw new Error("Failed to load categories");
            const data: WCCategory[] = await res.json();
            setCategories(Array.isArray(data) ? data.filter((c) => c.slug !== "uncategorized") : []);
        } catch (e) {
            console.error(e);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }

    // Build parent name map
    const parentMap = new Map(categories.map((c) => [c.id, c.name]));

    return (
        <AdminLayout>
            <div style={{ background: "#fff", border: "1px solid #ccd0d4", boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: 400, margin: 0, color: "#23282d" }}>
                        Categories <span style={{ fontSize: "15px", color: "#50575e" }}>({categories.length})</span>
                    </h1>
                    <a
                        href="https://missusoutfits.com/wp-admin/edit-tags.php?taxonomy=product_cat&post_type=product"
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: "#2271b1", color: "#fff", padding: "6px 12px", borderRadius: "3px", fontSize: "13px", textDecoration: "none", border: "1px solid #2271b1" }}
                    >
                        Manage in WordPress ↗
                    </a>
                </div>

                <div style={{ padding: "12px 20px", background: "#f0f6fc", borderBottom: "1px solid #c3d9f5", fontSize: "13px", color: "#004085" }}>
                    ℹ️ Categories are managed in WordPress. Changes here are read-only. Click &quot;Manage in WordPress&quot; to add, edit, or delete categories.
                </div>

                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#50575e" }}>Loading categories…</div>
                ) : categories.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#50575e" }}>No categories found.</div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#f6f7f7" }}>
                                    {["Image", "Name", "Slug", "Parent", "Products"].map((h) => (
                                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#2c3338", borderBottom: "1px solid #c3c4c7", textTransform: "uppercase", letterSpacing: ".04em" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((c) => (
                                    <tr key={c.id} style={{ borderBottom: "1px solid #f0f0f1" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"} onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                                        <td style={{ padding: "10px 14px" }}>
                                            {c.image?.src ? (
                                                <div style={{ width: "40px", height: "40px", position: "relative", borderRadius: "3px", overflow: "hidden", background: "#f0f0f1" }}>
                                                    <Image src={c.image.src} alt={c.image.alt || c.name} fill style={{ objectFit: "cover" }} sizes="40px" />
                                                </div>
                                            ) : (
                                                <div style={{ width: "40px", height: "40px", background: "#f0f0f1", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🏷️</div>
                                            )}
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 600, color: "#2c3338" }}>{c.name}</td>
                                        <td style={{ padding: "10px 14px", fontSize: "12px", color: "#50575e", fontFamily: "monospace" }}>{c.slug}</td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#50575e" }}>
                                            {c.parent ? parentMap.get(c.parent) || `#${c.parent}` : "—"}
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#50575e", textAlign: "center" }}>{c.count}</td>
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
