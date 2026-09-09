export interface StockVariant {
    id: number;
    available: boolean;
    attributes: { name: string; option: string }[];
}

export interface ProductStock {
    productId: number;
    variable: boolean;
    available: boolean;
    variants: StockVariant[];
}

export async function getProductStock(productId: number): Promise<ProductStock> {
    const api = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
    const headers = { Authorization: `Basic ${Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString("base64")}` };
    async function read(path: string) {
        const response = await fetch(`${api}${path}`, { headers, cache: "no-store", signal: AbortSignal.timeout(12000) });
        if (!response.ok) throw new Error("Product availability could not be loaded");
        return response.json();
    }
    const product = await read(`/products/${productId}`);
    if (product.status !== "publish") throw new Error("Product unavailable");
    const available = (item: { stock_status: string; purchasable: boolean }) => item.purchasable && item.stock_status !== "outofstock";
    const variants: StockVariant[] = [];
    if (product.type === "variable") {
        for (let page = 1; ; page++) {
            const batch = await read(`/products/${productId}/variations?per_page=100&page=${page}`);
            for (const variant of batch) {
                variants.push({ id: variant.id, available: variant.status === "publish" && available(variant), attributes: variant.attributes.map((a: { name: string; option: string }) => ({ name: a.name, option: a.option })) });
            }
            if (batch.length < 100) break;
        }
    }
    return { productId, variable: product.type === "variable", available: product.type === "variable" ? variants.some(v => v.available) : available(product), variants };
}
