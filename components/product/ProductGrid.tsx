import type { WCProduct } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
    products: WCProduct[];
    cols?: 2 | 3 | 4;
}

export default function ProductGrid({ products, cols = 4 }: ProductGridProps) {
    const colClass = {
        2: "grid-cols-2",
        3: "grid-cols-2 md:grid-cols-3",
        4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    }[cols];

    return (
        <div className={`grid ${colClass} gap-x-4 gap-y-8`}>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
