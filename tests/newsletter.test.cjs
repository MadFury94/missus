const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function route(env = {}, status = 202) {
    const calls = [];
    const exports = {};
    const code = ts.transpileModule(fs.readFileSync('app/api/newsletter/route.ts', 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(code, {
        exports, process: { env }, AbortSignal, console: { error() {} },
        require: () => ({ NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } }),
        fetch: async (url, options) => {
            calls.push({ url, ...options });
            return { ok: status >= 200 && status < 300, status };
        },
    });
    return { calls, post: body => exports.POST({ json: async () => body }) };
}

test('rejects malformed emails and missing configuration without false success', async () => {
    const api = route();
    assert.equal((await api.post(null)).status, 400);
    assert.equal((await api.post({ email: 'bad@' })).status, 400);
    assert.equal((await api.post({ email: 'person@example.com' })).status, 503);
    assert.equal(api.calls.length, 0);
});

test('subscribes email through Klaviyo with source, list and explicit consent', async () => {
    const api = route({ KLAVIYO_PRIVATE_KEY: 'test', KLAVIYO_LIST_ID: 'list', MAILCHIMP_API_KEY: 'test', MAILCHIMP_LIST_ID: 'old', MAILCHIMP_SERVER_PREFIX: 'us1' });
    assert.equal((await api.post({ email: ' person@example.com ', source: 'homepage' })).status, 200);
    assert.equal(api.calls.length, 1);
    assert.equal(api.calls[0].url, 'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs');
    const { data } = JSON.parse(api.calls[0].body);
    assert.equal(data.relationships.list.data.id, 'list');
    assert.equal(data.attributes.custom_source, 'Missus homepage');
    assert.equal(data.attributes.historical_import, false);
    assert.equal(data.attributes.profiles.data[0].attributes.email, 'person@example.com');
    assert.equal(data.attributes.profiles.data[0].attributes.subscriptions.email.marketing.consent, 'SUBSCRIBED');
});

test('provider failures and partial configuration do not claim success', async () => {
    const api = route({ KLAVIYO_PRIVATE_KEY: 'test', KLAVIYO_LIST_ID: 'list' }, 429);
    const response = await api.post({ email: 'person@example.com' });
    assert.equal(response.status, 500);
    assert.equal(response.body.ok, false);
    const partial = route({ KLAVIYO_PRIVATE_KEY: 'test', MAILCHIMP_API_KEY: 'test', MAILCHIMP_LIST_ID: 'old', MAILCHIMP_SERVER_PREFIX: 'us1' });
    assert.equal((await partial.post({ email: 'person@example.com' })).status, 503);
    assert.equal(partial.calls.length, 0);
});
