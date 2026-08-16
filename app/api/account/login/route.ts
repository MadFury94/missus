import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/wp-fetch";

const WP_API = process.env.WP_API_URL || "https://missusoutfits.com/wp-json";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
        }

        const res = await wcFetch(`${WP_API}/jwt-auth/v1/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!res) {
            // In dev this means the WP host is unreachable (connect timeout).
            // In production this should not happen.
            const isDev = process.env.NODE_ENV === "development";
            return NextResponse.json({
                success: false,
                error: isDev
                    ? "Cannot reach WordPress in dev — this will work on the live server."
                    : "Could not connect to the server. Please try again.",
            }, { status: 504 });
        }

        const data = await res.json();

        if (!res.ok) {
            const code: string = data.code ?? "";
            let message = data.message ?? "Login failed. Please check your credentials.";
            if (code === "invalid_username" || code === "[jwt_auth] invalid_username") {
                message = "No account found with that email address.";
            } else if (code.includes("incorrect_password")) {
                message = "Incorrect password. Please try again.";
            } else if (code === "invalid_email" || code === "[jwt_auth] invalid_email") {
                message = "Invalid email address.";
            }
            return NextResponse.json({ success: false, error: message }, { status: 401 });
        }

        let userId = 0;
        if (data.data?.user?.id) userId = parseInt(data.data.user.id);
        else if (data.user_id) userId = parseInt(data.user_id);
        else if (data.id) userId = parseInt(data.id);

        if (userId === 0 && data.token) {
            try {
                const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64").toString("utf8"));
                if (payload.data?.user?.id) userId = parseInt(payload.data.user.id);
            } catch { /* ignore */ }
        }

        if (userId === 0) {
            // Some JWT plugins don't include user ID — still return a valid session
            // with ID 0; the frontend only needs it for admin checks.
            console.warn("[login] Could not extract user ID from JWT response:", JSON.stringify(data).slice(0, 200));
        }

        return NextResponse.json({
            success: true,
            user: {
                id: userId,
                username: data.user_nicename ?? "",
                email: data.user_email ?? "",
                displayName: data.user_display_name ?? "",
                roles: data.user_roles ?? [],
                token: data.token,
            },
        });
    } catch (err) {
        console.error("[login] error:", err);
        return NextResponse.json({ success: false, error: "Server error. Please try again." }, { status: 500 });
    }
}
