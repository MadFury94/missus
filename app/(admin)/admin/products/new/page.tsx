"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProduct() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || !isAdmin(currentUser)) {
            router.push("/admin/login");
            return;
        }
        setUser(currentUser);
    }, [router]);

    const handleSubmit = async (productData: unknown) => {
        try {
            const response = await adminFetch("/api/admin/products", {
                method: "POST",
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create product");
            }

            alert("Product created successfully!");
            router.push("/admin/products");
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            alert(msg);
            throw error;
        }
    };

    if (!user) {
        return (
            <AdminLayout>
                <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={{ background: "#fff", border: "1px solid #ccd0d4", boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: 400, margin: 0, color: "#23282d" }}>Add New Product</h1>
                </div>

                <div style={{ padding: "20px" }}>
                    <ProductForm
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/admin/products")}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
