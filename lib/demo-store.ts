import type { StoreProduct, StoreCategory } from "./woocommerce";
import type { CartItem } from "@/types";
import type { ProductStock } from "./product-stock";
import type { ShippingRate } from "./woocommerce-shipping";

// Product fixtures use the numbered WearLux photography set in public/wearlux/images.
const photos = Array.from({ length: 100 }, (_, index) => `/wearlux/images/wearlux%20(${index + 1}).jpeg`);
const categoryNames = ["Two-Piece Sets", "Casual Shorts", "Linen Shirts", "Crop Shirts", "T-Shirts", "Linen Pants", "Casual Pants", "Denim Pants & Jeans", "Denim Shorts", "Whats New", "Discount Sale"];
const categorySlugs = ["two-piece-sets", "casual-shorts", "linen-shirts", "crop-shirts", "t-shirts", "linen-pants", "casual-pants", "denim-pants-jeans", "denim-shorts", "whats-new", "discount-sale"];
const categories = categoryNames.map((name, index) => ({ id: index + 1, name, slug: categorySlugs[index] }));
const samples: [string, number, number, string[]][] = [
    ["Lagos Linen Camp-Collar Shirt", 42000, 52000, ["linen-shirts", "crop-shirts"]],
    ["Sandstone Resort Shirt", 38500, 38500, ["linen-shirts", "t-shirts"]],
    ["Modern Senator Two-Piece", 55000, 65000, ["two-piece-sets", "linen-pants"]],
    ["Everyday Cotton Co-Ord", 32000, 32000, ["two-piece-sets", "casual-pants"]],
    ["Structured Oxford Shirt", 18000, 18000, ["linen-shirts", "crop-shirts"]],
    ["Evening Silk Blend Crop Shirt", 24500, 29000, ["crop-shirts", "t-shirts"]],
    ["Tailored Linen Pants", 35000, 35000, ["linen-pants", "casual-pants"]],
    ["Weekend Chino Shorts", 19500, 19500, ["casual-shorts", "denim-shorts"]],
    ["Essential Knit T-Shirt", 36000, 44000, ["t-shirts", "casual-pants"]],
    ["Midnight Casual Pants", 62000, 62000, ["casual-pants", "linen-shirts"]],
    ["Relaxed Denim Jeans", 12000, 15000, ["denim-pants-jeans", "denim-shorts"]],
    ["Classic Denim Shorts", 14500, 14500, ["denim-shorts", "t-shirts"]],
];

export const DEMO_PRODUCTS: StoreProduct[] = samples.map(([name, price, regular, slugs], index) => {
    const id = 900001 + index;
    const slug = name.toLowerCase().replaceAll(" ", "-");
    const sizes = index >= 10 ? ["One Size"] : ["S", "M", "L", "XL"];
    const color = ["Black", "Cream", "Rose", "Coffee"][index % 4];
    const onSale = price < regular;
    const imageStart = (index * 5) % photos.length;
    const imageSet = Array.from({ length: 5 }, (_, imageIndex) => photos[(imageStart + imageIndex) % photos.length]);
    return {
        id, name, slug, permalink: `/product/${slug}`, type: "variable",
        short_description: `<p>A Wearlux sample piece for exploring your new store.</p>`,
        description: `<p>${name}: an effortless addition to your wardrobe. This sample product uses illustrative photography and is available for demo checkout only.</p>`,
        on_sale: onSale,
        prices: { price: String(price * 100), regular_price: String(regular * 100), sale_price: onSale ? String(price * 100) : "", currency_symbol: "₦", currency_minor_unit: 2 },
        price_html: `₦${price.toLocaleString("en-NG")}`, average_rating: "0", review_count: 0,
        images: imageSet.slice(0, 5).map((src, imageIndex) => ({ id: id * 10 + imageIndex, src, thumbnail: src, alt: `${name} — illustrative editorial photograph ${imageIndex + 1}` })),
        categories: categories.filter(c => [...slugs, "whats-new", ...(onSale ? ["discount-sale"] : [])].includes(c.slug)),
        tags: [],
        attributes: [
            { id: 1, name: "Size", taxonomy: "pa_size", has_variations: true, terms: sizes.map((name, i) => ({ id: i + 1, name, slug: name.toLowerCase().replaceAll(" ", "-") })) },
            { id: 2, name: "Color", taxonomy: "pa_color", has_variations: true, terms: [{ id: 1, name: color, slug: color.toLowerCase() }] },
        ],
        variations: sizes.map((size, i) => ({ id: id * 10 + i, attributes: [{ name: "Size", value: size }, { name: "Color", value: color }] })),
        is_in_stock: true, stock_status: "instock", stock_quantity: 10, sku: `WEARLUX-DEMO-${index + 1}`,
    };
});

export const DEMO_CATEGORIES: StoreCategory[] = categories.map(category => ({
    ...category, description: `Explore Wearlux ${category.name.toLowerCase()}.`, parent: 0,
    count: DEMO_PRODUCTS.filter(p => p.categories.some(c => c.id === category.id)).length,
    image: { src: photos[(category.id - 1) % photos.length], thumbnail: photos[(category.id - 1) % photos.length], alt: category.name },
    permalink: `/category/${category.slug}`,
}));

/** Store API shaped fixtures shared by server rendering and browser API routes. */
export function demoStoreRead<T>(path: string): T {
    const url = new URL(path, "https://demo.invalid");
    const q = url.searchParams;
    if (url.pathname === "/products/categories") return structuredClone(DEMO_CATEGORIES) as T;
    const productId = url.pathname.match(/^\/products\/(\d+)$/)?.[1];
    if (productId) return structuredClone(DEMO_PRODUCTS.find(p => p.id === Number(productId)) ?? null) as T;
    if (url.pathname !== "/products") throw new Error(`Unsupported demo catalog path: ${url.pathname}`);
    let products = [...DEMO_PRODUCTS];
    if (q.get("slug")) products = products.filter(p => p.slug === q.get("slug"));
    if (q.get("search")) products = products.filter(p => `${p.name} ${p.categories.map(c => c.name).join(" ")}`.toLowerCase().includes(q.get("search")!.trim().toLowerCase()));
    if (q.get("category")) products = products.filter(p => p.categories.some(c => q.get("category")!.split(",").includes(c.slug) || q.get("category")!.split(",").includes(String(c.id))));
    if (q.get("on_sale") === "true") products = products.filter(p => p.on_sale);
    for (const key of ["include", "exclude"]) {
        if (q.get(key)) products = products.filter(p => q.get(key)!.split(",").includes(String(p.id)) === (key === "include"));
    }
    const sort = q.get("orderby");
    if (sort === "price") products.sort((a, b) => Number(a.prices.price) - Number(b.prices.price));
    else if (sort === "title") products.sort((a, b) => a.name.localeCompare(b.name));
    else products.sort((a, b) => a.id - b.id);
    if (q.get("order") === "desc") products.reverse();
    const limit = Math.max(1, Math.min(100, Number(q.get("per_page")) || 60));
    const page = Math.max(1, Number(q.get("page")) || 1);
    return structuredClone(products.slice((page - 1) * limit, page * limit)) as T;
}

export function demoProductStock(productId: number): ProductStock {
    const product = DEMO_PRODUCTS.find(p => p.id === productId);
    return { productId, variable: !!product, available: !!product, variants: product?.variations.map(v => ({ id: v.id, available: true, attributes: v.attributes.map(a => ({ name: a.name, option: a.value })) })) ?? [] };
}

/** Canonical prices/names come from fixtures, never from submitted cart totals. */
export function demoCart(input: unknown): CartItem[] {
    if (!Array.isArray(input) || !input.length || input.length > 100) throw new Error("Add products to your bag first.");
    const quantities = new Map<number, number>();
    return input.map(item => {
        if (!item || !Number.isSafeInteger(item.productId) || !Number.isSafeInteger(item.quantity) || item.quantity < 1) throw new Error("Invalid product or quantity.");
        const product = DEMO_PRODUCTS.find(p => p.id === item.productId);
        if (!product) throw new Error("This product is no longer available. Please update your bag.");
        const variant = product.variations.find(v => v.attributes.every(a => a.value === (a.name === "Size" ? item.size : item.color)));
        if (!variant || (item.variationId !== undefined && item.variationId !== variant.id)) throw new Error(`Choose a valid size and colour for ${product.name}.`);
        const quantity = (quantities.get(variant.id) ?? 0) + item.quantity;
        if (quantity > 10) throw new Error(`Only 10 of this selection are available: ${product.name}.`);
        quantities.set(variant.id, quantity);
        return { productId: product.id, variationId: variant.id, name: product.name, slug: product.slug, image: product.images[0].src, price: Number(product.prices.price) / 100, regularPrice: Number(product.prices.regular_price) / 100, quantity: item.quantity, size: item.size, color: item.color };
    });
}

export function demoDiscount(code: string, items: CartItem[]) {
    if (!code) return 0;
    if (code.trim().toUpperCase() !== "WEARLUX10") throw new Error("Try WEARLUX10 for 10% off in this demo.");
    return Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 10) / 100;
}

export function demoShipping(state: string, items: CartItem[], coupon = ""): ShippingRate[] {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0) - demoDiscount(coupon, items);
    const standard = /^(lagos|la)$/i.test(state.trim()) ? 350000 : 650000;
    return [
        { rate_id: "demo_standard", carrier_name: "Standard delivery", amount: subtotal >= 150000 ? 0 : standard, currency: "NGN", delivery_time: "3–5 business days", method_id: "flat_rate", instance_id: 1, is_free_standard: subtotal >= 150000 },
        { rate_id: "demo_express", carrier_name: "Express delivery", amount: standard + 300000, currency: "NGN", delivery_time: "1–2 business days", method_id: "flat_rate", instance_id: 2 },
    ];
}
