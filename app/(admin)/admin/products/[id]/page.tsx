"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-fetch";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProduct() {
    const router = useRouter();
    const params = useParams();
    const [user, setUser] = useState<any>(null);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || !isAdmin(currentUser)) {
            router.push("/admin/login");
            return;
        }
        setUser(currentUser);
        loadProduct();
    }, [router, params.id]);

    const loadProduct = async () => {
        try {
            const response = await adminFetch(`/api/admin/products/${params.id}`);
            if (!response.ok) throw new Error("Product not found");
            const data = await response.json();
            setProduct(data);
        } catch (error) {
            alert("Failed to load product");
            router.push("/admin/products");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (productData: unknown) => {
        try {
            const response = await adminFetch(`/api/admin/products/${params.id}`, {
                method: "PUT",
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update product");
            }

            alert("Product updated successfully!");
            router.push("/admin/products");
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            alert(msg);
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await adminFetch(`/api/admin/products/${params.id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete product");

            alert("Product deleted successfully!");
            router.push("/admin/products");
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            alert(msg);
        }
    };

    if (loading || !product) {
        return (
            <AdminLayout>
                <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={{ background: "#fff", border: "1px solid #ccd0d4", boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: 400, margin: 0, color: "#23282d" }}>Edit Product</h1>
                    <button
                        onClick={handleDelete}
                        style={{
                            background: "#d63638",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: "3px",
                            fontSize: "13px",
                            border: "1px solid #d63638",
                            cursor: "pointer",
                            transition: "background .15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#b32d2e"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#d63638"}
                    >
                        Delete Product
                    </button>
                </div>

                <div style={{ padding: "20px" }}>
                    <ProductForm
                        product={product}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/admin/products")}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
