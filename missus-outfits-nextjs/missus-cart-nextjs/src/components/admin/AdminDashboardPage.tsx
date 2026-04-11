"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag, Users, TrendingUp, Package, Bell,
  Search, LayoutDashboard, Settings, LogOut, ChevronRight,
  ArrowUpRight, ArrowDownRight, Eye, MoreVertical,
  CheckCircle, Clock, Truck, AlertCircle, Tag,
  BarChart2, ShieldCheck, Star, RefreshCw
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Revenue", value: "₦4,821,000", sub: "+12.4% this week", up: true, icon: TrendingUp, accent: "#e8002d" },
  { label: "Orders Today", value: "38", sub: "+5 vs yesterday", up: true, icon: ShoppingBag, accent: "#007a3d" },
  { label: "Active Customers", value: "1,284", sub: "+94 this month", up: true, icon: Users, accent: "#b8964a" },
  { label: "Low Stock Items", value: "7", sub: "Needs attention", up: false, icon: Package, accent: "#e8002d" },
];

const RECENT_ORDERS = [
  { id: "MO-2026-0058", customer: "Temi Adeyemi", email: "temi@gmail.com", items: 3, total: 107000, status: "processing", date: "Just now" },
  { id: "MO-2026-0057", customer: "Chisom Obi", email: "chisom@outlook.com", items: 1, total: 43000, status: "in_transit", date: "12 min ago" },
  { id: "MO-2026-0056", customer: "Ngozi Eze", email: "ngozi@email.com", items: 2, total: 78000, status: "delivered", date: "1 hr ago" },
  { id: "MO-2026-0055", customer: "Sarah Adeleke", email: "sarah@gmail.com", items: 4, total: 165000, status: "delivered", date: "2 hrs ago" },
  { id: "MO-2026-0054", customer: "Fatima Bello", email: "fatima@yahoo.com", items: 1, total: 59000, status: "cancelled", date: "3 hrs ago" },
];

const TOP_PRODUCTS = [
  { name: "Maybelline Bubble Mini", sales: 142, stock: 28, revenue: 6106000, trend: "up" },
  { name: "Malibu Barbie Halter", sales: 118, stock: 54, revenue: 3540000, trend: "up" },
  { name: "Stella Satin Wrap Dress", sales: 96, stock: 12, revenue: 4608000, trend: "down" },
  { name: "Lorraine Pant Set", sales: 88, stock: 4, revenue: 5192000, trend: "up" },
  { name: "Gemma Pinstripe Top", sales: 71, stock: 37, revenue: 2485000, trend: "up" },
];

const STATUS_MAP = {
  processing: { label: "Processing", color: "text-[#767676]", bg: "bg-[#f5f5f5]", icon: Clock },
  in_transit: { label: "In Transit", color: "text-[#b8964a]", bg: "bg-[#fdf8ec]", icon: Truck },
  delivered: { label: "Delivered", color: "text-[#007a3d]", bg: "bg-[#f0faf4]", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-[#e8002d]", bg: "bg-red-50", icon: AlertCircle },
};

type NavId = "dashboard" | "orders" | "products" | "customers" | "analytics" | "promos" | "settings";

const NAV_ITEMS: { id: NavId; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag, badge: 12 },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "promos", label: "Promos & Sales", icon: Tag },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }: { active: NavId; setActive: (id: NavId) => void }) {
  return (
    <aside className="w-[220px] bg-[#0a0a0a] flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <Link href="/">
          <span className="font-condensed text-[22px] font-black tracking-[0.06em] uppercase text-white">
            MISSUS<span className="text-[#e8002d]">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-1.5 mt-1">
          <ShieldCheck className="w-3 h-3 text-[#e8002d]" strokeWidth={2} />
          <span className="font-condensed text-[9px] font-bold tracking-[0.18em] uppercase text-white/30">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={[
                "w-full flex items-center gap-3 px-5 py-3 text-left transition-all relative",
                isActive
                  ? "bg-[#e8002d] text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5",
              ].join(" ")}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-white" />
              )}
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.6} />
              <span className="font-condensed text-[12px] font-bold tracking-[0.1em] uppercase flex-1">
                {item.label}
              </span>
              {item.badge && (
                <span className={`font-condensed text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${isActive ? "bg-white text-[#e8002d]" : "bg-[#e8002d] text-white"}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/8 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[#e8002d] flex items-center justify-center flex-shrink-0">
            <span className="font-condensed text-[11px] font-black text-white">AM</span>
          </div>
          <div className="min-w-0">
            <p className="font-condensed text-[12px] font-bold text-white truncate">Admin Missus</p>
            <p className="text-[10px] text-white/30 truncate">admin@missus.com</p>
          </div>
        </div>
        <Link href="/admin/login" className="flex items-center gap-2 text-white/30 hover:text-white transition-colors">
          <LogOut className="w-3.5 h-3.5" strokeWidth={1.6} />
          <span className="font-condensed text-[11px] font-bold tracking-[0.1em] uppercase">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}

// ─── Dashboard Main ───────────────────────────────────────────────────────────
function DashboardMain() {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-5 border border-[#e8e8e8]">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: `${s.accent}15` }}>
                  <Icon className="w-5 h-5" style={{ color: s.accent }} strokeWidth={1.6} />
                </div>
                <span className={`flex items-center gap-0.5 text-[11px] font-bold ${s.up ? "text-[#007a3d]" : "text-[#e8002d]"}`}>
                  {s.up ? <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} /> : <ArrowDownRight className="w-3.5 h-3.5" strokeWidth={2.5} />}
                  {s.sub.split(" ")[0]}
                </span>
              </div>
              <p className="font-condensed text-[28px] font-black leading-none mb-1">{s.value}</p>
              <p className="text-[12px] text-[#767676]">{s.label}</p>
              <p className="text-[11px] text-[#aaa] mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue chart placeholder + quick actions */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="bg-white border border-[#e8e8e8] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-condensed text-[16px] font-black uppercase tracking-[0.08em]">Revenue Overview</h3>
            <select className="text-[11px] border border-[#e0e0e0] px-2 py-1.5 outline-none bg-white cursor-pointer">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
            </select>
          </div>
          {/* Bar chart placeholder */}
          <div className="flex items-end gap-2 h-[140px]">
            {[55, 72, 48, 90, 65, 88, 78].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full transition-all hover:opacity-80 cursor-pointer"
                  style={{ height: `${h}%`, background: i === 5 ? "#e8002d" : "#e8e8e8" }}
                />
                <span className="text-[9px] text-[#aaa] font-condensed font-medium">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0f0f0]">
            <div>
              <p className="text-[11px] text-[#767676]">This week total</p>
              <p className="font-condensed text-[18px] font-black">₦1,240,000</p>
            </div>
            <div>
              <p className="text-[11px] text-[#767676]">Avg. order value</p>
              <p className="font-condensed text-[18px] font-black">₦67,500</p>
            </div>
            <div>
              <p className="text-[11px] text-[#767676]">Conversion rate</p>
              <p className="font-condensed text-[18px] font-black">3.8%</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[#e8e8e8] p-5">
          <h3 className="font-condensed text-[14px] font-black uppercase tracking-[0.1em] mb-4">Quick Actions</h3>
          {[
            { label: "Add New Product", icon: Package, color: "#000" },
            { label: "Create Promo Code", icon: Tag, color: "#e8002d" },
            { label: "View Pending Orders", icon: Clock, color: "#b8964a", badge: "12" },
            { label: "Manage Inventory", icon: RefreshCw, color: "#767676" },
            { label: "Customer Reports", icon: BarChart2, color: "#007a3d" },
            { label: "Site Settings", icon: Settings, color: "#555" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                className="w-full flex items-center gap-3 py-2.5 border-b border-[#f5f5f5] last:border-0 hover:bg-[#f5f5f5] -mx-2 px-2 transition-colors text-left"
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: a.color }} strokeWidth={1.6} />
                <span className="font-condensed text-[12px] font-bold tracking-[0.06em] uppercase text-[#333] flex-1">
                  {a.label}
                </span>
                {(a as { badge?: string }).badge && (
                  <span className="bg-[#e8002d] text-white font-condensed text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {(a as { badge?: string }).badge}
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-[#ccc]" strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-[#e8e8e8]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e8]">
          <h3 className="font-condensed text-[16px] font-black uppercase tracking-[0.08em]">Recent Orders</h3>
          <div className="flex items-center gap-3">
            <div className="flex border border-[#e0e0e0] h-8 overflow-hidden">
              <input className="text-[12px] px-3 w-44 outline-none bg-white placeholder:text-[#bbb]" placeholder="Search orders…" />
              <button className="w-8 bg-[#f5f5f5] flex items-center justify-center border-l border-[#e0e0e0]">
                <Search className="w-3.5 h-3.5 text-[#767676]" strokeWidth={2} />
              </button>
            </div>
            <button className="text-[11px] font-condensed font-bold tracking-[0.1em] uppercase underline hover:no-underline">
              View All →
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {["Order ID", "Customer", "Items", "Total", "Status", "Date", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-condensed text-[10px] font-bold tracking-[0.14em] uppercase text-[#aaa]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_ORDERS.map((order) => {
              const s = STATUS_MAP[order.status as keyof typeof STATUS_MAP];
              const Icon = s.icon;
              return (
                <tr key={order.id} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <span className="font-condensed text-[12px] font-bold tracking-[0.04em]">{order.id}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium">{order.customer}</p>
                    <p className="text-[11px] text-[#aaa]">{order.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#555]">{order.items} item{order.items !== 1 ? "s" : ""}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-condensed text-[14px] font-bold">{formatNaira(order.total)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 ${s.bg} ${s.color}`}>
                      <Icon className="w-3 h-3" strokeWidth={2} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[#aaa]">{order.date}</td>
                  <td className="px-5 py-3.5">
                    <button className="w-7 h-7 flex items-center justify-center hover:bg-[#f0f0f0] transition-colors">
                      <MoreVertical className="w-4 h-4 text-[#aaa]" strokeWidth={1.8} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Top products */}
      <div className="bg-white border border-[#e8e8e8] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-condensed text-[16px] font-black uppercase tracking-[0.08em]">Top Products</h3>
          <button className="text-[11px] font-condensed font-bold tracking-[0.1em] uppercase underline hover:no-underline">
            View All Products →
          </button>
        </div>
        <div className="space-y-0 divide-y divide-[#f5f5f5]">
          {TOP_PRODUCTS.map((p, i) => (
            <div key={p.name} className="flex items-center gap-4 py-3">
              <span className="font-condensed text-[18px] font-black text-[#e0e0e0] w-6 text-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="w-10 h-12 bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-[#ccc]" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-condensed text-[13px] font-bold uppercase tracking-[0.04em] truncate">{p.name}</p>
                <p className="text-[11px] text-[#aaa] mt-0.5">
                  {p.sales} sold ·{" "}
                  <span className={p.stock < 10 ? "text-[#e8002d] font-semibold" : ""}>{p.stock} in stock</span>
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-condensed text-[14px] font-black">{formatNaira(p.revenue)}</p>
                <p className={`text-[10px] flex items-center justify-end gap-0.5 mt-0.5 font-medium ${p.trend === "up" ? "text-[#007a3d]" : "text-[#e8002d]"}`}>
                  {p.trend === "up" ? <ArrowUpRight className="w-3 h-3" strokeWidth={2.5} /> : <ArrowDownRight className="w-3 h-3" strokeWidth={2.5} />}
                  {p.trend === "up" ? "Trending" : "Slowing"}
                </p>
              </div>
              <button className="ml-2">
                <Eye className="w-4 h-4 text-[#ccc] hover:text-black transition-colors" strokeWidth={1.6} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f5f5]">
      <Sidebar active={activeNav} setActive={setActiveNav} />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-[#e8e8e8] h-14 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h1 className="font-condensed text-[18px] font-black uppercase tracking-[0.08em] leading-none">
              {NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? "Dashboard"}
            </h1>
            <p className="text-[11px] text-[#aaa] mt-0.5">
              {new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex border border-[#e0e0e0] h-8 overflow-hidden">
              <input className="text-[12px] px-3 w-48 outline-none bg-white placeholder:text-[#bbb]" placeholder="Search everything…" />
              <button className="w-8 bg-[#f5f5f5] flex items-center justify-center border-l border-[#e0e0e0]">
                <Search className="w-3.5 h-3.5 text-[#767676]" strokeWidth={2} />
              </button>
            </div>
            <button className="relative w-8 h-8 flex items-center justify-center hover:bg-[#f5f5f5] transition-colors">
              <Bell className="w-4.5 h-4.5 text-[#555]" strokeWidth={1.6} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#e8002d] rounded-full" />
            </button>
            <div className="w-8 h-8 bg-[#e8002d] flex items-center justify-center">
              <span className="font-condensed text-[11px] font-black text-white">AM</span>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeNav === "dashboard" && <DashboardMain />}

          {activeNav !== "dashboard" && (
            <div className="bg-white border border-[#e8e8e8] p-16 text-center">
              <div className="w-14 h-14 bg-[#f5f5f5] flex items-center justify-center mx-auto mb-4">
                {(() => { const Icon = NAV_ITEMS.find(n => n.id === activeNav)?.icon ?? LayoutDashboard; return <Icon className="w-7 h-7 text-[#ccc]" strokeWidth={1.4} />; })()}
              </div>
              <p className="font-condensed text-[18px] font-bold uppercase tracking-[0.1em] text-[#ccc] mb-2">
                {NAV_ITEMS.find((n) => n.id === activeNav)?.label}
              </p>
              <p className="text-[12px] text-[#bbb]">
                This section is ready to be built out. Click Dashboard to return to the overview.
              </p>
              <button
                onClick={() => setActiveNav("dashboard")}
                className="mt-5 bg-black text-white font-condensed text-[12px] font-bold tracking-[0.12em] uppercase px-6 py-2.5 hover:bg-[#222] transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
