"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Cart } from "@/types";
import { getCart, updateQuantity, removeFromCart } from "@/lib/cart";
import { formatPrice } from "@/lib/woocommerce";
import { FREE_SHIPPING_THRESHOLD, CURRENCY_SYMBOL } from "@/lib/config";

export default function CartPage() {
    const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, total: 0 });

    useEffect(() => {
        setCart(getCart());
    }, []);

    function handleQty(productId: number, size: string | undefined, qty: number) {
        const updated = updateQuantity(productId, size, qty);
        setCart(updated);
        window.dispatchEvent(new Event("cart-updated"));
    }

    function handleRemove(productId: number, size?: string) {
        const updated = removeFromCart(productId, size);
        setCart(updated);
        window.dispatchEvent(new Event("cart-updated"));
    }

    const remaining = FREE_SHIPPING_THRESHOLD - cart.subtotal;

    if (cart.items.length === 0) {
        return (
            <div className="max-w-screen-xl mx-auto px-4 py-20 text-center">
                <h1 className="font-display text-3xl font-bold text-secondary mb-4">Your Bag is Empty</h1>
                <p className="text-secondary/50 mb-8">Looks like you haven&apos;t added anything yet.</p>
                <Link href="/shop" className="inline-block bg-secondary text-white text-xs font-bold tracking-widest uppercase px-10 py-4 hover:bg-secondary/85 transition-colors">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-10">
            <h1 className="font-display text-3xl font-bold text-secondary uppercase mb-8">Your Bag</h1>

            {/* Free shipping progress */}
            {remaining > 0 && (
                <div className="bg-muted p-4 mb-8 text-sm text-secondary/70">
                    Spend <span className="font-bold text-secondary">{formatPrice(remaining)}</span> more to unlock FREE SHIPPING!{" "}
                    <Link href="/shop" className="underline font-semibold text-secondary">Shop New →</Link>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-10">
                {/* Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.items.map((item) => (
                        <div key={`${item.productId}-${item.size}`} className="flex gap-4 border-b border-secondary/10 pb-6">
                            <div className="w-24 h-32 bg-muted shrink-0 relative overflow-hidden">
                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/product/${item.slug}`} className="text-sm font-semibold text-secondary hover:text-primary transition-colors line-clamp-2">
                                    {item.name}
                                </Link>
                                {item.size && <p className="text-xs text-secondary/50 mt-1">Size: {item.size}</p>}
                                {item.color && <p className="text-xs text-secondary/50">Color: {item.color}</p>}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center border border-secondary/20">
                                        <button onClick={() => handleQty(item.productId, item.size, item.quantity - 1)} className="px-2.5 py-1.5 text-secondary hover:bg-muted">−</button>
                                        <span className="px-3 py-1.5 text-sm font-semibold">{item.quantity}</span>
                                        <button onClick={() => handleQty(item.productId, item.size, item.quantity + 1)} className="px-2.5 py-1.5 text-secondary hover:bg-muted">+</button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-secondary">{formatPrice(item.price * item.quantity)}</p>
                                        {item.regularPrice > item.price && (
                                            <p className="text-xs text-[#999] line-through">{formatPrice(item.regularPrice * item.quantity)}</p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => handleRemove(item.productId, item.size)} className="text-xs text-secondary/30 hover:text-accent transition-colors mt-2">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="bg-muted p-6 h-fit">
                    <h2 className="font-bold text-secondary uppercase tracking-widest text-sm mb-6">Order Summary</h2>
                    <div className="space-y-3 text-sm mb-6">
                        <div className="flex justify-between">
                            <span className="text-secondary/60">Subtotal</span>
                            <span className="font-semibold">{formatPrice(cart.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-secondary/60">Shipping</span>
                            <span className="font-semibold">{cart.subtotal >= FREE_SHIPPING_THRESHOLD ? "FREE" : "Calculated at checkout"}</span>
                        </div>
                        <div className="border-t border-secondary/10 pt-3 flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span>{formatPrice(cart.total)}</span>
                        </div>
                    </div>
                    <Link
                        href="/checkout"
                        className="block w-full bg-secondary text-white text-xs font-bold tracking-widest uppercase py-4 text-center hover:bg-secondary/85 transition-colors"
                    >
                        Proceed to Checkout
                    </Link>
                    <Link href="/shop" className="block text-center text-xs text-secondary/40 hover:text-secondary mt-4 transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
