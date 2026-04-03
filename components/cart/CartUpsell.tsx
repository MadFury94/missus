import Link from "next/link";
import { formatPrice } from "@/lib/woocommerce";

interface UpsellProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    regularPrice?: number;
    colors?: string[];
}

interface CartUpsellProps {
    products: UpsellProduct[];
}

export default function CartUpsell({ products }: CartUpsellProps) {
    if (products.length === 0) return null;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            {products.map((product) => (
                <div key={product.id} style={{ cursor: "pointer", position: "relative" }} className="group">
                    <Link href={`/product/${product.slug}`} style={{ display: "block", textDecoration: "none" }}>
                        <div style={{ aspectRatio: "2/3", background: "#f0ece8", position: "relative", overflow: "hidden", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(0,0,0,.2)", textAlign: "center", padding: "8px", lineHeight: 1.4 }}>
                                {product.name}
                            </div>
                            <button style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "10px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textAlign: "center", padding: "10px 0", opacity: 0, transition: "opacity .2s", border: "none", width: "100%", cursor: "pointer" }} className="group-hover:opacity-100">
                                Add to Bag
                            </button>
                        </div>
                    </Link>

                    <p style={{ fontSize: "11px", color: "#000", lineHeight: 1.3, marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {product.name}
                    </p>

                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#000", margin: 0 }}>
                        {product.regularPrice && product.regularPrice > product.price && (
                            <span style={{ color: "#aaa", textDecoration: "line-through", fontWeight: 400, marginRight: "4px" }}>
                                {formatPrice(product.regularPrice)}
                            </span>
                        )}
                        <span style={{ color: product.regularPrice && product.regularPrice > product.price ? "#e8002d" : "#000" }}>
                            {formatPrice(product.price)}
                        </span>
                    </p>

                    {product.colors && product.colors.length > 0 && (
                        <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                            {product.colors.slice(0, 3).map((color, idx) => (
                                <div
                                    key={idx}
                                    style={{ width: "14px", height: "14px", border: "1px solid rgba(0,0,0,.1)", cursor: "pointer", background: color }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
