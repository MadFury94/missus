/**
 * Wearlux's single integration switch. Restart/rebuild after changing this file.
 * 1. Set wordpressUrl (and optional endpoint overrides) to the NEW store.
 * 2. Add the NEW store's secrets to its environment, never to this file.
 * 3. Change mode to "wordpress". All storefront adapters switch together.
 * Old WP_* / WC_API_URL environment URLs are deliberately not used here.
 */
export const STORE_CONFIG: {
    mode: "demo" | "wordpress";
    wordpressUrl: string;
    siteUrl: string;
    bankTransfer: { bankName: string; accountName: string; accountNumber: string };
    endpoints: { store: string; rest: string; core: string; custom: string; media: string };
} = {
    mode: "demo",
    wordpressUrl: "https://cms.wearlux.example",
    siteUrl: "http://localhost:3002",
    // Public payment instructions for the NEW store only. Blank disables bank transfer.
    bankTransfer: { bankName: "", accountName: "", accountNumber: "" },
    // Leave blank to derive standard WooCommerce/WordPress paths from wordpressUrl.
    endpoints: { store: "", rest: "", core: "", custom: "", media: "" },
};

export const IS_DEMO_STORE = STORE_CONFIG.mode === "demo";
export const BANK_TRANSFER_ENABLED = Object.values(STORE_CONFIG.bankTransfer).every(value => value.trim().length > 0);
