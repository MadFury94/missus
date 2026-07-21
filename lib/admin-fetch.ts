/**
 * Authenticated fetch wrapper for admin API calls.
 * Reads the JWT from localStorage and attaches it as a Bearer token.
 */
import { getCurrentUser } from "@/lib/auth";

export function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const user = getCurrentUser();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string>),
    };
    if (user?.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
    }
    return fetch(input, { ...init, headers });
}
