const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { webcrypto } = require('node:crypto');

function loader(overrides = {}, globals = {}) {
    const cache = new Map();
    function load(file) {
        file = path.resolve(file);
        if (cache.has(file)) return cache.get(file);
        const exports = {};
        cache.set(file, exports);
        vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
        }).outputText, {
            exports, console, URL, URLSearchParams, structuredClone, Request, Response, crypto: webcrypto,
            process: { env: { WC_API_URL: 'https://missus.invalid', WP_BASE_URL: 'https://missus.invalid' } },
            fetch: () => { throw new Error('Unexpected external request'); },
            require: name => {
                if (name in overrides) return overrides[name];
                if (!name.startsWith('.') && !name.startsWith('@/')) throw new Error(`Unexpected import: ${name}`);
                return load((name.startsWith('@/') ? path.resolve(name.slice(2)) : path.resolve(path.dirname(file), name)) + '.ts');
            }, ...globals,
        }, { filename: file });
        return exports;
    }
    return load;
}
const load = loader();
const demo = load('lib/demo-store.ts');
const api = load('lib/demo-api.ts');
const item = { productId: 900001, variationId: 9000010, size: 'S', color: 'Black', quantity: 1 };
async function post(route, body) {
    return api.handleDemoApi(new Request(`http://localhost/api/${route}`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }), route);
}

test('catalog supports category, sale, search, detail, exclusions, sorting and pagination', () => {
    assert.equal(demo.DEMO_PRODUCTS.length, 12);
    assert.ok(demo.demoStoreRead('/products?category=dresses').every(p => p.categories.some(c => c.slug === 'dresses')));
    assert.ok(demo.demoStoreRead('/products?on_sale=true').every(p => p.on_sale));
    assert.equal(demo.demoStoreRead('/products?search=midnight')[0].id, item.productId);
    assert.equal(demo.demoStoreRead('/products?slug=not-a-product').length, 0);
    assert.equal(demo.demoStoreRead('/products?include=900001,900002&exclude=900001')[0].id, 900002);
    const all = demo.demoStoreRead('/products?orderby=price&order=asc');
    assert.ok(all.every((p, i) => i === 0 || +p.prices.price >= +all[i - 1].prices.price));
    assert.equal(demo.demoStoreRead('/products?orderby=price&order=asc&per_page=2&page=2')[0].id, all[2].id);
});

test('cart rejects unknown products, invalid variants and combined quantities above stock', () => {
    for (const bad of [{ ...item, productId: 1 }, { ...item, size: 'XXL' }, { ...item, variationId: 1 }, { ...item, quantity: -1 }, { ...item, quantity: 1.5 }]) assert.throws(() => demo.demoCart([bad]));
    assert.throws(() => demo.demoCart([{ ...item, quantity: 6 }, { ...item, quantity: 5 }]));
    assert.equal(demo.demoCart([{ ...item, price: 1 }])[0].price, 42000);
});

test('shipping and discount use canonical naira/kobo amounts and threshold', () => {
    const cart = demo.demoCart([item]);
    assert.equal(demo.demoDiscount('wearlux10', cart), 4200);
    assert.equal(demo.demoShipping('Lagos', cart)[0].amount, 350000);
    assert.equal(demo.demoShipping('Abuja', cart)[0].amount, 650000);
    assert.equal(demo.demoShipping('Lagos', demo.demoCart([{ ...item, quantity: 4 }]))[0].amount, 0);
    assert.throws(() => demo.demoDiscount('INVALID', cart));
});

test('checkout recomputes totals, produces an unpaid demo receipt and omits customer details', async () => {
    const response = await post('orders', { cart: [{ ...item, price: 1 }], shipping: { firstName: 'Demo', lastName: 'Shopper', email: 'demo@example.com', phone: '08000000000', address: '1 Sample Road', city: 'Ikeja', state: 'Lagos' }, selectedRate: { rate_id: 'demo_standard', amount: 0 }, promoCode: 'WEARLUX10', total: 1 });
    assert.equal(response.status, 200);
    const { demo: isDemo, order } = await response.json();
    assert.equal(isDemo, true);
    assert.equal(order.total, 41300);
    assert.equal(order.paid, false);
    assert.match(order.reference, /^WL-DEMO-/);
    assert.equal(JSON.stringify(order).includes('demo@example.com'), false);
    assert.equal((await post('orders', { cart: [item], shipping: {} })).status, 400);
});

test('demo endpoints cannot invoke payment, admin, debug or external write integrations', async () => {
    for (const route of ['payment/initiate', 'payment/callback', 'admin/orders', 'debug/test-order-creation', 'shipping/create', 'contact', 'newsletter']) {
        assert.equal((await post(route, {})).status, 501);
    }
});

test('all server catalog adapters return local data without fetch', async () => {
    const woo = load('lib/woocommerce.ts');
    assert.equal((await woo.getProducts()).length, 12);
    assert.equal((await woo.getProduct('midnight-satin-dress')).id, 900001);
    assert.equal((await woo.getRelatedProducts(900001)).some(p => p.id === 900001), false);
    assert.equal(await woo.getStoreName(), 'Wearlux');
    assert.equal((await load('lib/wp-fetch.ts').storeFetch('/products')).length, 12);
    assert.equal((await load('lib/api-helpers.ts').wcStoreFetch('/products')).length, 12);
    assert.throws(() => load('lib/api-helpers.ts').getWooCommerceAuth());
});

test('central endpoint switch ignores old Missus URL environment values', () => {
    const { API_ENDPOINTS } = load('lib/config.ts');
    assert.equal(API_ENDPOINTS.woocommerce.rest, 'https://cms.wearlux.example/wp-json/wc/v3');
    const live = loader({ './store-config': { IS_DEMO_STORE: false, STORE_CONFIG: { mode: 'wordpress', wordpressUrl: 'https://new-store.example', siteUrl: 'https://wearlux.example', endpoints: {} } } });
    assert.equal(live('lib/config.ts').API_ENDPOINTS.woocommerce.rest, 'https://new-store.example/wp-json/wc/v3');
});

test('WordPress mode restores live catalog adapter with new endpoint', async () => {
    let requested;
    const live = loader({ './store-config': { IS_DEMO_STORE: false, STORE_CONFIG: { wordpressUrl: 'https://new-store.example', endpoints: {} } } }, {
        AbortSignal, fetch: async url => { requested = url; return Response.json([{ id: 77 }]); },
    });
    assert.equal((await live('lib/woocommerce.ts').getProducts())[0].id, 77);
    assert.ok(requested.startsWith('https://new-store.example/wp-json/wc/store/v1/products?'));
});

test('proxy rewrites legacy APIs locally and redirects old bank transfer pages', () => {
    const proxyLoad = loader({ 'next/server': { NextResponse: { next: () => 'next', rewrite: url => url.pathname, redirect: url => url.pathname } } });
    const { proxy } = proxyLoad('proxy.ts');
    for (const p of ['/api/payment/callback', '/api/debug/test-order-creation', '/api/products']) {
        assert.equal(proxy({ url: `http://localhost${p}`, nextUrl: { clone: () => new URL(`http://localhost${p}`) } }), `/api/demo${p.slice(4)}`);
    }
    assert.equal(proxy({ url: 'http://localhost/checkout/bank-transfer', nextUrl: { clone: () => new URL('http://localhost/checkout/bank-transfer') } }), '/checkout');
});
