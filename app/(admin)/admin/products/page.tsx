"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import Image from "next/image";

export default function AdminProducts() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || !isAdmin(currentUser)) {
            router.push("/admin/login");
            return;
        }
        setUser(currentUser);
        loadProducts();
    }, [router]);

    const loadProducts = async () => {
        try {
            const response = await fetch("/api/admin/products?per_page=100");
            const data = await response.json();

            // Check if data is an array, otherwise set empty array
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                console.error("API returned non-array:", data);
                setProducts([]);
            }
        } catch (error) {
            console.error("Failed to load products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = Array.isArray(products) ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    ) : [];

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={{ background: "#fff", border: "1px solid #ccd0d4", boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
                {/* Header */}
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h1 style={{ fontSize: "23px", fontWeight: 400, margin: 0, color: "#23282d" }}>
                        Products
                        <span style={{ color: "#50575e", fontSize: "16px", fontWeight: 400, marginLeft: "8px" }}>
                            ({products.length})
                        </span>
                    </h1>
                    <Link
                        href="/admin/products/new"
                        style={{
                            background: "#2271b1",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: "3px",
                            fontSize: "13px",
                            textDecoration: "none",
                            border: "1px solid #2271b1",
                            transition: "background .15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#135e96"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#2271b1"}
                    >
                        Add New
                    </Link>
                </div>

                {/* Search Bar */}
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #ccd0d4", background: "#f6f7f7" }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            padding: "6px 12px",
                            border: "1px solid #8c8f94",
                            borderRadius: "3px",
                            fontSize: "13px",
                            outline: "none"
                        }}
                    />
                </div>

                {/* Products Table */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f6f7f7" }}>
                                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#2c3338", borderBottom: "1px solid #c3c4c7" }}>
                                    <input type="checkbox" style={{ margin: 0 }} />
                                </th>
                                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#2c3338", borderBottom: "1px solid #c3c4c7" }}>Image</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#2c3338", borderBottom: "1px solid #c3c4c7" }}>Name</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#2c3338", borderBottom: "1px solid #c3c4c7" }}>SKU</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#2c3338", borderBottom: "1px solid #c3c4c7" }}>Stock</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#2c3338", borderBottom: "1px solid #c3c4c7" }}>Price</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#2c3338", borderBottom: "1px solid #c3c4c7" }}>Categories</th>
                                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#2c3338", borderBottom: "1px solid #c3c4c7" }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} style={{ borderBottom: "1px solid #c3c4c7" }}>
                                    <td style={{ padding: "10px 12px" }}>
                                        <input type="checkbox" style={{ margin: 0 }} />
                                    </td>
                                    <td style={{ padding: "10px 12px" }}>
                                        <div style={{ width: "40px", height: "50px", background: "#f0f0f1", position: "relative", borderRadius: "2px", overflow: "hidden" }}>
                                            {product.images[0] && (
                                                <Image
                                                    src={product.images[0].src}
                                                    alt={product.name}
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                    sizes="40px"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: "10px 12px" }}>
                                        <div>
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                style={{ color: "#2271b1", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}
                                            >
                                                {product.name}
                                            </Link>
                                            <div style={{ fontSize: "12px", color: "#50575e", marginTop: "4px" }}>
                                                <Link href={`/admin/products/${product.id}`} style={{ color: "#2271b1", textDecoration: "none", marginRight: "8px" }}>Edit</Link>
                                                <span style={{ color: "#c3c4c7" }}>|</span>
                                                <Link href={`/product/${product.slug}`} target="_blank" style={{ color: "#2271b1", textDecoration: "none", marginLeft: "8px" }}>View</Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#50575e" }}>
                                        {product.sku || "—"}
                                    </td>
                                    <td style={{ padding: "10px 12px", fontSize: "13px" }}>
                                        <span style={{
                                            padding: "3px 8px",
                                            borderRadius: "2px",
                                            fontSize: "12px",
                                            background: product.stock_status === "instock" ? "#00a32a" : "#d63638",
                                            color: "#fff"
                                        }}>
                                            {product.stock_status === "instock" ? "In stock" : "Out of stock"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#2c3338", fontWeight: 600 }}>
                                        ₦{parseInt(product.price || product.regular_price || "0").toLocaleString()}
                                    </td>
                                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#50575e" }}>
                                        {product.categories?.map((c: any) => c.name).join(", ") || "—"}
                                    </td>
                                    <td style={{ padding: "10px 12px", fontSize: "13px", color: "#50575e" }}>
                                        {new Date(product.date_created).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div style={{ padding: "40px", textAlign: "center", color: "#50575e" }}>
                        No products found
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
