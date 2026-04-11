"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("All fields are required."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    // Demo: any login succeeds
    if (email && password.length >= 6) {
      setSuccess(true);
    } else {
      setError("Invalid credentials. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Bg grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#e8002d]/5" />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Brand mark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#e8002d] mb-5">
            <ShieldCheck className="w-7 h-7 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="font-condensed text-[28px] font-black uppercase tracking-[0.06em] text-white mb-1">
            MISSUS<span className="text-[#e8002d]">.</span> Admin
          </h1>
          <p className="text-[12px] text-white/40 tracking-[0.1em] uppercase font-condensed font-medium">
            Restricted Access — Authorised Personnel Only
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-white/10 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-[#e8002d] flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h2 className="font-condensed text-[20px] font-black uppercase tracking-[0.1em] text-white mb-2">
                Access Granted
              </h2>
              <p className="text-[12px] text-white/50 mb-6">Redirecting to Admin Dashboard…</p>
              <Link
                href="/admin/dashboard"
                className="inline-block bg-[#e8002d] text-white font-condensed text-[12px] font-bold tracking-[0.14em] uppercase px-6 py-2.5 hover:bg-[#c0001f] transition-colors"
              >
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="font-condensed text-[13px] font-bold tracking-[0.1em] uppercase text-white mb-6">
                Sign in to Admin Panel
              </p>

              {error && (
                <div className="flex items-center gap-2 bg-[#e8002d]/10 border border-[#e8002d]/30 px-4 py-3 mb-5">
                  <AlertTriangle className="w-4 h-4 text-[#e8002d] flex-shrink-0" strokeWidth={2} />
                  <p className="text-[12px] text-[#e8002d] font-medium">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="mb-4">
                <label className="font-condensed text-[10px] font-bold tracking-[0.18em] uppercase text-white/50 block mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" strokeWidth={1.6} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@missusoutfits.com"
                    className="w-full bg-white/5 border border-white/10 focus:border-[#e8002d] h-11 pl-10 pr-4 text-[13px] text-white outline-none placeholder:text-white/20 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-5">
                <label className="font-condensed text-[10px] font-bold tracking-[0.18em] uppercase text-white/50 block mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" strokeWidth={1.6} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 focus:border-[#e8002d] h-11 pl-10 pr-10 text-[13px] text-white outline-none placeholder:text-white/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#e8002d] text-white font-condensed text-[13px] font-black tracking-[0.14em] uppercase hover:bg-[#c0001f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                    Sign In Securely
                  </>
                )}
              </button>

              <div className="flex items-center justify-between mt-4">
                <Link href="/admin/forgot" className="text-[11px] text-white/35 underline hover:text-white/70 transition-colors">
                  Forgot admin password?
                </Link>
                <Link href="/login" className="text-[11px] text-white/35 hover:text-white/70 transition-colors">
                  ← Customer login
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 mt-5 px-1">
          <ShieldCheck className="w-3.5 h-3.5 text-white/20 flex-shrink-0" strokeWidth={1.5} />
          <p className="text-[10px] text-white/25 leading-relaxed">
            All admin activity is logged and monitored. Unauthorised access attempts will be reported.
          </p>
        </div>
      </div>
    </div>
  );
}
