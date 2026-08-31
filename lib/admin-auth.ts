import { NextRequest, NextResponse } from "next/server";

const WP_API_URL = process.env.WP_API_URL || "https://missusoutfits.com/wp-json";

/**
 * Validates the Bearer JWT token in the Authorization header against WordPress.
 * In development, accepts the DEV_ADMIN_PASSWORD token bypass without hitting WordPress.
 * Returns a NextResponse 401/503 if invalid, or null if the request should proceed.
 */
export async function requireAdminAuth(request: NextRequest): Promise<NextResponse | null> {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);

    // Dev bypass — accept the local dev token without hitting WordPress
    if (process.env.NODE_ENV === "development" && token === "dev-token") {
        return null;
    }

    try {
        const res = await fetch(`${WP_API_URL}/jwt-auth/v1/token/validate`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return null; // auth passed — proceed
    } catch {
        return NextResponse.json({ error: "Auth service unreachable" }, { status: 503 });
    }
}
