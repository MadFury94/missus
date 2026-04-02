"use client";
import type { Cart, CartItem } from "@/types";

const CART_KEY = "missus_cart";

export function getCart(): Cart {
    if (typeof window === "undefined") return { items: [], subtotal: 0, total: 0 };
    try {
        const raw = localStorage.getItem(CART_KEY);
        const items: CartItem[] = raw ? JSON.parse(raw) : [];
        return calcCart(items);
    } catch {
        return { items: [], subtotal: 0, total: 0 };
    }
}

export function addToCart(item: CartItem): Cart {
    const cart = getCart();
    const existing = cart.items.findIndex(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
    );
    if (existing >= 0) {
        cart.items[existing].quantity += item.quantity;
    } else {
        cart.items.push(item);
    }
    saveCart(cart.items);
    return calcCart(cart.items);
}

export function updateQuantity(productId: number, size: string | undefined, qty: number): Cart {
    const cart = getCart();
    const idx = cart.items.findIndex((i) => i.productId === productId && i.size === size);
    if (idx >= 0) {
        if (qty <= 0) {
            cart.items.splice(idx, 1);
        } else {
            cart.items[idx].quantity = qty;
        }
    }
    saveCart(cart.items);
    return calcCart(cart.items);
}

export function removeFromCart(productId: number, size?: string): Cart {
    const cart = getCart();
    const items = cart.items.filter(
        (i) => !(i.productId === productId && i.size === size)
    );
    saveCart(items);
    return calcCart(items);
}

export function clearCart(): void {
    if (typeof window !== "undefined") localStorage.removeItem(CART_KEY);
}

function saveCart(items: CartItem[]): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
}

function calcCart(items: CartItem[]): Cart {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { items, subtotal, total: subtotal };
}

export function cartCount(cart: Cart): number {
    return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}
