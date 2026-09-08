import { SITE_URL } from "@/lib/config";
import { BRAND_CONFIG } from "@/lib/seo-config";
import type { StoreProduct, StoreCategory } from "@/lib/woocommerce";

// Organization Schema
export function getOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: BRAND_CONFIG.name,
        description: BRAND_CONFIG.description,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        image: `${SITE_URL}/og-image.jpg`,
        sameAs: [
            `https://instagram.com/${BRAND_CONFIG.social.instagram.replace('@', '')}`,
            `https://twitter.com/${BRAND_CONFIG.social.twitter.replace('@', '')}`,
            `https://facebook.com/${BRAND_CONFIG.social.facebook}`,
            `https://tiktok.com/${BRAND_CONFIG.social.tiktok.replace('@', '')}`
        ],
        address: {
            "@type": "PostalAddress",
            addressCountry: "NG",
            addressLocality: "Lagos"
        },
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "Customer Service",
            email: "hello@missusoutfits.com",
            availableLanguage: "English"
        }
    };
}

// Website Schema
export function getWebsiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: BRAND_CONFIG.name,
        url: SITE_URL,
        description: BRAND_CONFIG.description,
        publisher: {
            "@type": "Organization",
            name: BRAND_CONFIG.name
        },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };
}

// Breadcrumb Schema
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };
}

// Product Schema
export function getProductSchema(product: StoreProduct) {
    const baseUrl = SITE_URL.replace(/\/$/, "");

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.short_description?.replace(/<[^>]+>/g, "") || product.description?.replace(/<[^>]+>/g, ""),
        image: product.images?.[0]?.src || "",
        sku: product.sku || product.id.toString(),
        brand: {
            "@type": "Brand",
            name: BRAND_CONFIG.name
        },
        offers: {
            "@type": "Offer",
            price: product.prices?.price ? (parseInt(product.prices.price) / 100).toString() : "0",
            priceCurrency: "NGN",
            availability: product.stock_status === "instock"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: BRAND_CONFIG.name
            },
            url: `${baseUrl}/product/${product.slug}`,
            priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        category: product.categories?.[0]?.name || "Fashion",
        url: `${baseUrl}/product/${product.slug}`
    };
}

// Category/Collection Schema
export function getCollectionPageSchema(category: StoreCategory, products: StoreProduct[]) {
    const baseUrl = SITE_URL.replace(/\/$/, "");

    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${category.name} - ${BRAND_CONFIG.name}`,
        description: category.description?.replace(/<[^>]+>/g, "") || `Shop ${category.name} collection at ${BRAND_CONFIG.name}`,
        url: `${baseUrl}/category/${category.slug}`,
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: products.length,
            itemListElement: products.slice(0, 20).map((product, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                    "@type": "Product",
                    name: product.name,
                    url: `${baseUrl}/product/${product.slug}`,
                    image: product.images?.[0]?.src,
                    offers: {
                        "@type": "Offer",
                        price: product.prices?.price ? (parseInt(product.prices.price) / 100).toString() : "0",
                        priceCurrency: "NGN"
                    }
                }
            }))
        }
    };
}

// FAQ Schema
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(faq => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer
            }
        }))
    };
}

// Local Business Schema (if applicable)
export function getLocalBusinessSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        name: BRAND_CONFIG.name,
        description: BRAND_CONFIG.description,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        image: `${SITE_URL}/og-image.jpg`,
        priceRange: "₦₦-₦₦₦",
        address: {
            "@type": "PostalAddress",
            addressCountry: "NG",
            addressLocality: "Lagos"
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: "6.5244",
            longitude: "3.3792"
        },
        telephone: "+234-xxx-xxx-xxxx",
        email: "hello@missusoutfits.com",
        openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
            ],
            opens: "00:00",
            closes: "23:59"
        },
        sameAs: [
            `https://instagram.com/${BRAND_CONFIG.social.instagram.replace('@', '')}`,
            `https://twitter.com/${BRAND_CONFIG.social.twitter.replace('@', '')}`,
            `https://facebook.com/${BRAND_CONFIG.social.facebook}`
        ]
    };
}