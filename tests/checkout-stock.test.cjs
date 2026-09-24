const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(path, dependencies = {}, globals = {}) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, { exports, console, require: name => {
        if (!(name in dependencies)) throw new Error(`Unexpected import ${name}`);
        return dependencies[name];
    }, ...globals });
    return exports;
}
const dress = { productId: 1, variationId: 11, name: 'FIORELLA mini dress', slug: 'fiorella', price: 40000, quantity: 1, size: 'M', color: 'Black', image: '/dress.jpg' };
const other = { ...dress, variationId: 12, color: 'Red' };

function client({ unavailable = [dress], fail = false, storageFail = false, stale = false, wishlist = [] } = {}) {
    const storage = new Map([['wearlux_cart', JSON.stringify([dress, other])], ['wearlux_wishlist', JSON.stringify(wishlist)]]);
    const events = [];
    const globals = {
        Event: class { constructor(type) { this.type = type; } },
        window: { dispatchEvent: event => events.push(event.type) },
        localStorage: { getItem: key => storage.get(key), setItem: (key, value) => {
            if (storageFail && key === 'wearlux_wishlist') throw new Error('Storage unavailable');
            storage.set(key, value);
        } },
        console: { error() {} },
    };
    const cart = load('lib/cart.ts', {}, globals);
    const saved = load('lib/wishlist.ts', {}, globals);
    const service = load('lib/checkout-stock.ts', { './cart': cart, './wishlist': saved }, {
        ...globals, fetch: async () => {
            if (stale) storage.set('wearlux_cart', JSON.stringify([other]));
            return { ok: !fail, json: async () => fail ? { error: 'Stock service offline' } : { unavailable } };
        },
    });
    return { run: service.checkCheckoutStock, cart: () => JSON.parse(storage.get('wearlux_cart')), wishlist: () => JSON.parse(storage.get('wearlux_wishlist')), events };
}

test('moves only the unavailable selection to the wishlist and updates totals', async () => {
    const c = client();
    const result = await c.run();
    assert.equal(result.removed[0].name, dress.name);
    assert.equal(result.cart.total, 40000);
    assert.deepEqual(c.cart(), [other]);
    assert.equal(c.wishlist()[0].productId, dress.productId);
    assert.ok(c.events.includes('cart-updated'));
    assert.ok(c.events.includes('wishlistUpdated'));
});
test('existing wishlist entries are not duplicated', async () => {
    const c = client({ wishlist: [dress] });
    await c.run();
    assert.equal(c.wishlist().length, 1);
});
test('multiple unavailable selections can empty the cart', async () => {
    const c = client({ unavailable: [dress, other] });
    assert.equal((await c.run()).cart.total, 0);
    assert.equal(c.cart().length, 0);
    assert.equal(c.wishlist().length, 1);
});
test('failed stock checks and wishlist writes never remove items', async () => {
    for (const config of [{ fail: true }, { storageFail: true }]) {
        const c = client(config);
        await assert.rejects(c.run());
        assert.deepEqual(c.cart(), [dress, other]);
    }
});
test('responses for an older cart do not remove newly selected items', async () => {
    const c = client({ stale: true });
    const result = await c.run();
    assert.equal(result.changed, true);
    assert.equal(result.removed.length, 0);
    assert.deepEqual(c.cart(), [other]);
    assert.equal(c.wishlist().length, 0);
});
test('available carts remain unchanged', async () => {
    const c = client({ unavailable: [] });
    assert.equal((await c.run()).changed, false);
    assert.deepEqual(c.cart(), [dress, other]);
});
test('server checks the selected variation, reading each parent only once', async () => {
    let reads = 0;
    const route = load('app/api/cart/check-stock/route.ts', {
        'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status || 200 }) } },
        '@/lib/product-stock': { getProductStock: async () => {
            reads++;
            return { productId: 1, variable: true, available: true, variants: [
                { id: 11, available: false, attributes: [{ name: 'Color', option: 'Black' }] },
                { id: 12, available: true, attributes: [{ name: 'Color', option: 'Red' }] },
            ] };
        } },
        '@/lib/stock-selection': load('lib/stock-selection.ts'),
    });
    const result = await route.POST({ json: async () => ({ items: [dress, other] }) });
    assert.equal(reads, 1);
    assert.equal(result.body.unavailable.length, 1);
    assert.equal(result.body.unavailable[0].variationId, 11);
});
