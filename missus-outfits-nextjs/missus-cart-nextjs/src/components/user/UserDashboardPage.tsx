"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag, Heart, MapPin, User, LogOut,
  Package, ChevronRight, Star, Bell, Settings,
  CreditCard, RefreshCw, Truck, CheckCircle, Clock
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────
const USER = {
  name: "Ada Okafor",
  email: "ada@example.com",
  phone: "08012345678",
  joinDate: "March 2025",
  avatar: "AO",
  tier: "Gold",
  points: 1240,
};

const ORDERS = [
  {
    id: "MO-2026-0048",
    date: "Apr 8, 2026",
    items: ["Maybelline Bubble Mini Dress", "Robin Halter Top"],
    total: 65000,
    status: "delivered",
    statusLabel: "Delivered",
  },
  {
    id: "MO-2026-0041",
    date: "Apr 2, 2026",
    items: ["Lorraine Pant Set"],
    total: 59000,
    status: "in_transit",
    statusLabel: "In Transit",
  },
  {
    id: "MO-2026-0033",
    date: "Mar 22, 2026",
    items: ["Stella Satin Wrap Dress", "Gemma Pinstripe Top"],
    total: 83000,
    status: "delivered",
    statusLabel: "Delivered",
  },
];

const STATUS_CONFIG = {
  delivered: { color: "text-[#007a3d]", bg: "bg-[#f0faf4]", icon: CheckCircle },
  in_transit: { color: "text-[#b8964a]", bg: "bg-[#fdf8ec]", icon: Truck },
  processing: { color: "text-[#767676]", bg: "bg-[#f5f5f5]", icon: Clock },
};

type TabId = "orders" | "wishlist" | "addresses" | "profile" | "settings";

const TABS: { id: TabId; label: string; icon: typeof ShoppingBag }[] = [
  { id: "orders", label: "My Orders", icon: ShoppingBag },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function OrdersTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-condensed text-[20px] font-black uppercase tracking-[0.06em]">
          Order History
        </h2>
        <span className="text-[12px] text-[#767676]">{ORDERS.length} orders</span>
      </div>
      <div className="space-y-3">
        {ORDERS.map((order) => {
          const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
          const Icon = cfg.icon;
          return (
            <div key={order.id} className="border border-[#e8e8e8] p-4 hover:border-black transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="font-condensed text-[14px] font-bold tracking-[0.04em] uppercase">{order.id}</p>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3 h-3" strokeWidth={2} />
                      {order.statusLabel}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#767676] mb-1">{order.date}</p>
                  <p className="text-[12px] text-[#555] leading-relaxed">
                    {order.items.join(", ")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-condensed text-[18px] font-black">{formatNaira(order.total)}</p>
                  <button className="text-[11px] text-black underline hover:no-underline mt-1 flex items-center gap-0.5 ml-auto">
                    View Details <ChevronRight className="w-3 h-3" strokeWidth={2} />
                  </button>
                </div>
              </div>
              {order.status === "delivered" && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f0f0f0]">
                  <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] font-condensed text-[#555] hover:text-black transition-colors border border-[#e0e0e0] hover:border-black px-3 py-1.5">
                    <Star className="w-3 h-3" strokeWidth={1.8} />
                    Leave Review
                  </button>
                  <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] font-condensed text-[#555] hover:text-black transition-colors border border-[#e0e0e0] hover:border-black px-3 py-1.5">
                    <RefreshCw className="w-3 h-3" strokeWidth={1.8} />
                    Return/Exchange
                  </button>
                  <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] font-condensed text-[#555] hover:text-black transition-colors border border-[#e0e0e0] hover:border-black px-3 py-1.5">
                    <ShoppingBag className="w-3 h-3" strokeWidth={1.8} />
                    Buy Again
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div>
      <h2 className="font-condensed text-[20px] font-black uppercase tracking-[0.06em] mb-5">
        My Profile
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "First Name", value: "Ada" },
          { label: "Last Name", value: "Okafor" },
          { label: "Email Address", value: USER.email },
          { label: "Phone Number", value: USER.phone },
          { label: "Date of Birth", value: "March 15, 1995" },
          { label: "City", value: "Lagos" },
        ].map((field) => (
          <div key={field.label}>
            <label className="font-condensed text-[10px] font-bold tracking-[0.18em] uppercase text-[#767676] block mb-1.5">
              {field.label}
            </label>
            <input
              defaultValue={field.value}
              className="w-full border-[1.5px] border-[#e0e0e0] focus:border-black h-10 px-3 text-[13px] outline-none"
            />
          </div>
        ))}
      </div>
      <button className="mt-6 bg-black text-white font-condensed text-[12px] font-bold tracking-[0.14em] uppercase px-8 py-3 hover:bg-[#222] transition-colors">
        Save Changes
      </button>
    </div>
  );
}

function AddressesTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-condensed text-[20px] font-black uppercase tracking-[0.06em]">Saved Addresses</h2>
        <button className="border-[1.5px] border-black font-condensed text-[11px] font-bold tracking-[0.12em] uppercase px-4 py-2 hover:bg-black hover:text-white transition-colors">
          + Add New
        </button>
      </div>
      {[
        { tag: "Home", addr: "14 Banana Island Road, Ikoyi", city: "Lagos", default: true },
        { tag: "Office", addr: "Plot 5, Central Business District", city: "Abuja", default: false },
      ].map((a) => (
        <div key={a.tag} className="border border-[#e8e8e8] p-4 mb-3 relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-condensed text-[12px] font-bold tracking-[0.1em] uppercase">{a.tag}</span>
                {a.default && (
                  <span className="bg-black text-white font-condensed text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5">
                    Default
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[#555]">{a.addr}</p>
              <p className="text-[12px] text-[#767676] mt-0.5">{a.city}, Nigeria</p>
            </div>
            <div className="flex gap-2">
              <button className="text-[11px] underline text-[#767676] hover:text-black">Edit</button>
              <button className="text-[11px] underline text-[#767676] hover:text-[#e8002d]">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("orders");

  const stats = [
    { label: "Total Orders", value: "12", icon: Package, color: "text-black" },
    { label: "Wishlist Items", value: "4", icon: Heart, color: "text-[#e8002d]" },
    { label: "Reward Points", value: "1,240", icon: Star, color: "text-[#b8964a]" },
    { label: "Active Returns", value: "1", icon: RefreshCw, color: "text-[#767676]" },
  ];

  return (
    <div className="flex-1 bg-[#f5f5f5]">
      {/* Top hero bar */}
      <div className="bg-black text-white px-6 py-6">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 bg-[#e8002d] flex items-center justify-center flex-shrink-0">
              <span className="font-condensed text-[16px] font-black text-white">{USER.avatar}</span>
            </div>
            <div>
              <p className="font-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 mb-0.5">
                Welcome back
              </p>
              <h1 className="font-condensed text-[22px] font-black uppercase tracking-[0.04em] text-white leading-none">
                {USER.name}
              </h1>
            </div>
            {/* Tier badge */}
            <div className="border border-[#b8964a] px-3 py-1 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#b8964a] fill-[#b8964a]" strokeWidth={0} />
              <span className="font-condensed text-[11px] font-bold tracking-[0.1em] uppercase text-[#b8964a]">
                {USER.tier} Member
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors font-condensed text-[11px] font-bold tracking-[0.1em] uppercase">
              <Bell className="w-4 h-4" strokeWidth={1.6} />
              Notifications
            </button>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors font-condensed text-[11px] font-bold tracking-[0.1em] uppercase"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.6} />
              Sign Out
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${s.color}`} strokeWidth={1.6} />
                </div>
                <div>
                  <p className="font-condensed text-[22px] font-black leading-none mb-0.5">{s.value}</p>
                  <p className="text-[11px] text-[#767676]">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-[220px_1fr] gap-5">
          {/* Sidebar nav */}
          <div className="bg-white h-fit">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
                    "border-b border-[#f5f5f5] last:border-0",
                    activeTab === tab.id
                      ? "bg-black text-white"
                      : "hover:bg-[#f5f5f5] text-[#333]",
                  ].join(" ")}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? "text-white" : "text-[#767676]"}`}
                    strokeWidth={1.6}
                  />
                  <span className="font-condensed text-[12px] font-bold tracking-[0.1em] uppercase">
                    {tab.label}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ml-auto ${activeTab === tab.id ? "text-white/60" : "text-[#ccc]"}`}
                    strokeWidth={2}
                  />
                </button>
              );
            })}

            {/* Points card in sidebar */}
            <div className="m-3 mt-4 bg-black p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Star className="w-3.5 h-3.5 text-[#b8964a] fill-[#b8964a]" strokeWidth={0} />
                <p className="font-condensed text-[10px] font-bold tracking-[0.18em] uppercase text-[#b8964a]">
                  Reward Points
                </p>
              </div>
              <p className="font-condensed text-[28px] font-black text-white leading-none mb-1">
                {USER.points.toLocaleString()}
              </p>
              <p className="text-[10px] text-white/40 mb-3">= {formatNaira(USER.points * 10)} off your next order</p>
              <button className="w-full bg-[#b8964a] text-white font-condensed text-[10px] font-bold tracking-[0.14em] uppercase py-2 hover:bg-[#a07838] transition-colors">
                Redeem Points
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="bg-white p-6">
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "wishlist" && (
              <div className="text-center py-12">
                <Heart className="w-10 h-10 text-[#e0e0e0] mx-auto mb-3" strokeWidth={1} />
                <p className="font-condensed text-[16px] font-bold uppercase tracking-[0.1em] text-[#ccc] mb-3">
                  View your saved items
                </p>
                <Link href="/wishlist" className="inline-block bg-black text-white font-condensed text-[12px] font-bold tracking-[0.12em] uppercase px-6 py-2.5 hover:bg-[#222] transition-colors">
                  Go to Wishlist →
                </Link>
              </div>
            )}
            {activeTab === "addresses" && <AddressesTab />}
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "settings" && (
              <div>
                <h2 className="font-condensed text-[20px] font-black uppercase tracking-[0.06em] mb-5">Settings</h2>
                {[
                  { label: "Email Notifications", desc: "New drops, deals and order updates", on: true },
                  { label: "SMS Alerts", desc: "Delivery updates via text message", on: true },
                  { label: "WhatsApp Updates", desc: "Order tracking on WhatsApp", on: false },
                  { label: "Marketing Emails", desc: "Style inspo and exclusive offers", on: true },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-4 border-b border-[#f0f0f0]">
                    <div>
                      <p className="font-condensed text-[13px] font-bold uppercase tracking-[0.06em]">{s.label}</p>
                      <p className="text-[12px] text-[#767676] mt-0.5">{s.desc}</p>
                    </div>
                    <button
                      className={[
                        "w-11 h-6 rounded-full relative transition-colors",
                        s.on ? "bg-black" : "bg-[#e0e0e0]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                          s.on ? "left-5" : "left-0.5",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                ))}
                <div className="mt-6 pt-5 border-t border-[#e8e8e8]">
                  <button className="flex items-center gap-2 text-[#e8002d] font-condensed text-[12px] font-bold tracking-[0.12em] uppercase hover:opacity-70 transition-opacity">
                    <LogOut className="w-4 h-4" strokeWidth={1.8} />
                    Sign Out of All Devices
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
