// Server-only — uses Node.js fs. Never import this from a client component.
import "server-only";
import fs from "fs";
import path from "path";
import { HOMEPAGE_DEFAULTS, type HomepageContent } from "./homepage-content";

export function getHomepageContent(): HomepageContent {
    try {
        const file = path.join(process.cwd(), "data", "homepage-content.json");
        if (!fs.existsSync(file)) return HOMEPAGE_DEFAULTS;
        const saved = JSON.parse(fs.readFileSync(file, "utf-8"));
        return { ...HOMEPAGE_DEFAULTS, ...saved };
    } catch {
        return HOMEPAGE_DEFAULTS;
    }
}
