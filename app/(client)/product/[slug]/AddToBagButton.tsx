"use client";
import { useState } from "react";
import type { StoreProduct } from "@/lib/woocommerce";
import { addToCart } from "@/lib/cart";
import { getProductImage } from "@/lib/woocommerce";
import { useCurrency } from "@/lib/currency";

export default function AddToBagButton({ product, sizes, colors }: { product: StoreProduct; sizes: string[]; colors: string[] }) {
    const { convert } = useCurrency();
    const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
    const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    function handleAdd() {
        // Check if product is out of stock
        if (product.stock_status === "outofstock" || (product.stock_quantity !== null && product.stock_quantity <= 0)) {
            alert("This item is currently out of stock and cannot be added to your bag.");
            return;
        }

        // Check if requested quantity exceeds available stock
        if (product.stock_quantity !== null && qty > product.stock_quantity) {
            alert(`Only ${product.stock_quantity} items available in stock.`);
            return;
        }

        addToCart({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            image: getProductImage(product),
            price: parseInt(product.prices.price) / 100,
            regularPrice: parseInt(product.prices.regular_price) / 100,
            quantity: qty,
            size: selectedSize,
            color: selectedColor,
        });
        window.dispatchEvent(new Event("cart-updated"));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    }

    return (
        <div>
            {/* Size */}
            {sizes.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000" }}>
                            Size — <span style={{ color: "#767676", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontFamily: "'Barlow', sans-serif" }}>{selectedSize || "Select a size"}</span>
                        </p>
                        <button style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>Size Guide</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {sizes.map((s) => (
                            <button key={s} onClick={() => setSelectedSize(s)} style={{ minWidth: "50px", height: "46px", padding: "0 12px", border: `1.5px solid ${selectedSize === s ? "#000" : "#e0e0e0"}`, background: selectedSize === s ? "#000" : "#fff", color: selectedSize === s ? "#fff" : "#000", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer" }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Color */}
            {colors.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#000", marginBottom: "8px" }}>
                        Color — <span style={{ color: "#767676", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontFamily: "'Barlow', sans-serif" }}>{selectedColor}</span>
                    </p>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {colors.map((c) => (
                            <button key={c} onClick={() => setSelectedColor(c)} style={{ border: `3px solid ${selectedColor === c ? "#000" : "transparent"}`, outline: "1.5px solid #e0e0e0", outlineOffset: "2px", width: "36px", height: "36px", background: c.toLowerCase(), cursor: "pointer" }} title={c} />
                        ))}
                    </div>
                </div>
            )}

            {/* Qty */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>Qty:</span>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e0e0e0", height: "46px" }}>
                    <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        disabled={product.stock_status === "outofstock"}
                        style={{ width: "40px", height: "100%", border: "none", background: "#fff", fontSize: "18px", fontWeight: 300, cursor: product.stock_status === "outofstock" ? "not-allowed" : "pointer", opacity: product.stock_status === "outofstock" ? 0.5 : 1 }}
                    >
                        −
                    </button>
                    <span style={{ width: "44px", textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 700 }}>{qty}</span>
                    <button
                        onClick={() => {
                            const maxQty = product.stock_quantity !== null ? product.stock_quantity : 99;
                            setQty(Math.min(maxQty, qty + 1));
                        }}
                        disabled={product.stock_status === "outofstock" || (product.stock_quantity !== null && qty >= product.stock_quantity)}
                        style={{
                            width: "40px",
                            height: "100%",
                            border: "none",
                            background: "#fff",
                            fontSize: "18px",
                            fontWeight: 300,
                            cursor: (product.stock_status === "outofstock" || (product.stock_quantity !== null && qty >= product.stock_quantity)) ? "not-allowed" : "pointer",
                            opacity: (product.stock_status === "outofstock" || (product.stock_quantity !== null && qty >= product.stock_quantity)) ? 0.5 : 1
                        }}
                    >
                        +
                    </button>
                </div>
                {product.stock_status === "outofstock" ? (
                    <span style={{ fontSize: "11px", color: "#e8002d", fontWeight: 600 }}>● Out of Stock</span>
                ) : product.stock_quantity !== null && product.stock_quantity <= 5 ? (
                    <span style={{ fontSize: "11px", color: "#e8002d", fontWeight: 600 }}>● Only {product.stock_quantity} left</span>
                ) : null}
            </div>

            {/* CTAs */}
            <button
                onClick={handleAdd}
                disabled={product.stock_status === "outofstock"}
                style={{
                    width: "100%",
                    height: "52px",
                    background: product.stock_status === "outofstock" ? "#ccc" : (added ? "#2d7a2d" : "#000"),
                    color: "#fff",
                    border: "none",
                    borderRadius: "25px",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "15px",
                    fontWeight: 800,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    cursor: product.stock_status === "outofstock" ? "not-allowed" : "pointer",
                    marginBottom: "8px",
                    transition: "background .2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px"
                }}
            >
                {product.stock_status === "outofstock" ? (
                    "Out of Stock"
                ) : added ? (
                    "Added to Bag ✓"
                ) : (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/shopping-bag.png" alt="" aria-hidden="true" width={18} height={18} style={{ filter: "brightness(0) invert(1)", display: "block" }} />
                        Add to Bag
                    </>
                )}
            </button>
            <button
                disabled={product.stock_status === "outofstock"}
                style={{
                    width: "100%",
                    height: "52px",
                    background: product.stock_status === "outofstock" ? "#ccc" : "#e8002d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "25px",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "15px",
                    fontWeight: 800,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    cursor: product.stock_status === "outofstock" ? "not-allowed" : "pointer"
                }}
            >
                {product.stock_status === "outofstock" ? "Out of Stock" : "Buy Now — Pay on Delivery"}
            </button>
        </div>
    );
}
