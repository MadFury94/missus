import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/lib/admin-auth";
import { readHomepageContent, saveHomepageContent } from "@/lib/homepage-content.server";
import type { HomepageContent } from "@/lib/homepage-content";

const MAX_PAYLOAD_BYTES = 512 * 1024;

export async function GET() {
    try {
        return NextResponse.json(await readHomepageContent(), { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load homepage content." }, { status: 502 });
    }
}

function validContent(value: unknown): value is HomepageContent {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const content = value as HomepageContent;
    const strings = (...values: unknown[]) => values.every(value => typeof value === "string");
    return strings(content.announcement, content.newsletter?.heading, content.newsletter?.sub)
        && Array.isArray(content.marquee) && content.marquee.every(item => strings(item))
        && Array.isArray(content.hero) && content.hero.length > 0 && content.hero.every(slide => slide && strings(
            slide.src, slide.label, slide.heading, slide.sub, slide.cta?.label, slide.cta?.href, slide.cta2?.label, slide.cta2?.href,
        ))
        && Array.isArray(content.styleRadar) && content.styleRadar.every(card => card && strings(card.title, card.href, card.img));
}

export async function POST(req: NextRequest) {
    const authError = await requireAdminAuth(req);
    if (authError) return authError;
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_PAYLOAD_BYTES) {
        return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }
    let body: unknown;
    try { body = JSON.parse(raw); } catch {
        return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }
    if (!validContent(body)) return NextResponse.json({ error: "Invalid homepage content." }, { status: 400 });
    try {
        await saveHomepageContent(body);
        // The announcement is rendered in the root layout across the storefront.
        revalidatePath("/", "layout");
        return NextResponse.json({ ok: true, source: "wordpress" });
    } catch (error) {
        console.error("[homepage POST]", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save homepage content." }, { status: 502 });
    }
}
