"use client";
import { useState } from "react";
import type { ProductFilters } from "@/types";

interface FilterSidebarProps {
    filters: ProductFilters;
    onChange: (filters: ProductFilters) => void;
    showCategories?: boolean;
}

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];
const OCCASIONS = ["GNO/Date Night", "Vacation", "Brunch", "Cocktail", "Office", "Formal/Prom"];
const LENGTHS = ["Maxi", "Mini", "Midi", "Micro Mini"];
const STYLES = ["Bodycon", "A-Line", "Flowy", "Wrap", "Mermaid"];
const NECKLINES = ["V-Neck", "Halter", "Strapless", "Square Neck", "Sweetheart", "Off-Shoulder"];
const FABRICS = ["Satin", "Mesh", "Bandage", "Linen", "Crepe"];
const DETAILS = ["Ruched", "Cut Out", "Backless", "Split Hem", "Sequin"];
const PRICE_RANGES = [
    { label: "Under ₦20,000", min: 0, max: 20000 },
    { label: "₦20k – ₦35k", min: 20000, max: 35000 },
    { label: "₦35k – ₦55k", min: 35000, max: 55000 },
    { label: "₦55k – ₦100k", min: 55000, max: 100000 },
    { label: "₦100k+", min: 100000, max: undefined },
];

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="border-b border-secondary/10 py-4">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full text-sm font-bold text-secondary uppercase tracking-wide"
            >
                {title}
                <span className="text-secondary/40">{open ? "−" : "+"}</span>
            </button>
            {open && <div className="mt-3">{children}</div>}
        </div>
    );
}

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
    function toggleArray(key: keyof ProductFilters, value: string) {
        const current = (filters[key] as string[] | undefined) ?? [];
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        onChange({ ...filters, [key]: next });
    }

    function isActive(key: keyof ProductFilters, value: string) {
        return ((filters[key] as string[] | undefined) ?? []).includes(value);
    }

    return (
        <aside className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Refine By</h3>
                <button
                    onClick={() => onChange({})}
                    className="text-xs text-secondary/40 hover:text-secondary transition-colors"
                >
                    Clear All
                </button>
            </div>

            <FilterGroup title="Size">
                <div className="grid grid-cols-3 gap-1.5">
                    {SIZES.map((s) => (
                        <button
                            key={s}
                            onClick={() => toggleArray("sizes", s)}
                            className={`text-xs py-2 border font-medium transition-colors ${isActive("sizes", s)
                                    ? "border-secondary bg-secondary text-white"
                                    : "border-secondary/20 text-secondary hover:border-secondary"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </FilterGroup>

            <FilterGroup title="Occasion">
                <div className="space-y-2">
                    {OCCASIONS.map((o) => (
                        <label key={o} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive("occasions", o)}
                                onChange={() => toggleArray("occasions", o)}
                                className="accent-secondary"
                            />
                            <span className="text-sm text-secondary/70">{o}</span>
                        </label>
                    ))}
                </div>
            </FilterGroup>

            <FilterGroup title="Length">
                <div className="space-y-2">
                    {LENGTHS.map((l) => (
                        <label key={l} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive("lengths", l)}
                                onChange={() => toggleArray("lengths", l)}
                                className="accent-secondary"
                            />
                            <span className="text-sm text-secondary/70">{l}</span>
                        </label>
                    ))}
                </div>
            </FilterGroup>

            <FilterGroup title="Style">
                <div className="space-y-2">
                    {STYLES.map((s) => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive("styles", s)}
                                onChange={() => toggleArray("styles", s)}
                                className="accent-secondary"
                            />
                            <span className="text-sm text-secondary/70">{s}</span>
                        </label>
                    ))}
                </div>
            </FilterGroup>

            <FilterGroup title="Neckline">
                <div className="space-y-2">
                    {NECKLINES.map((n) => (
                        <label key={n} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive("necklines", n)}
                                onChange={() => toggleArray("necklines", n)}
                                className="accent-secondary"
                            />
                            <span className="text-sm text-secondary/70">{n}</span>
                        </label>
                    ))}
                </div>
            </FilterGroup>

            <FilterGroup title="Fabric">
                <div className="space-y-2">
                    {FABRICS.map((f) => (
                        <label key={f} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive("fabrics", f)}
                                onChange={() => toggleArray("fabrics", f)}
                                className="accent-secondary"
                            />
                            <span className="text-sm text-secondary/70">{f}</span>
                        </label>
                    ))}
                </div>
            </FilterGroup>

            <FilterGroup title="Detail">
                <div className="space-y-2">
                    {DETAILS.map((d) => (
                        <label key={d} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive("details", d)}
                                onChange={() => toggleArray("details", d)}
                                className="accent-secondary"
                            />
                            <span className="text-sm text-secondary/70">{d}</span>
                        </label>
                    ))}
                </div>
            </FilterGroup>

            <FilterGroup title="Price">
                <div className="space-y-2">
                    {PRICE_RANGES.map((r) => (
                        <label key={r.label} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="price"
                                checked={filters.minPrice === r.min && filters.maxPrice === r.max}
                                onChange={() => onChange({ ...filters, minPrice: r.min, maxPrice: r.max })}
                                className="accent-secondary"
                            />
                            <span className="text-sm text-secondary/70">{r.label}</span>
                        </label>
                    ))}
                </div>
            </FilterGroup>
        </aside>
    );
}
