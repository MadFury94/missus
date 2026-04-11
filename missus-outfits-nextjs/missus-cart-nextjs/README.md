# Missus Outfits — Next.js + Tailwind UI

Complete UI for the Missus Outfits e-commerce platform. Built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## Pages Included

| Route | Page | Description |
|---|---|---|
| `/cart` | Cart Page | Full cart with items, qty controls, promo codes, order summary, upsells |
| `/wishlist` | Wishlist — with items | Saved products, grid/list toggle, move to bag |
| `/wishlist` (empty) | Wishlist — empty | Empty state with trending products |
| `/login` | User Login | Split-panel sign in with validation |
| `/register` | User Register | Sign up with password strength meter |
| `/admin/login` | Admin Login | Dark secure-themed admin sign in |
| `/dashboard` | User Dashboard | Orders, wishlist, addresses, profile, settings |
| `/admin/dashboard` | Admin Dashboard | Revenue chart, orders table, top products, quick actions |

---

## Getting Started

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Run the dev server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) — it auto-redirects to `/cart`.

---

## Project Structure

\`\`\`
src/
├── app/
│   ├── layout.tsx              # Root layout + CartProvider
│   ├── globals.css             # Tailwind + Barlow fonts
│   ├── page.tsx                # Redirects to /cart
│   ├── cart/
│   │   ├── page.tsx
│   │   └── CartPageClient.tsx  # Client component for cart state
│   ├── wishlist/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx
│   └── admin/
│       ├── login/page.tsx
│       └── dashboard/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── AnnouncementBar.tsx
│   │   ├── Header.tsx          # Top nav + sub nav + ship bar
│   │   └── Footer.tsx
│   ├── cart/
│   │   ├── CartUnlockBar.tsx   # Free shipping progress
│   │   ├── CartItemRow.tsx     # Individual cart item
│   │   ├── PromoCodeInput.tsx  # Promo code (try: MISSUS10)
│   │   ├── OrderSummary.tsx    # Sticky sidebar summary
│   │   └── UpsellGrid.tsx      # "You May Also Like"
│   ├── wishlist/
│   │   └── WishlistPage.tsx    # Both empty + filled states
│   ├── auth/
│   │   ├── UserLoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── AdminLoginPage.tsx
│   ├── user/
│   │   └── UserDashboardPage.tsx
│   └── admin/
│       └── AdminDashboardPage.tsx
│
├── lib/
│   ├── cart-context.tsx        # Cart state via useReducer
│   ├── wishlist-context.tsx    # Wishlist state
│   └── utils.ts                # formatNaira, cn()
│
└── types/
    └── cart.ts                 # CartItem, CartState, etc.
\`\`\`

---

## Integration Notes

### Connecting to a real backend
Each context file (`cart-context.tsx`, `wishlist-context.tsx`) has a clear `dispatch` pattern. Replace the mock `initialState` with API calls in a `useEffect`, e.g.:

\`\`\`ts
useEffect(() => {
  fetch("/api/cart")
    .then(r => r.json())
    .then(data => dispatch({ type: "SET_ITEMS", items: data.items }));
}, []);
\`\`\`

### Authentication
- User login/register → integrate with NextAuth.js or your own JWT flow
- Admin login → add middleware at `src/middleware.ts` to protect `/admin/*` routes
- Demo promo code: **MISSUS10** (10% off)

### Fonts
Barlow + Barlow Condensed load via Google Fonts in `globals.css`. For production, use `next/font/google` for better performance:

\`\`\`ts
import { Barlow, Barlow_Condensed } from "next/font/google";
\`\`\`

---

## Tech Stack
- **Next.js 14** — App Router
- **TypeScript**
- **Tailwind CSS v3**
- **Lucide React** — icons
- **React Context + useReducer** — state management
