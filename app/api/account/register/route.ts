import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/wp-fetch";

const WC_API_URL = process.env.WC_API_URL || "https://missusoutfits.com/wp-json/wc/v3";
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getWCAuth() {
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");
    return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, first_name, last_name, billing } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
        }

        const res = await wcFetch(`${WC_API_URL}/customers`, {
            method: "POST",
            headers: getWCAuth(),
            body: JSON.stringify({
                email,
                password,
                first_name: first_name ?? "",
                last_name: last_name ?? "",
                username: email,
                billing: {
                    email,
                    first_name: first_name ?? "",
                    last_name: last_name ?? "",
                    phone: billing?.phone ?? "",
                },
            }),
        });

        if (!res) {
            return NextResponse.json({ error: "Could not reach the server. Please try again." }, { status: 504 });
        }

        const data = await res.json();

        if (!res.ok) {
            const message: string =
                typeof data.message === "string"
                    ? data.message
                    : data.code === "registration-error-email-exists"
                        ? "An account with that email already exists."
                        : "Registration failed. Please try again.";
            return NextResponse.json({ error: message }, { status: res.status });
        }

        return NextResponse.json({
            id: data.id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
        });
    } catch {
        return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
    }
}
