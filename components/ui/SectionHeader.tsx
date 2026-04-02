import Link from "next/link";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    viewAllHref?: string;
    viewAllLabel?: string;
    center?: boolean;
}

export default function SectionHeader({
    title,
    subtitle,
    viewAllHref,
    viewAllLabel = "View All →",
    center = false,
}: SectionHeaderProps) {
    return (
        <div className={`flex items-end justify-between mb-6 ${center ? "flex-col items-center text-center gap-2" : ""}`}>
            <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary uppercase tracking-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm text-[#666] mt-1">{subtitle}</p>
                )}
            </div>
            {viewAllHref && !center && (
                <Link
                    href={viewAllHref}
                    className="text-sm font-semibold text-secondary underline underline-offset-4 hover:text-primary transition-colors whitespace-nowrap"
                >
                    {viewAllLabel}
                </Link>
            )}
            {viewAllHref && center && (
                <Link
                    href={viewAllHref}
                    className="text-sm font-semibold text-secondary underline underline-offset-4 hover:text-primary transition-colors"
                >
                    {viewAllLabel}
                </Link>
            )}
        </div>
    );
}
