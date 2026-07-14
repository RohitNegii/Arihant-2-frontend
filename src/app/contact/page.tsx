"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Loader2, Sparkles, ArrowRight } from "lucide-react";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import axios from "axios";
import { API_URL } from "@/utils/api";
import { toast } from "sonner";

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full Name is required.";
        if (value.length > 100) return "Full Name cannot exceed 100 characters.";
        return "";
      case "email":
        if (!value.trim()) return "Email Address is required.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address.";
        if (value.length > 100) return "Email Address cannot exceed 100 characters.";
        return "";
      case "phone":
        if (value && value.length > 30) return "Phone number cannot exceed 30 characters.";
        return "";
      case "subject":
        if (!value.trim()) return "Subject is required.";
        if (value.length > 200) return "Subject cannot exceed 200 characters.";
        return "";
      case "message":
        if (!value.trim()) return "Message is required.";
        if (value.length > 3000) return "Message cannot exceed 3000 characters.";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const formErrors: FormErrors = {};
    Object.keys(form).forEach((key) => {
      const errorMsg = validateField(key, form[key as keyof FormState]);
      if (errorMsg) {
        formErrors[key as keyof FormErrors] = errorMsg;
      }
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error("Please correct the errors in the form.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/contact`, form);
      if (response.data.success) {
        toast.success(response.data.message || "Your inquiry has been sent successfully!");
        // Clear Form
        setForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        });
        setErrors({});
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to send inquiry. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5 text-verdant-gold" />,
      label: "Bespoke Concierge",
      value: "concierge@verdantjewels.com",
      link: "mailto:concierge@verdantjewels.com"
    },
    {
      icon: <Phone className="w-5 h-5 text-verdant-gold" />,
      label: "Support Line",
      value: "+1 (212) 555-8901",
      link: "tel:+12125558901"
    },
    {
      icon: <MapPin className="w-5 h-5 text-verdant-gold" />,
      label: "Flagship Boutique",
      value: "Fifth Avenue 712, New York, NY 10019",
      link: "https://maps.google.com/?q=Fifth+Avenue+712,+New+York"
    },
    {
      icon: <Clock className="w-5 h-5 text-verdant-gold" />,
      label: "Atelier Hours",
      value: "Monday – Saturday: 10:00 AM – 7:00 PM EST",
      link: null
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#F8F4EA] text-verdant-emerald overflow-hidden selection:bg-verdant-gold selection:text-black">
      {/* Navbar */}
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-[25%] left-[-15%] w-[55vw] h-[55vw] bg-radial from-[#C8A96A]/8 to-transparent blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />
      <div className="absolute bottom-[20%] right-[-15%] w-[50vw] h-[50vw] bg-radial from-[#0F4C3A]/6 to-transparent blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "10s" }} />

      {/* HERO BANNER */}
      <div className="relative w-full h-[320px] bg-[#0B1B17] overflow-hidden flex items-center justify-center">
        {/* Background Image with Dark Emerald Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=2000&q=80"
            alt="Jewelry Atelier"
            className="w-full h-full object-cover object-center opacity-30 select-none pointer-events-none filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1B17]/95 via-[#0B1B17]/70 to-[#F8F4EA]" />
          <div className="absolute inset-0 bg-[#0F4C3A]/10 mix-blend-overlay" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl w-full mx-auto px-6 pt-16 text-left">
          <div className="space-y-3">
            <span className="text-[10px] tracking-[0.3em] uppercase text-verdant-gold font-bold flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Direct Atelier Connection
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white leading-tight">
              Get in Touch
            </h1>
            <p className="text-xs text-white/60 leading-relaxed font-sans max-w-xl">
              Whether searching for GIA certification details, custom bridal consults, or boutique booking, our representatives are ready to assist.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT BLOCK */}
      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: CONTACT INFORMATION */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card bg-white/60 backdrop-blur-md border border-verdant-emerald/10 rounded-3xl p-8 shadow-[0_12px_40px_rgba(15,76,58,0.03)] text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-verdant-gold/10 to-transparent blur-2xl pointer-events-none" />
              
              <h2 className="font-serif text-2xl font-light text-verdant-emerald mb-2">Our Boutiques</h2>
              <p className="text-xs text-verdant-emerald/60 leading-relaxed mb-8">
                Verdant Jewels blends the geometry of rare raw crystals with clean modern settings. Connect with us online, call our support desks, or visit one of our flagship global galleries.
              </p>

              <div className="space-y-6">
                {contactInfo.map((info, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-verdant-emerald/5 border border-verdant-emerald/10 flex items-center justify-center shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <span className="text-[10px] tracking-widest uppercase text-verdant-gold font-bold block mb-1">
                        {info.label}
                      </span>
                      {info.link ? (
                        <a
                          href={info.link}
                          target={info.link.startsWith("http") ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className="text-xs text-verdant-emerald hover:text-verdant-gold font-medium transition-colors font-sans"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <span className="text-xs text-verdant-emerald font-medium font-sans">
                          {info.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantee Details */}
            <div className="glass-card bg-white/40 border border-verdant-emerald/5 rounded-3xl p-6 text-left space-y-3">
              <h4 className="font-serif text-xs tracking-wider font-semibold text-verdant-emerald uppercase">Interactive Assistance</h4>
              <p className="text-[10px] text-verdant-emerald/60 leading-relaxed font-sans">
                For security reasons, do not include raw financial credentials or credit card digits inside inquiry logs. Custom ring resizing orders are logged securely under private buyer transactions.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <div className="lg:col-span-7">
            <div className="glass-card bg-white/60 backdrop-blur-md border border-verdant-emerald/10 rounded-3xl p-8 md:p-10 shadow-[0_12px_45px_rgba(15,76,58,0.04)] text-left">
              <h2 className="font-serif text-2xl font-light text-verdant-emerald mb-6">Send an Inquiry</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald/75">
                      Full Name <span className="text-verdant-gold font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Eleanor Vance"
                      className={`w-full bg-[#FAF8F5]/80 border rounded-xl px-4 py-3 text-xs text-verdant-emerald placeholder-verdant-emerald/30 outline-hidden focus:bg-white focus:ring-1 focus:ring-verdant-gold transition-all ${
                        errors.name ? "border-red-500/50" : "border-verdant-emerald/10 focus:border-verdant-gold"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[10px] text-red-600 font-sans tracking-wide mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald/75">
                      Email Address <span className="text-verdant-gold font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="e.g. eleanor@vance.com"
                      className={`w-full bg-[#FAF8F5]/80 border rounded-xl px-4 py-3 text-xs text-verdant-emerald placeholder-verdant-emerald/30 outline-hidden focus:bg-white focus:ring-1 focus:ring-verdant-gold transition-all ${
                        errors.email ? "border-red-500/50" : "border-verdant-emerald/10 focus:border-verdant-gold"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[10px] text-red-600 font-sans tracking-wide mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone & Subject Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald/75">
                      Phone Number <span className="text-verdant-emerald/30 font-light">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="e.g. +1 555-0199"
                      className={`w-full bg-[#FAF8F5]/80 border rounded-xl px-4 py-3 text-xs text-verdant-emerald placeholder-verdant-emerald/30 outline-hidden focus:bg-white focus:ring-1 focus:ring-verdant-gold transition-all ${
                        errors.phone ? "border-red-500/50" : "border-verdant-emerald/10 focus:border-verdant-gold"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[10px] text-red-600 font-sans tracking-wide mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald/75">
                      Subject <span className="text-verdant-gold font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="e.g. Kundan ring customization details"
                      className={`w-full bg-[#FAF8F5]/80 border rounded-xl px-4 py-3 text-xs text-verdant-emerald placeholder-verdant-emerald/30 outline-hidden focus:bg-white focus:ring-1 focus:ring-verdant-gold transition-all ${
                        errors.subject ? "border-red-500/50" : "border-verdant-emerald/10 focus:border-verdant-gold"
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-[10px] text-red-600 font-sans tracking-wide mt-1">
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-verdant-emerald/75">
                    Message <span className="text-verdant-gold font-bold">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Provide details about your custom request, reservation date, or general question..."
                    className={`w-full bg-[#FAF8F5]/80 border rounded-xl px-4 py-3 text-xs text-verdant-emerald placeholder-verdant-emerald/30 outline-hidden focus:bg-white focus:ring-1 focus:ring-verdant-gold transition-all resize-none ${
                      errors.message ? "border-red-500/50" : "border-verdant-emerald/10 focus:border-verdant-gold"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[10px] text-red-600 font-sans tracking-wide mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto gold-gradient-bg text-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none text-[10px] tracking-[0.2em] uppercase font-bold px-10 py-4 rounded-full shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Sending Inquiry
                    </>
                  ) : (
                    <>
                      Send Inquiry
                      <ArrowRight className="w-3.5 h-3.5 text-black" />
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
