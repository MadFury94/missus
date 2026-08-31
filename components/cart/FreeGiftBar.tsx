import { formatPrice } from "@/lib/woocommerce";

interface FreeGiftBarProps {
    remaining: number;
}

export default function FreeGiftBar({ remaining }: FreeGiftBarProps) {
    if (remaining <= 0) return null;

    return (
        <div className="bg-gradient-to-r from-black to-gray-900 px-5 py-3.5 flex items-center gap-3.5">
            <div className="w-9 h-9 bg-[#630D13] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 stroke-white" fill="none" strokeWidth="1.8" viewBox="0 0 24 24">
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
            </div>
            <div>
                <p className="font-display text-[13px] font-bold tracking-[.06em] uppercase text-white leading-tight">
                    Add {formatPrice(remaining)} more for FREE SHIPPING
                </p>
                <span className="text-[11px] text-white/50 font-light">
                    Orders ₦150,000+ ship free nationwide
                </span>
            </div>
        </div>
    );
}
