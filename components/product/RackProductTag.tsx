"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { StoreProduct } from "@/lib/woocommerce";
import { getProductImage, getSizes, toNaira } from "@/lib/woocommerce";
import { useCurrency } from "@/lib/currency";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";
import { stockForSelection } from "@/lib/stock-selection";
import type { ProductStock } from "@/lib/product-stock";
import { normalizeStockStatus } from "@/lib/stock-status";
import styles from "./RackProductTag.module.css";

export default function RackProductTag({ product }: { product: StoreProduct }) {
    const { convert } = useCurrency();
    const sizes = getSizes(product);
    const colors = product.attributes?.find(a => /^(color|colour)$/i.test(a.name))?.terms ?? [];
    const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "");
    const [color, setColor] = useState(colors.length === 1 ? colors[0].name : "");
    const [wished, setWished] = useState(false);
    const [stock, setStock] = useState<ProductStock | null>(null);
    const [error, setError] = useState("");
    const [added, setAdded] = useState(false);

    useEffect(() => {
        const sync = () => setWished(isInWishlist(product.id));
        sync();
        window.addEventListener("wishlistUpdated", sync);
        window.addEventListener("storage", sync);
        return () => { window.removeEventListener("wishlistUpdated", sync); window.removeEventListener("storage", sync); };
    }, [product.id]);

    useEffect(() => {
        const controller = new AbortController();
        fetch(`/api/stock?productId=${product.id}`, { signal: controller.signal, cache: "no-store" })
            .then(async response => {
                if (!response.ok) throw new Error("View product details to check availability.");
                return await response.json() as ProductStock;
            })
            .then(data => { if (!controller.signal.aborted) setStock(data); })
            .catch(() => { if (!controller.signal.aborted) setError("View product details to check availability."); });
        return () => controller.abort();
    }, [product.id]);

    const choice = stockForSelection(stock, size, color);
    const status = normalizeStockStatus(product.stock_status, product.is_in_stock);
    const needsSelection = (sizes.length > 0 && !size) || (colors.length > 0 && !color);
    // Unrepresented variation attributes need the full product selector.
    const extraOptions = stock?.variants.some(v => v.attributes.some(a => !/size|colou?r/i.test(a.name)));
    const canAdd = !!stock && !!choice?.available && (!stock.variable || !!choice.id) && !needsSelection && !extraOptions && status !== "outofstock";

    function add() {
        if (!canAdd || !choice) return;
        try {
            addToCart({ productId: product.id, variationId: stock?.variable ? choice.id : undefined,
                name: product.name, slug: product.slug, price: toNaira(product.prices.price),
                regularPrice: toNaira(product.prices.regular_price), quantity: 1, image: getProductImage(product),
                size: size || undefined, color: color || undefined, stockStatus: status,
                backordersAllowed: product.backorders_allowed, isOnBackorder: product.is_on_backorder });
            setAdded(true);
            window.dispatchEvent(new Event("cart-updated"));
            window.dispatchEvent(new Event("open-cart-drawer"));
        } catch { setError("Your bag could not be saved. Please try again."); }
    }

    return <section className={styles.tag} aria-label={`${product.name} price and options`}>
        <div className={styles.heading}>
            <div><p className={styles.eyebrow}>The selected piece</p><h2 className={styles.name}>{product.name}</h2></div>
            <div className={styles.price}>
                {convert(toNaira(product.prices.price))}
                {product.on_sale && Number(product.prices.regular_price) > Number(product.prices.price) &&
                    <del className={styles.regular}>{convert(toNaira(product.prices.regular_price))}</del>}
            </div>
        </div>
        <div className={styles.options}>
            {sizes.length > 0 && <label className={styles.field}>Size
                <select value={size} onChange={e => { setSize(e.target.value); setAdded(false); }}>
                    <option value="">Choose size</option>
                    {sizes.map(s => <option key={s} value={s} disabled={!!stock && !stockForSelection(stock, s, color)?.available}>{s}{stock && !stockForSelection(stock, s, color)?.available ? " — sold out" : ""}</option>)}
                </select>
            </label>}
            {colors.length > 0 && <label className={styles.field}>Colour
                <select value={color} onChange={e => { setColor(e.target.value); setAdded(false); }}>
                    <option value="">Choose colour</option>
                    {colors.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                </select>
            </label>}
        </div>
        <div className={styles.actions}>
            <button className={styles.add} disabled={!canAdd || added} onClick={add}><ShoppingBag size={15} strokeWidth={1.4} />{added ? "Added to bag" : stock?.available === false || status === "outofstock" ? "Sold out" : "Add to bag"}</button>
            <button className={styles.heart} aria-label={wished ? "Remove from favourites" : "Add to favourites"} aria-pressed={wished} onClick={() => setWished(toggleWishlist({ productId: product.id, name: product.name, slug: product.slug, price: toNaira(product.prices.price), image: getProductImage(product) }))}>
                <Heart size={18} strokeWidth={1.4} fill={wished ? "currentColor" : "none"} />
            </button>
        </div>
        <p className={styles.status} role="status">{error || (!stock ? "Checking availability…" : extraOptions ? "Choose additional options on the product page." : needsSelection ? "Choose your fit to add this piece." : !choice?.available ? "This selection is sold out." : added ? "Your piece is in the bag." : "")}</p>
        <Link className={styles.details} href={`/product/${product.slug}`}>Explore this piece</Link>
    </section>;
}
