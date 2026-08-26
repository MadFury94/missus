// Shared types and defaults — no Node.js imports, safe for client and server

export const HOMEPAGE_DEFAULTS = {
    announcement: "FREE SHIPPING ON ORDERS ₦150,000+  |  NEW ARRIVALS EVERY WEEK  |  PAY ON DELIVERY AVAILABLE",
    marquee: [
        "Miss Us With The Ugly Clothes",
        "New Drops Weekly",
        "It-Girl Approved",
        "Shop Dresses · Tops · Sets",
        "Lagos Same Day Delivery",
    ],
    hero: [
        {
            src: "/missus.home.png",
            label: "The Edit",
            heading: "Made for\nHer.",
            sub: "Trend-forward, affordable fashion for the modern Nigerian girl.",
            cta: { label: "Shop Now", href: "/shop" },
            cta2: { label: "What's New", href: "/category/whats-new" },
        },
        {
            src: "/missus-hero.png",
            label: "Spring / Summer 2026",
            heading: "Dress Like\nHer.",
            sub: "Trend-forward, affordable fashion for the modern Nigerian girl. From Lagos to Abuja — we deliver style to your door.",
            cta: { label: "Shop Women", href: "/shop" },
            cta2: { label: "What's New", href: "/category/whats-new" },
        },
        {
            src: "/missus2.png",
            label: "New Drops",
            heading: "Fresh\nFits.",
            sub: "New arrivals every week. Be the first to wear what everyone else will be talking about.",
            cta: { label: "Shop New In", href: "/new-in" },
            cta2: { label: "View Sale", href: "/sale" },
        },
    ],
    styleRadar: [
        { title: "Independence Day Ready", href: "/category/dresses", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-96.jpeg" },
        { title: "Sugar & Spice", href: "/category/dresses", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg" },
        { title: "Night Mode", href: "/category/matching-sets", img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-27.png" },
        { title: "Wife of the Party", href: "/category/dresses", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Leila-Halter-Mini-Dress.jpg" },
    ],
    newsletter: {
        heading: "Join The Missus Circle",
        sub: "Early drops, exclusive deals & style inspo — straight to your inbox.",
    },
};

export type HomepageContent = typeof HOMEPAGE_DEFAULTS;
