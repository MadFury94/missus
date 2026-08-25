"use client";
import { useState } from "react";
import type { ProductFilters } from "@/types";

interface FilterSidebarProps {
    filters: ProductFilters;
    onChange: (filters: ProductFilters) => void;
    showCategories?: boolean;
}

const SIZES_PRIMARY = ["S", "S/M", "M", "L"];
const SIZES_ALL = ["XXS", "XS", "S", "S/M", "M", "L", "XL", "XXL", "3XL"];

const COLORS = [
    { name: "Black", hex: "#000000" },
    { name: "Blue", hex: "#1a5fe0" },
    { name: "White", hex: "#ffffff" },
    { name: "Pink", hex: "#f06fa4" },
    { name: "Brown", hex: "#7a4c2e" },
    { name: "Red", hex: "#cc1a2a" },
    { name: "Yellow", hex: "#e8c832" },
    { name: "Green", hex: "#2a7a3a" },
    { name: "Grey", hex: "#888888" },
    { name: "Purple", hex: "#7a2aaa" },
    { name: "Orange", hex: "#e86a1a" },
    { name: "Gold", hex: "#c8922a" },
    { name: "Silver", hex: "#c0c0c0" },
    { name: "Nude", hex: "#d4a884" },
];

const PRICE_RANGES = [
    { label: "Under ₦20,000", min: 0, max: 20000 },
    { label: "₦20k – ₦35k", min: 20000, max: 35000 },
    { label: "₦35k – ₦55k", min: 35000, max: 55000 },
    { label: "₦55k – ₦100k", min: 55000, max: 100000 },
    { label: "₦100k+", min: 100000, max: undefined },
];

const CATEGORIES = [
    { label: "What's New", slug: "whats-new" },
    { label: "Dresses", slug: "dresses" },
    { label: "Matching Sets", slug: "matching-sets" },
    { label: "Tops", slug: "tops" },
    { label: "Bottoms", slug: "bottoms" },
    { label: "Athleisure", slug: "athleisure-loungewear" },
    { label: "Gift Shop", slug: "gift-shop" },
    { label: "Sale", slug: "discount-sale" },
];

const OCCASIONS = ["GNO/Date Night", "Vacation", "Brunch", "Cocktail", "Office", "Formal/Prom"];
const LENGTHS = ["Maxi", "Mini", "Midi", "Micro Mini"];
const STYLES = ["Bodycon", "A-Line", "Flowy", "Wrap", "Mermaid"];

// Separator line between groups
const Divider = () => (
    <div style={{ borderBottom: "1px solid #e8e8e8", margin: "0" }} />
);

function FilterGroup({
    title,
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "14px 0",
                    cursor: "pointer",
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#000",
                    textAlign: "left",
                }}
            >
                {title}
                <span style={{
                    fontSize: "18px",
                    fontWeight: 300,
                    color: "#000",
                    lineHeight: 1,
                    transition: "transform .2s",
                    transform: open ? "rotate(45deg)" : "none",
                    display: "inline-block",
                }}>
                    +
                </span>
            </button>
            {open && (
                <div style={{ paddingBottom: "16px" }}>
                    {children}
                </div>
            )}
        </div>
    );
}

export default function FilterSidebar({ filters, onChange, showCategories }: FilterSidebarProps) {
    const [showAllSizes, setShowAllSizes] = useState(false);
    const [showAllColors, setShowAllColors] = useState(false);

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

    const visibleSizes = showAllSizes ? SIZES_ALL : SIZES_PRIMARY;
    const visibleColors = showAllColors ? COLORS : COLORS.slice(0, 10);

    const hasFilters =
        (filters.sizes?.length ?? 0) > 0 ||
        (filters.colors?.length ?? 0) > 0 ||
        filters.minPrice !== undefined ||
        (filters.occasions?.length ?? 0) > 0;

    return (
        <aside style={{ fontFamily: "'Barlow', sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "#000" }}>
                    Refine By
                </span>
                {hasFilters && (
                    <button
                        onClick={() => onChange({})}
                        style={{ fontSize: "11px", color: "#767676", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "'Barlow', sans-serif" }}
                    >
                        Clear All
                    </button>
                )}
            </div>

            <Divider />

            {/* Category */}
            {showCategories !== false && (
                <>
                    <FilterGroup title="Category">
                        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                            {CATEGORIES.map((cat) => {
                                const active = filters.category === cat.slug;
                                return (
                                    <button
                                        key={cat.slug}
                                        onClick={() => onChange({
                                            ...filters,
                                            category: active ? undefined : cat.slug,
                                        })}
                                        style={{
                                            fontSize: "13px",
                                            color: active ? "#000" : "#333",
                                            fontWeight: active ? 700 : 400,
                                            padding: "6px 0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            fontFamily: "'Barlow', sans-serif",
                                            width: "100%",
                                        }}
                                    >
                                        {cat.label}
                                        {active && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </FilterGroup>
                    <Divider />
                </>
            )}

            {/* Size */}
            <FilterGroup title="Size">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                    {visibleSizes.map((s) => (
                        <button
                            key={s}
                            onClick={() => toggleArray("sizes", s)}
                            style={{
                                minWidth: "42px",
                                padding: "6px 8px",
                                border: "1px solid",
                                borderColor: isActive("sizes", s) ? "#000" : "#d0d0d0",
                                background: isActive("sizes", s) ? "#000" : "#fff",
                                color: isActive("sizes", s) ? "#fff" : "#333",
                                fontFamily: "'Barlow', sans-serif",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all .15s",
                                textAlign: "center",
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowAllSizes(!showAllSizes)}
                    style={{ fontSize: "12px", color: "#000", background: "none", border: "none", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textDecoration: "underline", padding: 0 }}
                >
                    {showAllSizes ? "VIEW LESS" : "VIEW MORE"}
                </button>
            </FilterGroup>

            <Divider />

            {/* Colors */}
            <FilterGroup title="Colors">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 8px", marginBottom: "8px" }}>
                    {visibleColors.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => toggleArray("colors", color.name)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "2px 0",
                                fontFamily: "'Barlow', sans-serif",
                                fontSize: "12px",
                                color: isActive("colors", color.name) ? "#000" : "#333",
                                fontWeight: isActive("colors", color.name) ? 700 : 400,
                                textAlign: "left",
                            }}
                        >
                            <span style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                background: color.hex,
                                flexShrink: 0,
                                border: color.name === "White"
                                    ? "1.5px solid #d0d0d0"
                                    : isActive("colors", color.name)
                                        ? "2px solid #000"
                                        : "1.5px solid transparent",
                                outline: isActive("colors", color.name) ? "2px solid #000" : "none",
                                outlineOffset: "2px",
                                display: "inline-block",
                            }} />
                            {color.name}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowAllColors(!showAllColors)}
                    style={{ fontSize: "12px", color: "#000", background: "none", border: "none", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 600, textDecoration: "underline", padding: 0 }}
                >
                    {showAllColors ? "VIEW LESS" : "VIEW MORE"}
                </button>
            </FilterGroup>

            <Divider />

            {/* Price */}
            <FilterGroup title="Price" defaultOpen={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {PRICE_RANGES.map((r) => (
                        <label
                            key={r.label}
                            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#333" }}
                        >
                            <input
                                type="radio"
                                name="price"
                                checked={filters.minPrice === r.min && filters.maxPrice === r.max}
                                onChange={() => onChange({ ...filters, minPrice: r.min, maxPrice: r.max })}
                                style={{ accentColor: "#000", width: "14px", height: "14px", cursor: "pointer" }}
                            />
                            {r.label}
                        </label>
                    ))}
                </div>
            </FilterGroup>

            <Divider />

            {/* Occasion */}
            <FilterGroup title="Occasion" defaultOpen={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {OCCASIONS.map((o) => (
                        <label key={o} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#333" }}>
                            <input
                                type="checkbox"
                                checked={isActive("occasions", o)}
                                onChange={() => toggleArray("occasions", o)}
                                style={{ accentColor: "#000", width: "14px", height: "14px", cursor: "pointer" }}
                            />
                            {o}
                        </label>
                    ))}
                </div>
            </FilterGroup>

            <Divider />

            {/* Length */}
            <FilterGroup title="Length" defaultOpen={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {LENGTHS.map((l) => (
                        <label key={l} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#333" }}>
                            <input
                                type="checkbox"
                                checked={isActive("lengths", l)}
                                onChange={() => toggleArray("lengths", l)}
                                style={{ accentColor: "#000", width: "14px", height: "14px", cursor: "pointer" }}
                            />
                            {l}
                        </label>
                    ))}
                </div>
            </FilterGroup>

            <Divider />

            {/* Style */}
            <FilterGroup title="Style" defaultOpen={false}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {STYLES.map((s) => (
                        <label key={s} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#333" }}>
                            <input
                                type="checkbox"
                                checked={isActive("styles", s)}
                                onChange={() => toggleArray("styles", s)}
                                style={{ accentColor: "#000", width: "14px", height: "14px", cursor: "pointer" }}
                            />
                            {s}
                        </label>
                    ))}
                </div>
            </FilterGroup>

            <Divider />
        </aside>
    );
}
