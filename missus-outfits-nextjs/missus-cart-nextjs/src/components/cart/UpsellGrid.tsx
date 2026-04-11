"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { formatNaira } from "@/lib/utils";

const UPSELL_PRODUCTS = [
  {
    id: "u1",
    name: "Stella Satin Wrap Dress",
    slug: "stella-satin-wrap-dress",
    price: 48000,
    colors: [{ name: "Blush", hex: "#c8a4a4" }, { name: "Black", hex: "#000" }],
    bgColor: "#f0e8e4",
  },
  {
    id: "u2",
    name: "Malibu Barbie Halter Top",
    slug: "malibu-barbie-halter-top",
    price: 30000,
    colors: [{ name: "Pink", hex: "#f4a7b9" }, { name: "Blue", hex: "#87ceeb" }],
    bgColor: "#e8f0f4",
  },
  {
    id: "u3",
    name: "Lola Bandage Bodycon",
    slug: "lola-bandage-bodycon",
    price: 27000,
    originalPrice: 45000,
    colors: [{ name: "Black", hex: "#000" }, { name: "Purple", hex: "#9370db" }],
    bgColor: "#f4e8e8",
    badge: "DEAL",
  },
  {
    id: "u4",
    name: "Gemma Pinstripe Top",
    slug: "gemma-pinstripe-top",
    price: 35000,
    colors: [{ name: "Black", hex: "#000" }],
    bgColor: "#e8f4f0",
  },
];

export default function UpsellGrid() {
  return (
    <div className="mt-8 pt-6 border-t border-[#e8e8e8]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-condensed text-[20px] font-black tracking-[0.08em] uppercase">
          You May Also Like
        </h2>
        <Link
          href="/shop"
          className="font-condensed text-[12px] font-bold tracking-[0.1em] uppercase underline hover:opacity-50 transition-opacity"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {UPSELL_PRODUCTS.map((product) => (
          <div key={product.id} className="group cursor-pointer relative">
            {/* Image */}
            <div
              className="aspect-[2/3] relative overflow-hidden mb-1.5 flex items-center justify-center"
              style={{ background: product.bgColor }}
            >
              {/* Placeholder */}
              <span className="font-condensed text-[10px] font-bold tracking-[0.08em] uppercase text-black/20 text-center px-2 leading-relaxed">
                {product.name}
              </span>

              {/* Wishlist btn */}
              <button className="absolute top-2 right-2 w-7 h-7 bg-white/85 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Heart className="w-3.5 h-3.5 stroke-[1.8]" />
              </button>

              {/* Add to bag overlay */}
              <button className="absolute bottom-0 left-0 right-0 bg-black text-white font-condensed text-[10px] font-bold tracking-[0.1em] uppercase py-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 border-none">
                Add to Bag
              </button>

              {/* Badge */}
              {"badge" in product && product.badge && (
                <span className="absolute top-2 left-2 bg-[#e8002d] text-white font-condensed text-[9px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 z-10">
                  {product.badge as string}
                </span>
              )}
            </div>

            {/* Info */}
            <Link href={`/product/${product.slug}`}>
              <p className="text-[11px] text-[#111] leading-[1.35] mb-1 group-hover:underline">
                {product.name}
              </p>
            </Link>
            <p className="text-[11px] font-bold text-black">
              {"originalPrice" in product && product.originalPrice && (
                <span className="text-[#aaa] line-through font-normal mr-1">
                  {formatNaira(product.originalPrice)}
                </span>
              )}
              <span className={"originalPrice" in product && product.originalPrice ? "text-[#e8002d]" : ""}>
                {formatNaira(product.price)}
              </span>
            </p>

            {/* Color swatches */}
            <div className="flex gap-1 mt-1">
              {product.colors.map((c) => (
                <div
                  key={c.name}
                  title={c.name}
                  className="w-3.5 h-3.5 border border-black/12 cursor-pointer hover:scale-125 transition-transform"
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
