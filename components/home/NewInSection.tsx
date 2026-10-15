import { getProducts } from "@/lib/woocommerce";
import ProductCard from "@/components/product/ProductCard";

export default async function NewInSection() {
    const products = await getProducts({ category: "whats-new", perPage: 8, orderby: "date", order: "desc" });

    return (
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.4; }
                }
                .newin-section-wrap {
                    padding: 20px 72px 32px;
                }
                @media (max-width: 1024px) {
                    .newin-section-wrap {
                        padding: 0 0 24px;
                    }
                    .newin-section-wrap .grid-4 {
                        gap: 1px;
                    }
                }
            `}</style>

            {/* Section header */}
            <div style={{ background: "#000", color: "#fff", padding: "11px 20px" }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>New In</span>
            </div>

            <div className="newin-section-wrap">
                <div className="grid-4">
                    {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </div>
        </>
    );
}
