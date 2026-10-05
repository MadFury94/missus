// Shared types and defaults — no Node.js imports, safe for client and server

export interface HeroSlide {
    src: string;
    mobileSrc?: string;
    label?: string;
    heading: string;
    sub: string;
    cta: { label: string; href: string };
    cta2?: { label: string; href: string };
}

export interface HomepageContent {
    announcement: string;
    marquee: string[];
    hero: HeroSlide[];
    styleRadar: { title: string; href: string; img: string }[];
    categories: {
        feature: { label: string; href: string; img: string };
        grid: { label: string; href: string; img: string }[];
    };
    newsletter: {
        heading: string;
        sub: string;
    };
}

export const HOMEPAGE_DEFAULTS: HomepageContent = {
    announcement: "FREE SHIPPING ON ORDERS ₦150,000+  |  NEW ARRIVALS EVERY WEEK  |  PAY ON DELIVERY AVAILABLE",
    marquee: [
        "Style for the Modern Man",
        "New Drops Weekly",
        "Crafted for Confidence",
        "Shop Shirts ? Trousers ? Native Wear",
        "Nationwide Delivery Across Nigeria",
    ],
    hero: [
        {
            src: "/Desktop view 1.jpg",
            mobileSrc: "/Mobile View 1.WEBP",
            label: "The Edit",
            heading: "Made for\nHim.",
            sub: "Affordable luxury menswear for the modern Nigerian man.",
            cta: { label: "Shop Now", href: "/shop" },
            cta2: { label: "What's New", href: "/category/whats-new" },
        },
        {
            src: "/Desktop view 3.WEBP",
            mobileSrc: "/Mobile View 2.WEBP",
            label: "New Drops",
            heading: "Dress with\nConfidence.",
            sub: "New drops every week, from premium shirts and trousers to native wear and accessories.",
            cta: { label: "Shop New In", href: "/new-in" },
            cta2: { label: "View Sale", href: "/sale" },
        },
    ],
    styleRadar: [
        { title: "The Camp-Collar Edit", href: "/category/shirts", img: "/wearlux/images/wearlux%20(1).jpeg" },
        { title: "Native Textures", href: "/category/native-wear", img: "/wearlux/images/wearlux%20(7).jpeg" },
        { title: "Weekend Trousers", href: "/category/trousers", img: "/wearlux/images/wearlux%20(20).jpeg" },
        { title: "Statement Layers", href: "/category/casual-wear", img: "/wearlux/images/wearlux%20(35).jpeg" },
    ],
    categories: {
        feature: {
            label: "Shirts",
            href: "/category/shirts",
            img: "/wearlux/images/wearlux%20(19).jpeg",
        },
        grid: [
            {
                label: "Two-Piece Sets",
                href: "/category/two-piece-sets",
                img: "/wearlux/images/wearlux%20(26).jpeg",
            },
            {
                label: "Trousers",
                href: "/category/trousers",
                img: "/wearlux/images/wearlux%20(25).jpeg",
            },
            {
                label: "Kaftans",
                href: "/category/kaftans",
                img: "/wearlux/images/wearlux%20(7).jpeg",
            },
            {
                label: "Casual Wear",
                href: "/category/casual-wear",
                img: "/wearlux/images/wearlux%20(33).jpeg",
            },
        ],
    },
    newsletter: {
        heading: "Join the WearLux List",
        sub: "Early drops, styling advice & exclusive offers — straight to your inbox.",
    },
};
