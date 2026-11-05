/**
 * Creates all Wearlux WooCommerce categories in one shot.
 * Run once after setting up the new WordPress install.
 *
 * Usage:
 *   node scripts/create-wearlux-categories.mjs
 *
 * Requires:
 *   WC_API_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET set in .env.local
 *   (copy .env.wearlux to .env.local first, fill in the WC keys)
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (no dotenv dependency needed)
function loadEnv() {
    const envPath = resolve(__dirname, "../.env.local");
    const lines = readFileSync(envPath, "utf8").split("\n");
    const env = {};
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 0) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        env[key] = value;
    }
    return env;
}

const env = loadEnv();

const BASE_URL = env.WC_API_URL?.replace(/\/wc\/v3\/?$/, "") ?? "";
const API = `${BASE_URL}/wc/v3`;
const KEY = env.WC_CONSUMER_KEY ?? "";
const SECRET = env.WC_CONSUMER_SECRET ?? "";

if (!API || !KEY || !SECRET) {
    console.error("Missing WC_API_URL, WC_CONSUMER_KEY or WC_CONSUMER_SECRET in .env.local");
    process.exit(1);
}

const AUTH = "Basic " + Buffer.from(`${KEY}:${SECRET}`).toString("base64");

// All categories needed by the wearlux-app branch
const CATEGORIES = [
    { name: "What's New",         slug: "whats-new" },
    { name: "Two-Piece Sets",     slug: "two-piece-sets" },
    { name: "Linen Shirts",       slug: "linen-shirts" },
    { name: "Crop Shirts",        slug: "crop-shirts" },
    { name: "T-Shirts",           slug: "t-shirts" },
    { name: "Linen Pants",        slug: "linen-pants" },
    { name: "Casual Pants",       slug: "casual-pants" },
    { name: "Casual Shorts",      slug: "casual-shorts" },
    { name: "Denim Pants & Jeans",slug: "denim-pants-jeans" },
    { name: "Denim Shorts",       slug: "denim-shorts" },
    { name: "Night Out",          slug: "night-out" },
    { name: "Vacation",           slug: "vacation" },
    { name: "Formal",             slug: "formal" },
];

async function getExisting() {
    const res = await fetch(`${API}/products/categories?per_page=100`, {
        headers: { Authorization: AUTH },
    });
    if (!res.ok) throw new Error(`Failed to fetch existing categories: ${res.status}`);
    return await res.json();
}

async function createCategory(cat) {
    const res = await fetch(`${API}/products/categories`, {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({ name: cat.name, slug: cat.slug }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Failed to create "${cat.name}": ${JSON.stringify(data)}`);
    return data;
}

async function run() {
    console.log(`\nConnecting to: ${API}\n`);

    // Fetch what already exists
    let existing;
    try {
        existing = await getExisting();
    } catch (err) {
        console.error("Could not connect to WooCommerce:", err.message);
        console.error("Check your WC_API_URL, WC_CONSUMER_KEY and WC_CONSUMER_SECRET.");
        process.exit(1);
    }

    const existingSlugs = new Set(existing.map(c => c.slug));
    console.log(`Found ${existing.length} existing categories.\n`);

    let created = 0;
    let skipped = 0;

    for (const cat of CATEGORIES) {
        if (existingSlugs.has(cat.slug)) {
            console.log(`  SKIP  "${cat.name}" (slug: ${cat.slug}) — already exists`);
            skipped++;
            continue;
        }
        try {
            const result = await createCategory(cat);
            console.log(`  OK    "${cat.name}" (slug: ${result.slug}, id: ${result.id})`);
            created++;
        } catch (err) {
            console.error(`  FAIL  "${cat.name}": ${err.message}`);
        }
    }

    console.log(`\nDone. Created: ${created}  Skipped (already existed): ${skipped}\n`);
}

run();
