"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShowroomStore } from "@/store/showroom-store";
import { Menu, X, ArrowRight, User, LogOut, ShoppingBag } from "lucide-react";
import CrestMark from "@/components/global/CrestMark";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import LoginForm from "../global/LoginForm";
import SignupForm from "../global/SignupForm";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import CartDrawer from "../global/CartDrawer";
import { useScrollLock } from "@/hooks/useScrollLock";

// Darken the existing gold with the brand ink for readable active/hover text.
const navigationColor = (active: boolean) => active
  ? "text-[var(--nav-accent)]"
  : "text-verdant-emerald hover:text-[var(--nav-accent)]";

export default function Navbar() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  // Authentication Context State
  const {
    user,
    showAuthModal,
    authMode,
    openAuthModal,
    closeAuthModal,
    setAuthMode,
    loginSuccess,
    logout
  } = useAuthStore();

  // Cart Context State
  const { cartCount, setCartOpen } = useCartStore();

  useScrollLock(isOpen || showAuthModal);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    useShowroomStore.getState().setMenuOpen(isOpen);
    return () => useShowroomStore.getState().setMenuOpen(false);
  }, [isOpen]);

  const handleToggleMenu = () => {
    setIsOpen((prev) => {
      const next = !prev;
      useShowroomStore.getState().setMenuOpen(next);
      return next;
    });
  };

  const handleCloseMenu = () => {
    setIsOpen(false);
    useShowroomStore.getState().setMenuOpen(false);
  };

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    useShowroomStore.getState().setMenuOpen(false);
    if (href !== pathname) {
      setNavigatingTo(href);
      useShowroomStore.getState().beginNavigation(pathname);
    }
  };

  const handleSignOut = () => {
    logout();
    setIsOpen(false);
    useShowroomStore.getState().setMenuOpen(false);
  };

  const isHomeActive = pathname === "/";
  const isCollectionsActive = pathname === "/products" || pathname.startsWith("/products/");
  const isOrdersActive = pathname === "/orders" || pathname.startsWith("/orders/");
  const isContactActive = pathname === "/contact";

  return (
    <header className="pointer-events-auto fixed top-0 left-0 w-full z-50 pt-[env(safe-area-inset-top)] [--nav-accent:color-mix(in_srgb,var(--color-secondary)_45%,var(--color-primary))]">
      {/* Top Route Navigation Loading Bar */}
      {navigatingTo && (
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-verdant-gold/20 overflow-hidden z-[100] pointer-events-none">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-verdant-gold to-transparent"
          />
        </div>
      )}
      <motion.nav
        aria-label="Main"
        // `initial` must not depend on prefersReducedMotion: the hook reports
        // false during SSR and true on a reduced-motion client, so the server
        // sent opacity 0 / translateY(-100px) while the client wanted the
        // settled values — a hydration mismatch for exactly the users least
        // able to tolerate a repaint. The preference is honoured by collapsing
        // the duration instead, which lands on the same frame.
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: "easeOut" }}
        className={`w-full transition-all duration-500 ${isScrolled
          ? "py-3 bg-verdant-cream/95 backdrop-blur-xl border-b border-verdant-gold/20 shadow-[0_8px_32px_rgba(var(--color-primary-rgb),0.04)]"
          : "py-5 bg-verdant-cream/95 backdrop-blur-md border-b border-verdant-gold/15"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => handleNavigate("/")}
            onNavigate={() => handleNavigate("/")}
            className="hover-target flex items-center gap-2 group cursor-pointer"
            style={{ touchAction: "manipulation" }}
          >
            {/* The house mark. The pale gradient this used to sit in had to
                go with the sparkle: the crest is ivory and gold and would have
                vanished into it. */}
            <CrestMark
              size={32}
              className="rounded-lg border border-verdant-gold/25 group-hover:border-verdant-gold/60 group-hover:scale-105 transition-all duration-300"
            />
            {/* The wordmark is letter-spaced twice over — once by the spaces in
                the text and once by `tracking` — which at 390px wide put the
                final T on a line of its own under the rest of the name. Both
                scale down with the viewport now, and it may not wrap in any
                case: a house name that breaks mid-word is worse than a small
                one. */}
            <span className="font-serif text-sm sm:text-lg lg:text-xl tracking-wide whitespace-nowrap font-bold text-verdant-emerald group-hover:text-[var(--nav-accent)] transition-colors duration-300">
              GEETEJ VIRAASAT

            </span>
          </Link>

          {/* Desktop Navigation Links (Clean and spacious) */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            <Link
              href="/"
              onClick={() => handleNavigate("/")}
              onNavigate={() => handleNavigate("/")}
              className={`hover-target relative text-[11px] lg:text-xs tracking-[0.14em] uppercase transition-all duration-300 font-bold py-2 ${navigationColor(isHomeActive)
                }`}
            >
              Home
              {isHomeActive && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-verdant-gold rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
            <Link
              href="/products"
              onClick={() => handleNavigate("/products")}
              onNavigate={() => handleNavigate("/products")}
              className={`hover-target relative text-[11px] lg:text-xs tracking-[0.14em] uppercase transition-all duration-300 font-bold py-2 ${navigationColor(isCollectionsActive)
                }`}
            >
              Collections
              {isCollectionsActive && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-verdant-gold rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
            {user && (
              <Link
                href="/orders"
                onClick={() => handleNavigate("/orders")}
                onNavigate={() => handleNavigate("/orders")}
                className={`hover-target relative text-[11px] lg:text-xs tracking-[0.14em] uppercase transition-all duration-300 font-bold py-2 ${navigationColor(isOrdersActive)
                  }`}
              >
                Orders
                {isOrdersActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-verdant-gold rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )}
            <Link
              href="/contact"
              onClick={() => handleNavigate("/contact")}
              onNavigate={() => handleNavigate("/contact")}
              className={`hover-target relative text-[11px] lg:text-xs tracking-[0.14em] uppercase transition-all duration-300 font-bold py-2 ${navigationColor(isContactActive)
                }`}
            >
              Contact
              {isContactActive && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-verdant-gold rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
            {/* Legal Dropdown */}
            <div className="relative group/dropdown py-2">
              <button
                className={`hover-target flex items-center gap-1 text-[11px] lg:text-xs tracking-[0.14em] uppercase transition-all duration-300 font-bold cursor-pointer ${navigationColor(pathname === "/privacy-policy" || pathname === "/terms-of-use" || pathname === "/refund-policy")
                  }`}
              >
                Legal
                <span className="text-[8px] transform group-hover/dropdown:rotate-180 transition-transform duration-300 ml-1">▼</span>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-[var(--color-background)]/95 backdrop-blur-xl border border-verdant-gold/15 rounded-xl shadow-xl py-2 opacity-0 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:pointer-events-auto transition-all duration-300 transform scale-95 group-hover/dropdown:scale-100 origin-top">
                <Link
                  href="/privacy-policy"
                  onClick={() => handleNavigate("/privacy-policy")}
                  onNavigate={() => handleNavigate("/privacy-policy")}
                  className={`block px-4 py-2.5 text-[11px] tracking-[0.1em] uppercase font-bold hover:bg-verdant-gold/10 transition-colors ${navigationColor(pathname === "/privacy-policy")
                    }`}
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-use"
                  onClick={() => handleNavigate("/terms-of-use")}
                  onNavigate={() => handleNavigate("/terms-of-use")}
                  className={`block px-4 py-2.5 text-[11px] tracking-[0.1em] uppercase font-bold hover:bg-verdant-gold/10 transition-colors ${navigationColor(pathname === "/terms-of-use")
                    }`}
                >
                  Terms of Use
                </Link>
                <Link
                  href="/refund-policy"
                  onClick={() => handleNavigate("/refund-policy")}
                  onNavigate={() => handleNavigate("/refund-policy")}
                  className={`block px-4 py-2.5 text-[11px] tracking-[0.1em] uppercase font-bold hover:bg-verdant-gold/10 transition-colors ${navigationColor(pathname === "/refund-policy")
                    }`}
                >
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Dynamic Sign-In / User Profile CTA Button & Cart */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart Icon Button */}
            {user && (
              <button
                onClick={() => setCartOpen(true)}
                className="hover-target relative w-10 h-10 rounded-full border border-verdant-emerald/10 bg-[var(--color-background)]/40 hover:bg-white flex items-center justify-center text-verdant-emerald hover:text-verdant-gold hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-verdant-gold text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[var(--color-background)]"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-[10px] tracking-widest font-bold uppercase text-verdant-emerald bg-verdant-emerald/5 px-4 py-2 rounded-full border border-verdant-emerald/10 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-verdant-gold" /> {user.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="hover-target border border-verdant-danger/10 hover:border-verdant-danger/40 text-verdant-danger bg-verdant-danger/5 hover:bg-verdant-danger/10 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { openAuthModal("login"); }}
                className="hover-target px-6 py-2.5 rounded-full text-xs tracking-[0.15em] uppercase bg-verdant-emerald text-white hover:bg-verdant-gold hover:text-black transition-all duration-300 flex items-center gap-2 border border-transparent shadow-xs cursor-pointer font-bold group"
              >
                Sign In
                <ArrowRight className="w-3.5 h-3.5 text-verdant-gold group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Mobile Menu & Cart Icon (Visible on mobile) */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-10 h-10 rounded-full border border-verdant-emerald/10 bg-white/40 flex items-center justify-center text-verdant-emerald cursor-pointer animate-all"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-verdant-gold text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[var(--color-background)]">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleMenu}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="cursor-pointer flex items-center justify-center w-11 h-11 text-verdant-emerald active:text-[var(--nav-accent)] active:scale-95 transition-transform touch-manipulation select-none"
              style={{ touchAction: "manipulation" }}
            >
              {isOpen ? (
                <X aria-hidden className="w-6 h-6" />
              ) : (
                <Menu aria-hidden className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Menu (Sidebar Slide-over) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleCloseMenu}
              className="fixed inset-0 bg-black z-40 md:hidden"
              style={{ touchAction: "none" }}
            />
            {/* Drawer */}
            <motion.div
              id="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 right-0 w-full max-w-xs z-50 bg-[var(--color-background)] shadow-2xl border-l border-verdant-emerald/10 flex flex-col p-8 select-none md:hidden text-left overflow-y-auto overscroll-contain"
              style={{
                touchAction: "pan-y",
                willChange: "transform",
                WebkitOverflowScrolling: "touch",
              }}
              data-lenis-prevent
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-8">
                <span className="font-serif text-sm tracking-[0.2em] font-light text-verdant-emerald">
                  M E N U
                </span>
                <button
                  type="button"
                  onClick={handleCloseMenu}
                  aria-label="Close menu"
                  className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full border border-verdant-emerald/10 text-verdant-emerald/70 active:text-verdant-emerald active:bg-verdant-emerald/5 transition-transform active:scale-95 touch-manipulation"
                  style={{ touchAction: "manipulation" }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="flex flex-col gap-3 text-sm">
                {[
                  { href: "/", label: "Home", active: isHomeActive },
                  { href: "/products", label: "Collections", active: isCollectionsActive },
                  ...(user ? [{ href: "/orders", label: "Orders", active: isOrdersActive }] : []),
                  { href: "/contact", label: "Contact", active: isContactActive },
                  { href: "/privacy-policy", label: "Privacy Policy", active: pathname === "/privacy-policy" },
                  { href: "/terms-of-use", label: "Terms of Use", active: pathname === "/terms-of-use" },
                  { href: "/refund-policy", label: "Refund Policy", active: pathname === "/refund-policy" },
                ].map((item) => {
                  const isNavigating = navigatingTo === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => handleNavigate(item.href)}
                      className={`cursor-pointer tracking-[0.15em] uppercase font-bold py-2.5 px-3 rounded-lg border-b border-verdant-emerald/5 active:bg-verdant-gold/15 active:text-[var(--nav-accent)] transition-colors touch-manipulation flex items-center justify-between ${
                        item.active
                          ? "text-[var(--nav-accent)] font-extrabold bg-verdant-gold/10"
                          : "text-verdant-emerald"
                      }`}
                      style={{ touchAction: "manipulation" }}
                    >
                      <span className="flex items-center gap-2">
                        {item.label}
                        {isNavigating && (
                          <span className="inline-block w-2 h-2 rounded-full bg-verdant-gold animate-ping" />
                        )}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${item.active ? "text-[var(--nav-accent)] translate-x-0.5" : "opacity-40"}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Drawer CTAs at bottom */}
              <div className="mt-auto pt-8 border-t border-verdant-emerald/10">
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="text-[10px] tracking-widest font-bold uppercase text-verdant-emerald bg-verdant-emerald/5 px-4 py-3 rounded-xl border border-verdant-emerald/10 flex items-center gap-2 justify-center">
                      <User className="w-4 h-4 text-verdant-gold" /> {user.name}
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="cursor-pointer w-full border border-verdant-danger/10 active:border-verdant-danger/40 text-verdant-danger bg-verdant-danger/5 active:bg-verdant-danger/10 py-3 rounded-full flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-wider text-[10px] touch-manipulation active:scale-95"
                      style={{ touchAction: "manipulation" }}
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { handleCloseMenu(); openAuthModal("login"); }}
                    className="cursor-pointer w-full px-6 py-3 rounded-full text-xs tracking-[0.15em] uppercase bg-verdant-emerald text-white active:bg-verdant-gold active:text-black transition-all flex items-center justify-center gap-2 border border-transparent shadow-xs font-bold touch-manipulation active:scale-95"
                    style={{ touchAction: "manipulation" }}
                  >
                    Sign In
                    <ArrowRight className="w-3.5 h-3.5 text-verdant-gold" />
                  </button>
                )}
              </div>
            </motion.div>
          </>
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
              className="w-full max-w-4xl rounded-3xl border border-verdant-emerald/10 bg-[var(--color-background)] shadow-[0_32px_80px_rgba(var(--color-primary-rgb),0.15)] relative overflow-hidden text-left text-verdant-emerald max-h-[90vh] overflow-y-auto"
              data-lenis-prevent
            >
              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Left side premium image (responsive) */}
                <div className="hidden md:block md:col-span-5 relative min-h-[500px]">
                  <img
                    src="/images/products/ksp_16.jpg"
                    alt="Luxury jewelry collection preview"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.8]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-8 select-none">
                    <h3 className="font-serif text-2xl text-verdant-gold font-light mb-2">GEETEJ VIRAASAT</h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/70 leading-relaxed font-bold font-sans">
                      Enter the vault of handcrafted masterpieces and timeless designs.
                    </p>
                  </div>
                </div>

                {/* Right side form */}
                <div className="col-span-1 md:col-span-7 p-8 md:p-10 flex flex-col justify-center relative">
                  {/* Close Button */}
                  <button
                    onClick={closeAuthModal}
                    className="absolute top-6 right-6 text-verdant-emerald/50 hover:text-verdant-emerald bg-verdant-emerald/5 p-2 rounded-full border border-verdant-emerald/10 cursor-pointer transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Tab Switcher Headers */}
                  <div className="flex border-b border-verdant-emerald/10 mb-6">
                    <button
                      onClick={() => setAuthMode("login")}
                      className={`flex-1 pb-3 text-xs tracking-[0.15em] uppercase font-bold text-center transition-all ${authMode === "login"
                        ? "text-verdant-emerald border-b-2 border-verdant-gold"
                        : "text-verdant-emerald/40 hover:text-verdant-emerald"
                        }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode("signup")}
                      className={`flex-1 pb-3 text-xs tracking-[0.15em] uppercase font-bold text-center transition-all ${authMode === "signup"
                        ? "text-verdant-emerald border-b-2 border-verdant-gold"
                        : "text-verdant-emerald/40 hover:text-verdant-emerald"
                        }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Render Selected View Form */}
                  {authMode === "login" ? (
                    <LoginForm
                      onSuccess={loginSuccess}
                      onSwitchToSignup={() => setAuthMode("signup")}
                    />
                  ) : (
                    <SignupForm
                      onSuccess={loginSuccess}
                      onSwitchToLogin={() => setAuthMode("login")}
                    />
                  )}

                  <p className="text-[8px] tracking-widest text-verdant-emerald/30 uppercase text-center mt-6 block select-none">
                    secured via military cryptography protocols.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
    </header>
  );
}

