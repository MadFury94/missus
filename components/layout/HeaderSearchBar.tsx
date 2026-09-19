"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";

export default function HeaderSearchBar() {
    const router = useRouter();
    const pathname = usePathname();
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isHome = pathname === "/";

    // Track scroll for transparency on homepage
    useEffect(() => {
        if (!isHome) {
            setScrolled(true);
            return;
        }

        const checkScroll = () => setScrolled(window.scrollY > 100);
        checkScroll();

        window.addEventListener("scroll", checkScroll, { passive: true });
        return () => window.removeEventListener("scroll", checkScroll);
    }, [isHome]);

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

    // Determine if background should be transparent
    const transparent = isHome && !scrolled;

    return (
        <>
            {/* Mobile-only search bar */}
            <div className="mobile-search-bar" style={{
                width: "100%",
                background: transparent ? "transparent" : "#fff",
                borderBottom: transparent ? "1px solid rgba(255,255,255,0.15)" : "1px solid #f0f0f0",
                padding: "12px 20px",
                transition: "background 0.3s, border-color 0.3s"
            }}>
                <form onSubmit={handleSearch} style={{ position: "relative", width: "100%" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        background: transparent ? "rgba(255,255,255,0.1)" : "#f8f8f8",
                        border: `2px solid ${isFocused
                            ? (transparent ? "rgba(255,255,255,0.4)" : "#000")
                            : (transparent ? "rgba(255,255,255,0.2)" : "#e0e0e0")
                            }`,
                        borderRadius: "8px",
                        padding: "12px 16px",
                        transition: "border-color 0.2s ease, background 0.3s",
                        width: "100%",
                        backdropFilter: transparent ? "blur(4px)" : "none"
                    }}>
                        {/* Search Icon on LEFT */}
                        <Search
                            size={20}
                            color={transparent ? "rgba(255,255,255,0.8)" : "#999"}
                            style={{ flexShrink: 0, marginRight: "12px", transition: "color 0.3s" }}
                        />

                        {/* Search Input */}
                        <input
                            type="text"
                            value={searchValue}
                            onChange={handleInputChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Try searching for... Dresses, Tops, Sets"
                            style={{
                                flex: 1,
                                border: "none",
                                background: "transparent",
                                outline: "none",
                                fontSize: "15px",
                                fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
                                color: transparent ? "#fff" : "#333",
                                fontWeight: 400,
                                transition: "color 0.3s"
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
                    color: ${transparent ? "rgba(255,255,255,0.6)" : "#aaa"};
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