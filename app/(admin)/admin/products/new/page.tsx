"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout, { APanel, APanelHeader } from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";

const T = { sans: "var(--font-admin-sans,'Public Sans',sans-serif)", serif: "var(--font-admin-serif,'Fraunces',serif)" };

export default function NewProduct() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const u = getCurrentUser();
        if (!u || !isAdmin(u)) { router.push("/admin/login"); return; }
        setUser(u);
    }, [router]);

    const handleSubmit = async (productData: unknown) => {
        const response = await adminFetch("/api/admin/products", { method: "POST", body: JSON.stringify(productData) });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to create product");
        }
        alert("Product created successfully!");
        router.push("/admin/products");
    };

    if (!user) return <AdminLayout><div style={{ padding: 40, textAlign: "center", fontFamily: T.sans, color: "var(--stone)" }}>Loading…</div></AdminLayout>;

    return (
        <AdminLayout>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 600, color: "var(--ink)", margin: 0 }}>Add New Product</h1>
            </div>
            <APanel>
                <div style={{ padding: 24 }}>
                    <ProductForm onSubmit={handleSubmit} onCancel={() => router.push("/admin/products")} />
                </div>
            </APanel>
        </AdminLayout>
    );
}
