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
            src: "/Desktop view 1.jpg",
            label: "The Edit",
            heading: "Made for\nHer.",
            sub: "Trend-forward, affordable fashion for the modern Nigerian girl.",
            cta: { label: "Shop Now", href: "/shop" },
            cta2: { label: "What's New", href: "/category/whats-new" },
        },
        {
            src: "/Desktop view 3.WEBP",
            label: "New Drops",
            heading: "Dress Like\nHer.",
            sub: "New arrivals every week. Be the first to wear what everyone else will be talking about.",
            cta: { label: "Shop New In", href: "/new-in" },
            cta2: { label: "View Sale", href: "/sale" },
        },
    ],
    styleRadar: [
        { title: "Croquetish", href: "/category/dresses", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-96.jpeg" },
        { title: "Flights Sans Feelings", href: "/category/dresses", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg" },
        { title: "Birthday Behavior", href: "/category/matching-sets", img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-27.png" },
        { title: "Table For Two", href: "/category/dresses", img: "https://missusoutfits.com/wp-content/uploads/2026/03/Leila-Halter-Mini-Dress.jpg" },
    ],
    newsletter: {
        heading: "Join Missus Girls Club",
        sub: "Early drops, exclusive deals & style inspo — straight to your inbox.",
    },
};

export type HomepageContent = typeof HOMEPAGE_DEFAULTS;
