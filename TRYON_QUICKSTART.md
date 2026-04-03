# Virtual Try-On Quick Start

## ✅ Setup Complete!

You've successfully set up virtual try-on with Replicate. Here's what's ready:

### What's Configured

1. ✅ Replicate API token added to `.env.local`
2. ✅ `replicate` package installed
3. ✅ VirtualTryOn component created
4. ✅ API route configured (`/api/virtual-tryon`)
5. ✅ Component added to product pages

### Model Being Used

**IDM-VTON** - Best quality virtual try-on model
- Model ID: `cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4`
- Processing time: 30-60 seconds
- Cost: ~$0.02-0.04 per image
- Your free credit: $5 (≈125-250 try-ons)

## 🚀 How to Test

1. **Start the dev server:**
   ```bash
   cd missus
   npm run dev
   ```

2. **Go to any product page:**
   - Example: `http://localhost:3000/product/any-product-slug`

3. **Click "✨ Try It On Virtually" button**

4. **Upload a test photo:**
   - Use a full-body photo
   - Good lighting
   - Plain background works best
   - Person standing straight

5. **Click "Generate Try-On"**
   - First time takes 30-60 seconds (cold start)
   - Subsequent requests are faster

## 📸 Best Photo Guidelines

For best results, tell users to upload photos with:

- ✅ Full body visible (head to toe)
- ✅ Standing straight, arms slightly away from body
- ✅ Good lighting (natural light is best)
- ✅ Plain background (white/neutral preferred)
- ✅ Facing camera directly
- ❌ Avoid: sitting, lying down, dark photos, busy backgrounds

## 💰 Cost Management

With your $5 free credit:
- ~125-250 try-ons included
- After that: $0.02-0.04 per try-on

**To limit costs:**
1. Add rate limiting (5 tries per user per day)
2. Require user login
3. Cache results (same user + product = reuse image)
4. Show cost estimate before generating

## 🎯 Next Steps (Optional Improvements)

### 1. Add Hover Effect (Your Original Goal)

To show try-on on hover, you need to:
- Pre-generate try-ons when user uploads their photo
- Cache results in database
- Show cached image on hover

This requires:
- User authentication
- Database to store results
- Background job to pre-generate try-ons

### 2. Add Rate Limiting

Edit `/api/virtual-tryon/route.ts`:
```typescript
// Add at the top of POST function
const userId = getUserId(); // Implement this
const today = new Date().toDateString();
const key = `tryon:${userId}:${today}`;
const count = await redis.get(key) || 0;

if (count >= 5) {
  return NextResponse.json(
    { error: 'Daily limit reached (5 try-ons per day)' },
    { status: 429 }
  );
}

await redis.incr(key);
await redis.expire(key, 86400); // 24 hours
```

### 3. Cache Results

Save results to prevent duplicate generations:
```typescript
// Before calling Replicate
const cacheKey = `tryon:${userId}:${productId}`;
const cached = await db.getTryOn(cacheKey);
if (cached) return cached;

// After successful generation
await db.saveTryOn(cacheKey, result.imageUrl);
```

### 4. Add to ProductCard for Hover

Edit `components/product/ProductCard.tsx`:
```typescript
const [tryOnImage, setTryOnImage] = useState<string | null>(null);

// On mount, check if user has uploaded photo
useEffect(() => {
  const userPhoto = getUserPhoto(); // From user profile
  if (userPhoto) {
    // Check cache first
    const cached = await getCachedTryOn(product.id);
    if (cached) {
      setTryOnImage(cached);
    }
  }
}, []);

// On hover
<div 
  onMouseEnter={() => {
    if (tryOnImage) {
      // Show try-on image
    }
  }}
>
```

## 🐛 Troubleshooting

### "Virtual try-on service not configured"
- Check `.env.local` has `REPLICATE_API_TOKEN`
- Restart dev server: `npm run dev`

### "Failed to generate try-on image"
- Check photo quality (full body, good lighting)
- Try a different photo
- Check Replicate dashboard: https://replicate.com/account

### Slow processing (>2 minutes)
- First request has "cold start" (60-90 seconds)
- Subsequent requests faster (30-45 seconds)
- This is normal for Replicate

### "Rate limit exceeded"
- You've used your free credit
- Add payment method at https://replicate.com/account/billing
- Or implement rate limiting to control usage

## 📊 Monitor Usage

Check your usage at: https://replicate.com/account/billing

You can see:
- Remaining free credit
- Number of predictions run
- Cost per prediction
- Total spend

## 🎨 Customize the UI

Edit `components/product/VirtualTryOn.tsx` to:
- Change button colors
- Modify modal layout
- Add sharing options
- Customize loading states
- Add download button

## 🔗 Useful Links

- Replicate Dashboard: https://replicate.com/account
- IDM-VTON Model: https://replicate.com/cuuupid/idm-vton
- Replicate Docs: https://replicate.com/docs
- Next.js Guide: https://replicate.com/docs/guides/run/nextjs

## ✨ You're All Set!

The virtual try-on feature is ready to test. Just run `npm run dev` and visit any product page!
