import type { CartItem } from "@/types";

const STATE_CODES: Record<string, string> = {
    abia: "AB", adamawa: "AD", "akwa ibom": "AK", anambra: "AN", bauchi: "BA", bayelsa: "BY",
    benue: "BE", borno: "BO", "cross river": "CR", delta: "DE", ebonyi: "EB", edo: "ED",
    ekiti: "EK", enugu: "EN", "fct abuja": "FC", abuja: "FC", fct: "FC", gombe: "GO",
    imo: "IM", jigawa: "JI", kaduna: "KD", kano: "KN", katsina: "KT", kebbi: "KE", kogi: "KO",
    kwara: "KW", lagos: "LA", nasarawa: "NA", niger: "NI", ogun: "OG", ondo: "ON", osun: "OS",
    oyo: "OY", plateau: "PL", rivers: "RI", sokoto: "SO", taraba: "TA", yobe: "YO", zamfara: "ZA",
};

export function normalizeShippingAddress(address: CustomerAddress): CustomerAddress {
    const country = address.country.toLowerCase() === "nigeria" ? "NG" : address.country.toUpperCase();
    const state = country === "NG" ? STATE_CODES[address.state.trim().toLowerCase()] || address.state.replace(/^NG:/i, "").toUpperCase() : address.state;
    return { ...address, country, state };
}

async function prepareCart(items: CartItem[]) {
    const base = `${(process.env.WP_API_URL || "https://missusoutfits.com/wp-json").replace(/\/$/, "")}/wc/store/v1`;
    // Each quote gets a separate cart; server fetch does not maintain browser cookies.
    let token = "";
    async function request(path: string, body?: unknown) {
        const response = await fetch(`${base}${path}`, {
            method: body === undefined ? "GET" : "POST", cache: "no-store",
            headers: { "Content-Type": "application/json", ...(token ? { "Cart-Token": token } : {}) },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(20000),
        });
        const data = await response.json();
        if (!response.ok) {
            if (path === "/cart/add-item" && [400, 409].includes(response.status)) {
                throw new CartAvailabilityError(String(data.message || "An item is unavailable.").replace(/&quot;/g, '"').replace(/&#0?39;|&#8217;/g, "'").replace(/&amp;/g, "&").replace(/<[^>]*>/g, ""));
            }
            throw new Error(data.message || `Shipping calculation failed (${response.status})`);
        }
        token = response.headers.get("Cart-Token") || token;
        return data;
    }
    // Avoid an upstream cache reusing the same anonymous cart across quotes.
    await request(`/cart?quote=${crypto.randomUUID()}`);
    if (!token) throw new Error("WooCommerce did not provide a cart token");
    for (const item of items) {
        const product = await request(`/products/${item.productId}`);
        const variation = (product.attributes || []).filter((attribute: any) => attribute.has_variations).map((attribute: any) => {
            const name = attribute.name.toLowerCase();
            const selected = name.includes("size") ? item.size : /colou?r/.test(name) ? item.color : undefined;
            const term = selected ? attribute.terms.find((term: any) => [term.name, term.slug].some(value => value.toLowerCase() === selected.toLowerCase()))
                : attribute.terms.find((term: any) => term.default) || (attribute.terms.length === 1 ? attribute.terms[0] : undefined);
            if (!term && !item.variationId) throw new Error(`Choose ${attribute.name} for ${item.name}`);
            return term ? { attribute: attribute.taxonomy || attribute.name, value: attribute.taxonomy ? term.slug : term.name } : null;
        }).filter(Boolean);
        await request("/cart/add-item", { id: item.variationId || item.productId, quantity: item.quantity, variation });
    }
    return request;
}

export class CartAvailabilityError extends Error {}

export async function validateCartAvailability(items: CartItem[]) {
    await prepareCart(items);
}

export async function getWooCommerceShippingRates(address: CustomerAddress, items: CartItem[], coupon = ""): Promise<ShippingRate[]> {
    const request = await prepareCart(items);
    if (coupon) await request("/cart/apply-coupon", { code: coupon });
    const cart = await request("/cart/update-customer", { shipping_address: normalizeShippingAddress(address), billing_address: normalizeShippingAddress(address) });
    const packages = cart.shipping_rates || [];
    if (packages.length > 1) throw new Error("Multiple shipping packages are not supported by this checkout");
    return packages.flatMap((pkg: any) => (pkg.shipping_rates || []).map((rate: any) => {
        const amount = Number(rate.price) + Number(rate.taxes || 0);
        if (!Number.isSafeInteger(amount) || amount < 0 || rate.currency_minor_unit !== 2 || rate.currency_code !== "NGN") throw new Error("Invalid shipping price from WooCommerce");
        return { rate_id: rate.rate_id, carrier_name: rate.name, amount, currency: rate.currency_code,
            delivery_time: rate.delivery_time || rate.description || "", method_id: rate.method_id, instance_id: Number(rate.instance_id) };
    })).filter((rate: ShippingRate) => !(rate.method_id === "terminal_delivery" && rate.amount === 0))
        .sort((a: ShippingRate, b: ShippingRate) => a.amount - b.amount);
}

export interface ShippingRate {
    rate_id: string;
    carrier_name: string;
    carrier_logo?: string;
    amount: number; // Price in kobo
    currency: string;
    delivery_time: string;
    pickup_time?: string;
    delivery_date?: string;
    method_id: string;
    instance_id: number;
}

// Customer address structure for WooCommerce Store API
export interface CustomerAddress {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode?: string;
    country: string;
    email?: string;
    phone?: string;
}

