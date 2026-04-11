"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Check, X } from "lucide-react";

export default function PromoCodeInput() {
  const { state, applyPromo, removePromo } = useCart();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isApplied = !!state.promoCode;

  async function handleApply() {
    if (!value.trim()) return;
    setLoading(true);
    setError("");
    // Simulate async validation
    await new Promise((r) => setTimeout(r, 400));
    if (value.toUpperCase() === "MISSUS10") {
      applyPromo(value);
      setError("");
    } else {
      setError("Invalid promo code. Try MISSUS10.");
    }
    setLoading(false);
  }

  function handleRemove() {
    removePromo();
    setValue("");
    setError("");
  }

  if (isApplied) {
    return (
      <div className="flex items-center justify-between bg-[#f0faf4] border border-[#c8e6d4] px-4 py-3 mt-6">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-[#007a3d]" strokeWidth={2.5} />
          <span className="text-[13px] font-semibold text-[#007a3d]">
            Code <strong>{state.promoCode}</strong> applied — 10% off!
          </span>
        </div>
        <button
          onClick={handleRemove}
          className="text-[#767676] hover:text-black transition-colors"
          aria-label="Remove promo code"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-5 border-t border-[#e8e8e8]">
      <div className="flex gap-0">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Enter promo / discount code"
          className={[
            "flex-1 border-[1.5px] border-r-0 px-3.5 h-11",
            "font-sans text-[13px] outline-none bg-white",
            "placeholder:text-[#aaa] placeholder:text-[12px]",
            "uppercase tracking-[0.04em]",
            error ? "border-[#e8002d]" : "border-black",
          ].join(" ")}
        />
        <button
          onClick={handleApply}
          disabled={loading || !value.trim()}
          className={[
            "bg-black text-white h-11 px-5",
            "font-condensed text-[12px] font-bold tracking-[0.12em] uppercase",
            "hover:bg-[#333] transition-colors whitespace-nowrap",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {loading ? "..." : "Apply"}
        </button>
      </div>
      {error && (
        <p className="text-[11px] text-[#e8002d] mt-1.5 font-medium">{error}</p>
      )}
      <p className="text-[11px] text-[#aaa] mt-1.5">
        Try <button onClick={() => setValue("MISSUS10")} className="underline hover:text-black transition-colors">MISSUS10</button> for 10% off
      </p>
    </div>
  );
}
