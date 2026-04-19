import { useEffect } from "react";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const FOOTER_STYLES = `
  @keyframes footer-pulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.5); opacity: 0.6; }
  }
  @keyframes footer-flow {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .footer-link {
    font-family: 'Montserrat', sans-serif;
    font-size: 12px; font-weight: 600;
    color: #505075;
    text-decoration: none;
    padding: 4px 8px; border-radius: 7px;
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .footer-link:hover { color: #F0F0FF; background: rgba(255,255,255,0.04); }

  .footer-social {
    width: 32px; height: 32px; border-radius: 9px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; text-decoration: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 800; color: #9090B8;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
    flex-shrink: 0;
  }
  .footer-social:hover {
    background: rgba(124,58,237,0.15);
    border-color: #8B5CF6;
    color: #C4B5FD;
    transform: translateY(-2px);
  }

  .footer-stat {
    display: flex; flex-direction: column; align-items: center;
    padding: 14px 24px;
    border-right: 1px solid rgba(255,255,255,0.06);
  }
  .footer-stat:last-child { border-right: none; }
`;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const FOOTER_LINKS = [
  { label: "Privacy",    href: "/privacy" },
  { label: "Terms",      href: "/terms" },
  { label: "Docs",       href: "#" },
  { label: "API",        href: "/api" },
  { label: "Support",    href: "/support" },
  { label: "Blog",       href: "#" },
  { label: "Changelog",  href: "#" },
];

const SOCIAL_LINKS = [
  { label: "𝕏",   href: "#", title: "Twitter / X" },
  { label: "in",  href: "#", title: "LinkedIn" },
  { label: "gh",  href: "#", title: "GitHub" },
  { label: "yt",  href: "#", title: "YouTube" },
];

const PRODUCT_LINKS = [
  { label: "Dashboard",  href: "/dashboard" },
  { label: "Tasks",      href: "/tasks" },
  { label: "Finance",    href: "/finance" },
  { label: "Habits",     href: "/habits" },
  { label: "AI Chat",    href: "/ai" },
  { label: "Reports",    href: "/reports" },
];

const COMPANY_LINKS = [
  { label: "About",      href: "/about" },
  { label: "Careers",    href: "/careers" },
  { label: "Press",      href: "/press" },
  { label: "Contact",    href: "/contact" },
];

/* ─────────────────────────────────────────────
   FOOTER COMPONENT
   Usage: <Footer />
───────────────────────────────────────────── */
export default function Footer() {
  /* Inject styles once */
  useEffect(() => {
    const id = "tracklio-footer-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = FOOTER_STYLES;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <footer style={{
      position: "relative", zIndex: 10,
      background: "rgba(8,8,16,0.95)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      fontFamily: "'Montserrat', sans-serif",
      marginTop: "auto",
    }}>

      {/* Top gradient border */}
      <div style={{
        height: 1,
        background: "linear-gradient(90deg, transparent, #8B5CF6, #22D3EE, #8B5CF6, transparent)",
        backgroundSize: "300% 100%",
        animation: "footer-flow 6s linear infinite",
      }} />

      {/* Stats bar */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(255,255,255,0.015)",
      }}>
        <div style={{
          maxWidth: 1300, margin: "0 auto", padding: "0 24px",
          display: "flex", justifyContent: "center", flexWrap: "wrap",
        }}>
          {[
            { value: "12,400+",  label: "Active Users",       color: "#8B5CF6" },
            { value: "98.9%",    label: "Uptime SLA",         color: "#10B981" },
            { value: "2.4M",     label: "Tasks Tracked",      color: "#06B6D4" },
            { value: "KES 1.2B", label: "Finances Managed",   color: "#F59E0B" },
            { value: "4.9 ★",   label: "User Rating",        color: "#F43F5E" },
          ].map(({ value, label, color }) => (
            <div key={label} className="footer-stat">
              <span style={{ fontSize: 18, fontWeight: 900, color, letterSpacing: -0.5 }}>{value}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#505075", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer body */}
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 36 }}>

          {/* Brand column */}
          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <span style={{
                fontWeight: 900, fontSize: 18, letterSpacing: -0.7,
                background: "linear-gradient(90deg, #8B5CF6, #22D3EE)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Tracklio
              </span>
            </div>

            <p style={{
              fontSize: 12, color: "#505075", fontWeight: 500,
              lineHeight: 1.75, maxWidth: 240, marginBottom: 18,
            }}>
              Track your tasks, finances and life — all in one intelligent, AI-powered platform built for modern living.
            </p>

            {/* Socials */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {SOCIAL_LINKS.map(({ label, href, title }) => (
                <a key={label} href={href} className="footer-social" title={title}>
                  {label}
                </a>
              ))}
            </div>

            {/* Version badge */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px",
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.22)",
                borderRadius: 8,
                fontSize: 10, fontWeight: 700, color: "#C4B5FD",
              }}>
                ✦ v2.4.1 Pro
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 8,
                fontSize: 10, fontWeight: 700, color: "#6EE7B7",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "footer-pulse 2.5s infinite" }} />
                All Systems OK
              </div>
            </div>
          </div>

          {/* Product links */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#F0F0FF", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>
              Product
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {PRODUCT_LINKS.map(({ label, href }) => (
                <a key={label} href={href} className="footer-link" style={{ display: "block" }}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#F0F0FF", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>
              Company
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {COMPANY_LINKS.map(({ label, href }) => (
                <a key={label} href={href} className="footer-link" style={{ display: "block" }}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#F0F0FF", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>
              Stay Updated
            </div>
            <p style={{ fontSize: 12, color: "#505075", fontWeight: 500, lineHeight: 1.65, marginBottom: 14 }}>
              Get weekly productivity tips and Tracklio feature updates.
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  flex: 1, padding: "9px 12px",
                  background: "#1A1A28",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, minWidth: 0,
                  color: "#F0F0FF",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 12, fontWeight: 500,
                  outline: "none",
                  transition: "border-color .2s",
                }}
                onFocus={e => e.target.style.borderColor = "#8B5CF6"}
                onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              <button
                style={{
                  padding: "9px 14px", flexShrink: 0,
                  background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                  border: "none", borderRadius: 10,
                  color: "#fff",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 12, fontWeight: 700,
                  cursor: "pointer", transition: "opacity .2s, transform .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = ".88"; e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1";   e.currentTarget.style.transform = "scale(1)"; }}
                onClick={e => {
                  const inp = e.currentTarget.previousSibling;
                  if (inp.value.trim()) { alert(`Subscribed: ${inp.value}`); inp.value = ""; }
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 22 }} />

        {/* Bottom bar */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <span style={{ fontSize: 11, color: "#505075", fontWeight: 500 }}>
            © 2026 Tracklio Technologies Ltd. Built with ❤️ in Nairobi, Kenya.
          </span>

          {/* Bottom links */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            {FOOTER_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="footer-link">
                {label}
              </a>
            ))}
          </div>

          {/* Status dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#10B981", display: "inline-block",
              animation: "footer-pulse 2.5s infinite",
            }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#505075" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}