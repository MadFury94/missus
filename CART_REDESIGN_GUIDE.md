# Cart Page Redesign - Implementation Guide

## Overview
This guide will help you implement the exact cart design from the HTML mockup into your Next.js app.

## Key Features to Implement

1. **Cart Unlock Progress Bar** - Shows progress toward free shipping
2. **Free Gift Bar** - Highlights shipping threshold
3. **Enhanced Cart Items** - Better layout with color swatches
4. **Promo Code Input** - Apply discount codes
5. **Recently Removed Items** - Quick restore functionality
6. **You May Also Like** - Upsell products grid
7. **Enhanced Order Summary** - Sticky sidebar with all details
8. **Express Checkout Options** - Paystack, OPay, Kuda buttons
9. **Delivery Estimates** - Show shipping times
10. **Payment Method Icons** - Trust badges

## File Structure

Create these new components:
```
missus/components/cart/
├── CartUnlockBar.tsx
├── FreeGiftBar.tsx
├── CartItem.tsx
├── PromoCodeInput.tsx
├── RecentlyRemoved.tsx
├── CartUpsell.tsx
├── OrderSummary.tsx
└── ExpressCheckout.tsx
```

## Step-by-Step Implementation

### Step 1: Update Cart Page Structure

The main cart page should have this layout:
- Ship bar (free shipping threshold)
- Cart unlock progress bar
- Free gift bar
- Main grid (items + summary)
- Recently removed section
- Upsell grid

### Step 2: Cart Item Component

Each cart item needs:
- 90px × 120px image with color background
- Product name (clickable)
- Size and color meta
- Quantity controls (− input +)
- Price (with sale price if applicable)
- Remove button
- Save for Later button (wishlist)
- Sale badge (if on sale)

### Step 3: Order Summary Sidebar

Features:
- Black header with white text
- Subtotal, Discount, Shipping rows
- Savings callout (green background)
- Total with large font
- Checkout button with icon
- Express checkout buttons
- Delivery estimate box
- Payment method icons

### Step 4: Styling Notes

Key CSS values from the HTML:
```css
--black: #000
--white: #fff
--red: #e8002d
--gray: #f5f5f5
--mid: #767676
--border: #e0e0e0
--dark: #1a1a1a
--body: 'Barlow', sans-serif
--display: 'Barlow Condensed', sans-serif
```

Font sizes:
- Cart title: clamp(32px, 4vw, 48px)
- Section headers: 11-13px uppercase
- Body text: 12-14px
- Prices: 16-28px

### Step 5: Interactive Features

JavaScript functionality needed:
1. Quantity controls (min 1, max 10)
2. Remove item with animation
3. Promo code application
4. Recently removed restore
5. Add to bag from upsell
6. Progress bar calculation

## Quick Start Code

I'll create the components for you. Since the file is large, I'll break it into manageable pieces.

Would you like me to:
1. Create all the component files separately?
2. Provide the complete cart page code in a document you can copy?
3. Update the existing cart page piece by piece?

Let me know your preference and I'll proceed!
