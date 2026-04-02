"use client";
import { useState } from "react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

export default function LoginPage() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // TODO: WooCommerce JWT auth
        setLoading(false);
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <Link href="/" className="font-display text-3xl font-bold text-secondary">{SITE_NAME}</Link>
                    <h1 className="text-xl font-bold text-secondary mt-4">Welcome Back</h1>
                    <p className="text-sm text-secondary/50 mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-secondary/60 block mb-1.5">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required
                            className="w-full border border-secondary/20 px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-secondary/60 block mb-1.5">Password</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange} required
                            className="w-full border border-secondary/20 px-4 py-3 text-sm outline-none focus:border-secondary transition-colors" />
                    </div>
                    <div className="flex justify-end">
                        <Link href="/account/forgot-password" className="text-xs text-secondary/40 hover:text-secondary transition-colors">Forgot password?</Link>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-secondary text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-secondary/85 transition-colors disabled:opacity-50">
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p className="text-center text-sm text-secondary/50 mt-6">
                    Don&apos;t have an account?{" "}
                    <Link href="/account/register" className="font-semibold text-secondary underline hover:text-primary transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
