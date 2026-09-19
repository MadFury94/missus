import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { API_ENDPOINTS } from "@/lib/config";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
    const authError = await requireAdminAuth(request);
    if (authError) return authError;

    const credentials = process.env.WP_APP_PASSWORD;
    if (!credentials || credentials.indexOf(":") <= 0) {
        return NextResponse.json({ error: "Configure WP_APP_PASSWORD as username:application-password." }, { status: 503 });
    }

    let file: File;
    try {
        const form = await request.formData();
        const value = form.get("file");
        if (!(value instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
        file = value;
    } catch {
        return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or GIF image." }, { status: 415 });
    if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: "Images must be 10 MB or smaller." }, { status: 413 });

    const upstream = await fetch(API_ENDPOINTS.wordpress.media, {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(credentials.trim()).toString("base64")}`,
            "Content-Type": file.type,
            "Content-Disposition": `attachment; filename="${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}"`,
        },
        body: await file.arrayBuffer(),
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
        const message = typeof data?.message === "string" ? data.message : "WordPress rejected the image upload.";
        return NextResponse.json({ error: message }, { status: upstream.status >= 500 ? 502 : upstream.status });
    }
    if (typeof data?.source_url !== "string") return NextResponse.json({ error: "WordPress returned no image URL." }, { status: 502 });
    return NextResponse.json({ url: data.source_url, id: data.id, title: data.title?.rendered ?? file.name });
}
