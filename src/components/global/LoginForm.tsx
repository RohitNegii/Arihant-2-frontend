"use client";

import { useState, useEffect } from "react";
import { Mail, Key, ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { sendOtpApi, verifyOtpApi, UserProfile } from "../../services/auth";
import { toast } from "sonner";

interface LoginFormProps {
  onSuccess: (token: string, user: UserProfile) => void;
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      const res = await sendOtpApi(email, "login");
      if (res.success) {
        toast.success(`OTP dispatched! Check console log. (Code: ${res.code})`);
        setStep(2);
        setResendCountdown(30);
      } else {
        toast.error(res.message || "Failed to send OTP");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await sendOtpApi(email, "login");
      if (res.success) {
        toast.success(`New OTP code dispatched to console log! (Code: ${res.code})`);
        setResendCountdown(30);
      } else {
        toast.error(res.message || "Failed to resend OTP");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error resending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;

    setLoading(true);

    try {
      const res = await verifyOtpApi(email, otp);
      if (res.success && res.token && res.user) {
        toast.success("Signed In successfully!");
        onSuccess(res.token, res.user);
      } else {
        toast.error(res.message || "Invalid OTP code");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left select-none text-verdant-emerald">
      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase tracking-widest text-verdant-gold font-bold">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER REGISTERED EMAIL"
                required
                className="w-full text-xs text-verdant-emerald bg-white/60 border border-verdant-emerald/10 rounded-xl pl-10 pr-4 py-3.5 focus:outline-hidden focus:border-verdant-gold focus:bg-white placeholder-verdant-emerald/35 transition-colors font-bold tracking-wider"
              />
              <Mail className="w-4 h-4 text-verdant-emerald/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
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

          <p className="text-[10px] tracking-wide text-verdant-emerald/60 text-center mt-3 font-semibold">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-verdant-gold hover:underline font-bold"
            >
              Sign Up Instead
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
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
                className="w-full text-xs text-verdant-emerald bg-white/60 border border-verdant-emerald/10 rounded-xl pl-10 pr-4 py-3.5 focus:outline-hidden focus:border-verdant-gold focus:bg-white placeholder-verdant-emerald/35 transition-colors font-mono font-bold tracking-widest text-center"
              />
              <Key className="w-4 h-4 text-verdant-emerald/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex justify-end mt-1">
              <button
                type="button"
                disabled={resendCountdown > 0 || loading}
                onClick={handleResendOtp}
                className="text-[10px] tracking-wide text-verdant-gold hover:underline font-bold font-mono uppercase cursor-pointer disabled:opacity-50 disabled:no-underline"
              >
                {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : "Resend OTP"}
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-verdant-emerald border border-verdant-emerald/15 hover:bg-verdant-emerald/5 text-[9px] tracking-widest uppercase font-bold py-3.5 px-6 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 gold-gradient-bg text-black hover:scale-103 active:scale-95 text-[9px] tracking-widest uppercase font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? "VERIFYING..." : "CONFIRM VERIFICATION"}
              <ShieldCheck className="w-4.5 h-4.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
