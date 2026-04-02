interface StarRatingProps {
    rating: number;
    count?: number;
    size?: "sm" | "md";
}

export default function StarRating({ rating, count, size = "md" }: StarRatingProps) {
    const stars = Math.round(rating);
    const textSize = size === "sm" ? "text-xs" : "text-sm";

    return (
        <div className={`flex items-center gap-1 ${textSize}`}>
            <span className="text-yellow-400 tracking-tight">
                {"★".repeat(stars)}{"☆".repeat(5 - stars)}
            </span>
            {count !== undefined && (
                <span className="text-[#999]">({count})</span>
            )}
        </div>
    );
}
