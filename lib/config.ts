import { BRAND_CONFIG } from "./brand-config";
import { STORE_CONFIG } from "./store-config";

export const SITE_NAME = BRAND_CONFIG.name;
export const SITE_URL = STORE_CONFIG.siteUrl;
export const CURRENCY_SYMBOL = "₦";
export const FREE_SHIPPING_THRESHOLD = 150000;

// ──────────────────────────────────────────────────────────────────────────
// CENTRALIZED API CONFIGURATION
// Change these URLs in one place for seamless WordPress subdomain migration
// ──────────────────────────────────────────────────────────────────────────

// WordPress/WooCommerce Base URLs - MODIFY THESE FOR MIGRATION
export const WP_BASE_URL = STORE_CONFIG.wordpressUrl.replace(/\/$/, "");
export const WP_MEDIA_BASE = STORE_CONFIG.endpoints.media || `${WP_BASE_URL}/wp-content/uploads`;

// Derived API endpoints (automatically update when base URLs change)
export const API_ENDPOINTS = {
    // WooCommerce Store API (public, no auth)
    woocommerce: {
        store: STORE_CONFIG.endpoints.store || `${WP_BASE_URL}/wp-json/wc/store/v1`,
        rest: STORE_CONFIG.endpoints.rest || `${WP_BASE_URL}/wp-json/wc/v3`,
    },

    // WordPress Core API
    wordpress: {
        core: STORE_CONFIG.endpoints.core || `${WP_BASE_URL}/wp-json`,
        settings: `${WP_BASE_URL}/wp-json/wp/v2/settings`,
        media: `${WP_BASE_URL}/wp-json/wp/v2/media`,
    },

    // Custom APIs
    custom: {
        giftCards: STORE_CONFIG.endpoints.custom || `${WP_BASE_URL}/wp-json/missus/v1`,
        homepage: `${WP_BASE_URL}/wp-json/wp/v2/homepage_settings`,
    },

    // Static Assets
    assets: {
        uploads: WP_MEDIA_BASE,
        products: `${WP_MEDIA_BASE}/2025/09`, // Product photos base path
        banners: `${WP_MEDIA_BASE}/2026/02`,  // Banner images
        categories: `${WP_MEDIA_BASE}/2026/03`, // Category images
    }
} as const;

// WordPress request headers (with proper origin)
export const WP_HEADERS = {
    "Content-Type": "application/json",
    "Referer": WP_BASE_URL,
    "Origin": WP_BASE_URL,
} as const;

// Fetch timeout settings
export const WP_FETCH_TIMEOUT = process.env.NODE_ENV === "development" ? 4000 : 12000;

export const SOCIAL_LINKS = {
    instagram: BRAND_CONFIG.social.instagram,
    tiktok: BRAND_CONFIG.social.tiktok,
    snapchat: BRAND_CONFIG.social.snapchat,
    facebook: BRAND_CONFIG.social.facebook,
    youtube: BRAND_CONFIG.social.youtube,
    // TODO: replace with the real business WhatsApp number e.g. "https://wa.me/2348012345678"
    whatsapp: BRAND_CONFIG.social.whatsapp,
};

export const ANNOUNCEMENT = "FREE SHIPPING ON ORDERS ₦150,000+  |  NEW ARRIVALS EVERY WEEK  |  PAY ON DELIVERY AVAILABLE";

export const TOP_NAV = [
    { label: "WOMEN", href: "/shop" },
    { label: "CURVE+", href: "/category/curve" },
    { label: "NEW DROPS", href: "/new-in", isNew: true },
    { label: "GIFT SHOP", href: "/category/gift-shop" },
    { label: "BEAUTY", href: "/category/beauty" },
];

export const SUB_NAV = [
    { label: "What's New", href: "/category/whats-new", hot: true },
    { label: "Shop All", href: "/shop" },
    { label: "Dresses", href: "/category/dresses" },
    { label: "Matching Sets", href: "/category/matching-sets" },
    { label: "Tops", href: "/category/tops" },
    { label: "Bottoms", href: "/category/bottoms" },
    { label: "Athleisure", href: "/category/athleisure-loungewear" },
    { label: "Gift Shop", href: "/category/gift-shop" },
    { label: "Sale", href: "/sale", sale: true },
];

export const FOOTER_LINKS = {
    Help: [
        { label: "FAQ", href: "/faq" },
        { label: "Shipping Info", href: "/shipping" },
        { label: "Returns", href: "/returns" },
        { label: "Size Guide", href: "/size-guide" },
        { label: "Contact Us", href: "/contact" },
    ],
    Company: [
        { label: "About Missus", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Want to Collab?", href: "/contact#collab" },
    ],
    Legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
    ],
};

export const MARQUEE_ITEMS = [
    "Miss Us With The Ugly Clothes",
    "New Drops Weekly",
    "It-Girl Approved",
    "Shop Dresses · Tops · Sets",
    "Lagos Same Day Delivery",
];

export const TRUST_ITEMS = [
    { title: "Lagos: 1–2 Hours", sub: "Express delivery available", icon: "truck" },
    { title: "Secure Checkout", sub: "100% safe & encrypted", icon: "shield" },
    { title: "24/7 DM Support", sub: "Reply within 1 hour", icon: "chat" },
];

export const STATIC_REVIEWS = [
    { stars: 5, text: "Got my last Club fit from Missus and they delivered literally 1hr after I ordered. Never going back to anyone else!", name: "Sarah O.", meta: "Verified Buyer · Lagos" },
    { stars: 5, text: "Stopped shopping on Fashionnova after I found Missus. Missus is really for the IT girls. Period.", name: "Jess A.", meta: "Verified Buyer · Abuja" },
    { stars: 5, text: "I bought the Girls Night Out dress and it was absolutely perfect. The fit, the quality, everything. Missus can have all my money.", name: "Audrey M.", meta: "Verified Buyer · Port Harcourt" },
    { stars: 5, text: "Can't wait for the Lagos girlies to find out about Missus. The prices are unreal for the quality. Missus literally saves the day, everytime.", name: "Lota N.", meta: "Verified Buyer · Lagos" },
];

export const TREND_CARDS = [
    { label: "Night Out", title: "Club Night\nEnergy", bg: "#e8ddd5", href: "/category/night-out" },
    { label: "Resort Escape", title: "Resort\nEscape", bg: "#dde5e8", href: "/category/vacation" },
    { label: "Spring Sets", title: "Spring\nEssentials", bg: "#e8e5dd", href: "/category/matching-sets" },
    { label: "Prom Queen", title: "Prom Queen\nEnergy", bg: "#e8dde0", href: "/category/formal" },
];

export const CATEGORY_CARDS = [
    { label: "Dresses", sub: "Shop Dresses", href: "/category/dresses", abbr: "D", bg: "linear-gradient(135deg,#1a1a2e,#2d1b34)", tall: true, img: `${API_ENDPOINTS.assets.products}/Product-Photos-Your-Story-8.png` },
    { label: "Matching Sets", sub: "Shop Sets", href: "/category/matching-sets", abbr: "MS", bg: "linear-gradient(135deg,#1a2e1a,#2d341b)", img: `${API_ENDPOINTS.assets.products}/Product-Photos-Your-Story-27.png` },
    { label: "Tops", sub: "Shop Tops", href: "/category/tops", abbr: "T", bg: "linear-gradient(135deg,#2e1a1a,#341b2d)", img: `${API_ENDPOINTS.assets.products}/Product-Photos-Your-Story-17.png` },
    { label: "Bottoms", sub: "Shop Bottoms", href: "/category/bottoms", abbr: "B", bg: "linear-gradient(135deg,#1a2a2e,#1b2e2e)", img: `${API_ENDPOINTS.assets.products}/Product-Photos-Your-Story-22.png` },
    { label: "Athleisure", sub: "Shop Athleisure", href: "/category/athleisure-loungewear", abbr: "A", bg: "linear-gradient(135deg,#2e2a1a,#2e1a1a)", img: null },
    { label: "Gift Shop", sub: "Shop Gifts", href: "/category/gift-shop", abbr: "G", bg: "linear-gradient(135deg,#1a1a1a,#2e2e2e)", img: null },
];
