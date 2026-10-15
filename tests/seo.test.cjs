const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const modules = new Map();
function load(file) {
    file = path.resolve(root, file);
    if (!path.extname(file) || file.endsWith('.server')) file += ['.ts', '.tsx'].find(ext => fs.existsSync(`${file}${ext}`)) || '.ts';
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} };
    modules.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const localRequire = name => {
        if (name === 'server-only') return {};
        if (name === 'next/cache') return { unstable_cache: fn => fn };
        if (name === 'next/navigation') return { useRouter: () => ({ push() {} }) };
        if (name.startsWith('@/')) return load(name.slice(2));
        if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
        return require(name);
    };
    new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
    return module.exports;
}

async function main() {
    const origin = 'https://www.missusoutfits.com';
    const { generatePageMetadata, HOME_TITLE, HOME_DESCRIPTION, DEFAULT_METADATA } = load('lib/seo-config.ts');
    const metadata = generatePageMetadata({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: '/shop?orderby=price&filter_color=black&page=2' });
    assert.equal(metadata.alternates.canonical, `${origin}/shop`);
    assert.equal(metadata.title.absolute, HOME_TITLE);
    assert.equal(metadata.twitter.card, 'summary_large_image');
    assert.equal(metadata.openGraph.url, `${origin}/shop`);
    assert(!('keywords' in metadata) && !('keywords' in DEFAULT_METADATA));
    assert(HOME_TITLE.length < 60 && HOME_DESCRIPTION.length < 155);
    const { getCategorySeo } = load('lib/category-seo.ts');
    for (const slug of ['dresses', 'matching-sets', 'tops', 'bottoms', 'athleisure-loungewear', 'gift-shop', 'shop', 'new-in', 'sale', 'curve']) {
        const copy = getCategorySeo(slug);
        assert(copy.title.length < 60, `${slug}: title too long`);
        assert(copy.description.length < 155, `${slug}: description too long`);
        const words = copy.intro.split(/\s+/).length;
        assert(words >= 100 && words <= 150, `${slug}: ${words} words`);
        assert(!copy.intro.includes('\u2014'));
    }
    const redirects = await load('next.config.ts').default.redirects();
    assert.equal(redirects.length, 4);
    assert(redirects.every(r => r.statusCode === 301));
    const { canonicalLink } = load('lib/seo-urls.ts');
    assert.equal(canonicalLink('https://missusoutfits.com/category/whats-new?orderby=date'), '/new-in?orderby=date');
    const product = { id: 12, name: 'Cassie Satin Dress', slug: 'cassie', sku: 'CASSIE', short_description: '<p>Black satin mini dress</p>', description: '', stock_status: undefined, is_in_stock: false, prices: { price: '2500000', regular_price: '2500000', sale_price: '', currency_minor_unit: 2 }, images: [{ src: "/dress.jpg", alt: 'Missus' }], categories: [{ name: 'Dresses', slug: 'dresses' }], attributes: [], tags: [] };
    const schema = load('lib/structured-data.ts').getProductSchema(product);
    assert.equal(schema.offers.price, '25000');
    assert.equal(schema.offers.priceCurrency, 'NGN');
    assert.equal(schema.offers.availability, 'https://schema.org/OutOfStock');
    assert(!schema.aggregateRating && !schema.review && !schema.offers.priceValidUntil);
    assert(load('lib/product-seo.ts').productImageAlt(product).includes('Cassie Satin Dress'));
    assert.equal(load('lib/product-seo.ts').productType({ ...product, categories: [] }), 'Dress');
    const { modificationDate, getSitemapProducts } = load('lib/sitemap-data.ts');
    assert.equal(modificationDate('2026-04-10T12:30:00'), '2026-04-10T12:30:00.000Z');
    assert.equal(modificationDate('bad'), undefined);
    const oldFetch = global.fetch;
    const oldKey = process.env.WC_CONSUMER_KEY;
    const oldSecret = process.env.WC_CONSUMER_SECRET;
    try {
        process.env.WC_CONSUMER_KEY = 'test'; process.env.WC_CONSUMER_SECRET = 'test';
        const requested = [];
        global.fetch = async url => {
            const page = Number(new URL(url).searchParams.get('page'));
            requested.push(page);
            return new Response(JSON.stringify([{ slug: `product-${page}`, catalog_visibility: 'visible', date_modified_gmt: '2026-04-10T12:30:00' }, { slug: 'hidden', catalog_visibility: 'hidden' }]), { headers: { 'x-wp-totalpages': '3' } });
        };
        assert.equal((await getSitemapProducts()).length, 3);
        assert.deepEqual(requested, [1, 2, 3]);
        global.fetch = async () => new Response('[]', { status: 503 });
        await assert.rejects(getSitemapProducts(), /503/);
        global.fetch = async url => new Response(JSON.stringify(String(url).includes('/categories') ? [{ slug: 'whats-new', count: 1 }, { slug: 'dresses', count: 1 }] : [{ slug: 'cassie', catalog_visibility: 'visible', date_modified_gmt: '2026-04-10T12:30:00' }]), { headers: { 'x-wp-totalpages': '1' } });
        const sitemap = await load('app/sitemap.ts').default();
        const robots = load('app/robots.ts').default();
        assert(!('host' in robots));
        const urls = sitemap.map(entry => entry.url);
        assert.equal(urls.length, new Set(urls).size);
        for (const entry of sitemap) {
            assert(entry.url.startsWith(origin));
            assert(!('priority' in entry) && !('changeFrequency' in entry));
            assert(!/\/(search|track|gift-card-balance|newsletter|careers|account|cart|checkout|category\/whats-new)$/.test(entry.url));
            assert(!robots.rules[0].disallow.some(prefix => new URL(entry.url).pathname.startsWith(prefix)));
        }
        assert.equal(sitemap.find(entry => entry.url.endsWith('/product/cassie')).lastModified, '2026-04-10T12:30:00.000Z');
        global.fetch = async () => new Response(JSON.stringify([product]));
        const section = await load('components/home/NewInSection.tsx').default();
        const { CurrencyProvider } = load('lib/currency.tsx');
        const html = renderToStaticMarkup(React.createElement(CurrencyProvider, null, section));
        assert(html.includes('href="/product/cassie"'));
        assert(html.includes('Cassie Satin Dress'));
        assert(html.includes('25,000'));
        assert(!html.includes('name="keywords"'));
    } finally {
        global.fetch = oldFetch;
        if (oldKey === undefined) delete process.env.WC_CONSUMER_KEY; else process.env.WC_CONSUMER_KEY = oldKey;
        if (oldSecret === undefined) delete process.env.WC_CONSUMER_SECRET; else process.env.WC_CONSUMER_SECRET = oldSecret;
    }
    console.log('SEO checks passed: metadata, copy lengths, redirects, schema, pagination, sitemap exclusions, and server-rendered product links/prices.');
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { load };
