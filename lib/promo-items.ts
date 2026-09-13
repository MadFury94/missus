export interface PromoItem {
    name?: string;
    slug?: string;
    price: number;
    regularPrice?: number;
    quantity: number;
}

export function isPromoEligible(item: PromoItem): boolean {
    // Keep the existing sale/gift exclusions, but apply them per item.
    const isGift = item.name?.toLowerCase().includes("gift") ||
        item.slug?.toLowerCase().includes("gift") || item.name?.toLowerCase().includes("box");
    return !isGift && !(item.regularPrice !== undefined && item.price < item.regularPrice);
}

export function eligiblePromoSubtotal(items: PromoItem[]): number {
    return items.reduce((sum, item) => sum + (isPromoEligible(item)
        ? Math.round(item.price * item.quantity * 100) : 0), 0) / 100;
}

// Allocate in kobo, proportionally, retaining every rounding remainder.
export function allocatePromoDiscount(items: PromoItem[], discount: number): number[] {
    let remaining = Math.round(discount * 100);
    let eligible = Math.round(eligiblePromoSubtotal(items) * 100);
    if (!Number.isSafeInteger(remaining) || remaining < 0 || remaining > eligible) {
        throw new Error("Discount exceeds eligible items' total");
    }
    return items.map(item => {
        if (!isPromoEligible(item)) return 0;
        const amount = Math.round(item.price * item.quantity * 100);
        const reduction = eligible > 0 ? Math.min(amount, Math.round(remaining * amount / eligible)) : 0;
        remaining -= reduction;
        eligible -= amount;
        return reduction;
    });
}
