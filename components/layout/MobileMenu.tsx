"use client";
import { useEffect } from "react";
import Link from "next/link";
import { SUB_NAV } from "@/lib/config";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-[199] transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[200] overflow-y-auto shadow-2xl animate-slide-in">
                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-secondary/10">
                        <Link
                            href="/"
                            onClick={onClose}
                            className="flex items-center"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/missus-logo.webp" alt="Missus" style={{ height: "36px", width: "auto" }} />
                        </Link>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close menu"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <form action="/search" method="get" className="mb-6">
                        <div className="flex border-2 border-secondary">
                            <input
                                name="q"
                                type="text"
                                placeholder="Search..."
                                className="flex-1 px-4 py-3 text-sm outline-none"
                            />
                            <button
                                type="submit"
                                className="w-12 bg-secondary flex items-center justify-center"
                                aria-label="Search"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <Link
                            href="/account/login"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 py-3 border border-secondary/20 hover:border-secondary transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wider">Login</span>
                        </Link>
                        <Link
                            href="/wishlist"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 py-3 border border-secondary/20 hover:border-secondary transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wider">Wishlist</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1">
                        {SUB_NAV.map((link) => (
                            <Link
                                key={link.href + link.label}
                                href={link.href}
                                onClick={onClose}
                                className={`block py-3 px-4 font-display text-base font-bold uppercase tracking-wide hover:bg-gray-50 transition-colors ${link.sale ? 'text-red-600' : 'text-secondary'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Footer Info */}
                    <div className="mt-8 pt-6 border-t border-secondary/10 space-y-3 text-sm text-secondary/60">
                        <p className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            Free Shipping Over ₦150,000
                        </p>
                        <p className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            30-Day Returns
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
