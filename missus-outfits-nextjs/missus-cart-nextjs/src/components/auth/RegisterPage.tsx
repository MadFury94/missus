"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check } from "lucide-react";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  agree: boolean;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirm?: string;
  agree?: string;
}

const PERKS = [
  "Early access to new drops",
  "Exclusive member-only deals",
  "Free returns on your first order",
  "Order tracking & history",
  "Saved wishlist & addresses",
];

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    firstName: "", lastName: "", email: "",
    phone: "", password: "", confirm: "", agree: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone) e.phone = "Phone number is required";
    else if (!/^(\+?234|0)[789]\d{9}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid Nigerian number";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    if (!form.agree) e.agree = "You must accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setSuccess(true);
  }

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: k === "agree" ? (e.target as HTMLInputElement).checked : e.target.value });

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = passwordStrength();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#e8002d", "#ff6b35", "#f0a500", "#007a3d"][strength];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-black flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,rgba(255,255,255,0.015)_40px,rgba(255,255,255,0.015)_41px)]" />
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#e8002d]/8 to-transparent" />

        <Link href="/" className="relative z-10">
          <span className="font-condensed text-[28px] font-black tracking-[0.06em] uppercase text-white">
            MISSUS<span className="text-[#e8002d]">.</span>
          </span>
        </Link>

        <div className="relative z-10">
          <p className="font-condensed text-[11px] font-bold tracking-[0.3em] uppercase text-[#e8002d] mb-4">
            Join the Circle
          </p>
          <h2 className="font-condensed text-[52px] font-black uppercase text-white leading-[0.92] mb-6">
            Dress Like<br />
            <span className="text-[#e8002d]">Her.</span>
          </h2>
          <p className="text-[13px] text-white/50 font-light leading-relaxed mb-8">
            Create your Missus account and unlock a world of trendy, affordable
            fashion — delivered fast to your door.
          </p>

          {/* Perks list */}
          <div className="space-y-3">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#e8002d] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[13px] text-white/70 font-light">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/25 font-light">
          Join 50,000+ Missus girls across Nigeria
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 bg-white overflow-y-auto">
        <div className="w-full max-w-[480px]">
          <Link href="/" className="flex lg:hidden mb-6">
            <span className="font-condensed text-[24px] font-black tracking-[0.06em] uppercase">
              MISSUS<span className="text-[#e8002d]">.</span>
            </span>
          </Link>

          <h1 className="font-condensed text-[32px] font-black uppercase tracking-[0.04em] mb-1">
            Create Account
          </h1>
          <p className="text-[13px] text-[#767676] mb-7">
            Already have an account?{" "}
            <Link href="/login" className="text-black font-semibold underline hover:no-underline">
              Sign in →
            </Link>
          </p>

          {success ? (
            <div className="bg-[#f0faf4] border border-[#c8e6d4] p-8 text-center">
              <div className="w-14 h-14 bg-[#007a3d] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="font-condensed text-[22px] font-black uppercase tracking-[0.06em] text-[#007a3d] mb-2">
                Welcome to Missus!
              </h2>
              <p className="text-[13px] text-[#555] leading-relaxed mb-4">
                Your account has been created. Check your email for a verification link, then start shopping.
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-black text-white font-condensed text-[13px] font-bold tracking-[0.12em] uppercase px-8 py-3 hover:bg-[#222] transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                {(["firstName", "lastName"] as const).map((k) => (
                  <div key={k}>
                    <label className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase text-black block mb-1.5">
                      {k === "firstName" ? "First Name" : "Last Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" strokeWidth={1.6} />
                      <input
                        type="text"
                        value={form[k]}
                        onChange={update(k)}
                        placeholder={k === "firstName" ? "Ada" : "Okafor"}
                        className={[
                          "w-full border-[1.5px] h-11 pl-10 pr-3 text-[13px] outline-none bg-white placeholder:text-[#bbb]",
                          errors[k] ? "border-[#e8002d]" : "border-[#e0e0e0] focus:border-black",
                        ].join(" ")}
                      />
                    </div>
                    {errors[k] && <p className="text-[11px] text-[#e8002d] mt-1">{errors[k]}</p>}
                  </div>
                ))}
              </div>

              {/* Email */}
              <div>
                <label className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase text-black block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" strokeWidth={1.6} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="ada@example.com"
                    className={[
                      "w-full border-[1.5px] h-11 pl-10 pr-4 text-[13px] outline-none bg-white placeholder:text-[#bbb]",
                      errors.email ? "border-[#e8002d]" : "border-[#e0e0e0] focus:border-black",
                    ].join(" ")}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-[#e8002d] mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase text-black block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" strokeWidth={1.6} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="08012345678"
                    className={[
                      "w-full border-[1.5px] h-11 pl-10 pr-4 text-[13px] outline-none bg-white placeholder:text-[#bbb]",
                      errors.phone ? "border-[#e8002d]" : "border-[#e0e0e0] focus:border-black",
                    ].join(" ")}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-[#e8002d] mt-1">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase text-black block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" strokeWidth={1.6} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={update("password")}
                    placeholder="Min. 8 characters"
                    className={[
                      "w-full border-[1.5px] h-11 pl-10 pr-10 text-[13px] outline-none bg-white placeholder:text-[#bbb]",
                      errors.password ? "border-[#e8002d]" : "border-[#e0e0e0] focus:border-black",
                    ].join(" ")}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-black">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="mt-1.5">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength ? strengthColor : "#e0e0e0" }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-medium" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-[11px] text-[#e8002d] mt-1">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="font-condensed text-[11px] font-bold tracking-[0.14em] uppercase text-black block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" strokeWidth={1.6} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={update("confirm")}
                    placeholder="Repeat password"
                    className={[
                      "w-full border-[1.5px] h-11 pl-10 pr-10 text-[13px] outline-none bg-white placeholder:text-[#bbb]",
                      errors.confirm ? "border-[#e8002d]"
                      : form.confirm && form.confirm === form.password ? "border-[#007a3d]"
                      : "border-[#e0e0e0] focus:border-black",
                    ].join(" ")}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-black">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {form.confirm && form.confirm === form.password && (
                    <Check className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-[#007a3d]" strokeWidth={2.5} />
                  )}
                </div>
                {errors.confirm && <p className="text-[11px] text-[#e8002d] mt-1">{errors.confirm}</p>}
              </div>

              {/* Terms */}
              <div>
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={form.agree}
                    onChange={update("agree")}
                    className="w-4 h-4 accent-black cursor-pointer mt-0.5 flex-shrink-0"
                  />
                  <label htmlFor="agree" className="text-[12px] text-[#555] cursor-pointer leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-black font-semibold underline hover:no-underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-black font-semibold underline hover:no-underline">Privacy Policy</Link>.
                    I&apos;d also love to receive exclusive offers and new arrival updates.
                  </label>
                </div>
                {errors.agree && <p className="text-[11px] text-[#e8002d] mt-1 ml-6">{errors.agree}</p>}
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
                    Creating Account…
                  </span>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
