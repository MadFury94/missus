/**
 * Centralized API utilities for WordPress/WooCommerce integration
 * 
 * Use these helpers instead of hardcoded URLs to ensure seamless migration
 * when moving WordPress to a subdomain (e.g., wp.missusoutfits.com)
 */

import { API_ENDPOINTS, WP_HEADERS, WP_FETCH_TIMEOUT } from "./config";

// ──────────────────────────────────────────────────────────────────────────
// WooCommerce API Helpers
// ──────────────────────────────────────────────────────────────────────────

/** Get WooCommerce REST API credentials with proper error handling */
export function getWooCommerceAuth() {
    const key = process.env.WC_CONSUMER_KEY;
    const secret = process.env.WC_CONSUMER_SECRET;

    if (!key || !secret) {
        throw new Error("WooCommerce API credentials not configured");
    }

    return {
        key,
        secret,
        authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
    };
}

/** Fetch from WooCommerce REST API v3 with authentication */
export async function wcApiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const auth = getWooCommerceAuth();

    const response = await fetch(`${API_ENDPOINTS.woocommerce.rest}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: auth.authorization,
            ...options.headers,
        },
        signal: AbortSignal.timeout(WP_FETCH_TIMEOUT),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`WooCommerce API error (${response.status}): ${error}`);
    }

    return response.json();
}

/** Fetch from WooCommerce Store API (public, no auth) */
export async function wcStoreFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_ENDPOINTS.woocommerce.store}${path}`, {
        ...options,
        headers: {
            ...WP_HEADERS,
            ...options.headers,
        },
        signal: AbortSignal.timeout(WP_FETCH_TIMEOUT),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`WooCommerce Store API error (${response.status}): ${error}`);
    }

    return response.json();
}

// ──────────────────────────────────────────────────────────────────────────
// WordPress API Helpers
// ──────────────────────────────────────────────────────────────────────────

/** Fetch from WordPress Core API */
export async function wpApiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_ENDPOINTS.wordpress.core}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        signal: AbortSignal.timeout(WP_FETCH_TIMEOUT),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`WordPress API error (${response.status}): ${error}`);
    }

    return response.json();
}

/** Fetch from custom Missus API endpoints */
export async function missusApiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_ENDPOINTS.custom.giftCards}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        signal: AbortSignal.timeout(WP_FETCH_TIMEOUT),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Missus API error (${response.status}): ${error}`);
    }

    return response.json();
}

// ──────────────────────────────────────────────────────────────────────────
// Asset URL Helpers
// ──────────────────────────────────────────────────────────────────────────

/** Get WordPress media URL with centralized base */
export function getWpMediaUrl(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_ENDPOINTS.assets.uploads}/${cleanPath}`;
}

/** Get product image URL */
export function getProductImageUrl(filename: string): string {
    return `${API_ENDPOINTS.assets.products}/${filename}`;
}

/** Get banner image URL */
export function getBannerImageUrl(filename: string): string {
    return `${API_ENDPOINTS.assets.banners}/${filename}`;
}

/** Get category image URL */
export function getCategoryImageUrl(filename: string): string {
    return `${API_ENDPOINTS.assets.categories}/${filename}`;
}

// ──────────────────────────────────────────────────────────────────────────
// Migration Utilities
// ──────────────────────────────────────────────────────────────────────────

/** 
 * Check if running against WordPress subdomain 
 * (useful for conditional logic during migration)
 */
export function isWordPressSubdomain(): boolean {
    return API_ENDPOINTS.wordpress.core.includes('wp.');
}

/**
 * Get the current WordPress base URL
 * (useful for logging, debugging, and migration scripts)
 */
export function getWordPressBaseUrl(): string {
    return API_ENDPOINTS.wordpress.core.replace('/wp-json', '');
}