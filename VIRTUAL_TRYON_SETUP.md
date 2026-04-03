# Virtual Try-On Setup Guide

## Quick Start (15 minutes)

### Step 1: Get Replicate API Key (FREE $5 credit)

1. Go to https://replicate.com
2. Sign up with GitHub/Google
3. Go to Account Settings → API Tokens
4. Copy your API token

### Step 2: Add to Environment Variables

Add to `missus/.env.local`:
```env
REPLICATE_API_TOKEN=r8_your_token_here
```

### Step 3: Install Dependencies

```bash
cd missus
npm install replicate
```

### Step 4: Add to Product Page

Edit `missus/app/product/[slug]/page.tsx`:

```tsx
import VirtualTryOn from "@/components/product/VirtualTryOn";

// Inside your component, after AddToBagButton:
<VirtualTryOn 
    productImage={product.images[0]?.src || ""} 
    productName={product.name}
    category="upper_body"
/>
```

### Step 5: Test It!

1. Run dev server: `npm run dev`
2. Go to any product page
3. Click "Try It On Virtually"
4. Upload a full-body photo
5. Wait 30-60 seconds for result

## Important Notes

### Image Requirements

**User Photo:**
- Full body shot (head to toe)
- Good lighting
- Plain background preferred
- Standing straight, arms slightly away from body
- File size < 10MB

**Product Image:**
- Clean product shot
- Preferably on white/transparent background
- Full garment visible
- High resolution

### Cost Management

With FREE $5 credit, you get approximately:
- 100-250 try-ons (depending on model)
- After that: ~$0.02-0.05 per try-on

**To limit costs:**
1. Add rate limiting (5 tries per user per day)
2. Require user login
3. Cache results
4. Show cost estimate before generating

### Production Considerations

Before going live, you should:

1. **Image Upload to Cloud Storage**
   - Use Vercel Blob, Cloudinary, or AWS S3
   - Don't send base64 images (too large)
   
2. **Add Authentication**
   - Require login to use feature
   - Track usage per user
   
3. **Rate Limiting**
   - Limit tries per user per day
   - Prevent abuse
   
4. **Queue System**
   - Handle multiple requests
   - Show position in queue
   
5. **Result Caching**
   - Save results to database
   - Reuse if same user+product combo

## Alternative: Simpler MVP

If you want to test the feature first without AI costs:

1. **Mock Mode**: Show a sample result image
2. **Waitlist**: Collect emails, launch later
3. **Premium Feature**: Charge $1-2 per try-on
4. **Size Recommendation**: Simpler alternative using body measurements

## Troubleshooting

### "Module not found: replicate"
```bash
npm install replicate
```

### "Virtual try-on service not configured"
- Check `.env.local` has `REPLICATE_API_TOKEN`
- Restart dev server after adding env var

### "Failed to generate try-on image"
- Check image quality (full body, good lighting)
- Try different photo
- Check Replicate dashboard for errors

### Slow processing (>2 minutes)
- Normal for first request (cold start)
- Subsequent requests faster
- Consider showing estimated time

## Next Steps

1. Test with various photos
2. Add usage analytics
3. Implement rate limiting
4. Add result sharing
5. Optimize for mobile
6. A/B test conversion impact

## Support

- Replicate Docs: https://replicate.com/docs
- IDM-VTON Model: https://replicate.com/cuuupid/idm-vton
- Issues: Check Replicate dashboard for API errors
