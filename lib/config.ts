export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Missus";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const CURRENCY_SYMBOL = "₦";
export const FREE_SHIPPING_THRESHOLD = 150000;

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
    { label: "MissusDeals", href: "/sale", sale: true },
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
        { label: "Help Center", href: "/help" },
        { label: "Track Order", href: "/track" },
        { label: "Shipping Info", href: "/shipping" },
        { label: "Returns", href: "/returns" },
        { label: "Contact Us", href: "/contact" },
    ],
    Company: [
        { label: "About Missus", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Sustainability", href: "/sustainability" },
        { label: "Want to Collab?", href: "/collab" },
    ],
    "Quick Links": [
        { label: "Size Guide", href: "/size-guide" },
        { label: "Gift Cards", href: "/gift-cards" },
        { label: "Sitemap", href: "/sitemap.xml" },
        { label: "Refer a Friend", href: "/refer" },
        { label: "Affiliate Program", href: "/affiliate" },
    ],
    Legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Accessibility", href: "/accessibility" },
    ],
};

export const MARQUEE_ITEMS = [
    "Free Delivery ₦150k+",
    "New Drops Weekly",
    "Pay On Delivery",
    "It-Girl Approved",
    "Shop Dresses · Tops · Sets",
    "Lagos 1-Hour Delivery",
];

export const TRUST_ITEMS = [
    { title: "Lagos: 1–2 Hours", sub: "Express delivery available", icon: "truck" },
    { title: "Easy Returns", sub: "7-day hassle-free returns", icon: "return" },
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
    { label: "Dresses", sub: "Shop Dresses →", href: "/category/dresses", abbr: "D", bg: "linear-gradient(135deg,#1a1a2e,#2d1b34)", tall: true, img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-8.png" },
    { label: "Matching Sets", sub: "Shop Sets →", href: "/category/matching-sets", abbr: "MS", bg: "linear-gradient(135deg,#1a2e1a,#2d341b)", img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-27.png" },
    { label: "Tops", sub: "Shop Tops →", href: "/category/tops", abbr: "T", bg: "linear-gradient(135deg,#2e1a1a,#341b2d)", img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-17.png" },
    { label: "Bottoms", sub: "Shop Bottoms →", href: "/category/bottoms", abbr: "B", bg: "linear-gradient(135deg,#1a2a2e,#1b2e2e)", img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-22.png" },
    { label: "Athleisure", sub: "Shop Athleisure →", href: "/category/athleisure-loungewear", abbr: "A", bg: "linear-gradient(135deg,#2e2a1a,#2e1a1a)", img: null },
    { label: "Gift Shop", sub: "Shop Gifts →", href: "/category/gift-shop", abbr: "G", bg: "linear-gradient(135deg,#1a1a1a,#2e2e2e)", img: null },
];
