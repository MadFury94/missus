// Only connection-establishment failures are safe to replay for an order POST.
export function isOrderConnectionFailure(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const detail = error as { code?: string; cause?: unknown; errors?: unknown[] };
    if (detail.code && ["UND_ERR_CONNECT_TIMEOUT", "ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ENETUNREACH", "EHOSTUNREACH"].includes(detail.code)) return true;
    if (detail.errors?.length) return detail.errors.every(isOrderConnectionFailure);
    return detail.cause !== undefined && isOrderConnectionFailure(detail.cause);
}

export async function fetchOrderRequest(url: string, options: RequestInit) {
    for (let attempt = 0; ; attempt++) {
        try {
            return await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
        } catch (error) {
            // Socket resets and response timeouts may occur after an order exists.
            if (attempt === 0 && isOrderConnectionFailure(error)) continue;
            throw error;
        }
    }
}
