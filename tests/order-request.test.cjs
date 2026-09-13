const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function service(failures) {
    const exports = {};
    let calls = 0;
    vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/order-request.ts', 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, {
        exports, AbortSignal,
        fetch: async (_, options) => {
            assert.equal(options.method, 'POST');
            const failure = failures[calls++];
            if (failure) throw { cause: { code: failure } };
            return { ok: true };
        },
    });
    return { ...exports, run: () => exports.fetchOrderRequest('https://example.com/orders', { method: 'POST' }), get calls() { return calls; } };
}

test('retries a connection timeout once', async () => {
    const s = service(['UND_ERR_CONNECT_TIMEOUT']);
    assert.equal((await s.run()).ok, true);
    assert.equal(s.calls, 2);
});
test('persistent connection failures stop after two attempts', async () => {
    const s = service(['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_CONNECT_TIMEOUT']);
    await assert.rejects(s.run(), error => s.isOrderConnectionFailure(error));
    assert.equal(s.calls, 2);
});
test('never replays a POST when an order may already exist', async () => {
    for (const code of ['ECONNRESET', 'UND_ERR_SOCKET', 'UND_ERR_HEADERS_TIMEOUT']) {
        const s = service([code]);
        await assert.rejects(s.run());
        assert.equal(s.calls, 1);
    }
});
test('aggregate errors must all be connection failures before retrying', () => {
    const s = service([]);
    assert.equal(s.isOrderConnectionFailure({ cause: { errors: [{ code: 'ECONNREFUSED' }, { code: 'ENETUNREACH' }] } }), true);
    assert.equal(s.isOrderConnectionFailure({ cause: { errors: [{ code: 'ECONNREFUSED' }, { code: 'ECONNRESET' }] } }), false);
});
