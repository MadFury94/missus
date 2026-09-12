const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const pending = {
    cart: [{ productId: 1, name: 'Test dress', price: 80000, quantity: 2, size: 'M', image: '' }],
    shipping: { firstName: 'Test', lastName: 'Customer', email: 'test@example.com', phone: '08000000000', address: 'Test Street', city: 'Lagos', state: 'Lagos' },
    promoDiscount: 10000, selectedRate: { carrier_name: 'Express', amount: 400000 }, total: 154000,
};

function page({ order = pending, failure = false, notificationFailure = false, receipt } = {}) {
    const state = [], effects = [], calls = [];
    let index = 0;
    const local = new Map(order ? [['pending_bank_order', JSON.stringify(order)]] : []);
    const session = new Map(receipt ? [['bank_transfer_receipt', JSON.stringify(receipt)]] : []);
    const storage = map => ({ getItem: key => map.get(key) || null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) });
    const exports = {};
    const hooks = {
        useState(initial) { const key = index++; if (!(key in state)) state[key] = initial; return [state[key], value => state[key] = value]; },
        useRef(initial) { const key = index++; if (!(key in state)) state[key] = { current: initial }; return state[key]; },
        useEffect(effect) { if (!effects.length) effects.push(effect); },
    };
    const source = ts.transpileModule(fs.readFileSync('app/(client)/checkout/bank-transfer/page.tsx', 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(source, {
        exports, localStorage: storage(local), sessionStorage: storage(session), setTimeout,
        navigator: { clipboard: { writeText: async () => {} } },
        require(name) {
            if (name === 'react') return hooks;
            if (name === './transfer.module.css') return new Proxy({}, { get: (_, key) => key === '__esModule' ? false : String(key) });
            if (name === 'next/link') return ({ children, ...props }) => React.createElement('a', props, children);
            if (name === 'next/image') return () => null;
            return require(name);
        },
        fetch: async (url, options) => {
            calls.push({ url, body: JSON.parse(options.body) });
            if (url.includes('notifications') && notificationFailure) throw new Error('notification offline');
            return { ok: !failure, json: async () => failure ? { error: 'Please retry' } : { orderId: 42, orderNumber: '42' } };
        },
    });
    function render() { index = 0; return exports.default(); }
    render(); effects[0]();
    function button(node) {
        if (!node || typeof node !== 'object') return null;
        if (node.type === 'button' && node.props.onClick?.name === 'confirmPayment') return node;
        for (const child of React.Children.toArray(node.props?.children)) { const found = button(child); if (found) return found; }
        return null;
    }
    return { html: () => renderToStaticMarkup(render()), confirm: () => button(render())?.props.onClick(), calls, local, session };
}

test('transfer page shows naira totals, delivery map and a prominent payment action', () => {
    const p = page(); const html = p.html();
    assert.match(html, /154,000\.00/);
    assert.match(html, /160,000\.00/);
    assert.match(html, /4,000\.00/);
    assert.match(html, /Delivery location/);
    assert.match(html, /maps.google.com/);
    assert.match(html, /I’ve made the transfer/);
    assert.match(html, /Awaiting transfer/);
    assert.doesNotMatch(html, /Order Confirmed/);
});
test('reporting payment submits once and shows verification, even if notification fails', async () => {
    const p = page({ notificationFailure: true });
    await Promise.all([p.confirm(), p.confirm()]);
    assert.equal(p.calls.filter(c => c.url === '/api/orders').length, 1);
    assert.equal(p.calls[0].body.total, 154000);
    assert.equal(p.calls[0].body.paymentStatus, 'pending');
    assert.match(p.html(), /Awaiting verification/);
    assert.doesNotMatch(p.html(), /I’ve made the transfer/);
    assert.equal(p.local.has('pending_bank_order'), false);
    const restored = page({ order: null, receipt: JSON.parse(p.session.get('bank_transfer_receipt')) });
    assert.match(restored.html(), /Order #42/);
});
test('failed order creation keeps checkout details and permits retry', async () => {
    const p = page({ failure: true }); await p.confirm();
    assert.match(p.html(), /Please retry/);
    assert.match(p.html(), /I’ve made the transfer/);
    assert.equal(p.local.has('pending_bank_order'), true);
});
test('missing checkout details show a way back to checkout', () => {
    assert.match(page({ order: null }).html(), /No pending transfer/);
});
