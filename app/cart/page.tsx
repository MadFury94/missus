"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Cart } from "@/types";
import type { StoreProduct } from "@/lib/woocommerce";
import { getCart, updateQuantity, removeFromCart } from "@/lib/cart";
import { formatPrice } from "@/lib/woocommerce";
import CartUnlockBar from "@/components/cart/CartUnlockBar";
import CartItemRow from "@/components/cart/CartItemRow";
import PromoCodeInput from "@/components/cart/PromoCodeInput";
import OrderSummary from "@/components/cart/OrderSummary";
import CartUpsell from "@/components/cart/CartUpsell";

export default function CartPage() {
    const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, total: 0 });
    const [upsellProducts, setUpsellProducts] = useState<any[]>([]);

    useEffect(() => {
        setCart(getCart());

        // Fetch upsell products
        fetch("/api/products?per_page=4&orderby=popularity")
            .then((r) => r.json())
            .then((data) => {
                const products = (data.products || []).map((p: StoreProduct) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price: parseInt(p.prices.price),
                    regularPrice: p.on_sale ? parseInt(p.prices.regular_price) : undefined,
                    image: p.images[0]?.src
                }));
                setUpsellProducts(products);
            })
            .catch(() => setUpsellProducts([]));
    }, []);

    function handleQty(productId: number, size: string | undefined, delta: number) {
        const item = cart.items.find(i => i.productId === productId && i.size === size);
        if (!item) return;
        const newQty = Math.max(1, Math.min(10, item.quantity + delta));
        const updated = updateQuantity(productId, size, newQty);
        setCart(updated);
        window.dispatchEvent(new Event("cart-updated"));
    }

    function handleRemove(productId: number, size?: string) {
        const updated = removeFromCart(productId, size);
        setCart(updated);
        window.dispatchEvent(new Event("cart-updated"));
    }

    const discount = 0; // Calculate from sale items
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.items.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center">
                <ShoppingBag className="w-16 h-16 text-[#e0e0e0] mb-5" strokeWidth={1} />
                <h1 className="font-condensed text-[32px] font-black uppercase tracking-[0.06em] mb-2">Your Bag is Empty</h1>
                <p className="text-[13px] text-[#767676] mb-8 max-w-[320px]">
                    Looks like you haven&apos;t added anything yet. Browse our latest drops and find your next it-girl look.
                </p>
                <Link href="/shop" className="bg-black text-white font-condensed text-[13px] font-bold tracking-[0.12em] uppercase px-10 py-3.5 hover:bg-[#222] transition-colors">
                    Shop Now
                </Link>
            </div>
        );
    }

    return (
        <>
            <CartUnlockBar total={cart.subtotal} />

            <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-8 pb-20">
                <h1 className="font-condensed text-[clamp(28px,4vw,46px)] font-black uppercase tracking-[0.04em] mb-6">
                    Your Bag
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
                    {/* Left */}
                    <div>
                        {/* Column headers */}
                        <div className="hidden lg:grid grid-cols-[1fr_auto_auto] gap-5 pb-2.5 border-b-[1.5px] border-black mb-0">
                            <span className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase">Product</span>
                            <span className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase">Quantity</span>
                            <span className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase">Price</span>
                        </div>

                        {/* Items */}
                        {cart.items.map((item) => (
                            <CartItemRow
                                key={`${item.productId}-${item.size}`}
                                item={item}
                                onUpdateQty={handleQty}
                                onRemove={handleRemove}
                            />
                        ))}

                        <PromoCodeInput />

                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-1.5 font-condensed text-[12px] font-bold tracking-[0.1em] uppercase mt-5 border-b border-black pb-0.5 hover:opacity-50 transition-opacity"
                        >
                            ← Continue Shopping
                        </Link>

                        {/* Upsell */}
                        {upsellProducts.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-[#e8e8e8]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-condensed text-[20px] font-black tracking-[0.08em] uppercase">
                                        You May Also Like
                                    </h3>
                                    <Link href="/shop" className="font-condensed text-[12px] font-bold tracking-[0.1em] uppercase underline hover:no-underline">
                                        View All →
                                    </Link>
                                </div>
                                <CartUpsell products={upsellProducts} />
                            </div>
                        )}
                    </div>

                    {/* Right */}
                    <OrderSummary
                        subtotal={cart.subtotal}
                        discount={discount}
                        total={cart.total}
                        itemCount={itemCount}
                    />
                </div>
            </div>
        </>
    );
}