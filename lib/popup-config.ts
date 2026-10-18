/**
 * Popup discount config — single source of truth.
 * Both popup copy and the coupon code reference this file.
 * Update COUPON_CODE when you create a new WooCommerce coupon.
 */

export const POPUP_CONFIG = {
    // The WooCommerce coupon code Klaviyo will reference in the welcome email
    couponCode: "SUMMER15",

    // Displayed in popup copy
    discountLabel: "15% off",
    discountPercent: 15,

    // Storage keys
    storageKeyA: "missus_popup_a",
    storageKeyB: "missus_popup_b",
    storageKeySubscribed: "missus_popup_subscribed",

    // Timing
    popupADelayMs: 10_000,       // 10 seconds
    popupAScrollPct: 40,          // or 40% scroll depth
    suppressDays: 7,

    // Pages where popups never show
    suppressPaths: ["/cart", "/checkout", "/account", "/track", "/newsletter"],
} as const;
