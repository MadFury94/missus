export type { StoreProduct as WCProduct, StoreCategory as WCCategory } from "@/lib/woocommerce";

export interface CartItem {
    productId: number;
    variationId?: number;
    name: string;
    slug: string;
    image: string;
    price: number;       // naira
    regularPrice: number;
    quantity: number;
    size?: string;
    color?: string;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    total: number;
}

export interface ProductFilters {
    category?: string;
    sizes?: string[];
    colors?: string[];
    occasions?: string[];
    lengths?: string[];
    styles?: string[];
    necklines?: string[];
    fabrics?: string[];
    details?: string[];
    minPrice?: number;
    maxPrice?: number;
    onSale?: boolean;
    orderby?: "date" | "price" | "price-desc" | "popularity";
    page?: number;
    perPage?: number;
}
