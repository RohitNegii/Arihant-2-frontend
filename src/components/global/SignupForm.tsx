"use client";

import { useState } from "react";
import { Phone, Key, ArrowRight, ShieldCheck, ArrowLeft, User, Mail } from "lucide-react";
import { sendOtpApi, verifyOtpApi, UserProfile } from "../../services/auth";

interface SignupFormProps {
  onSuccess: (token: string, user: UserProfile) => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await sendOtpApi(phone, "signup");
      if (res.success) {
        setSuccess("OTP dispatched! Check server console log.");
        setStep(2);
      } else {
        setError(res.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otp || !name) {
      if (!name) setError("Please enter your name to complete signup");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await verifyOtpApi(phone, otp, name, email || undefined);
      if (res.success && res.token && res.user) {
        setSuccess("Account created successfully!");
        onSuccess(res.token, res.user);
      } else {
        setError(res.message || "Invalid OTP code");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left select-none text-white">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-[11px] font-semibold p-3.5 rounded-xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-[11px] font-semibold p-3.5 rounded-xl flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {success}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-widest text-verdant-gold font-bold">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="ENTER PHONE FOR SIGN UP"
                required
                className="w-full text-xs text-white bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 focus:outline-hidden focus:border-verdant-gold/80 focus:bg-white/15 placeholder-white/35 transition-all font-bold tracking-wider"
              />
              <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gold-gradient-bg text-black hover:scale-103 active:scale-95 text-[9px] tracking-widest uppercase font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md transition-all duration-300 w-full cursor-pointer disabled:opacity-50 mt-2 font-mono"
          >
            {loading ? "SENDING CODE..." : "DISPATCH OTP CODE"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <p className="text-[10px] tracking-wide text-white/60 text-center mt-3 font-semibold">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-verdant-gold hover:underline font-bold"
            >
              Sign In Instead
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          {/* OTP Code */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-widest text-verdant-gold font-bold">
              Verification OTP
            </label>
            <div className="relative">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="ENTER 6-DIGIT OTP"
                required
                className="w-full text-xs text-white bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 focus:outline-hidden focus:border-verdant-gold/80 focus:bg-white/15 placeholder-white/35 transition-all font-mono font-bold tracking-widest text-center"
              />
              <Key className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-widest text-verdant-gold font-bold">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="YOUR NAME"
                required
                className="w-full text-xs text-white bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 focus:outline-hidden focus:border-verdant-gold/80 focus:bg-white/15 placeholder-white/35 transition-all font-bold tracking-wider uppercase"
              />
              <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Optional Email */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[9px] uppercase tracking-widest text-verdant-gold font-bold">
                Email Address
              </label>
              <span className="text-[7px] text-verdant-gold/70 tracking-wider uppercase font-bold font-mono">Optional</span>
            </div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL@DOMAIN.COM"
                className="w-full text-xs text-white bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 focus:outline-hidden focus:border-verdant-gold/80 focus:bg-white/15 placeholder-white/35 transition-all font-semibold tracking-wider"
              />
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="glass-effect text-white border border-white/10 hover:bg-white/5 text-[9px] tracking-widest uppercase font-bold py-3.5 px-6 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 gold-gradient-bg text-black hover:scale-103 active:scale-95 text-[9px] tracking-widest uppercase font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? "REGISTERING..." : "CONFIRM REGISTRATION"}
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
