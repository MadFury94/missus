/**
 * Test script for WooCommerce shipping integration
 * Run with: node test-woocommerce-shipping.js
 */

const STORE_API = "https://missusoutfits.com/wp-json/wc/store/v1";

async function testWooCommerceShipping() {
    console.log("🧪 Testing WooCommerce Shipping Integration\n");
    
    try {
        // Test 1: Check if Store API is accessible
        console.log("1. Testing Store API accessibility...");
        const cartResponse = await fetch(`${STORE_API}/cart`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://missusoutfits.com",
                "Origin": "https://missusoutfits.com",
            },
            credentials: "include",
        });
        
        if (cartResponse.ok) {
            console.log("✅ Store API is accessible");
            const cartData = await cartResponse.json();
            console.log(`   Cart totals currency: ${cartData.totals?.currency_code || 'N/A'}`);
        } else {
            console.log("❌ Store API not accessible:", cartResponse.status);
            return;
        }
        
        // Test 2: Test our shipping rates endpoint
        console.log("\n2. Testing shipping rates API endpoint...");
        const ratesResponse = await fetch("http://localhost:3000/api/shipping/woocommerce-rates", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                city: "Lagos",
                state: "Lagos", 
                items: [
                    {
                        productId: 123,
                        name: "Test Product",
                        price: 5000,
                        quantity: 1,
                        size: "M",
                        color: "Black",
                        image: "/test.jpg",
                        slug: "test-product",
                    }
                ],
                address_1: "Test Street",
                postcode: "100001",
            }),
        });
        
        if (ratesResponse.ok) {
            const ratesData = await ratesResponse.json();
            console.log("✅ Shipping rates endpoint working");
            console.log(`   Found ${ratesData.rates?.length || 0} rate(s)`);
            console.log(`   Using fallback: ${ratesData.fallback ? 'Yes' : 'No'}`);
            
            if (ratesData.rates?.length > 0) {
                console.log("   Sample rate:", {
                    carrier: ratesData.rates[0].carrier_name,
                    amount: ratesData.rates[0].amount,
                    delivery_time: ratesData.rates[0].delivery_time
                });
                
                // Check if we're getting correct WooCommerce rates vs fallback
                const expectedWCRates = [400000, 600000]; // ₦4,000, ₦6,000 in kobo
                const actualRates = ratesData.rates.map(r => r.amount);
                const hasCorrectRates = expectedWCRates.some(expected => actualRates.includes(expected));
                
                if (hasCorrectRates && !ratesData.fallback) {
                    console.log("🎉 Getting correct WooCommerce configured rates!");
                } else if (ratesData.fallback) {
                    console.log("⚠️  Using fallback rates - WooCommerce API may not be accessible");
                } else {
                    console.log("❓ Getting rates but they don't match expected WooCommerce config");
                }
            }
        } else {
            console.log("❌ Shipping rates endpoint failed:", ratesResponse.status);
        }
        
        // Test 3: Test with different state (non-Lagos)
        console.log("\n3. Testing with non-Lagos state...");
        const nonLagosResponse = await fetch("http://localhost:3000/api/shipping/woocommerce-rates", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                city: "Abuja",
                state: "FCT Abuja",
                items: [
                    {
                        productId: 123,
                        name: "Test Product",
                        price: 5000,
                        quantity: 1,
                    }
                ],
            }),
        });
        
        if (nonLagosResponse.ok) {
            const nonLagosData = await nonLagosResponse.json();
            console.log("✅ Non-Lagos shipping rates working");
            console.log(`   Found ${nonLagosData.rates?.length || 0} rate(s)`);
            console.log(`   Using fallback: ${nonLagosData.fallback ? 'Yes' : 'No'}`);
        }
        
        console.log("\n🎉 WooCommerce shipping integration test complete!");
        
    } catch (error) {
        console.error("❌ Test failed with error:", error.message);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testWooCommerceShipping();
}

module.exports = { testWooCommerceShipping };