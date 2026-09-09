// WooCommerce's order list does not support a transaction_id filter.
// Search for candidates, then verify the reference before using any order.
export async function findOrderByReference(
    reference: string,
    apiUrl: string,
    headers: Record<string, string>,
) {
    for (let page = 1; ; page++) {
        const query = new URLSearchParams({ search: reference, per_page: "100", page: String(page) });
        const response = await fetch(`${apiUrl}/orders?${query}`, { headers, cache: "no-store" });
        if (!response.ok) throw new Error(`Order lookup failed (${response.status})`);
        const orders = await response.json();
        if (!Array.isArray(orders)) throw new Error("Invalid order lookup response");
        const match = orders.find(order => order.transaction_id === reference);
        if (match) return match;
        const totalPages = Number(response.headers.get("x-wp-totalpages"));
        if (orders.length < 100 || (totalPages > 0 && page >= totalPages)) return null;
    }
}
