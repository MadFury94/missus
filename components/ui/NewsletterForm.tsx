"use client";
import { useState } from "react";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        // TODO: wire to Mailchimp / Klaviyo / WC newsletter
        setSubmitted(true);
    }

    return (
        <section className="bg-muted py-16 px-4">
            <div className="max-w-xl mx-auto text-center">
                <h2 className="font-display text-2xl font-bold text-secondary mb-1">Join The Missus Circle</h2>
                <p className="text-sm text-[#666] mb-6">
                    Get early drops, exclusive deals & style inspo — straight to your inbox.
                </p>
                {submitted ? (
                    <p className="text-primary font-semibold">You&apos;re in! Welcome to the circle ✨</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            required
                            className="flex-1 border border-secondary/20 bg-white px-4 py-3 text-sm outline-none focus:border-secondary transition-colors"
                        />
                        <button
                            type="submit"
                            className="bg-secondary text-white px-6 py-3 text-sm font-semibold tracking-wide hover:bg-secondary/85 transition-colors"
                        >
                            Subscribe
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
