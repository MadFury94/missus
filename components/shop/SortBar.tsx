"use client";
import type { ProductFilters } from "@/types";

interface SortBarProps {
    total: number;
    showing: number;
    filters: ProductFilters;
    onChange: (filters: ProductFilters) => void;
}

const SORT_OPTIONS = [
    { value: "date", label: "Newest First" },
    { value: "popularity", label: "Best Selling" },
    { value: "price", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
];

export default function SortBar({ total, showing, filters, onChange }: SortBarProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-secondary/10 mb-6">
            <p className="text-sm text-secondary/60">
                <span className="font-semibold text-secondary">{showing}</span> of{" "}
                <span className="font-semibold text-secondary">{total}</span> products
            </p>
            <div className="flex items-center gap-3">
                <label className="text-xs text-secondary/50 uppercase tracking-wide">Sort:</label>
                <select
                    value={filters.orderby ?? "date"}
                    onChange={(e) => onChange({ ...filters, orderby: e.target.value as ProductFilters["orderby"] })}
                    className="text-sm border border-secondary/20 px-3 py-2 bg-white outline-none focus:border-secondary cursor-pointer"
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <select
                    value={filters.perPage ?? 60}
                    onChange={(e) => onChange({ ...filters, perPage: Number(e.target.value) })}
                    className="text-sm border border-secondary/20 px-3 py-2 bg-white outline-none focus:border-secondary cursor-pointer"
                >
                    <option value={60}>Show 60</option>
                    <option value={120}>Show 120</option>
                </select>
            </div>
        </div>
    );
}
