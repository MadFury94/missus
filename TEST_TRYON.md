# Test Virtual Try-On

## Quick Test Steps

1. **Make sure your Replicate token is set:**
   - Open `.env.local`
   - Find the line: `REPLICATE_API_TOKEN=r8_your_token_here`
   - Replace `r8_your_token_here` with your actual token from https://replicate.com/account/api-tokens

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Visit any product page:**
   - Go to: `http://localhost:3000/product/[any-product-slug]`
   - Or browse from homepage → click any product

4. **Test the feature:**
   - Scroll down to find the purple "✨ Try It On Virtually" button
   - Click it
   - Upload a full-body photo
   - Click "Generate Try-On"
   - Wait 30-60 seconds for the result

## Test Photos

For best results, use photos with:
- Full body visible (head to toe)
- Person standing straight
- Good lighting
- Plain background
- Arms slightly away from body

You can find test images online by searching:
- "full body fashion model standing"
- "person standing white background"

## What to Expect

1. **First click:** Modal opens with upload interface
2. **After upload:** Preview of your photo + product image side by side
3. **After clicking "Generate":** 
   - Button shows "Generating... (30-60s)"
   - First time may take 60-90 seconds (cold start)
   - Subsequent tries are faster (30-45 seconds)
4. **Result:** AI-generated image showing the person wearing the product

## If It Doesn't Work

### Check 1: Token is set correctly
```bash
# In missus folder, run:
cat .env.local | grep REPLICATE
```
Should show: `REPLICATE_API_TOKEN=r8_xxxxx...`

### Check 2: Package is installed
```bash
npm list replicate
```
Should show: `replicate@x.x.x`

### Check 3: Server logs
Look at the terminal where `npm run dev` is running. If there's an error, it will show there.

### Check 4: Browser console
Open browser DevTools (F12) → Console tab. Look for any errors.

## Next: Hover Effect

Once basic try-on works, we can implement the hover effect you wanted. That requires:

1. User uploads their photo once (saved to profile)
2. Pre-generate try-ons for products they view
3. Cache results in database
4. Show cached image on hover

This is more complex and requires:
- User authentication system
- Database to store results
- Background job queue
- Caching layer

Let me know when basic try-on works and we can tackle the hover feature!
