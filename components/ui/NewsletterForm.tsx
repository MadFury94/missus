"use client";
import { useState } from "react";
import { BRAND_CONFIG } from "@/lib/brand-config";
import { useNewsletter } from "@/lib/use-newsletter";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const { done: submitted, loading, error, subscribe } = useNewsletter("footer");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        void subscribe(email);
    }

    return (
        <section className="bg-muted py-16 px-4">
            <div className="max-w-xl mx-auto text-center">
                <h2 className="font-display text-2xl font-bold text-secondary mb-1">Join {BRAND_CONFIG.name} Girls Club</h2>
                <p className="text-sm text-[#666] mb-6">
                    Get early drops, exclusive deals & style inspo — straight to your inbox.
                </p>
                {submitted ? (
                    <p className="text-primary font-semibold">Thanks! Check your inbox to confirm if requested.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
                        <input
                            type="email"
                            id="newsletter-form-email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            aria-label="Email address for newsletter subscription"
                            required
                            className="flex-1 border border-secondary/20 bg-white px-4 py-3 text-sm outline-none focus:border-secondary transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-secondary text-white px-6 py-3 text-sm font-semibold tracking-wide hover:bg-secondary/85 transition-colors"
                        >
                            {loading ? "Subscribing..." : "Subscribe"}
                        </button>
                    </form>
                )}
                {error && <p role="alert" className="text-sm mt-2">{error}</p>}
                <p className="text-xs mt-2">By subscribing, you agree to receive marketing emails. Unsubscribe anytime. <a href="/privacy" className="underline">Privacy Policy</a></p>
            </div>
        </section>
    );
}
