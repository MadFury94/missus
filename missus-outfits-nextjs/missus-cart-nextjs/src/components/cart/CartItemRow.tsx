"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatNaira } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

interface Props {
  item: CartItem & { bgColor?: string };
}

export default function CartItemRow({ item }: Props) {
  const { removeItem, updateQty } = useCart();
  const [removing, setRemoving] = useState(false);

  function handleRemove() {
    setRemoving(true);
    // Allow animation to play before removing from state
    setTimeout(() => removeItem(item.id), 280);
  }

  const lineTotal = item.price * item.quantity;

  return (
    <div
      className={[
        "grid grid-cols-[90px_1fr] gap-4 py-5 border-b border-[#e8e8e8] relative",
        "transition-all duration-300 ease-out",
        removing ? "opacity-0 translate-x-4 max-h-0 overflow-hidden py-0 border-0" : "opacity-100",
      ].join(" ")}
    >
      {/* Product image */}
      <Link href={`/product/${item.slug}`} className="block w-[90px] h-[120px] relative flex-shrink-0 bg-[#f0ece8] overflow-hidden">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          /* Placeholder with color tint */
          <div className="w-full h-full flex items-center justify-center relative">
            <div
              className="absolute inset-0 opacity-15"
              style={{ background: item.colorHex }}
            />
            <span className="font-condensed text-[9px] font-bold tracking-[0.08em] uppercase text-black/20 text-center px-2 leading-relaxed relative z-10">
              {item.name}
            </span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-col justify-between min-w-0">
        {/* Top row: name + price */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/product/${item.slug}`}
              className="font-condensed text-[15px] font-bold uppercase tracking-[0.03em] text-black hover:text-[#555] transition-colors leading-tight block"
            >
              {item.name}
            </Link>
            <div className="flex flex-col gap-0.5 mt-2">
              <p className="text-[12px] text-[#767676]">
                <span className="font-semibold text-black">Size:</span> {item.size}
              </p>
              <p className="text-[12px] text-[#767676]">
                <span className="font-semibold text-black">Color:</span> {item.color}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            {item.originalPrice && (
              <span className="block text-[12px] text-[#aaa] line-through font-normal">
                {formatNaira(item.originalPrice * item.quantity)}
              </span>
            )}
            <span
              className={[
                "font-condensed text-[16px] font-bold",
                item.originalPrice ? "text-[#e8002d]" : "text-black",
              ].join(" ")}
            >
              {formatNaira(lineTotal)}
            </span>
          </div>
        </div>

        {/* Bottom row: qty + actions */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {/* Qty control */}
          <div className="flex items-center border-[1.5px] border-[#e0e0e0] h-[34px]">
            <button
              onClick={() => updateQty(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-full flex items-center justify-center hover:bg-[#f5f5f5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            <span className="w-9 text-center font-condensed text-[14px] font-bold select-none">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQty(item.id, item.quantity + 1)}
              disabled={item.quantity >= 10}
              className="w-8 h-full flex items-center justify-center hover:bg-[#f5f5f5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={handleRemove}
            className="text-[12px] text-[#767676] underline hover:text-[#e8002d] transition-colors font-sans"
          >
            Remove
          </button>

          {/* Save for later */}
          <button className="flex items-center gap-1 text-[12px] text-[#767676] underline hover:text-black transition-colors font-sans">
            <Heart className="w-3 h-3" strokeWidth={1.8} />
            Save for Later
          </button>
        </div>
      </div>

      {/* SALE badge */}
      {item.badge && (
        <span className="absolute top-5 right-0 bg-[#e8002d] text-white font-condensed text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5">
          {item.badge}
        </span>
      )}
    </div>
  );
}
