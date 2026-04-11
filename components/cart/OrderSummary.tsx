"use client";

import Link from "next/link";
import { CreditCard, Truck, RefreshCw, Check } from "lucide-react";
import { formatPrice } from "@/lib/woocommerce";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";

const PAY_ICONS = ["VISA", "MASTERCARD", "PAYSTACK", "FLUTTERWAVE", "OPAY"];
const EXPRESS = ["PAYSTACK", "OPAY", "KUDA"];

interface Props {
    subtotal: number;
    discount: number;
    total: number;
    itemCount: number;
    promoCode?: string;
    promoDiscount?: number;
}

export default function OrderSummary({ subtotal, discount, total, itemCount, promoCode, promoDiscount = 0 }: Props) {
    const isShippingFree = subtotal >= FREE_SHIPPING_THRESHOLD;

    return (
        <div className="border-[1.5px] border-black sticky top-[80px]">
            {/* Header */}
            <div className="bg-black px-5 py-4">
                <h2 className="font-condensed text-[16px] font-black tracking-[0.14em] uppercase text-white">
                    Order Summary
                </h2>
            </div>

            <div className="px-5 py-5 space-y-0">
                {/* Line items */}
                <div className="space-y-0 divide-y divide-[#f0f0f0]">
                    <div className="flex justify-between items-center py-2.5">
                        <span className="text-[13px] text-[#555]">
                            Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                        </span>
                        <span className="text-[13px] font-semibold">{formatPrice(subtotal)}</span>
                    </div>

                    {discount > 0 && (
                        <div className="flex justify-between items-center py-2.5">
                            <span className="text-[13px] text-[#555]">Discount</span>
                            <span className="text-[13px] font-semibold text-[#e8002d]">
                                −{formatPrice(discount)}
                            </span>
                        </div>
                    )}

                    {promoCode && promoDiscount > 0 && (
                        <div className="flex justify-between items-center py-2.5">
                            <span className="text-[13px] text-[#555]">
                                Promo ({promoCode})
                            </span>
                            <span className="text-[13px] font-semibold text-[#e8002d]">
                                −{formatPrice(promoDiscount)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center py-2.5">
                        <span className="text-[13px] text-[#555]">Shipping</span>
                        <span
                            className={[
                                "text-[13px]",
                                isShippingFree
                                    ? "font-bold text-[#007a3d]"
                                    : "text-[#767676] font-normal",
                            ].join(" ")}
                        >
                            {isShippingFree ? "FREE" : "Calculated at checkout"}
                        </span>
                    </div>
                </div>

                {/* Savings callout */}
                {discount > 0 && (
                    <div className="flex items-center gap-2 bg-[#f0faf4] border border-[#c8e6d4] px-3.5 py-2.5 mt-3">
                        <Check className="w-4 h-4 text-[#007a3d] flex-shrink-0" strokeWidth={2.5} />
                        <span className="text-[12px] text-[#007a3d] font-semibold">
                            You&apos;re saving {formatPrice(discount)} on this order!
                        </span>
                    </div>
                )}

                {/* Divider */}
                <div className="h-px bg-black mt-3 mb-3" />

                {/* Total */}
                <div className="flex justify-between items-baseline pt-1">
                    <span className="font-condensed text-[16px] font-black tracking-[0.1em] uppercase">
                        Total
                    </span>
                    <span className="font-condensed text-[26px] font-black text-black leading-none">
                        {formatPrice(total)}
                    </span>
                </div>
                <p className="text-[11px] text-[#aaa] text-right mt-0.5">
                    Taxes included where applicable
                </p>

                {/* CTA */}
                <Link
                    href="/checkout"
                    className="w-full h-[52px] bg-black text-white font-condensed text-[16px] font-black tracking-[0.12em] uppercase mt-4 hover:bg-[#222] transition-colors flex items-center justify-center gap-2.5 group"
                >
                    <CreditCard className="w-[18px] h-[18px] stroke-[1.8]" />
                    <span>
                        Proceed to Checkout
                        <span className="block text-[10px] font-normal tracking-[0.06em] opacity-70 group-hover:opacity-100 transition-opacity">
                            Secure · Encrypted · Fast
                        </span>
                    </span>
                </Link>

                {/* Continue shopping */}
                <Link
                    href="/shop"
                    className="block text-center font-condensed text-[12px] font-bold tracking-[0.1em] uppercase mt-3 border-b border-black pb-0.5 w-fit mx-auto hover:opacity-50 transition-opacity"
                >
                    Continue Shopping
                </Link>

                {/* Express checkout */}
                <div className="mt-4 pt-4 border-t border-[#e8e8e8]">
                    <p className="text-[11px] text-[#aaa] text-center uppercase tracking-[0.08em] mb-2.5 relative">
                        <span className="relative z-10 bg-white px-2">— Express Checkout —</span>
                    </p>
                    <div className="flex gap-2">
                        {EXPRESS.map((name) => (
                            <button
                                key={name}
                                className="flex-1 h-11 border-[1.5px] border-[#e0e0e0] hover:border-black hover:text-black transition-all font-condensed text-[11px] font-bold tracking-[0.06em] text-[#555]"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Delivery estimate */}
                <div className="bg-[#f5f5f5] px-3.5 py-3 mt-4 flex items-start gap-2.5">
                    <Truck className="w-[18px] h-[18px] stroke-[1.5] flex-shrink-0 mt-0.5" />
                    <div className="text-[12px] text-[#333] leading-[1.55] space-y-0.5">
                        <p>
                            <strong className="font-semibold text-black">Lagos:</strong>{" "}
                            Estimated delivery in 1–2 hours
                        </p>
                        <p>
                            <strong className="font-semibold text-black">Nationwide:</strong>{" "}
                            1–3 business days
                        </p>
                    </div>
                </div>

                {/* 7 day returns */}
                <div className="flex items-center gap-2 mt-3">
                    <RefreshCw className="w-4 h-4 stroke-[1.5] text-[#767676] flex-shrink-0" />
                    <span className="text-[12px] text-[#767676]">
                        Free returns within <strong className="text-black">7 days</strong> of delivery
                    </span>
                </div>

                {/* Payment icons */}
                <div className="mt-4 pt-4 border-t border-[#e8e8e8]">
                    <p className="text-[11px] text-[#aaa] text-center tracking-[0.04em] mb-2">
                        We Accept
                    </p>
                    <div className="flex justify-center gap-1.5 flex-wrap">
                        {PAY_ICONS.map((icon) => (
                            <span
                                key={icon}
                                className="bg-[#f5f5f5] border border-[#e0e0e0] rounded-sm px-2 py-1 font-condensed text-[9px] font-bold tracking-[0.08em] text-[#555]"
                            >
                                {icon}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
