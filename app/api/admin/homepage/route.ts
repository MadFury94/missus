import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "homepage-content.json");

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
    try {
        const body = await req.json();
        writeData(body);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
