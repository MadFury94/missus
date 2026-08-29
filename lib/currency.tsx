"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export const CURRENCIES = [
    { code: "NGN", symbol: "₦", label: "Nigerian Naira" },
    { code: "USD", symbol: "$", label: "US Dollar" },
    { code: "GBP", symbol: "£", label: "British Pound" },
    { code: "EUR", symbol: "€", label: "Euro" },
    { code: "CAD", symbol: "CA$", label: "Canadian Dollar" },
    { code: "GHS", symbol: "GH₵", label: "Ghanaian Cedi" },
    { code: "KES", symbol: "KSh", label: "Kenyan Shilling" },
    { code: "ZAR", symbol: "R", label: "South African Rand" },
];

interface CurrencyCtx {
    currency: string;
    symbol: string;
    rates: Record<string, number>;
    setCurrency: (code: string) => void;
    convert: (nairaAmount: number) => string;
    loading: boolean;
}

const Ctx = createContext<CurrencyCtx>({
    currency: "NGN", symbol: "₦", rates: {}, setCurrency: () => { }, convert: () => "", loading: true,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState("NGN");
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    // Load saved preference
    useEffect(() => {
        const saved = localStorage.getItem("missus_currency");
        if (saved && CURRENCIES.find((c) => c.code === saved)) {
            setCurrencyState(saved);
        }
    }, []);

    // Fetch rates once on mount
    useEffect(() => {
        fetch("/api/currency")
            .then((r) => r.json())
            .then((d) => { if (d.rates) setRates(d.rates); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const setCurrency = useCallback((code: string) => {
        setCurrencyState(code);
        localStorage.setItem("missus_currency", code);
        // Notify all components that currency changed
        window.dispatchEvent(new CustomEvent("currency-changed", { detail: code }));
    }, []);

    const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₦";

    // nairaAmount is in kobo (WooCommerce stores prices * 100)
    const convert = useCallback((kobo: number): string => {
        const naira = kobo / 100;
        if (currency === "NGN" || !rates[currency]) {
            return `₦${naira.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }
        const rate = rates[currency];
        const converted = naira * rate;
        const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency;
        // Format based on value size
        if (converted < 10) {
            return `${sym}${converted.toFixed(2)}`;
        }
        return `${sym}${converted.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }, [currency, rates]);

    return (
        <Ctx.Provider value={{ currency, symbol, rates, setCurrency, convert, loading }}>
            {children}
        </Ctx.Provider>
    );
}

export function useCurrency() {
    return useContext(Ctx);
}
