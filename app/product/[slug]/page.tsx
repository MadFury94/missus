import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProduct, getRelatedProducts, formatPrice, getDiscount, getSizes, getColors } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";
import AddToBagButton from "./AddToBagButton";
import VirtualTryOn from "@/components/product/VirtualTryOn";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) return { title: "Product Not Found" };
    return {
        title: product.name,
        description: product.short_description.replace(/<[^>]+>/g, "").slice(0, 160),
        openGraph: { images: [{ url: product.images[0]?.src ?? "" }] },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);
    if (!product) notFound();

    const related = await getRelatedProducts(product.id, 5);
    const sizes = getSizes(product);
    const colors = getColors(product);
    const discount = getDiscount(product.prices.regular_price, product.prices.sale_price);
    const isOnSale = product.on_sale && product.prices.sale_price !== product.prices.regular_price;
    const breadcrumb = product.categories?.[0];

    return (
        <div>
            {/* Breadcrumb */}
            <div style={{ padding: "10px 20px", borderBottom: "1px solid #e8e8e8", background: "#fff" }}>
                <div style={{ fontSize: "11px", color: "#767676", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                    <Link href="/" style={{ color: "#767676", cursor: "pointer" }}>Home</Link>
                    {breadcrumb && <><span>/</span><Link href={`/category/${breadcrumb.slug}`} style={{ color: "#767676", cursor: "pointer", textTransform: "capitalize" }}>{breadcrumb.name}</Link></>}
                    <span>/</span>
                    <span style={{ color: "#000" }}>{product.name}</span>
                </div>
            </div>

            <div className="pdp-grid">
                {/* Gallery */}
                <div style={{ maxWidth: "700px" }}>
                    <div style={{ aspectRatio: "2/3", background: "#f0ece8", position: "relative", overflow: "hidden", marginBottom: "8px", maxHeight: "900px" }}>
                        {product.images[0] && (
                            <Image src={product.images[0].src} alt={product.images[0].alt || product.name} fill style={{ objectFit: "cover", objectPosition: "top" }} priority sizes="50vw" />
                        )}
                        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 2 }}>
                            {product.tags?.some((t) => t.slug === "whats-new") && (
                                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "4px 10px", background: "#e8002d", color: "#fff" }}>NEW</span>
                            )}
                            {isOnSale && (
                                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "4px 10px", background: "#000", color: "#fff" }}>{discount}% OFF</span>
                            )}
                        </div>
                    </div>
                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
                            {product.images.slice(0, 4).map((img, i) => (
                                <div key={i} style={{ aspectRatio: "2/3", background: "#f0ece8", position: "relative", overflow: "hidden", border: i === 0 ? "2px solid #000" : "2px solid transparent", cursor: "pointer" }}>
                                    <Image src={img.src} alt={img.alt || product.name} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="10vw" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={{ position: "sticky", top: "80px", alignSelf: "start" }}>
                    {/* Rating */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{ display: "flex", gap: "2px" }}>
                            {"★★★★★".split("").map((s, i) => <span key={i} style={{ color: "#ffc107", fontSize: "14px" }}>{s}</span>)}
                        </div>
                        <span style={{ fontSize: "12px", color: "#767676", textDecoration: "underline", cursor: "pointer" }}>{product.review_count} Reviews</span>
                        <span style={{ fontSize: "11px", color: "#767676", marginLeft: "auto" }}>SKU: {product.sku}</span>
                    </div>

                    <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 800, letterSpacing: ".02em", textTransform: "uppercase", lineHeight: 1.1, marginBottom: "10px", color: "#000" }}>
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "16px" }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 900, color: "#000", letterSpacing: ".02em" }}>
                            {formatPrice(product.prices.price)}
                        </span>
                        {isOnSale && (
                            <>
                                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 600, color: "#aaa", textDecoration: "line-through" }}>
                                    {formatPrice(product.prices.regular_price)}
                                </span>
                                <span style={{ background: "#e8002d", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".08em", padding: "3px 10px" }}>
                                    SAVE {formatPrice(String(parseInt(product.prices.regular_price) - parseInt(product.prices.price)))}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Description */}
                    {product.short_description && (
                        <div style={{ fontSize: "13px", color: "#555", lineHeight: 1.7, marginBottom: "16px" }}
                            dangerouslySetInnerHTML={{ __html: product.short_description }} />
                    )}

                    {/* Add to bag */}
                    <AddToBagButton product={product} sizes={sizes} colors={colors} />

                    {/* Virtual Try-On */}
                    <VirtualTryOn
                        productImage={product.images[0]?.src || ""}
                        productName={product.name}
                        category="upper_body"
                    />

                    {/* Delivery */}
                    <div style={{ background: "#f5f5f5", padding: "14px 16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[
                            { icon: "🚚", text: "<strong>Lagos Express:</strong> 1–2 hours | Other cities: 1–3 days" },
                            { icon: "↩️", text: "Free returns within <strong>7 days</strong> of delivery" },
                            { icon: "🔒", text: "Free shipping on orders above <strong>₦150,000</strong>" },
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "16px" }}>{item.icon}</span>
                                <span style={{ fontSize: "12px", color: "#333" }} dangerouslySetInnerHTML={{ __html: item.text }} />
                            </div>
                        ))}
                    </div>

                    {/* Accordion */}
                    <div style={{ borderTop: "1px solid #e8e8e8" }}>
                        {[
                            { title: "Product Details", content: product.description || product.short_description },
                            { title: "Size & Fit", content: "Model is 5'7\" and wearing a size Small. This style runs true to size." },
                            { title: "Care Instructions", content: "Hand wash cold. Do not bleach. Hang to dry. Do not tumble dry." },
                            { title: "Shipping & Returns", content: "Lagos express delivery within 1–2 hours. Nationwide delivery 1–3 business days. Free returns within 7 days." },
                        ].map((item) => (
                            <details key={item.title} style={{ borderBottom: "1px solid #e8e8e8" }}>
                                <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000", listStyle: "none" }}>
                                    {item.title} <span style={{ fontSize: "18px", fontWeight: 300 }}>+</span>
                                </summary>
                                <div style={{ paddingBottom: "14px", fontSize: "13px", color: "#555", lineHeight: 1.75, fontWeight: 300 }}
                                    dangerouslySetInnerHTML={{ __html: item.content || "" }} />
                            </details>
                        ))}
                    </div>
                </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
                <div style={{ background: "#fff", borderTop: "1px solid #e8e8e8", padding: "40px 20px" }}>
                    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "24px", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase" }}>You May Also Like</h2>
                            <Link href="/shop" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "underline", color: "#000" }}>View All →</Link>
                        </div>
                        <div className="grid-5">
                            {related.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
