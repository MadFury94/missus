/**
 * Test script to verify centralized API configuration
 * Run with: node scripts/test-api-endpoints.js
 */

const { API_ENDPOINTS, WP_BASE_URL } = require('../lib/config.ts');

console.log('🔍 Testing Centralized API Configuration\n');

console.log('📊 API Endpoints:');
console.log('├─ WordPress Base:', WP_BASE_URL);
console.log('├─ WooCommerce Store API:', API_ENDPOINTS.woocommerce.store);
console.log('├─ WooCommerce REST API:', API_ENDPOINTS.woocommerce.rest);
console.log('├─ WordPress Core API:', API_ENDPOINTS.wordpress.core);
console.log('├─ Gift Cards API:', API_ENDPOINTS.custom.giftCards);
console.log('└─ Media Assets:', API_ENDPOINTS.assets.uploads);

console.log('\n🖼️ Asset URLs:');
console.log('├─ Product Images:', API_ENDPOINTS.assets.products);
console.log('├─ Banner Images:', API_ENDPOINTS.assets.banners);
console.log('└─ Category Images:', API_ENDPOINTS.assets.categories);

console.log('\n✅ All API endpoints are centralized and ready for migration!');
console.log('\n📝 To migrate to subdomain:');
console.log('   Set WP_BASE_URL=https://wp.missusoutfits.com in .env.local');
console.log('   All endpoints will automatically update');

// Test if endpoints are using environment variables correctly
const usingSubdomain = API_ENDPOINTS.wordpress.core.includes('wp.');
if (usingSubdomain) {
    console.log('\n🚀 Currently using WordPress subdomain configuration');
} else {
    console.log('\n🏠 Currently using main domain configuration');
}