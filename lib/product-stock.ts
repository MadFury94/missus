import { wcApiFetch } from "./api-helpers";

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
    async function read(path: string) {
        return await wcApiFetch(path);
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
