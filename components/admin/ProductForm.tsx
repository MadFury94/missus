"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/admin-fetch";

interface ProductFormProps {
    product?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [form, setForm] = useState({
        name: product?.name || "",
        slug: product?.slug || "",
        type: product?.type || "simple",
        status: product?.status || "publish",
        featured: product?.featured || false,
        description: product?.description || "",
        short_description: product?.short_description || "",
        sku: product?.sku || "",
        regular_price: product?.regular_price || "",
        sale_price: product?.sale_price || "",
        manage_stock: product?.manage_stock || false,
        stock_quantity: product?.stock_quantity || "",
        stock_status: product?.stock_status || "instock",
        categories: product?.categories?.map((c: any) => c.id) || [],
        images: product?.images || [],
        weight: product?.weight || "",
        dimensions: {
            length: product?.dimensions?.length || "",
            width: product?.dimensions?.width || "",
            height: product?.dimensions?.height || "",
        },
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await adminFetch("/api/admin/categories");
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Format data for WooCommerce API
            const productData: any = {
                name: form.name,
                slug: form.slug,
                type: form.type,
                status: form.status,
                featured: form.featured,
                description: form.description,
                short_description: form.short_description,
                sku: form.sku,
                regular_price: form.regular_price,
                sale_price: form.sale_price,
                manage_stock: form.manage_stock,
                stock_status: form.stock_status,
                categories: form.categories.map((id: number) => ({ id })),
                images: form.images,
                weight: form.weight,
                dimensions: form.dimensions,
            };

            if (form.manage_stock) {
                productData.stock_quantity = parseInt(form.stock_quantity) || 0;
            }

            await onSubmit(productData);
        } catch (error) {
            console.error("Form submission error:", error);
            alert("Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // In production, upload to WordPress media library
        // For now, just show a message
        alert("Image upload: Please add image URLs manually or upload through WordPress media library");
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div style={{ background: "#fff", border: "1px solid #c3c4c7", borderRadius: "4px", padding: "20px", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "#1d2327", padding: "0 0 12px 0", borderBottom: "1px solid #c3c4c7" }}>
                    Basic Information
                </h2>

                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#1d2327" }}>
                        Product Name *
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #8c8f94", borderRadius: "3px", fontSize: "13px", outline: "none" }}
                    />
                </div>

                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#1d2327" }}>
                        Slug
                    </label>
                    <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="Auto-generated from name"
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #8c8f94", borderRadius: "3px", fontSize: "13px", outline: "none" }}
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#1d2327" }}>
                            Product Type
                        </label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                            style={{ width: "100%", padding: "8px 12px", border: "1px solid #8c8f94", borderRadius: "3px", fontSize: "13px", outline: "none" }}
                        >
                            <option value="simple">Simple</option>
                            <option value="variable">Variable</option>
                            <option value="grouped">Grouped</option>
                            <option value="external">External</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#1d2327" }}>
                            Status
                        </label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            style={{ width: "100%", padding: "8px 12px", border: "1px solid #8c8f94", borderRadius: "3px", fontSize: "13px", outline: "none" }}
                        >
                            <option value="publish">Published</option>
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                            style={{ width: "16px", height: "16px" }}
                        />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1d2327" }}>Featured Product</span>
                    </label>
                </div>

                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#1d2327" }}>
                        Description
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={6}
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #8c8f94", borderRadius: "3px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#1d2327" }}>
                        Short Description
                    </label>
                    <textarea
                        value={form.short_description}
                        onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                        rows={3}
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #8c8f94", borderRadius: "3px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
                    />
                </div>
            </div>

            {/* Pricing */}
            <div style={{ background: "#fff", border: "1px solid #c3c4c7", borderRadius: "4px", padding: "20px", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", color: "#1d2327", padding: "0 0 12px 0", borderBottom: "1px solid #c3c4c7" }}>
                    Pricing
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                            SKU
                        </label>
                        <input
                            type="text"
                            value={form.sku}
                            onChange={(e) => setForm({ ...form, sku: e.target.value })}
                            style={{ width: "100%", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                            Regular Price (₦) *
                        </label>
                        <input
                            type="number"
                            value={form.regular_price}
                            onChange={(e) => setForm({ ...form, regular_price: e.target.value })}
                            required
                            step="0.01"
                            style={{ width: "100%", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                            Sale Price (₦)
                        </label>
                        <input
                            type="number"
                            value={form.sale_price}
                            onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                            step="0.01"
                            style={{ width: "100%", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>
                </div>
            </div>

            {/* Inventory */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase" }}>
                    Inventory
                </h2>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={form.manage_stock}
                            onChange={(e) => setForm({ ...form, manage_stock: e.target.checked })}
                            style={{ width: "18px", height: "18px" }}
                        />
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>Manage Stock</span>
                    </label>
                </div>

                {form.manage_stock && (
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                            Stock Quantity
                        </label>
                        <input
                            type="number"
                            value={form.stock_quantity}
                            onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                            style={{ width: "200px", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>
                )}

                <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                        Stock Status
                    </label>
                    <select
                        value={form.stock_status}
                        onChange={(e) => setForm({ ...form, stock_status: e.target.value })}
                        style={{ width: "200px", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "14px" }}
                    >
                        <option value="instock">In Stock</option>
                        <option value="outofstock">Out of Stock</option>
                        <option value="onbackorder">On Backorder</option>
                    </select>
                </div>
            </div>

            {/* Categories */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase" }}>
                    Categories
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                    {categories.map((cat) => (
                        <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={form.categories.includes(cat.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setForm({ ...form, categories: [...form.categories, cat.id] });
                                    } else {
                                        setForm({ ...form, categories: form.categories.filter((id: number) => id !== cat.id) });
                                    }
                                }}
                                style={{ width: "18px", height: "18px" }}
                            />
                            <span style={{ fontSize: "14px" }}>{cat.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Shipping */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase" }}>
                    Shipping
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                            Weight (kg)
                        </label>
                        <input
                            type="text"
                            value={form.weight}
                            onChange={(e) => setForm({ ...form, weight: e.target.value })}
                            style={{ width: "100%", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                            Length (cm)
                        </label>
                        <input
                            type="text"
                            value={form.dimensions.length}
                            onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, length: e.target.value } })}
                            style={{ width: "100%", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                            Width (cm)
                        </label>
                        <input
                            type="text"
                            value={form.dimensions.width}
                            onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, width: e.target.value } })}
                            style={{ width: "100%", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                            Height (cm)
                        </label>
                        <input
                            type="text"
                            value={form.dimensions.height}
                            onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, height: e.target.value } })}
                            style={{ width: "100%", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "14px" }}
                        />
                    </div>
                </div>
            </div>

            {/* Images */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase" }}>
                    Product Images
                </h2>

                <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
                        Upload images through WordPress Media Library, then add URLs here
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            const url = prompt("Enter image URL:");
                            if (url) {
                                setForm({ ...form, images: [...form.images, { src: url }] });
                            }
                        }}
                        style={{ padding: "10px 20px", background: "#000", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                    >
                        + Add Image URL
                    </button>
                </div>

                {form.images.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
                        {form.images.map((img: any, idx: number) => (
                            <div key={idx} style={{ position: "relative", paddingTop: "120%", background: "#f5f5f5", borderRadius: "8px", overflow: "hidden" }}>
                                <Image
                                    src={img.src}
                                    alt={`Product ${idx + 1}`}
                                    fill
                                    style={{ objectFit: "cover" }}
                                    sizes="120px"
                                />
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, images: form.images.filter((_: any, i: number) => i !== idx) })}
                                    style={{ position: "absolute", top: "8px", right: "8px", background: "#630D13", color: "#fff", border: "none", borderRadius: "4px", width: "24px", height: "24px", cursor: "pointer", fontSize: "16px", lineHeight: "1" }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start", paddingTop: "16px" }}>
                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: "8px 16px", background: loading ? "#8c8f94" : "#2271b1", color: "#fff", border: "1px solid #2271b1", borderRadius: "3px", fontSize: "13px", fontWeight: 400, cursor: loading ? "not-allowed" : "pointer", transition: "background .15s" }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#135e96")}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#2271b1")}
                >
                    {loading ? "Saving..." : product ? "Update Product" : "Publish"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    style={{ padding: "8px 16px", background: "#fff", color: "#2271b1", border: "1px solid #2271b1", borderRadius: "3px", fontSize: "13px", fontWeight: 400, cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f6f7f7"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
