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

// Login with WordPress JWT
export async function loginUser(username: string, password: string): Promise<LoginResponse> {
    try {
        console.log("Attempting login with username:", username);

        const response = await fetch(`https://missusoutfits.com/wp-json/jwt-auth/v1/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
            credentials: "omit", // Don't send cookies
        });

        const data = await response.json();
        console.log("Login response:", data);

        if (!response.ok) {
            // Better error messages
            if (data.code === "invalid_username") {
                return { success: false, error: "Invalid username or email" };
            }
            if (data.code === "incorrect_password" || data.code === "[jwt_auth] incorrect_password") {
                return { success: false, error: "Incorrect password" };
            }
            if (data.code === "invalid_email") {
                return { success: false, error: "Invalid email address" };
            }
            return {
                success: false,
                error: data.message || "Login failed. Please check your credentials.",
            };
        }

        // Extract user ID from JWT data - try multiple possible locations
        let userId = 0;

        // The JWT response has structure: { token, user_email, data: { user: { id } } }
        if (data.data && data.data.user && data.data.user.id) {
            userId = parseInt(data.data.user.id);
            console.log("Found user ID in data.data.user.id:", userId);
        } else if (data.user_id) {
            userId = parseInt(data.user_id);
            console.log("Found user ID in data.user_id:", userId);
        } else if (data.id) {
            userId = parseInt(data.id);
            console.log("Found user ID in data.id:", userId);
        }

        console.log("Final User ID:", userId);
        console.log("Full JWT response:", JSON.stringify(data, null, 2));

        // Get roles from response or default to admin for user ID 1
        let roles = data.user_roles || [];
        if (roles.length === 0 && userId === 1) {
            roles = ["administrator"];
            console.log("User ID is 1, granting administrator role");
        }

        // If still no user ID, try to decode JWT token
        if (userId === 0 && data.token) {
            try {
                // JWT tokens have 3 parts separated by dots: header.payload.signature
                const tokenParts = data.token.split('.');
                if (tokenParts.length === 3) {
                    // Decode the payload (second part)
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log("Decoded JWT payload:", payload);

                    // Try to extract user ID from payload
                    if (payload.data && payload.data.user && payload.data.user.id) {
                        userId = parseInt(payload.data.user.id);
                        console.log("Extracted user ID from JWT payload:", userId);
                    }
                }
            } catch (decodeError) {
                console.error("Failed to decode JWT token:", decodeError);
            }
        }

        // If still no user ID, fail
        if (userId === 0) {
            console.error("Could not extract user ID from response or token");
            return {
                success: false,
                error: "Login successful but could not verify user identity. Please contact support.",
            };
        }

        return {
            success: true,
            token: data.token,
            user: {
                id: userId,
                username: data.user_nicename,
                email: data.user_email,
                displayName: data.user_display_name,
                roles: roles,
                token: data.token,
            },
        };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            error: "Network error. Please check your connection and try again.",
        };
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
