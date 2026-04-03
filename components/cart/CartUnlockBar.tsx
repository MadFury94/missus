import Link from "next/link";
import { formatPrice } from "@/lib/woocommerce";

interface CartUnlockBarProps {
    remaining: number;
    progressPercent: number;
}

export default function CartUnlockBar({ remaining, progressPercent }: CartUnlockBarProps) {
    if (remaining <= 0) return null;

    return (
        <div className="bg-white border-b-2 border-black px-6 py-2.5 text-[13px] font-medium text-black">
            Spend <strong className="font-bold">{formatPrice(remaining)}</strong> more to unlock{" "}
            <strong className="font-bold">FREE SHIPPING!</strong>&nbsp;
            <Link href="/shop" className="font-bold underline hover:no-underline cursor-pointer">
                Shop New →
            </Link>
            <div className="h-[3px] bg-gray-300 mt-2 rounded-none">
                <div
                    className="h-full bg-black transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
}
