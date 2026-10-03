import { wcApiFetch } from "./api-helpers";
import { IS_DEMO_STORE } from "./store-config";
import { demoProductStock } from "./demo-store";

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

interface RestStockProduct {
    id: number;
    status: string;
    type: string;
    stock_status: string;
    purchasable: boolean;
    attributes: { name: string; option: string }[];
}

export async function getProductStock(productId: number): Promise<ProductStock> {
    if (IS_DEMO_STORE) return demoProductStock(productId);
    async function read<T>(path: string) {
        return await wcApiFetch<T>(path);
    }
    const product = await read<RestStockProduct>(`/products/${productId}`);
    if (product.status !== "publish") throw new Error("Product unavailable");
    const available = (item: { stock_status: string; purchasable: boolean }) => item.purchasable && item.stock_status !== "outofstock";
    const variants: StockVariant[] = [];
    if (product.type === "variable") {
        for (let page = 1; ; page++) {
            const batch = await read<RestStockProduct[]>(`/products/${productId}/variations?per_page=100&page=${page}`);
            for (const variant of batch) {
                variants.push({ id: variant.id, available: variant.status === "publish" && available(variant), attributes: variant.attributes.map((a: { name: string; option: string }) => ({ name: a.name, option: a.option })) });
            }
            if (batch.length < 100) break;
        }
    }
    return { productId, variable: product.type === "variable", available: product.type === "variable" ? variants.some(v => v.available) : available(product), variants };
}
