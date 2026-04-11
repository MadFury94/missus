"use client";

import { useState } from "react";
import Link from "next/link";

const MESSAGES = [
  "FREE SHIPPING ON ORDERS ₦150,000+ | NEW ARRIVALS EVERY WEEK | PAY ON DELIVERY AVAILABLE",
  "USE CODE MISSUS10 FOR 10% OFF YOUR FIRST ORDER | SHOP NOW",
  "LAGOS DELIVERY IN 1–2 HOURS | NATIONWIDE 1–3 DAYS",
];

export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((i) => (i - 1 + MESSAGES.length) % MESSAGES.length);
  const next = () => setIdx((i) => (i + 1) % MESSAGES.length);

  return (
    <div className="bg-black text-white text-xs font-medium tracking-wider py-2 px-4 flex items-center justify-center relative select-none">
      {/* Arrows — left */}
      <button
        onClick={prev}
        aria-label="Previous announcement"
        className="absolute left-3 text-white/60 hover:text-white transition-colors text-base leading-none px-1"
      >
        ‹
      </button>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span>{MESSAGES[idx]}</span>
        <Link
          href="/sale"
          className="text-white font-bold underline underline-offset-2 hover:no-underline whitespace-nowrap"
        >
          SHOP SALE →
        </Link>
      </div>

      {/* Arrows — right */}
      <button
        onClick={next}
        aria-label="Next announcement"
        className="absolute right-3 text-white/60 hover:text-white transition-colors text-base leading-none px-1"
      >
        ›
      </button>
    </div>
  );
}
