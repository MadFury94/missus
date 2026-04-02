# Missus — Implementation Plan

## Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- WooCommerce REST API (headless)
- WordPress REST API (store settings, pages)
- Paystack (payments)

---

## Design Tokens

```
Primary:   #C8A882  (warm nude/tan — "it-girl" brand color)
Secondary: #1A1A1A  (near-black — text, headers, CTAs)
Accent:    #E63946  (sale red — badges, countdown, deals)
Background:#FAFAF8  (off-white)
Muted:     #F4F1ED  (light beige — section backgrounds)
```

Store name, tagline, social links, and contact info all come from
`/wp-json/wp/v2/settings` + WooCommerce store settings API.

---

## Project Structure

```
missus/
├── app/
│   ├── layout.tsx                  # Root layout — Navbar + Footer
│   ├── page.tsx                    # Homepage
│   ├── shop/
│   │   └── page.tsx                # Shop All (340 products)
│   ├── dresses/
│   │   └── page.tsx                # Dresses category (120 products)
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx            # Dynamic category page
│   ├── product/
│   │   └── [slug]/
│   │       └── page.tsx            # Product detail page
│   ├── sale/
│   │   └── page.tsx                # MissusDeals / Sale page
│   ├── cart/
│   │   └── page.tsx                # Cart page
│   ├── checkout/
│   │   └── page.tsx                # Checkout + Paystack
│   ├── account/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── orders/page.tsx
│   └── api/
│       ├── store/route.ts          # Proxy: WC store settings
│       ├── products/route.ts       # Proxy: WC products list
│       ├── products/[id]/route.ts  # Proxy: single product
│       ├── cart/route.ts           # Cart session management
│       └── payment/
│           └── initiate/route.ts   # Paystack payment init
│
├── components/
│   ├── layout/
│   │   ├── AnnouncementBar.tsx     # "FREE SHIPPING ON ORDERS ₦150,000+"
│   │   ├── Navbar.tsx              # Logo + nav + search + wishlist + bag
│   │   ├── CategoryNav.tsx         # Second nav row (New In, Clothing, etc.)
│   │   └── Footer.tsx              # Full footer with links + payment icons
│   │
│   ├── home/
│   │   ├── HeroBanner.tsx          # Split hero with Spring Collection text
│   │   ├── MarqueeStrip.tsx        # Scrolling "Free Delivery · New Drops..."
│   │   ├── TrendReport.tsx         # 4-card editorial grid
│   │   ├── SaleBanner.tsx          # 60% OFF full-width banner
│   │   ├── NewInSection.tsx        # Horizontal scroll product grid
│   │   ├── SaleStrip.tsx           # Dark sale CTA strip
│   │   ├── CategoryGrid.tsx        # Shop By Category (D/MS/T/B/A/S)
│   │   ├── ReviewsSection.tsx      # Customer reviews carousel
│   │   ├── AppDownloadBanner.tsx   # App download CTA
│   │   └── TrustBar.tsx            # Delivery · Returns · Secure · Support
│   │
│   ├── product/
│   │   ├── ProductCard.tsx         # Card used in all grids (badge, price, sizes)
│   │   ├── ProductGrid.tsx         # Responsive grid wrapper
│   │   ├── ProductGallery.tsx      # Image gallery with Front/Back/Detail tabs
│   │   ├── ProductInfo.tsx         # Name, price, color, size, qty, CTA
│   │   ├── SizeGuide.tsx           # Accordion size guide
│   │   └── YouMayAlsoLike.tsx      # Related products scroll
│   │
│   ├── shop/
│   │   ├── FilterSidebar.tsx       # Size, Color, Occasion, Length, etc.
│   │   ├── SortBar.tsx             # Sort + view toggle + count
│   │   └── ActiveFilters.tsx       # Pill tags for active filters
│   │
│   └── ui/
│       ├── Badge.tsx               # NEW / DEAL / % OFF badges
│       ├── Button.tsx              # Primary / secondary / ghost variants
│       ├── CountdownTimer.tsx      # Sale countdown HH:MM:SS
│       ├── PriceDisplay.tsx        # Sale price + original + SAVE
│       ├── StarRating.tsx          # ★★★★★ display
│       ├── SectionHeader.tsx       # Title + subtitle + view-all link
│       └── NewsletterForm.tsx      # Email subscribe input
│
├── lib/
│   ├── woocommerce.ts              # WC REST API client (products, categories, orders)
│   ├── wordpress.ts                # WP REST API client (store settings, pages)
│   ├── cart.ts                     # Cart state helpers (localStorage + server)
│   ├── paystack.ts                 # Paystack payment helpers
│   └── config.ts                   # Site-wide constants (colors, nav items)
│
├── types/
│   └── index.ts                    # WCProduct, WCCategory, CartItem, Order types
│
└── .env.local                      # All API keys and secrets
```

---

## Pages

### 1. Homepage (`/`)
- AnnouncementBar
- Navbar + CategoryNav
- HeroBanner (Spring Collection 2026 split layout)
- MarqueeStrip (scrolling ticker)
- TrendReport (4 editorial cards: Night Out, Resort, Spring Sets, Prom)
- SaleBanner (60% OFF)
- NewInSection (horizontal scroll, 10 products from WC "new" tag)
- SaleStrip (dark CTA)
- CategoryGrid (Dresses / Sets / Tops / Bottoms / Accessories / Shoes)
- ReviewsSection (4 reviews)
- AppDownloadBanner
- TrustBar (4 icons)
- NewsletterForm
- Footer

### 2. Shop All (`/shop`)
- FilterSidebar (Category, Size, Color, Price, Occasion)
- SortBar
- ProductGrid (60 per page, load more)
- Pagination / Load More

### 3. Category (`/category/[slug]` + `/dresses`)
- Category-specific FilterSidebar (Size, Color, Occasion, Length, Style, Neckline, Fabric, Detail, Price)
- SortBar
- ProductGrid
- Load More

### 4. Product (`/product/[slug]`)
- ProductGallery (4 images, tab switcher)
- ProductInfo (name, price, color swatches, size selector, qty, Add to Bag, Buy Now)
- Accordion (Details, Size & Fit, Care, Shipping, Reviews)
- YouMayAlsoLike

### 5. Sale (`/sale`)
- Countdown timer banner
- Category filter tabs (All / Dresses / Tops / Bottoms / Sets / Under ₦15k / Up to 60%)
- SortBar
- ProductGrid (sale items with % OFF badges)

### 6. Cart (`/cart`)
- Cart items list
- Order summary
- Proceed to checkout CTA

### 7. Checkout (`/checkout`)
- Delivery form
- Paystack payment integration
- Order summary sidebar

### 8. Account (`/account/login`, `/account/register`, `/account/orders`)
- WooCommerce JWT auth

---

## API Layer (`lib/woocommerce.ts`)

```
getProducts(params)         → GET /wp-json/wc/v3/products
getProduct(slug)            → GET /wp-json/wc/v3/products?slug=
getCategories()             → GET /wp-json/wc/v3/products/categories
getNewArrivals(limit)       → products filtered by tag "new"
getSaleProducts(limit)      → products with on_sale=true
getStoreSettings()          → GET /wp-json/wc/v3/settings/general
```

---

## Environment Variables

```env
# WooCommerce
WC_API_URL=https://your-store.com/wp-json/wc/v3
WC_CONSUMER_KEY=ck_xxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxx

# WordPress
WP_API_URL=https://your-store.com/wp-json/wp/v2

# Paystack
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxx

# Site
NEXT_PUBLIC_SITE_URL=https://missus.ng
NEXT_PUBLIC_STORE_CURRENCY=NGN
```

---

## Implementation Order

1. Config + types + lib (woocommerce.ts, config.ts)
2. Layout components (AnnouncementBar, Navbar, CategoryNav, Footer)
3. UI primitives (Badge, Button, PriceDisplay, StarRating, SectionHeader)
4. Homepage sections (top to bottom)
5. ProductCard + ProductGrid
6. Shop All + Category pages + FilterSidebar
7. Product detail page
8. Sale page + CountdownTimer
9. Cart + Checkout + Paystack
10. Account pages

---

## Notes

- Store name (`Missus.`) pulled from WC store settings — `NEXT_PUBLIC_SITE_NAME` as fallback
- Primary/secondary colors defined in `tailwind.config.ts` as `primary` and `secondary`
- All product images use `next/image` with WC image URLs whitelisted in `next.config.ts`
- Cart state managed in `localStorage` + synced to WC sessions for logged-in users
- ISR revalidation: products every 60s, categories every 300s, homepage every 30s
