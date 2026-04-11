"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Chrome } from "lucide-react";

interface FormState {
  email: string;
  password: string;
}

interface Errors {
  email?: string;
  password?: string;
  form?: string;
}

export default function UserLoginPage() {
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const e: Errors = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-black flex-col justify-between p-12 relative overflow-hidden">
        {/* Bg decoration */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,rgba(255,255,255,0.015)_40px,rgba(255,255,255,0.015)_41px)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[#e8002d]/8 to-transparent" />

        <Link href="/" className="relative z-10">
          <span className="font-condensed text-[28px] font-black tracking-[0.06em] uppercase text-white">
            MISSUS<span className="text-[#e8002d]">.</span>
          </span>
        </Link>

        <div className="relative z-10">
          <p className="font-condensed text-[11px] font-bold tracking-[0.3em] uppercase text-[#e8002d] mb-4">
            Welcome Back
          </p>
          <h2 className="font-condensed text-[clamp(40px,5vw,64px)] font-black uppercase text-white leading-[0.92] mb-6">
            Dress Like<br />
            <span className="text-[#e8002d]">Her.</span>
          </h2>
          <p className="text-[13px] text-white/50 font-light leading-relaxed max-w-[340px]">
            Log in to track your orders, manage your wishlist, and get early
            access to new drops and exclusive Missus deals.
          </p>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 border border-white/10 p-5">
          <div className="flex gap-0.5 mb-3 text-[#ffc107] text-sm">★★★★★</div>
          <p className="text-[13px] text-white/70 italic leading-relaxed mb-3">
            "Missus is really for the IT girls. Delivery in 45 mins, quality is
            unreal. Never switching."
          </p>
          <p className="font-condensed text-[11px] font-bold tracking-[0.12em] uppercase text-[#e8002d]">
            Sarah O. — Lagos
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden mb-8">
            <span className="font-condensed text-[24px] font-black tracking-[0.06em] uppercase">
              MISSUS<span className="text-[#e8002d]">.</span>
            </span>
          </Link>

          <h1 className="font-condensed text-[32px] font-black uppercase tracking-[0.04em] mb-1">
            Sign In
          </h1>
          <p className="text-[13px] text-[#767676] mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-black font-semibold underline hover:no-underline">
              Create one →
            </Link>
          </p>

          {success ? (
            <div className="bg-[#f0faf4] border border-[#c8e6d4] p-6 text-center">
              <div className="w-12 h-12 bg-[#007a3d] rounded-full flex items-center justify-center mx-auto mb-3">
                <ArrowRight className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="font-condensed text-[18px] font-bold uppercase tracking-[0.08em] text-[#007a3d] mb-1">
                Welcome Back!
              </h2>
              <p className="text-[13px] text-[#555]">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {errors.form && (
                <div className="bg-red-50 border border-[#e8002d]/30 px-4 py-3 text-[12px] text-[#e8002d] font-medium">
                  {errors.form}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase text-black block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" strokeWidth={1.6} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className={[
                      "w-full border-[1.5px] h-11 pl-10 pr-4 text-[13px] outline-none bg-white",
                      "placeholder:text-[#bbb] transition-colors",
                      errors.email ? "border-[#e8002d]" : "border-[#e0e0e0] focus:border-black",
                    ].join(" ")}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-[#e8002d] mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase text-black">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[11px] text-[#767676] underline hover:text-black transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" strokeWidth={1.6} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className={[
                      "w-full border-[1.5px] h-11 pl-10 pr-10 text-[13px] outline-none bg-white",
                      "placeholder:text-[#bbb] transition-colors",
                      errors.password ? "border-[#e8002d]" : "border-[#e0e0e0] focus:border-black",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-black transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-[#e8002d] mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="w-4 h-4 accent-black cursor-pointer" />
                <label htmlFor="remember" className="text-[12px] text-[#555] cursor-pointer select-none">
                  Keep me signed in
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-black text-white font-condensed text-[14px] font-black tracking-[0.14em] uppercase hover:bg-[#222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing In…
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e0e0e0]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[11px] text-[#aaa] uppercase tracking-[0.08em]">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google sign in */}
              <button
                type="button"
                className="w-full h-11 border-[1.5px] border-[#e0e0e0] font-condensed text-[13px] font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-2.5 hover:border-black transition-colors"
              >
                <Chrome className="w-4 h-4" strokeWidth={1.8} />
                Continue with Google
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
