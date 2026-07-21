# Medium Priority Fixes — Missus

## Tasks

- [x] 1. Fix PDP hardcoded shipping copy (wrong dates, ₦75 threshold, 10001 ZIP)
- [x] 2. Remove ZIP/Afterpay/Klarna from PDP (not available in Nigeria)
- [x] 3. Remove fake review count fallback (|| 318)
- [x] 4. Remove App Download Banner (app doesn't exist) — repurposed as social follow section
- [x] 5. Move promo code validation server-side (/api/promo/validate)
- [x] 6. Fix placeholder WhatsApp number in lib/config.ts
- [x] 7. Add error.tsx and not-found.tsx
- [x] 8. Add sitemap.ts and robots.ts
- [x] 9. Fix NEXT_PUBLIC_SITE_URL in .env.local
- [x] 10. Fix sale page sort select (SaleClient with working onChange)
- [x] 11. Fix getRelatedProducts to use actual WC related_ids with Store API hydration
