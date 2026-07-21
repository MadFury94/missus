// WordPress JWT Authentication

const WP_API_URL = process.env.WP_API_URL || "https://missusoutfits.com/wp-json";
const JWT_SECRET = process.env.JWT_API;

export interface User {
    id: number;
    username: string;
    email: string;
    displayName: string;
    roles: string[];
    token: string;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
}

// Login with WordPress JWT — goes through /api/account/login proxy to avoid browser CORS
export async function loginUser(username: string, password: string): Promise<LoginResponse> {
    try {
        const response = await fetch("/api/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!data.success) {
            return { success: false, error: data.error ?? "Login failed." };
        }

        return { success: true, token: data.user.token, user: data.user };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Network error. Please check your connection and try again." };
    }
}

// Validate token
export async function validateToken(token: string): Promise<boolean> {
    try {
        const response = await fetch(`${WP_API_URL}/jwt-auth/v1/token/validate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return response.ok;
    } catch {
        return false;
    }
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;

    try {
        const userStr = localStorage.getItem("missus_user");
        if (!userStr) return null;

        const user = JSON.parse(userStr);
        return user;
    } catch {
        return null;
    }
}

// Save user to localStorage
export function saveUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("missus_user", JSON.stringify(user));
}

// Logout
export function logoutUser(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("missus_user");
}

// Check if user is admin
export function isAdmin(user: User | null): boolean {
    if (!user) return false;
    // Check if user has admin role OR if user ID is 1 (main admin)
    return user.roles.includes("administrator") || user.roles.includes("shop_manager") || user.id === 1;
}
