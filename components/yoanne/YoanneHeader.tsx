"use client";

import { BRAND_CONFIG } from "@/lib/brand-config";
import { Search, Heart, ShoppingBag } from "lucide-react";

export default function YoanneHeader() {
    return (
        <header className="nav solid">
            <div className="wrap nav-inner">
                <a href="/" className="logo">{BRAND_CONFIG.homepage.name}</a>
                <nav className="navlinks">
                    <a href="/" className="active">Home</a>
                    <a href="/shop">Shop</a>
                    <a href="/shop">Collections</a>
                    <a href="#about">About</a>
                    <a href="#lookbook">Lookbook</a>
                    <a href="#contact">Contact</a>
                </nav>
                <div className="navright">
                    <div className="navicons">
                        <a href="/search" data-action="search" aria-label="Search"><Search size={18} strokeWidth={1.5} /></a>
                        <a href="/wishlist" aria-label="Wishlist"><Heart size={18} strokeWidth={1.5} /></a>
                        <a href="/cart" data-action="cart" aria-label="Cart"><ShoppingBag size={18} strokeWidth={1.5} /></a>
                    </div>
                    <a href="/shop" className="btn btn-gold">Shop Collection</a>
                </div>
            </div>
        </header>
    );
}
