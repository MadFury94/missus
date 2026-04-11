# Design Replication Plan

## Pages to Replicate from Reference Design

### 1. Cart Page ✅ (Priority 1)
**Location:** `app/cart/page.tsx`
**Components needed:**
- [x] CartUnlockBar - Free shipping progress bar
- [ ] CartPageClient - Main cart layout
- [ ] CartItemRow - Individual cart items with qty controls
- [ ] PromoCodeInput - Discount code input
- [ ] OrderSummary - Sticky sidebar with totals
- [ ] UpsellGrid - "You May Also Like" products

### 2. Wishlist Page (Priority 2)
**Location:** `app/wishlist/page.tsx`
**Status:** Already exists, needs design update to match reference

### 3. User Login Page (Priority 3)
**Location:** `app/account/login/page.tsx`
**Components needed:**
- [ ] UserLoginPage - Clean login form with social options

### 4. Register Page (Priority 4)
**Location:** `app/account/register/page.tsx`
**Components needed:**
- [ ] RegisterPage - Multi-step registration form

### 5. User Dashboard (Priority 5)
**Location:** `app/account/page.tsx` or `app/dashboard/page.tsx`
**Components needed:**
- [ ] UserDashboardPage - Orders, addresses, wishlist tabs

### 6. Admin Login (Priority 6)
**Location:** `app/admin/login/page.tsx`
**Status:** Already exists, needs design update

### 7. Admin Dashboard (Priority 7)
**Location:** `app/admin/page.tsx`
**Status:** Already exists, needs design update

## Design System Notes from Reference

### Typography
- Font: Barlow Condensed for headings (already using)
- Uppercase tracking for labels
- Bold condensed for CTAs

### Colors
- Primary: #000000 (black)
- Accent: #e8002d (red)
- Success: #007a3d (green)
- Borders: #e0e0e0, #e8e8e8
- Text: #767676 (gray), #555 (dark gray)

### Spacing
- Consistent use of px-6, py-3.5
- Grid gaps: gap-4, gap-10
- Border widths: border-[1.5px]

### Components
- Sticky order summary at top-[80px]
- Progress bars for free shipping
- Express checkout buttons
- Payment method icons
- Delivery estimates

## Execution Order

1. **Cart Page** - Most critical for checkout flow
2. **Wishlist Page** - Update existing to match design
3. **Login/Register** - For user accounts
4. **User Dashboard** - For order management
5. **Admin updates** - Polish admin interface

## Notes
- Keep existing functionality intact
- Only update UI/design to match reference
- Use existing cart.ts and wishlist.ts logic
- Maintain WooCommerce API integration
