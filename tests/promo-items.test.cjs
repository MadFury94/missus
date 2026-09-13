const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(path, dependencies = {}, globals = {}) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, { exports, require: name => {
        if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`);
        return dependencies[name];
    }, Buffer, console: { log() {}, error() {} }, ...globals });
    return exports;
}
const helpers = load('lib/promo-items.ts');
const dress = { productId: 1, name: 'Dress', price: 40000, regularPrice: 40000, quantity: 1 };
const box = { productId: 2, name: 'Gift Box', price: 5000, regularPrice: 5000, quantity: 1 };
const card = { productId: 3, name: 'Gift Card', price: 10000, regularPrice: 10000, quantity: 1 };
const sale = { productId: 4, name: 'Sale Dress', price: 20000, regularPrice: 25000, quantity: 1 };

function promoRoute(coupon) {
    return load('app/api/promo/validate/route.ts', {
        'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } },
        '@/lib/promo-items': helpers,
        '@/lib/giftCards': { checkGiftCard: async () => null },
    }, {
        process: { env: coupon ? { WC_API_URL: 'https://example.test', WC_CONSUMER_KEY: 'key', WC_CONSUMER_SECRET: 'secret' } : {} },
        fetch: async () => ({ ok: true, json: async () => [coupon] }),
    }).POST;
}
async function validate(cart, code = 'MISSUS10', coupon) {
    return promoRoute(coupon)({ json: async () => ({ code, subtotal: cart.reduce((sum, i) => sum + i.price * i.quantity, 0), cart }) });
}

test('percentage code discounts only eligible items in mixed carts', async () => {
    for (const excluded of [[box], [card], [box, card, sale]]) {
        const result = await validate([dress, ...excluded]);
        assert.equal(result.body.valid, true);
        assert.equal(result.body.discount, 4000);
    }
});
test('gift-only and empty carts cannot use a promo', async () => {
    for (const items of [[box], [card], [box, card], [sale], []]) {
        const result = await validate(items);
        assert.equal(result.body.valid, false);
        assert.match(result.body.error, /No eligible items/);
    }
});
test('quantity changes recalculate discount and fixed promos cannot spill into gifts', async () => {
    assert.equal((await validate([{ ...dress, quantity: 2 }, box, card])).body.discount, 8000);
    assert.equal((await validate([{ ...dress, price: 1000, regularPrice: 1000 }, box, card], 'SPRING20')).body.discount, 1000);
});
test('WooCommerce percentage and fixed-cart coupons use eligible naira totals', async () => {
    for (const [discount_type, amount, expected] of [['percent', '10', 4000], ['fixed_cart', '2000', 2000], ['fixed_cart', '50000', 40000]]) {
        const result = await validate([dress, box, card], 'SAVE', { code: 'SAVE', status: 'publish', discount_type, amount });
        assert.equal(result.body.discount, expected);
    }
});
test('gifts do not satisfy coupon minimum spend', async () => {
    const result = await validate([dress, box, card], 'SAVE', { code: 'SAVE', status: 'publish', discount_type: 'percent', amount: '10', minimum_amount: '45000' });
    assert.equal(result.body.valid, false);
});
test('allocation preserves gift prices regardless of cart order and sums exactly', () => {
    for (const items of [[box, card, dress, sale], [dress, box, sale, card]]) {
        const reductions = helpers.allocatePromoDiscount(items, 4000);
        items.forEach((item, index) => assert.equal(reductions[index], item === dress ? 400000 : 0));
    }
    const reductions = helpers.allocatePromoDiscount([dress, dress, dress, box], 1000);
    assert.equal(reductions.reduce((sum, n) => sum + n, 0), 100000);
    assert.equal(reductions[3], 0);
    assert.throws(() => helpers.allocatePromoDiscount([dress, box], 45000));
});
test('paid order keeps gifts at full price and matches the verified payment', async () => {
    let payload;
    const service = load('lib/paid-order.ts', {
        './promo-items': helpers,
        './order-reference': { findOrderByReference: async () => null },
        './giftCards': { redeemGiftCard: async () => {} },
    }, {
        process: { env: {} },
        fetch: async (url, options) => {
            if (url.includes('paystack.co')) return { ok: true, json: async () => ({ data: {
                status: 'success', reference: 'mixed', currency: 'NGN', amount: 5700000,
                metadata: { cart: [box, card, dress], shipping: { email: 'test@example.com' }, selectedRate: { amount: 600000 }, promoCode: 'MISSUS10', promoDiscount: 4000 },
            } }) };
            payload = JSON.parse(options.body);
            return { ok: true, json: async () => ({ ...payload, id: 42 }) };
        },
    });
    await service.ensurePaidOrder('mixed');
    assert.deepEqual(payload.line_items.map(i => i.total), ['5000.00', '10000.00', '36000.00']);
});

test('bank-transfer order records the same eligible-item discount', async () => {
    let payload;
    const route = load('app/api/orders/route.ts', {
        'next/server': { NextResponse: { json: body => body } },
        '@/lib/promo-items': helpers,
        '@/lib/order-request': {
            isOrderConnectionFailure: () => false,
            fetchOrderRequest: async (_url, options) => {
                payload = JSON.parse(options.body);
                return { ok: true, json: async () => ({ id: 42, number: '42' }) };
            },
        },
    }, { process: { env: {} } });
    const result = await route.POST({ json: async () => ({
        cart: [box, card, dress], shipping: {}, selectedRate: { amount: 600000 },
        promoDiscount: 4000, promoCode: 'MISSUS10', paymentMethod: 'bank_transfer', total: 57000,
    }) });
    assert.equal(result.success, true);
    assert.deepEqual(payload.line_items.map(i => i.total), ['5000.00', '10000.00', '36000.00']);
});
