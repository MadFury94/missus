"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function UserLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // TODO: Implement actual login logic with WooCommerce
        setTimeout(() => {
            setLoading(false);
            router.push("/account");
        }, 1000);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-[45%] bg-black flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,0.015) 40px,rgba(255,255,255,0.015) 41px)" }}></div>
                <div className="absolute bottom-0 left-0 right-0 h-[50%]" style={{ background: "linear-gradient(to top, rgba(232,0,45,0.08), transparent)" }}></div>

                {/* Logo */}
                <Link href="/" className="fc text-[28px] font-black tracking-[0.06em] uppercase text-white relative z-10">
                    MISSUS<span className="text-[#e8002d]">.</span>
                </Link>

                {/* Hero text */}
                <div className="relative z-10">
                    <p className="fc text-[11px] font-bold tracking-[0.3em] uppercase text-[#e8002d] mb-4">Welcome Back</p>
                    <h2 className="fc text-[64px] font-black uppercase text-white leading-[0.92] mb-6">
                        Dress Like<br /><span className="text-[#e8002d]">Her.</span>
                    </h2>
                    <p className="text-[13px] text-white/50 font-light leading-relaxed max-w-[340px]">
                        Log in to track your orders, manage your wishlist, and get early access to new drops and exclusive Missus deals.
                    </p>
                </div>

                {/* Testimonial */}
                <div className="relative z-10 border border-white/10 p-5">
                    <div className="text-[#ffc107] text-sm mb-3">★★★★★</div>
                    <p className="text-[13px] text-white/70 italic leading-relaxed mb-3">
                        "Missus is really for the IT girls. Delivery in 45 mins, quality is unreal. Never switching."
                    </p>
                    <p className="fc text-[11px] font-bold tracking-[0.12em] uppercase text-[#e8002d]">Sarah O. — Lagos</p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
                <div className="w-full max-w-[420px]">
                    <h1 className="fc text-[32px] font-black uppercase tracking-[0.04em] mb-1">Sign In</h1>
                    <p className="text-[13px] text-[#767676] mb-8">
                        Don't have an account?{" "}
                        <Link href="/account/register" className="text-black font-semibold underline hover:no-underline">
                            Create one →
                        </Link>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="fc text-[11px] font-bold tracking-[0.14em] uppercase text-black block mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full border-[1.5px] border-[#e0e0e0] focus:border-black h-11 pl-10 pr-4 text-[13px] outline-none bg-white placeholder:text-[#bbb] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="fc text-[11px] font-bold tracking-[0.14em] uppercase text-black">Password</label>
                                <Link href="/account/forgot-password" className="text-[11px] text-[#767676] underline hover:text-black transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    className="w-full border-[1.5px] border-[#e0e0e0] focus:border-black h-11 pl-10 pr-10 text-[13px] outline-none bg-white placeholder:text-[#bbb] transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-black transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="w-4 h-4 accent-black cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-[12px] text-[#555] cursor-pointer select-none">
                                Keep me signed in
                            </label>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 text-[12px]">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-black text-white fc text-[14px] font-black tracking-[0.14em] uppercase hover:bg-[#222] transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                        </button>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#e0e0e0]"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-3 text-[11px] text-[#aaa] uppercase tracking-[0.08em]">
                                    or continue with
                                </span>
                            </div>
                        </div>

                        {/* Google */}
                        <button
                            type="button"
                            className="w-full h-11 border-[1.5px] border-[#e0e0e0] fc text-[13px] font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-2.5 hover:border-black transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
