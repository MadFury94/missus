"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import CartItemRow from "@/components/cart/CartItemRow";
import PromoCodeInput from "@/components/cart/PromoCodeInput";
import OrderSummary from "@/components/cart/OrderSummary";
import UpsellGrid from "@/components/cart/UpsellGrid";
import { useCart } from "@/lib/cart-context";

export default function CartPageClient() {
  const { state, itemCount } = useCart();
  const isEmpty = itemCount === 0;

  if (isEmpty) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 text-center">
        <ShoppingBag className="w-16 h-16 text-[#e0e0e0] mb-5" strokeWidth={1} />
        <h1 className="font-condensed text-[32px] font-black uppercase tracking-[0.06em] mb-2">Your Bag is Empty</h1>
        <p className="text-[13px] text-[#767676] mb-8 max-w-[320px]">
          Looks like you haven&apos;t added anything yet. Browse our latest drops and find your next it-girl look.
        </p>
        <Link href="/shop" className="bg-black text-white font-condensed text-[13px] font-bold tracking-[0.12em] uppercase px-10 py-3.5 hover:bg-[#222] transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-8 pb-20">
      <h1 className="font-condensed text-[clamp(28px,4vw,46px)] font-black uppercase tracking-[0.04em] mb-6">
        Your Bag
      </h1>

      <div className="grid grid-cols-[1fr_360px] gap-10 items-start">
        {/* Left */}
        <div>
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-5 pb-2.5 border-b-[1.5px] border-black mb-0">
            <span className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase">Product</span>
            <span className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase">Quantity</span>
            <span className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase">Price</span>
          </div>

          {/* Items */}
          {state.items.map((item) => (
            <CartItemRow key={item.id} item={item as Parameters<typeof CartItemRow>[0]["item"]} />
          ))}

          <PromoCodeInput />

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 font-condensed text-[12px] font-bold tracking-[0.1em] uppercase mt-5 border-b border-black pb-0.5 hover:opacity-50 transition-opacity"
          >
            ← Continue Shopping
          </Link>

          <UpsellGrid />
        </div>

        {/* Right */}
        <OrderSummary />
      </div>
    </div>
  );
}
