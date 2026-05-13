import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/woocommerce";

interface UpsellProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    regularPrice?: number;
    colors?: string[];
    image?: string;
}

interface Props {
    products: UpsellProduct[];
}

export default function CartUpsell({ products }: Props) {
    if (products.length === 0) return null;

    return (
        <>
            <div className="upsell-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {products.map((product) => (
                    <div key={product.id} style={{ cursor: "pointer", position: "relative" }} className="up-card">
                        <Link href={`/product/${product.slug}`} style={{ display: "block", textDecoration: "none" }}>
                            <div style={{ aspectRatio: "2/3", background: "#f0ece8", position: "relative", overflow: "hidden", marginBottom: "6px" }}>
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-barlow-condensed)", fontSize: "10px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(0,0,0,.2)", textAlign: "center", padding: "8px", lineHeight: 1.5 }}>
                                        {product.name}
                                    </div>
                                )}
                                <button
                                    className="up-atb"
                                    style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#000", color: "#fff", fontFamily: "var(--font-barlow-condensed)", fontSize: "10px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", textAlign: "center", padding: "9px 0", opacity: 0, transition: "opacity .2s", border: "none", width: "100%", cursor: "pointer" }}
                                >
                                    Add to Bag
                                </button>
                            </div>
                        </Link>

                        <p style={{ fontSize: "11px", color: "#111", lineHeight: 1.35, marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
                            {product.name}
                        </p>

                        <p style={{ fontSize: "11px", fontWeight: 700, color: "#000", margin: 0 }}>
                            {product.regularPrice && product.regularPrice > product.price && (
                                <span style={{ color: "#aaa", textDecoration: "line-through", fontWeight: 400, marginRight: "3px" }}>
                                    {formatPrice(product.regularPrice)}
                                </span>
                            )}
                            <span style={{ color: product.regularPrice && product.regularPrice > product.price ? "#e8002d" : "#000" }}>
                                {formatPrice(product.price)}
                            </span>
                        </p>

                        {product.colors && product.colors.length > 0 && (
                            <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>
                                {product.colors.slice(0, 3).map((color, idx) => (
                                    <div key={idx} style={{ width: "14px", height: "14px", border: "1px solid rgba(0,0,0,.12)", background: color }} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
                .up-card:hover .up-atb {
                    opacity: 1 !important;
                }
                @media (max-width: 768px) {
                    .upsell-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
            `}</style>
        </>
    );
}
