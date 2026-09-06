import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminAuth } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "homepage-content.json");
const MAX_PAYLOAD_BYTES = 512 * 1024; // 512 KB — more than enough for homepage content

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) return null;
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch {
        return null;
    }
}

function writeData(data: unknown) {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
    const data = readData();
    return NextResponse.json(data ?? {});
}

export async function POST(req: NextRequest) {
    // 1. Auth — only admins can update homepage content
    const authError = await requireAdminAuth(req);
    if (authError) return authError;

    // 3. Payload size guard — reject oversized bodies before parsing
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_BYTES) {
        return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }

    try {
        const body = await req.json();

        // Basic shape validation — must be an object
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
        }

        writeData(body);
        revalidatePath("/");
        revalidatePath("/(client)", "layout");
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Failed to save." }, { status: 500 });
    }
}
