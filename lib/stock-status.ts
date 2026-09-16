export type StockStatus = "instock" | "outofstock" | "onbackorder";

export function normalizeStockStatus(status?: string | null, isInStock?: boolean): StockStatus {
    if (status === "onbackorder") return "onbackorder";
    if (status === "outofstock" || (status !== "instock" && isInStock === false)) return "outofstock";
    return "instock";
}

export function stockStatusLabel(status?: string | null, isInStock?: boolean): string {
    const value = normalizeStockStatus(status, isInStock);
    return value === "onbackorder" ? "Available on Backorder" : value === "outofstock" ? "Out of Stock" : "In Stock";
}
