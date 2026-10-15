// Run against the production server: node tests/seo-http.cjs http://localhost:3012
const assert = require('node:assert/strict');
const http = require('node:http');
const https = require('node:https');
const base = process.argv[2] || 'http://localhost:3012';
const canonicalOrigin = 'https://www.missusoutfits.com';

async function main() {
    const redirects = [];
    for (const [source, destination] of [['/category/shop-all', '/shop'], ['/category/whats-new', '/new-in'], ['/category/discount-sale', '/sale']]) {
        const response = await fetch(`${base}${source}?orderby=price`, { redirect: 'manual' });
        assert.equal(response.status, 301);
        assert(response.headers.get('location').endsWith(`${destination}?orderby=price`));
        redirects.push({ source, destination, status: response.status });
    }
    // Node fetch can replace a supplied Host header. Use HTTP directly for this check.
    const target = new URL('/shop?orderby=price', base);
    const hostRedirect = await new Promise((resolve, reject) => {
        (target.protocol === 'https:' ? https : http).get(target, { headers: { Host: 'missusoutfits.com' } }, response => {
            response.resume(); resolve({ status: response.statusCode, location: response.headers.location });
        }).on('error', reject);
    });
    assert.equal(hostRedirect.status, 301);
    assert.equal(hostRedirect.location, `${canonicalOrigin}/shop?orderby=price`);
    const xml = await (await fetch(`${base}/sitemap.xml`)).text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
    assert(urls.length > 0);
    assert.equal(urls.length, new Set(urls).size);
    assert(urls.every(url => url.startsWith(canonicalOrigin)));
    assert(!/<priority>|<changefreq>/.test(xml));
    const robots = await (await fetch(`${base}/robots.txt`)).text();
    assert(!robots.includes('Host:'));
    assert(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
    const product = urls.find(url => url.includes('/product/'))?.replace(canonicalOrigin, '');
    assert(product, 'Live sitemap must contain products');
    const paths = ['/', '/category/dresses?orderby=price&page=2', '/shop?filter_color=black', '/new-in', '/sale', product, '/faq', '/shipping'];
    const pages = await Promise.all(paths.map(async path => {
        const response = await fetch(`${base}${path}`, { headers: { 'User-Agent': 'Googlebot' } });
        const html = await response.text();
        assert.equal(response.status, 200, path);
        const canonicals = [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map(match => match[1]);
        assert.equal(canonicals.length, 1, path);
        assert.equal(canonicals[0].replace(/\/$/, ''), `${canonicalOrigin}${path.split('?')[0]}`.replace(/\/$/, ''));
        assert(!html.includes('name="keywords"'));
        const h1s = [...html.matchAll(/<h1[\s>]/g)].length;
        assert.equal(h1s, 1, path);
        const title = html.match(/<title>(.*?)<\/title>/)?.[1];
        const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
        if (path === '/') {
            assert(html.includes('href="/product/'));
            assert(schemas.some(schema => schema['@type'] === 'WebSite'));
            assert(schemas.some(schema => schema['@type'] === 'Organization'));
            assert(html.includes('<picture>'));
            assert(title.includes('Women') && !title.includes('Missus Outfits |'));
        }
        if (path === product) {
            assert(schemas.some(schema => schema['@type'] === 'Product'));
            assert(schemas.some(schema => schema['@type'] === 'BreadcrumbList'));
        }
        return { path, status: response.status, title, canonical: canonicals[0], h1s, schemas: schemas.map(schema => schema['@type']) };
    }));
    console.log(JSON.stringify({ redirects, hostRedirect, sitemapUrls: urls.length, lastmodCount: [...xml.matchAll(/<lastmod>/g)].length, pages }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
