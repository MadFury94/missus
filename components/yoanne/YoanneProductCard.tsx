import { YOANNE_FEATURED } from "@/lib/yoanne-home-content";

type FeaturedProduct = (typeof YOANNE_FEATURED)[number];

const FABRIC_CLASSES = ["fabric-butterfly", "fabric-pleat", "fabric-patchwork", "fabric-sequin"] as const;
const FABRIC_NAMES = ["Adire Butterfly Print", "Wine Pleat Weave", "Patchwork Adire", "Champagne Sequin"] as const;
const BADGES = ["New", "", "Limited", ""] as const;

export default function YoanneProductCard({ product, index, wished }: { product: FeaturedProduct; index: number; wished: boolean }) {
    const fabricClass = FABRIC_CLASSES[index] ?? FABRIC_CLASSES[0];
    const fabricName = FABRIC_NAMES[index] ?? "Adire Collection";
    const stars = index === 2 ? 4.5 : index === 1 ? 5 : index === 3 ? 4 : 4;

    return (
        <div className="product-card">
            <div className="product-media">
                {BADGES[index] && <span className="badge">{BADGES[index]}</span>}
                <button className={wished ? "wish-btn active" : "wish-btn"} data-wishlist={product.id} aria-pressed={wished} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}><i className="fa-regular fa-heart"></i></button>
                <a href={`/product/${product.slug}`} aria-label={`View ${product.name}`} style={{ display: "block", height: "100%" }}><div className={`fabric-swatch ${fabricClass}`}><span className="fabric-name">{fabricName}</span></div></a>
                <button className="quick-add" data-product={index}>Quick Add</button>
            </div>
            <div className="product-info">
                <span className="fabric-tag">{fabricName}</span>
                <h3><a href={`/product/${product.slug}`}>{product.name}</a></h3>
                <div className="price">₦{product.price.toLocaleString("en-NG")}</div>
                <div className="rating" aria-label={`${stars} out of 5 stars`}>
                    {[0, 1, 2, 3, 4].map((star) => <i key={star} className={star < Math.floor(stars) ? "fa-solid fa-star" : star < stars ? "fa-regular fa-star-half-stroke" : "fa-regular fa-star"}></i>)}
                </div>
            </div>
        </div>
    );
}
