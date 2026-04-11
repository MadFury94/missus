// Wishlist management using localStorage

export interface WishlistItem {
    productId: number;
    name: string;
    price: number;
    image: string;
    slug: string;
}

const WISHLIST_KEY = "missus_wishlist";

// Get wishlist from localStorage
export function getWishlist(): WishlistItem[] {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(WISHLIST_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

// Save wishlist to localStorage
function saveWishlist(items: WishlistItem[]): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
        // Dispatch custom event for navbar to update count
        window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
        console.error("Failed to save wishlist:", err);
    }
}

// Add item to wishlist
export function addToWishlist(item: WishlistItem): void {
    const wishlist = getWishlist();
    const exists = wishlist.find((i) => i.productId === item.productId);
    if (!exists) {
        wishlist.push(item);
        saveWishlist(wishlist);
    }
}

// Remove item from wishlist
export function removeFromWishlist(productId: number): void {
    const wishlist = getWishlist();
    const filtered = wishlist.filter((i) => i.productId !== productId);
    saveWishlist(filtered);
}

// Check if item is in wishlist
export function isInWishlist(productId: number): boolean {
    const wishlist = getWishlist();
    return wishlist.some((i) => i.productId === productId);
}

// Toggle item in wishlist
export function toggleWishlist(item: WishlistItem): boolean {
    if (isInWishlist(item.productId)) {
        removeFromWishlist(item.productId);
        return false;
    } else {
        addToWishlist(item);
        return true;
    }
}

// Get wishlist count
export function getWishlistCount(): number {
    return getWishlist().length;
}

// Clear wishlist
export function clearWishlist(): void {
    saveWishlist([]);
}
