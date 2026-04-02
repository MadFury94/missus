interface BadgeProps {
    type: "new" | "deal" | "sale" | "bestseller";
    discount?: number;
}

export default function Badge({ type, discount }: BadgeProps) {
    if (type === "new") {
        return (
            <span className="bg-secondary text-white text-[10px] font-bold tracking-widest uppercase px-2 py-0.5">
                NEW
            </span>
        );
    }
    if (type === "deal" || type === "sale") {
        return (
            <span className="bg-accent text-white text-[10px] font-bold tracking-widest uppercase px-2 py-0.5">
                {discount ? `${discount}% OFF` : "DEAL"}
            </span>
        );
    }
    if (type === "bestseller") {
        return (
            <span className="bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-2 py-0.5">
                BESTSELLER
            </span>
        );
    }
    return null;
}
