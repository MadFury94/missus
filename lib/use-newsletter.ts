"use client";

import { useState } from "react";

export type NewsletterSource = "homepage" | "footer" | "popup-a" | "popup-b";

interface SubscribeOptions {
    source: NewsletterSource;
    tags?: string[];        // e.g. preference chips like ["Dresses","Tops"]
    popupVariant?: "a" | "b";
}

export function useNewsletter(source: NewsletterSource) {
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function subscribe(email: string, opts?: Pick<SubscribeOptions, "tags" | "popupVariant">) {
        if (loading) return;
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    source,
                    tags: opts?.tags ?? [],
                    popupVariant: opts?.popupVariant,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.ok) throw new Error(data.error || "Could not subscribe. Please try again.");
            setDone(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not subscribe. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return { done, loading, error, subscribe };
}
