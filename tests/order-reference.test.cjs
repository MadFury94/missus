const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, dependencies = {}, extras = {}) {
 const exports = {};
 const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
 vm.runInNewContext(source, { exports, require: name => dependencies[name], URLSearchParams, Buffer, process: { env: {} }, console, ...extras });
 return exports;
}
const response = orders => ({ ok: true, json: async () => orders, headers: { get: () => null } });
test('ignores unrelated orders even when the server returns them first', async () => {
 const expected = { id: 2, transaction_id: 'paid-ref' };
 const service = load('lib/order-reference.ts', {}, { fetch: async url => {
  assert.equal(new URL(url).searchParams.get('search'), 'paid-ref');
  return response([{ id: 1, transaction_id: 'different' }, expected]);
 }});
 assert.equal(await service.findOrderByReference('paid-ref', 'https://example.com', {}), expected);
});
test('unknown reference never resolves to another customer order', async () => {
 const service = load('lib/order-reference.ts', {}, { fetch: async () => response([{ id: 1, transaction_id: 'different' }]) });
 assert.equal(await service.findOrderByReference('unknown', 'https://example.com', {}), null);
});
test('continues to the next page for an exact match', async () => {
 let calls = 0;
 const service = load('lib/order-reference.ts', {}, { fetch: async () => response(++calls === 1 ? Array.from({ length: 100 }, () => ({ transaction_id: 'other' })) : [{ id: 3, transaction_id: 'paid-ref' }]) });
 assert.equal((await service.findOrderByReference('paid-ref', 'https://example.com', {})).id, 3);
 assert.equal(calls, 2);
});
test('lookup errors do not masquerade as an absent order', async () => {
 const service = load('lib/order-reference.ts', {}, { fetch: async () => ({ ok: false, status: 503 }) });
 await assert.rejects(service.findOrderByReference('paid-ref', 'https://example.com', {}), /503/);
});
test('confirmation returns saved products and custom shipping, including free shipping', async () => {
 for (const total of ['3500.00', '0.00']) {
  const route = load('app/api/payment/order-by-ref/route.ts', {
   'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
   '@/lib/order-reference': { findOrderByReference: async () => ({ id: 2, transaction_id: 'paid-ref', total: '23500.00', shipping_total: total, shipping_lines: [{ method_title: 'Custom Lagos delivery', total }], line_items: [{ id: 4, name: 'Purchased dress', quantity: 1, total: '20000.00' }] }) }
  });
  const result = await route.GET({ nextUrl: new URL('https://example.com?ref=paid-ref') });
  assert.equal(result.body.line_items[0].name, 'Purchased dress');
  assert.equal(result.body.shipping_lines[0].method_title, 'Custom Lagos delivery');
  assert.equal(result.body.shipping_total, total);
 }
});
