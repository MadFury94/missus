"use client";
import { getCart, removeCartSelections } from "./cart";
import { addToWishlist, isInWishlist } from "./wishlist";
import type { CartItem } from "@/types";

export async function checkCheckoutStock() {
    const snapshot = getCart();
    if (!snapshot.items.length) return { cart: snapshot, removed: [], changed: false };
    const response = await fetch("/api/cart/check-stock", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: snapshot.items }),
    });
    const data = await response.json();
    if (!response.ok || !Array.isArray(data.unavailable)) {
        throw new Error(data.error || "Could not check stock. Please try again.");
    }
    // A response for an older cart must never remove a newly selected item.
    if (JSON.stringify(getCart().items) !== JSON.stringify(snapshot.items)) {
        return { cart: getCart(), removed: [], changed: true };
    }
    const removed: CartItem[] = data.unavailable;
    for (const item of removed) {
        addToWishlist(item);
        if (!isInWishlist(item.productId)) {
            throw new Error("We could not save an item to your wishlist. Your cart has not been changed. Please try again.");
        }
    }
    return { cart: removed.length ? removeCartSelections(removed) : snapshot, removed, changed: removed.length > 0 };
}
