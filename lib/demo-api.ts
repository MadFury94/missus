import { demoCart, demoDiscount, demoProductStock, demoShipping, demoStoreRead, DEMO_CATEGORIES } from "./demo-store";
import type { StoreProduct } from "./woocommerce";

/** No fetch, credentials, payment calls, or live writes are used by this adapter. */
export async function handleDemoApi(request: Request, path: string): Promise<Response> {
    const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
    const url = new URL(request.url);
    try {
        if (request.method === "GET") {
            if (path === "products" || path === "search") {
                const query = new URLSearchParams(url.search);
                if (path === "search") query.set("search", query.get("q") || "");
                const products = demoStoreRead<StoreProduct[]>(`/products?${query}`);
                return json({ products, total: products.length });
            }
            if (path.startsWith("products/")) {
                const product = demoStoreRead<StoreProduct[]>(`/products?slug=${encodeURIComponent(decodeURIComponent(path.slice(9)))}`)[0];
                return product ? json({ ...product, attributes: product.attributes.map(a => ({ name: a.name, options: a.terms.map(t => t.name) })) }) : json(null, 404);
            }
            if (path === "categories") return json(DEMO_CATEGORIES.map(c => ({ slug: c.slug, name: c.name, image: c.image?.src })));
            if (path === "stock") {
                const id = Number(url.searchParams.get("productId"));
                if (!Number.isSafeInteger(id) || id <= 0) return json({ error: "Invalid product." }, 400);
                return json(demoProductStock(id));
            }
            if (path === "currency") return json({ demo: true, rates: { NGN: 1, USD: 0.00065, GBP: 0.0005, EUR: 0.0006, CAD: 0.0009, GHS: 0.01, KES: 0.085, ZAR: 0.012 } });
        }
        if (request.method === "POST" && ["cart/validate", "cart/check-stock", "shipping/woocommerce-rates", "promo/validate", "orders"].includes(path)) {
            const body = await request.json();
            if (path === "cart/validate") { demoCart([body.item]); return json({ available: true }); }
            if (path === "cart/check-stock") {
                if (!Array.isArray(body.items) || body.items.length > 100) return json({ error: "Invalid cart." }, 400);
                const unavailable = body.items.filter((item: unknown) => { try { demoCart([item]); return false; } catch { return true; } });
                return json({ unavailable });
            }
            const items = demoCart(body.items ?? body.cart);
            if (path === "promo/validate") {
                if (typeof body.code !== "string" || !body.code.trim()) throw new Error("Enter a discount code.");
                return json({ valid: true, code: "WEARLUX10", discount: demoDiscount(body.code, items), label: "10% off · demo", type: "woocommerce_coupon" });
            }
            if (path === "shipping/woocommerce-rates") {
                if (typeof body.city !== "string" || !body.city.trim() || typeof body.state !== "string" || !body.state.trim()) throw new Error("Enter your delivery city and state.");
                return json({ rates: demoShipping(body.state, items, body.coupon || "") });
            }
            const shipping = body.shipping;
            if (!shipping || ["firstName", "lastName", "email", "phone", "address", "city", "state"].some(key => typeof shipping[key] !== "string" || !shipping[key].trim())) throw new Error("Complete your contact and delivery details.");
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) throw new Error("Enter a valid email address.");
            const rate = demoShipping(shipping.state, items, body.promoCode || "").find(r => r.rate_id === body.selectedRate?.rate_id);
            if (!rate) throw new Error("Choose a delivery option.");
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const discount = demoDiscount(body.promoCode || "", items);
            // Receipt belongs to this browser. No customer details are stored on the server.
            return json({ demo: true, order: { reference: `WL-DEMO-${crypto.randomUUID()}`, createdAt: new Date().toISOString(), items, subtotal, discount, shipping: rate.amount / 100, total: subtotal - discount + rate.amount / 100, deliveryMethod: rate.carrier_name, status: "demo", paid: false } });
        }
        return json({ error: "This feature needs the new store's API connection. Demo browsing, bag, discounts and checkout are available.", demo: true }, 501);
    } catch (error) {
        return json({ valid: false, error: error instanceof Error ? error.message : "Invalid request." }, 400);
    }
}
