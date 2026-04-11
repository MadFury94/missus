"use client";

import Link from "next/link";
import { Search, User, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const GENDER_TABS = [
  { label: "WOMEN", href: "/" },
  { label: "CURVE+", href: "/curve" },
  { label: "NEW DROPS", href: "/new", isNew: true },
  { label: "GIFT SHOP", href: "/gifts" },
];

const SUB_LINKS = [
  { label: "What's New", href: "/new", hot: true },
  { label: "Shop All", href: "/shop" },
  { label: "MissusDeals", href: "/deals", deals: true },
  { label: "Dresses", href: "/dresses" },
  { label: "Matching Sets", href: "/sets" },
  { label: "Tops", href: "/tops" },
  { label: "Bottoms", href: "/bottoms" },
  { label: "Athleisure", href: "/athleisure" },
  { label: "Gift Shop", href: "/gifts" },
  { label: "Sale", href: "/sale", sale: true },
];

export default function Header() {
  const { itemCount } = useCart();

  return (
    <>
      {/* ── Top Nav ───────────────────────────────────── */}
      <header className="bg-white border-b border-[#e8e8e8] sticky top-0 z-50">
        <div className="flex items-center h-[60px] px-6 gap-0">
          {/* Gender tabs */}
          <nav className="flex items-center flex-1">
            {GENDER_TABS.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={[
                  "font-condensed text-[13px] font-bold tracking-[0.08em] uppercase",
                  "h-[60px] px-3 flex items-center relative",
                  "border-b-[3px] border-transparent hover:border-black hover:text-black",
                  "text-[#555] transition-colors whitespace-nowrap",
                ].join(" ")}
              >
                {tab.label}
                {tab.isNew && (
                  <span className="absolute top-2 right-0 bg-[#e8002d] text-white text-[8px] font-bold px-1 py-0.5 rounded-sm leading-none">
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link
            href="/"
            className="font-condensed text-[28px] font-black tracking-[0.06em] uppercase text-black flex-1 text-center"
          >
            MISSUS<span className="text-[#e8002d]">.</span>
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-5 flex-1 justify-end">
            {/* Search */}
            <div className="flex border-[1.5px] border-black h-9 overflow-hidden">
              <input
                type="text"
                placeholder="Search women's clothing"
                className="text-[13px] px-3 w-[200px] outline-none font-sans bg-white"
              />
              <button className="bg-black w-10 flex items-center justify-center flex-shrink-0">
                <Search className="w-[15px] h-[15px] text-white stroke-[2]" />
              </button>
            </div>

            {/* Login */}
            <button className="flex items-center gap-1 font-condensed text-[12px] font-bold tracking-[0.08em] uppercase hover:text-[#555] transition-colors">
              <User className="w-5 h-5 stroke-[1.6]" />
              LOGIN
            </button>

            {/* Wishlist */}
            <button className="flex items-center gap-1 font-condensed text-[12px] font-bold tracking-[0.08em] uppercase hover:text-[#555] transition-colors">
              <Heart className="w-5 h-5 stroke-[1.6]" />
              WISHLIST
            </button>

            {/* Bag */}
            <Link
              href="/cart"
              className="flex items-center gap-1 font-condensed text-[12px] font-bold tracking-[0.08em] uppercase hover:text-[#555] transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
              BAG
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-[#e8002d] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-sans">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Sub Nav ───────────────────────────────────── */}
      <nav className="bg-white border-b border-[#e8e8e8] overflow-x-auto no-scrollbar">
        <div className="flex px-6 whitespace-nowrap">
          {SUB_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={[
                "text-[13px] font-medium px-3.5 py-2.5 inline-block",
                "border-b-2 border-transparent hover:border-black transition-colors",
                link.hot ? "text-[#e8002d] font-bold" : "",
                link.deals ? "text-[#e8002d]" : "",
                link.sale ? "text-[#e8002d] font-bold" : "",
                !link.hot && !link.deals && !link.sale ? "text-[#111]" : "",
              ].join(" ")}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Ship Bar ─────────────────────────────────── */}
      <div className="bg-[#f5f5f5] border-b border-[#e8e8e8] text-center py-1.5 text-[12px] text-[#111]">
        Spend ₦150,000 or more to unlock{" "}
        <Link href="/shop" className="font-bold underline hover:no-underline">
          FREE SHIPPING!
        </Link>{" "}
        &nbsp;
        <Link href="/new" className="font-bold underline hover:no-underline">
          Shop New →
        </Link>
      </div>
    </>
  );
}
