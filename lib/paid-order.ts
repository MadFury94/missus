import { findOrderByReference } from "./order-reference";
import { redeemGiftCard } from "./giftCards";

// Coalesce callback/recovery requests for the same payment in this server process.
const pending = new Map<string, Promise<{ order: any; created: boolean }>>();

export function ensurePaidOrder(reference: string) {
    const current = pending.get(reference);
    if (current) return current;
    const task = persist(reference).finally(() => pending.delete(reference));
    pending.set(reference, task);
    return task;
}

async function persist(reference: string) {
    const api = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
    const headers = {
        Authorization: `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64")}`,
        "Content-Type": "application/json",
    };
    const existing = await findOrderByReference(reference, api, headers);
    if (existing) return { order: existing, created: false };

    const verified = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }, cache: "no-store",
    });
    const transaction = (await verified.json()).data;
    if (!verified.ok || transaction?.status !== "success" || transaction.reference !== reference || transaction.currency !== "NGN") {
        throw new Error("Successful payment could not be verified");
    }
    const meta = typeof transaction.metadata === "string" ? JSON.parse(transaction.metadata) : transaction.metadata;
    const cart = meta?.cart;
    const shipping = meta?.shipping;
    const rate = meta?.selectedRate;
    if (!Array.isArray(cart) || !cart.length || !shipping?.email || !rate) throw new Error("Payment order details are incomplete");
    const amounts = cart.map((item: any) => {
        if (!Number.isInteger(item.productId) || item.productId <= 0 || !Number.isInteger(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.price) || item.price < 0) throw new Error("Invalid paid item");
        return Math.round(item.price * item.quantity * 100);
    });
    const subtotal = amounts.reduce((sum: number, amount: number) => sum + amount, 0);
    const discount = Math.round((Number(meta.promoDiscount || 0) + Number(meta.giftCardAmount || 0)) * 100);
    const shippingAmount = Number(rate.amount);
    if (!Number.isSafeInteger(shippingAmount) || shippingAmount < 0 || !Number.isSafeInteger(discount) || discount < 0 || discount > subtotal || subtotal - discount + shippingAmount !== transaction.amount) {
        throw new Error("Order totals do not match verified payment");
    }
    const money = (minor: number) => (minor / 100).toFixed(2);
    let remainingDiscount = discount;
    const lineItems = cart.map((item: any, index: number) => {
        const reduction = Math.min(amounts[index], remainingDiscount);
        remainingDiscount -= reduction;
        return {
            product_id: item.productId, ...(item.variationId ? { variation_id: item.variationId } : {}),
            name: item.name, quantity: item.quantity,
            subtotal: money(amounts[index]), total: money(amounts[index] - reduction),
            meta_data: [
                ...(item.size ? [{ key: "Size", value: item.size }] : []),
                ...(item.color ? [{ key: "Color", value: item.color }] : []),
            ],
        };
    });
    const address = { first_name: shipping.firstName, last_name: shipping.lastName, address_1: shipping.address,
        address_2: shipping.apartment || "", city: shipping.city, state: shipping.state,
        postcode: shipping.postalCode || "", country: "NG" };
    const response = await fetch(`${api}/orders`, {
        method: "POST", headers,
        body: JSON.stringify({
            payment_method: "paystack", payment_method_title: "Paystack", set_paid: true,
            transaction_id: reference, status: "processing", currency: "NGN",
            billing: { ...address, email: shipping.email, phone: shipping.phone }, shipping: address,
            customer_note: shipping.notes || "", line_items: lineItems,
            shipping_lines: [{ method_id: rate.method_id || "flat_rate", method_title: rate.carrier_name || "Shipping", total: money(shippingAmount),
                ...(rate.instance_id !== undefined ? { instance_id: String(rate.instance_id) } : {}) }],
            meta_data: [{ key: "_paystack_reference", value: reference },
                { key: "_payment_amount_verified", value: money(transaction.amount) },
                { key: "_shipping_amount_paid", value: String(shippingAmount) },
                { key: "_shipping_method_paid", value: rate.carrier_name || "Shipping" }],
        }),
    });
    const order = await response.json();
    if (!response.ok || !order.id || order.transaction_id !== reference) {
        throw new Error(`Order persistence failed: ${order.code || response.status} ${order.message || ""}`);
    }
    if (meta.giftCardCode && meta.giftCardAmount > 0) await redeemGiftCard(meta.giftCardCode, meta.giftCardAmount, order.id);
    return { order, created: true };
}
