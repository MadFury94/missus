# WooCommerce API Guide for Missus

## Overview

Your Next.js app consumes the **WooCommerce Store API** (public, no authentication required) from your WordPress site at `https://missusoutfits.com`.

---

## API Endpoints Currently Used

### Base URL
```
https://missusoutfits.com/wp-json/wc/store/v1
```

---

## 1. Products API

### Get Products
**Endpoint:** `/products`

**What it does:**
- Fetches a list of products with full details
- Supports filtering, sorting, pagination
- Returns product data including images, prices, attributes, variations

**Parameters:**
- `per_page` - Number of products (default: 60)
- `page` - Page number for pagination
- `category` - Filter by category slug
- `on_sale` - Filter sale products (true/false)
- `orderby` - Sort by: date, popularity, price, rating
- `order` - Sort direction: asc, desc
- `slug` - Get specific product by slug

**Example Requests:**
```javascript
// Get all products
GET /products?per_page=60

// Get products in "dresses" category
GET /products?category=dresses&per_page=20

// Get sale products
GET /products?on_sale=true&per_page=30

// Get new arrivals
GET /products?category=whats-new&orderby=date&order=desc

// Get specific product
GET /products?slug=elegant-maxi-dress
```

**Response Structure:**
```json
[
  {
    "id": 123,
    "name": "Elegant Maxi Dress",
    "slug": "elegant-maxi-dress",
    "permalink": "https://missusoutfits.com/product/elegant-maxi-dress",
    "type": "variable",
    "short_description": "Beautiful flowing dress",
    "description": "Full product description...",
    "on_sale": true,
    "prices": {
      "price": "4500000",           // In kobo (₦45,000)
      "regular_price": "6000000",   // In kobo (₦60,000)
      "sale_price": "4500000",      // In kobo (₦45,000)
      "currency_symbol": "₦",
      "currency_minor_unit": 2
    },
    "price_html": "<del>₦60,000</del> <ins>₦45,000</ins>",
    "average_rating": "4.5",
    "review_count": 12,
    "images": [
      {
        "id": 456,
        "src": "https://missusoutfits.com/wp-content/uploads/dress-1.jpg",
        "thumbnail": "https://missusoutfits.com/wp-content/uploads/dress-1-150x150.jpg",
        "alt": "Elegant Maxi Dress"
      }
    ],
    "categories": [
      {
        "id": 10,
        "name": "Dresses",
        "slug": "dresses"
      }
    ],
    "tags": [
      {
        "id": 20,
        "name": "New",
        "slug": "new"
      }
    ],
    "attributes": [
      {
        "id": 1,
        "name": "Size",
        "taxonomy": "pa_size",
        "has_variations": true,
        "terms": [
          { "id": 30, "name": "S", "slug": "s" },
          { "id": 31, "name": "M", "slug": "m" },
          { "id": 32, "name": "L", "slug": "l" }
        ]
      },
      {
        "id": 2,
        "name": "Color",
        "taxonomy": "pa_color",
        "has_variations": true,
        "terms": [
          { "id": 40, "name": "Black", "slug": "black" },
          { "id": 41, "name": "Red", "slug": "red" },
          { "id": 42, "name": "Blue", "slug": "blue" }
        ]
      }
    ],
    "variations": [
      {
        "id": 789,
        "attributes": [
          { "name": "Size", "value": "M" },
          { "name": "Color", "value": "Black" }
        ]
      }
    ],
    "stock_status": "instock",
    "stock_quantity": 50,
    "sku": "DRESS-001"
  }
]
```

---

## 2. Categories API

### Get Categories
**Endpoint:** `/products/categories`

**What it does:**
- Fetches all product categories
- Returns category details including images and product counts

**Parameters:**
- `per_page` - Number of categories (default: 50)

**Example Request:**
```javascript
GET /products/categories?per_page=50
```

**Response Structure:**
```json
[
  {
    "id": 10,
    "name": "Dresses",
    "slug": "dresses",
    "description": "Beautiful dresses for every occasion",
    "parent": 0,
    "count": 45,
    "image": {
      "src": "https://missusoutfits.com/wp-content/uploads/category-dresses.jpg",
      "thumbnail": "https://missusoutfits.com/wp-content/uploads/category-dresses-150x150.jpg",
      "alt": "Dresses Category"
    },
    "permalink": "https://missusoutfits.com/product-category/dresses"
  }
]
```

---

## 3. Store Settings API

### Get Store Name
**Endpoint:** `/wp-json/wp/v2/settings` (WordPress Core API)

**What it does:**
- Fetches general WordPress site settings
- Used to get store name dynamically

**Example Request:**
```javascript
GET https://missusoutfits.com/wp-json/wp/v2/settings
```

**Response:**
```json
{
  "title": "Missus Outfits",
  "description": "Premium African Fashion",
  "url": "https://missusoutfits.com",
  "email": "info@missusoutfits.com"
}
```

---

## How Your App Uses These APIs

### In `lib/woocommerce.ts`:

```typescript
// 1. Get all products
const products = await getProducts({ perPage: 60 });

// 2. Get products by category
const dresses = await getProducts({ category: "dresses", perPage: 20 });

// 3. Get sale products
const saleProducts = await getSaleProducts(30);

// 4. Get new arrivals
const newArrivals = await getNewArrivals(10);

// 5. Get single product
const product = await getProduct("elegant-maxi-dress");

// 6. Get categories
const categories = await getCategories();

// 7. Get related products
const related = await getRelatedProducts(productId, 5);
```

---

## Product Attributes Explained

### Attributes vs Variations

**Attributes** are product properties like:
- Size (S, M, L, XL)
- Color (Black, Red, Blue)
- Material (Cotton, Silk, Polyester)

**Structure:**
```typescript
attributes: [
  {
    id: 1,
    name: "Color",           // Attribute name
    taxonomy: "pa_color",    // WordPress taxonomy
    has_variations: true,    // Used for variations?
    terms: [                 // Available options
      { id: 40, name: "Black", slug: "black" },
      { id: 41, name: "Red", slug: "red" }
    ]
  }
]
```

**Variations** are specific combinations:
- Size M + Color Black = Variation 1
- Size L + Color Red = Variation 2

Each variation can have its own:
- Price
- Stock quantity
- SKU
- Images

---

## Helper Functions Available

### Price Helpers
```typescript
// Convert kobo to naira
toNaira("4500000") // Returns: 45000

// Format price with symbol
formatPrice("4500000") // Returns: "₦45,000"

// Calculate discount percentage
getDiscount("6000000", "4500000") // Returns: 25
```

### Product Helpers
```typescript
// Get product image
getProductImage(product, 0) // First image
getProductImage(product, 1) // Second image

// Get sizes
getSizes(product) // Returns: ["S", "M", "L", "XL"]

// Get colors
getColors(product) // Returns: ["Black", "Red", "Blue"]
```

---

## API Features You're Using

### ✅ Currently Implemented:

1. **Product Listing**
   - Homepage new arrivals
   - Category pages
   - Shop page
   - Sale page

2. **Product Details**
   - Single product pages
   - Images, prices, descriptions
   - Attributes and variations

3. **Filtering & Sorting**
   - By category
   - By sale status
   - By date (new arrivals)
   - By popularity

4. **Categories**
   - Category navigation
   - Category images
   - Product counts

5. **Search**
   - Product search by name/description

---

## API Features Available But Not Used Yet

### 🔄 Can Be Added:

1. **Reviews API**
   - Get product reviews
   - Submit reviews
   - Average ratings

2. **Cart API**
   - Server-side cart management
   - Cart totals calculation
   - Apply coupons

3. **Checkout API**
   - Create orders
   - Process payments
   - Order confirmation

4. **Customer API**
   - Customer registration
   - Login/authentication
   - Order history

5. **Coupons API**
   - Validate coupon codes
   - Apply discounts
   - Get coupon details

6. **Shipping API**
   - Calculate shipping costs
   - Get shipping methods
   - Delivery zones

---

## Authentication

### Current Setup: No Auth Required ✅

The Store API endpoints you're using are **public** and don't require authentication:
- `/products`
- `/products/categories`

### For Protected Endpoints (Future):

If you need to use protected endpoints (cart, checkout, orders), you'll need:

**Option 1: Consumer Key/Secret**
```javascript
const auth = {
  consumer_key: "ck_xxxxxxxxxxxxx",
  consumer_secret: "cs_xxxxxxxxxxxxx"
};
```

**Option 2: JWT Authentication**
```javascript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
headers: {
  "Authorization": `Bearer ${token}`
}
```

---

## Rate Limiting

WooCommerce Store API has no strict rate limits for public endpoints, but:
- Use caching (you're using 60s revalidation ✅)
- Don't make excessive requests
- Consider CDN for images

---

## Error Handling

### Common Errors:

```typescript
// 404 - Product not found
{
  "code": "woocommerce_rest_product_invalid_id",
  "message": "Invalid product ID.",
  "data": { "status": 404 }
}

// 400 - Invalid parameter
{
  "code": "rest_invalid_param",
  "message": "Invalid parameter(s): category",
  "data": { "status": 400 }
}
```

### Your Error Handling:
```typescript
async function storeFetch<T>(path: string) {
  try {
    const res = await fetch(`${STORE_API}${path}`);
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch (err) {
    console.warn("Store API fetch failed:", err);
    return null;
  }
}
```

---

## Performance Optimization

### What You're Doing Right ✅

1. **Server-Side Rendering**
   - Products fetched on server
   - Fast initial page load
   - SEO friendly

2. **Caching**
   - 60-second revalidation
   - Reduces API calls
   - Faster page loads

3. **Image Optimization**
   - Next.js Image component
   - Automatic WebP conversion
   - Lazy loading

4. **Pagination**
   - Limited results per page
   - Faster API responses

---

## Summary

### APIs You're Consuming:

| API | Endpoint | Purpose | Auth Required |
|-----|----------|---------|---------------|
| Products | `/products` | Get product list | No |
| Single Product | `/products?slug=X` | Get product details | No |
| Categories | `/products/categories` | Get categories | No |
| Settings | `/wp/v2/settings` | Get store name | No |

### What They Do:

1. **Products API** - Powers your entire product catalog
2. **Categories API** - Powers navigation and filtering
3. **Settings API** - Gets store information

### Data Flow:

```
WordPress/WooCommerce
        ↓
   Store API (JSON)
        ↓
  Next.js Server
        ↓
   React Components
        ↓
    User Browser
```

---

## Next Steps

### To Add More Features:

1. **Product Reviews**
   - Endpoint: `/products/reviews`
   - Display customer reviews
   - Star ratings

2. **Cart Management**
   - Endpoint: `/cart`
   - Server-side cart
   - Sync across devices

3. **Checkout**
   - Endpoint: `/checkout`
   - Process orders
   - Payment integration

4. **Customer Accounts**
   - Endpoint: `/customers`
   - User registration
   - Order history

---

**Your WooCommerce API integration is working perfectly for product display and browsing. All the data you need is coming through correctly!**
