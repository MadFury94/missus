import { formatPrice } from "@/lib/woocommerce";

interface PriceDisplayProps {
    price: string;
    regularPrice?: string;
    size?: "sm" | "md" | "lg";
}

export default function PriceDisplay({ price, regularPrice, size = "md" }: PriceDisplayProps) {
    const isOnSale = regularPrice && parseFloat(regularPrice) > parseFloat(price);

    const saleSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
    const origSize = size === "lg" ? "text-base" : "text-xs";

    return (
        <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`font-bold text-secondary ${saleSize}`}>
                {formatPrice(price)}
            </span>
            {isOnSale && (
                <span className={`text-muted-foreground line-through text-[#999] ${origSize}`}>
                    {formatPrice(regularPrice!)}
                </span>
            )}
        </div>
    );
}
