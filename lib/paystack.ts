export interface PaystackInitResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export async function initializePayment(params: {
    email: string;
    amount: number; // in naira — will be converted to kobo
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, unknown>;
}): Promise<PaystackInitResponse | null> {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) {
        console.warn("Paystack secret key missing");
        return null;
    }
    try {
        const res = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: params.email,
                amount: Math.round(params.amount * 100), // convert naira → kobo
                reference: params.reference,
                callback_url: params.callbackUrl,
                metadata: params.metadata,
                currency: "NGN",
            }),
        });
        return res.json();
    } catch (err) {
        console.warn("Paystack init failed:", err);
        return null;
    }
}

export async function verifyPayment(reference: string): Promise<boolean> {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return false;
    try {
        const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${key}` },
        });
        const data = await res.json();
        return data?.data?.status === "success";
    } catch {
        return false;
    }
}

export function generateReference(): string {
    return `MISSUS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
