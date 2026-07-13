"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "../../services/auth";
import LoginForm from "../global/LoginForm";
import SignupForm from "../global/SignupForm";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Authentication State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Load active session from local storage
    try {
      const storedToken = localStorage.getItem("aurum_user_token");
      const storedUser = localStorage.getItem("aurum_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      // Ignored
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("aurum_user_token", newToken);
    localStorage.setItem("aurum_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    
    // Auto-close modal after brief delay
    setTimeout(() => {
      setShowAuthModal(false);
    }, 1000);
  };

  const handleSignOut = () => {
    localStorage.removeItem("aurum_user_token");
    localStorage.removeItem("aurum_user");
    setToken(null);
    setUser(null);
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 pt-[env(safe-area-inset-top)]">
      <motion.nav
        aria-label="Main"
        initial={prefersReducedMotion ? false : { y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`w-full transition-all duration-500 ${
          isScrolled
            ? "py-4 bg-verdant-cream/70 backdrop-blur-md border-b border-verdant-emerald/5"
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="hover-target flex items-center gap-2">
            <span className="font-serif text-xl tracking-[0.2em] font-light text-verdant-emerald">
              V E R D A N T
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            {["Collections", "Showcase", "Story", "Aesthetics"].map((link) => (
              <Link
                key={link}
                href={link === "Collections" ? "/products" : `/#${link.toLowerCase()}`}
                className="hover-target text-xs tracking-[0.2em] uppercase text-verdant-emerald/70 hover:text-verdant-gold transition-colors duration-300 font-bold"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Dynamic Sign-In / User Profile CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-[10px] tracking-widest font-bold uppercase text-verdant-emerald bg-verdant-emerald/5 px-4 py-2 rounded-full border border-verdant-emerald/10 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-verdant-gold" /> {user.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="hover-target border border-red-800/10 hover:border-red-800/40 text-red-800 bg-red-800/5 hover:bg-red-800/10 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
                className="hover-target glass-effect px-6 py-2.5 rounded-full text-xs tracking-[0.15em] uppercase hover:bg-verdant-emerald/5 transition-all duration-300 flex items-center gap-2 border border-verdant-emerald/10 hover:border-verdant-gold/50 group text-verdant-emerald cursor-pointer font-bold"
              >
                Sign In
                <ArrowRight className="w-3.5 h-3.5 text-verdant-gold group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button — 44px+ touch target */}
          <button
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="hover-target md:hidden flex items-center justify-center w-11 h-11 -mr-2 text-verdant-emerald/80 hover:text-verdant-emerald transition-colors"
          >
            {isOpen ? (
              <X aria-hidden className="w-6 h-6" />
            ) : (
              <Menu aria-hidden className="w-6 h-6" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-[70px] z-40 bg-verdant-cream/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 md:hidden border-t border-verdant-emerald/5 select-none"
          >
            {["Collections", "Showcase", "Story", "Aesthetics"].map((link) => (
              <Link
                key={link}
                href={link === "Collections" ? "/products" : `/#${link.toLowerCase()}`}
                onClick={() => setIsOpen(false)}
                className="text-lg tracking-[0.2em] uppercase text-verdant-emerald/80 hover:text-verdant-gold transition-colors duration-300 font-bold"
              >
                {link}
              </Link>
            ))}

            {user ? (
              <div className="flex flex-col items-center gap-4 w-full px-8">
                <span className="text-xs tracking-widest font-bold uppercase text-verdant-emerald bg-verdant-emerald/5 px-6 py-3 rounded-full border border-verdant-emerald/10 flex items-center gap-2 w-full justify-center">
                  <User className="w-4 h-4 text-verdant-gold" /> {user.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="w-full border border-red-800/10 hover:border-red-800/40 text-red-800 bg-red-800/5 hover:bg-red-800/10 py-3 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer font-bold uppercase tracking-wider text-[10px]"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsOpen(false); setAuthMode("login"); setShowAuthModal(true); }}
                className="glass-effect px-8 py-3 rounded-full text-xs tracking-[0.15em] uppercase hover:bg-verdant-emerald/5 flex items-center gap-2 border border-verdant-emerald/10 text-verdant-emerald font-bold"
              >
                Sign In
                <ArrowRight className="w-3.5 h-3.5 text-verdant-gold" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphism Authentication Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 select-none"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="glass-effect w-full max-w-md p-8 md:p-10 rounded-3xl border border-white/20 bg-[#0F4C3A]/50 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.3)] relative text-left text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/5 p-2 rounded-full border border-white/10 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Tab Switcher Headers */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 pb-3 text-xs tracking-[0.15em] uppercase font-bold text-center transition-all ${
                    authMode === "login"
                      ? "text-white border-b-2 border-verdant-gold"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 pb-3 text-xs tracking-[0.15em] uppercase font-bold text-center transition-all ${
                    authMode === "signup"
                      ? "text-white border-b-2 border-verdant-gold"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Render Selected View Form */}
              {authMode === "login" ? (
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToSignup={() => setAuthMode("signup")}
                />
              ) : (
                <SignupForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setAuthMode("login")}
                />
              )}

              <p className="text-[8px] tracking-widest text-white/30 uppercase text-center mt-6 block">
                secured via military cryptography protocols.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
