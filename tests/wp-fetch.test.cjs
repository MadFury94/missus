const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function service(fetch) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/wp-fetch.ts', 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, { exports, fetch, AbortSignal, process: { env: {} }, console: { warn() {} } });
    return exports;
}
test('Store API returns parsed products', async () => {
    const products = [{ id: 1 }];
    const s = service(async () => ({ ok: true, json: async () => products }));
    assert.equal(await s.storeFetch('/products'), products);
});
test('Store API handles connection failures and rejected responses', async () => {
    for (const fetch of [async () => { throw new Error('connect timeout'); }, async () => ({ ok: false })]) {
        assert.equal(await service(fetch).storeFetch('/products'), null);
    }
});
test('Store API handles failed response bodies without leaking a rejected promise', async () => {
    for (const error of [new Error('socket closed'), new SyntaxError('invalid JSON')]) {
        const s = service(async () => ({ ok: true, json: async () => { throw error; } }));
        assert.equal(await s.storeFetch('/products'), null);
    }
});
