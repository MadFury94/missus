"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Cart, CartItem } from "@/types";
import type { StoreProduct } from "@/lib/woocommerce";
import { getCart, updateQuantity, removeFromCart } from "@/lib/cart";
import { formatPrice } from "@/lib/woocommerce";
import CartUnlockBar from "@/components/cart/CartUnlockBar";
import CartItemRow from "@/components/cart/CartItemRow";
import PromoCodeInput from "@/components/cart/PromoCodeInput";
import OrderSummary from "@/components/cart/OrderSummary";
import CartUpsell from "@/components/cart/CartUpsell";
import RecentlyRemoved from "@/components/cart/RecentlyRemoved";

export default function CartPage() {
    const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, total: 0 });
    const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
    const [recentlyRemoved, setRecentlyRemoved] = useState<{ name: string; image?: string }[]>([]);

    useEffect(() => {
        const currentCart = getCart();
        setCart(currentCart);
        fetchUpsells(currentCart.items);
    }, []);

    async function fetchUpsells(cartItems: CartItem[]) {
        try {
            // IDs already in cart — exclude from recommendations
            const cartIds = cartItems.map((i) => i.productId).join(",");

            // Fetch the first cart item's product to get its category
            let categorySlug = "";
            if (cartItems.length > 0) {
                const productRes = await fetch(
                    `https://missusoutfits.com/wp-json/wc/store/v1/products?slug=${cartItems[0].slug}`
                );
                if (productRes.ok) {
                    const data: StoreProduct[] = await productRes.json();
                    categorySlug = data?.[0]?.categories?.[0]?.slug ?? "";
                }
            }

            // Prefer same category as first cart item, fall back to popular
            const params = new URLSearchParams({
                per_page: "8",
                orderby: "popularity",
            });
            if (categorySlug) params.set("category", categorySlug);
            if (cartIds) params.set("exclude", cartIds);

            const upsellRes = await fetch(`/api/products?${params}`);
            const upsellData = await upsellRes.json();

            const products = (upsellData.products || [])
                .slice(0, 4)
                .map((p: StoreProduct) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price: parseInt(p.prices.price),
                    regularPrice: p.on_sale ? parseInt(p.prices.regular_price) : undefined,
                    image: p.images[0]?.src,
                }));

            setUpsellProducts(products);
        } catch {
            setUpsellProducts([]);
        }
    }

    function handleQty(productId: number, size: string | undefined, delta: number) {
        const item = cart.items.find((i) => i.productId === productId && i.size === size);
        if (!item) return;
        const newQty = Math.max(1, Math.min(10, item.quantity + delta));
        setCart(updateQuantity(productId, size, newQty));
        window.dispatchEvent(new Event("cart-updated"));
    }

    function handleRemove(productId: number, size?: string) {
        const item = cart.items.find((i) => i.productId === productId && i.size === size);
        if (item) {
            setRecentlyRemoved((prev) => [{ name: item.name, image: item.image }, ...prev].slice(0, 4));
        }
        setCart(removeFromCart(productId, size));
        window.dispatchEvent(new Event("cart-updated"));
    }

    const discount = cart.items.reduce((sum, item) => {
        if (item.regularPrice && item.regularPrice > item.price) {
            return sum + (item.regularPrice - item.price) * item.quantity;
        }
        return sum;
    }, 0);

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.items.length === 0) {
        return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "20px" }}>
                    <path d="M6 9h12l-1.5 10H7.5L6 9z" />
                    <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                </svg>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "28px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#ccc", marginBottom: "8px" }}>
                    Your Bag is Empty
                </h1>
                <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "24px", maxWidth: "320px" }}>
                    Looks like you haven&apos;t added anything yet. Browse our latest drops and find your next it-girl look.
                </p>
                <Link href="/shop" style={{ background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "13px", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "14px 40px", textDecoration: "none" }}>
                    Shop Now
                </Link>
            </div>
        );
    }

    return (
        <>
            <CartUnlockBar total={cart.subtotal} />

            <div style={{ flex: 1, padding: "32px 24px 60px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
                <h1 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(32px,4vw,48px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".02em", marginBottom: "6px", color: "#000" }}>
                    YOUR BAG
                </h1>

                <div className="cart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "40px", alignItems: "start", marginTop: "28px" }}>
                    {/* LEFT — Items */}
                    <div>
                        {/* Column headers */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "20px", paddingBottom: "10px", borderBottom: "1.5px solid #000", marginBottom: 0 }}>
                            {["Product", "Quantity", "Price"].map((h) => (
                                <span key={h} style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#000" }}>
                                    {h}
                                </span>
                            ))}
                        </div>

                        {cart.items.map((item) => (
                            <CartItemRow
                                key={`${item.productId}-${item.size}`}
                                item={item}
                                onUpdateQty={handleQty}
                                onRemove={handleRemove}
                            />
                        ))}

                        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e8e8e8" }}>
                            <PromoCodeInput />
                        </div>

                        <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#000", textDecoration: "none", marginTop: "20px", borderBottom: "1.5px solid #000", paddingBottom: "1px" }}>
                            ← Continue Shopping
                        </Link>

                        <RecentlyRemoved items={recentlyRemoved} />

                        {upsellProducts.length > 0 && (
                            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e8e8e8" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                    <h3 style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "20px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>
                                        You May Also Like
                                    </h3>
                                    <Link href="/shop" style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "12px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textDecoration: "underline", color: "#000" }}>
                                        View All →
                                    </Link>
                                </div>
                                <CartUpsell products={upsellProducts} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT — Order Summary */}
                    <OrderSummary
                        subtotal={cart.subtotal}
                        discount={discount}
                        total={cart.total}
                        itemCount={itemCount}
                    />
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 1024px) {
                    .cart-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </>
    );
}
