"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";

export default function HeaderSearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const isProductPage = pathname?.includes("/product/");

    // Don't show search bar on product pages
    if (isProductPage) {
        return null;
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
            setSearchValue("");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    return (
        <>
            {/* Mobile-only search bar */}
            <div className="mobile-search-bar" style={{
                width: "100%",
                background: "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                padding: "16px 20px",
                transition: "border-color 0.3s"
            }}>
                <form onSubmit={handleSearch} style={{ position: "relative", width: "100%" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        background: "transparent",
                        border: "none",
                        borderRadius: "0",
                        padding: "12px 0 12px 4px", // Left padding to align with hamburger menu
                        transition: "border-color 0.2s ease",
                        width: "100%"
                    }}>
                        {/* Search Icon on LEFT */}
                        <Search
                            size={16}
                            color="rgba(255,255,255,0.7)"
                            style={{ flexShrink: 0, marginRight: "12px", transition: "color 0.3s", cursor: "pointer" }}
                            onClick={handleSearch}
                        />

                        {/* Search Input */}
                        <input
                            type="text"
                            value={searchValue}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Try searching for... White Dress"
                            style={{
                                flex: 1,
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: "14px",
                                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                color: "#fff",
                                fontWeight: 400,
                                transition: "color 0.3s",
                                textAlign: "left"
                            }}
                        />
                    </div>
                </form>
            </div>

            <style>{`
                .mobile-search-bar {
                    display: none;
                }
                
                .mobile-search-bar input::placeholder {
                    color: rgba(255,255,255,0.5);
                    font-weight: 300;
                    transition: color 0.3s;
                }
                
                @media (max-width: 768px) {
                    .mobile-search-bar {
                        display: block;
                    }
                }
            `}</style>
        </>
    );
}