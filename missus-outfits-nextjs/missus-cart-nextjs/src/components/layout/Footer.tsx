import Link from "next/link";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";

const FOOTER_COLS = [
  {
    title: "Help",
    links: ["Help Center", "Track Order", "Shipping Info", "Returns", "Contact Us"],
    hrefs: ["/help", "/track", "/shipping", "/returns", "/contact"],
  },
  {
    title: "Company",
    links: ["About Missus", "Careers", "Press", "Sustainability", "Want to Collab?"],
    hrefs: ["/about", "/careers", "/press", "/sustainability", "/collab"],
  },
  {
    title: "Quick Links",
    links: ["Size Guide", "Gift Cards", "Sitemap", "Refer a Friend", "Affiliate Program"],
    hrefs: ["/size-guide", "/gift-cards", "/sitemap", "/refer", "/affiliate"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"],
    hrefs: ["/privacy", "/terms", "/cookies", "/accessibility"],
  },
];

const PAY_ICONS = ["VISA", "MASTERCARD", "PAYSTACK", "FLUTTERWAVE", "OPAY"];

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-auto">
      <div className="px-6 pt-10 pb-6">
        {/* Grid */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-8 pb-8 border-b border-white/10 mb-6">
          {/* Brand */}
          <div>
            <div className="font-condensed text-[26px] font-black tracking-[0.06em] uppercase mb-2.5">
              MISSUS<span className="text-[#e8002d]">.</span>
            </div>
            <p className="text-[12px] text-white/45 leading-relaxed font-light mb-4">
              Trendy, affordable women&apos;s fashion built for the modern
              Nigerian woman. Delivering style from Lagos to Abuja and beyond.
            </p>
            <div className="flex gap-2">
              {[Instagram, Facebook, Youtube, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 border border-white/15 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-white/60" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-condensed text-[12px] font-bold tracking-[0.14em] uppercase mb-3.5 text-white">
                {col.title}
              </h4>
              {col.links.map((link, i) => (
                <Link
                  key={link}
                  href={col.hrefs[i]}
                  className="block text-[12px] text-white/45 mb-2 hover:text-white transition-colors font-light"
                >
                  {link}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-[11px] text-white/30">
            © 2026 Missus Outfits. All rights reserved.
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {PAY_ICONS.map((icon) => (
              <span
                key={icon}
                className="bg-white/8 border border-white/10 rounded-sm px-2 py-1 font-condensed text-[9px] font-bold tracking-[0.08em] text-white/40"
              >
                {icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
