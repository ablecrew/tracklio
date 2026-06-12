import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';

/* ─── Data ─── */
const STATS = [
  { value: "12,400+", label: "Active Users", color: "text-violet-400" },
  { value: "98.9%", label: "Uptime SLA", color: "text-emerald-400" },
  { value: "2.4M", label: "Tasks Tracked", color: "text-cyan-400" },
  { value: "KES 1.2B", label: "Finances Managed", color: "text-amber-400" },
  { value: "4.9 ★", label: "User Rating", color: "text-rose-400" },
];

const SOCIAL_LINKS = [
  { Icon: FaTwitter, href: "#", label: "Twitter / X" },
  { Icon: FaLinkedin, href: "#", label: "LinkedIn" },
  { Icon: FaGithub, href: "#", label: "GitHub" },
  { Icon: FaYoutube, href: "#", label: "YouTube" },
  { Icon: FaInstagram, href: "#", label: "Instagram" },
];

const PRODUCT_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tasks", href: "/tasks" },
  { label: "Finance", href: "/finance" },
  { label: "Habits", href: "/habits" },
  { label: "AI Chat", href: "/ai" },
  { label: "Reports", href: "/reports" },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Contact", href: "/contact" },
];

const BOTTOM_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Docs", href: "#" },
  { label: "API", href: "/api" },
  { label: "Support", href: "/support" },
  { label: "Blog", href: "#" },
  { label: "Changelog", href: "#" },
];

/* ─── Footer ─── */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="relative z-10 bg-[#080810]/95 backdrop-blur-xl font-montserrat mt-auto">

      {/* Top gradient border */}
      <div className="h-px bg-gradient-to-r from-transparent via-violet-500 via-cyan-400 to-transparent bg-[length:300%_100%] animate-gradient-x" />

      {/* ─── Stats bar ─── */}
      <div className="border-b border-white/[0.05] bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-white/[0.06] sm:py-0">
            {STATS.map(({ value, label, color }, i) => (
              <div
                key={label}
                className={`flex flex-col items-center justify-center py-3.5 px-4 ${
                  i === STATS.length - 1 && STATS.length % 2 === 1 ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                <span className={`text-base sm:text-lg font-black tracking-tight ${color}`}>{value}</span>
                <span className="text-[10px] font-semibold text-[#505075] mt-1 uppercase tracking-wider text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main footer body ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-7">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10 mb-9">

          {/* Brand column — spans full row on mobile */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_4px_14px_rgba(124,58,237,0.35)] shrink-0">
                <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
                Tracklio
              </span>
            </div>

            <p className="text-xs text-[#505075] font-medium leading-relaxed max-w-xs mb-5">
              Track your tasks, finances and life — all in one intelligent, AI-powered platform built for modern living.
            </p>

            {/* Socials */}
            <div className="flex flex-wrap gap-2 mb-5">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[#9090B8] hover:bg-violet-500/15 hover:border-violet-500 hover:text-violet-300 hover:-translate-y-0.5 transition-all duration-200 shrink-0"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Version + status badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-[10px] font-bold text-violet-300">
                <Sparkles className="w-3 h-3" /> v2.4.1 Pro
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems OK
              </span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <div className="text-[11px] font-extrabold text-[#F0F0FF] uppercase tracking-wider mb-3.5">
              Product
            </div>
            <ul className="flex flex-col gap-0.5">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="inline-block text-xs font-semibold text-[#505075] hover:text-[#F0F0FF] hover:bg-white/[0.04] px-2 py-1 rounded-md transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <div className="text-[11px] font-extrabold text-[#F0F0FF] uppercase tracking-wider mb-3.5">
              Company
            </div>
            <ul className="flex flex-col gap-0.5">
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="inline-block text-xs font-semibold text-[#505075] hover:text-[#F0F0FF] hover:bg-white/[0.04] px-2 py-1 rounded-md transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter — spans full row on mobile, own col on lg */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="text-[11px] font-extrabold text-[#F0F0FF] uppercase tracking-wider mb-3.5">
              Stay Updated
            </div>
            <p className="text-xs text-[#505075] font-medium leading-relaxed mb-3.5">
              Get weekly productivity tips and Tracklio feature updates.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs font-bold text-emerald-300">
                <Check className="w-3.5 h-3.5" /> Subscribed!
              </div>
            ) : (
              <div className="flex gap-1.5">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  className="flex-1 min-w-0 px-3 py-2.5 bg-[#1A1A28] border border-white/[0.08] rounded-xl text-[#F0F0FF] placeholder:text-[#505075] text-xs font-medium outline-none focus:border-violet-500 transition-colors"
                />
                <button
                  onClick={handleSubscribe}
                  aria-label="Subscribe"
                  className="shrink-0 px-3.5 py-2.5 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl text-white hover:scale-105 active:scale-95 transition-transform"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.05] mb-5" />

        {/* ─── Bottom bar ─── */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-3">
          <span className="text-[11px] text-[#505075] font-medium text-center lg:text-left order-3 lg:order-1">
            © 2026 Tracklio Technologies Ltd. Built with ❤️ in Nairobi, Kenya.
          </span>

          <div className="flex gap-1 flex-wrap justify-center order-1 lg:order-2">
            {BOTTOM_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                className="text-[11px] font-semibold text-[#505075] hover:text-[#F0F0FF] hover:bg-white/[0.04] px-2 py-1 rounded-md transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="inline-flex items-center gap-1.5 order-2 lg:order-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-[#505075]">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}