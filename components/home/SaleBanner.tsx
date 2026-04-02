import Link from "next/link";

interface SaleBannerProps {
    variant?: "light" | "dark";
}

export default function SaleBanner({ variant = "light" }: SaleBannerProps) {
    if (variant === "dark") {
        return (
            <section className="bg-secondary py-20 px-4">
                <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-2">Limited Time Offer</p>
                        <h2 className="font-display text-5xl md:text-7xl font-bold text-white leading-none">
                            UP TO 60%
                        </h2>
                        <h2 className="font-display text-5xl md:text-7xl font-bold text-accent leading-none">
                            OFF SITEWIDE
                        </h2>
                        <p className="text-sm text-white/60 mt-3">MissusDeals — prices as marked. While stocks last.</p>
                    </div>
                    <Link
                        href="/sale"
                        className="bg-accent text-white text-xs font-bold tracking-widest uppercase px-10 py-5 hover:bg-accent/85 transition-colors shrink-0"
                    >
                        Shop Sale Now
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-muted py-16 px-4">
            <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1">
                    <p className="text-xs font-bold tracking-widest uppercase text-secondary/40 mb-2">SALE</p>
                    <p className="text-xs font-bold tracking-widest uppercase text-secondary/60 mb-3">Limited Time Offer</p>
                    <h2 className="font-display text-5xl font-bold text-secondary leading-none">UP TO 60%</h2>
                    <h2 className="font-display text-5xl font-bold text-accent leading-none">OFF SITEWIDE</h2>
                    <p className="text-sm text-secondary/60 mt-3">MissusDeals — prices as marked. While stocks last.</p>
                    <Link
                        href="/sale"
                        className="inline-block mt-6 bg-secondary text-white text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-secondary/85 transition-colors"
                    >
                        Shop Sale Now
                    </Link>
                </div>
                <div className="flex gap-4 text-secondary">
                    {["Sale\nDresses", "Tops", "Bottoms\n& Sets"].map((label, i) => (
                        <div key={i} className="text-center">
                            <p className="font-display text-lg font-bold whitespace-pre-line leading-tight">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
