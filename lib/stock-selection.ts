import type { ProductStock } from "./product-stock";

export function stockForSelection(stock: ProductStock | null, size: string, color: string) {
    if (!stock) return null;
    if (!stock.variable) return { id: stock.productId, available: stock.available };
    const normalize = (value: string) => value.toLowerCase().replace(/^pa_/, "").trim();
    const matches = stock.variants.filter(variant => variant.attributes.every(attribute => {
        const name = normalize(attribute.name);
        const selected = name.includes("size") ? size : /colou?r/.test(name) ? color : "";
        return !selected || !attribute.option || normalize(attribute.option) === normalize(selected);
    }));
    return { id: matches.find(v => v.available)?.id || matches[0]?.id, available: matches.some(v => v.available) };
}
