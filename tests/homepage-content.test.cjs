const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies, extras = {}) {
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(source, { exports, require: name => {
        if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
        return dependencies[name];
    }, Buffer, AbortSignal, console: { error() {} }, ...extras });
    return exports;
}
const shared = load('lib/homepage-content.ts', {});
const content = JSON.parse(JSON.stringify(shared.HOMEPAGE_DEFAULTS));
const encode = c => ({ hp_announcement: c.announcement, hp_marquee: JSON.stringify(c.marquee),
    hp_hero: JSON.stringify(c.hero), hp_style_radar: JSON.stringify(c.styleRadar),
    hp_nl_heading: c.newsletter.heading, hp_nl_sub: c.newsletter.sub });
const response = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
function server(fetch, env = { WP_APP_PASSWORD: 'admin:test-password' }) {
    return load('lib/homepage-content.server.ts', { 'server-only': {}, react: { cache: fn => fn },
        './homepage-content': shared }, { fetch, process: { env } });
}

test('reads WordPress on each request and preserves intentionally blank text', async () => {
    let acf = encode(content);
    const service = server(async (_, options) => {
        assert.equal(options.cache, 'no-store');
        return response([{ id: 42, acf }]);
    });
    assert.equal((await service.readHomepageContent()).announcement, content.announcement);
    acf = { ...acf, hp_announcement: '', hp_nl_sub: '' };
    const updated = await service.readHomepageContent();
    assert.equal(updated.announcement, '');
    assert.equal(updated.newsletter.sub, '');
});

test('awaits WordPress persistence and uses the discovered endpoint for writing', async () => {
    const calls = [];
    let acf = encode(content);
    const service = server(async (url, options) => {
        calls.push(url);
        if (url.includes('/homepage-settings')) return response({}, 404);
        if (options.method === 'POST') {
            await new Promise(resolve => setTimeout(resolve, 10));
            acf = JSON.parse(options.body).acf;
            return response({ acf });
        }
        return response(url.includes('per_page') ? [{ id: 42, acf }] : { acf });
    });
    await service.saveHomepageContent({ ...content, announcement: 'Updated' });
    assert.equal(acf.hp_announcement, 'Updated');
    assert.ok(calls.includes('https://missusoutfits.com/wp-json/wp/v2/homepage_settings/42'));
    assert.ok(calls.at(-1).endsWith('/42?_fields=acf'));
});

test('rejects a failed WordPress save', async () => {
    const service = server(async (_, options) => options.method === 'POST'
        ? response({}, 403) : response([{ id: 42, acf: encode(content) }]));
    await assert.rejects(service.saveHomepageContent(content), /403/);
});

test('rejects a successful HTTP response when ACF changes were ignored', async () => {
    const acf = encode(content);
    const service = server(async url => response(url.includes('per_page') ? [{ id: 42, acf }] : { acf }));
    await assert.rejects(service.saveHomepageContent({ ...content, announcement: 'Not retained' }), /did not retain/);
});

test('requires application credentials instead of falling back to WooCommerce keys', async () => {
    const service = server(async () => { throw new Error('Should not fetch'); }, {});
    await assert.rejects(service.saveHomepageContent(content), /WP_APP_PASSWORD/);
});

test('surfaces read failures to admin while storefront has defaults', async () => {
    const service = server(async () => response({}, 500));
    await assert.rejects(service.readHomepageContent(), /500/);
    assert.equal(await service.getHomepageContent(), shared.HOMEPAGE_DEFAULTS);
});

test('save route invalidates layout only after confirmed persistence', async () => {
    const events = [];
    const route = load('app/api/admin/homepage/route.ts', {
        'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
        'next/cache': { revalidatePath: (...args) => events.push(args) },
        '@/lib/admin-auth': { requireAdminAuth: async () => null },
        '@/lib/homepage-content.server': { saveHomepageContent: async () => events.push('saved') },
    });
    const result = await route.POST({ text: async () => JSON.stringify(content) });
    assert.equal(result.body.source, 'wordpress');
    assert.equal(JSON.stringify(events), JSON.stringify(['saved', ['/', 'layout']]));
    const invalid = await route.POST({ text: async () => '{}' });
    assert.equal(invalid.status, 400);
});
