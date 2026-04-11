"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { formatPrice } from "@/lib/woocommerce";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";

interface Props {
    total: number;
}

export default function CartUnlockBar({ total }: Props) {
    const remaining = FREE_SHIPPING_THRESHOLD - total;
    const isUnlocked = total >= FREE_SHIPPING_THRESHOLD;
    const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

    return (
        <>
            {/* Text bar with progress */}
            <div className="bg-white border-b-2 border-black px-6 py-2.5 text-[13px] font-medium text-black">
                {isUnlocked ? (
                    <span>
                        🎉 You&apos;ve unlocked <strong>FREE SHIPPING!</strong> Enjoy.
                    </span>
                ) : (
                    <span>
                        Spend <strong>{formatPrice(remaining)}</strong> more to
                        unlock <strong>FREE SHIPPING!</strong>{" "}
                        <Link href="/shop" className="font-bold underline hover:no-underline">
                            Shop New →
                        </Link>
                    </span>
                )}

                {/* Progress bar */}
                <div className="h-[3px] bg-[#e0e0e0] mt-2 w-full">
                    <div
                        className="h-full bg-black transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Free gift promo banner */}
            <div className="bg-black flex items-center gap-3.5 px-6 py-3.5">
                <div className="w-9 h-9 bg-[#e8002d] flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-white" strokeWidth={1.8} />
                </div>
                <div>
                    {isUnlocked ? (
                        <>
                            <p className="font-condensed text-[13px] font-bold tracking-[0.06em] uppercase text-white leading-tight">
                                Free shipping unlocked! 🎉
                            </p>
                            <span className="text-[11px] text-white/50 font-light">
                                Your order ships free nationwide
                            </span>
                        </>
                    ) : (
                        <>
                            <p className="font-condensed text-[13px] font-bold tracking-[0.06em] uppercase text-white leading-tight">
                                Add {formatPrice(remaining)} more for FREE SHIPPING
                            </p>
                            <span className="text-[11px] text-white/50 font-light">
                                Orders ₦150,000+ ship free nationwide
                            </span>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
