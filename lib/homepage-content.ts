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
        "Miss Us With The Ugly Clothes",
        "New Drops Weekly",
        "It-Girl Approved",
        "Shop Dresses · Tops · Sets",
        "Lagos Same Day Delivery",
    ],
    hero: [
        {
            src: "/Desktop view 1.jpg",
            mobileSrc: "/Mobile View 1.WEBP",
            label: "The Edit",
            heading: "Made for\nHer.",
            sub: "Trend-forward, affordable fashion for the modern Nigerian girl.",
            cta: { label: "Shop Now", href: "/shop" },
            cta2: { label: "What's New", href: "/category/whats-new" },
        },
        {
            src: "/Desktop view 3.WEBP",
            mobileSrc: "/Mobile View 2.WEBP",
            label: "New Drops",
            heading: "Dress Like\nHer.",
            sub: "New arrivals every week. Be the first to wear what everyone else will be talking about.",
            cta: { label: "Shop New In", href: "/new-in" },
            cta2: { label: "View Sale", href: "/sale" },
        },
    ],
    styleRadar: [
        { title: "Resort Ready", href: "/category/dresses", img: "/style%20radar/Resort%20Ready.JPEG" },
        { title: "Flights Sans Feelings", href: "/category/dresses", img: "/style%20radar/Flights%20Sans%20feelings.JPEG" },
        { title: "Birthday Behavior", href: "/category/matching-sets", img: "/style%20radar/Birthday%20behavior.jpeg" },
        { title: "Table For Two", href: "/category/dresses", img: "/style%20radar/Table%20for%20two.jpeg" },
    ],
    categories: {
        feature: {
            label: "Dresses",
            href: "/category/dresses",
            img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-8.png",
        },
        grid: [
            {
                label: "Matching Sets",
                href: "/category/matching-sets",
                img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-27.png",
            },
            {
                label: "Bottoms",
                href: "/category/bottoms",
                img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-22.png",
            },
            {
                label: "Tops",
                href: "/category/tops",
                img: "https://missusoutfits.com/wp-content/uploads/2025/09/Product-Photos-Your-Story-17.png",
            },
            {
                label: "Athleisure & Loungewear",
                href: "/category/athleisure-loungewear",
                img: "https://missusoutfits.com/wp-content/uploads/2026/03/Product-Photos-88.jpeg",
            },
        ],
    },
    newsletter: {
        heading: "Join Missus Girls Club",
        sub: "Early drops, exclusive deals & style inspo — straight to your inbox.",
    },
};
