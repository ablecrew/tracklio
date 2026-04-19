import { useEffect, useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --violet:#7C3AED;--violet-light:#8B5CF6;--cyan:#06B6D4;--cyan-light:#22D3EE;
    --emerald:#10B981;--rose:#F43F5E;--amber:#F59E0B;
    --dark-1:#080810;--dark-2:#0E0E18;--dark-3:#14141F;--dark-4:#1A1A28;--dark-5:#222235;
    --glass:rgba(255,255,255,0.04);--glass-b:rgba(255,255,255,0.07);
    --text-1:#F0F0FF;--text-2:#9090B8;--text-3:#505075;
  }
  html,body{font-family:'Montserrat',sans-serif;background:var(--dark-1);color:var(--text-1)}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:var(--dark-5);border-radius:99px}
  .orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0}
  .orb-1{width:600px;height:600px;background:var(--violet);top:-200px;left:-150px;opacity:.10}
  .orb-2{width:450px;height:450px;background:var(--cyan);bottom:-120px;right:-150px;opacity:.08}
  @keyframes float-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .4s ease both}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6,#06B6D4);background-size:300% 100%;animation:accent-flow 5s linear infinite}
  .prv-section{background:var(--dark-3);border:1px solid var(--glass-b);border-radius:18px;padding:28px 32px;margin-bottom:16px;transition:border-color .25s}
  .prv-section:hover{border-color:rgba(255,255,255,0.11)}
  .prv-h2{font-size:16px;font-weight:800;color:var(--text-1);margin-bottom:14px;display:flex;align-items:center;gap:10px}
  .prv-p{font-size:13px;color:var(--text-2);line-height:1.85;font-weight:500;margin-bottom:10px}
  .prv-p:last-child{margin-bottom:0}
  .prv-ul{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
  .prv-ul li{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--text-2);line-height:1.7;font-weight:500}
  .prv-ul li::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--violet-light);flex-shrink:0;margin-top:6px}
  .prv-badge{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;margin-bottom:12px}
  .prv-toc-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text-2);transition:all .2s;border:none;background:none;text-align:left;width:100%}
  .prv-toc-item:hover,.prv-toc-item.active{background:rgba(124,58,237,.1);color:#C4B5FD}
  .prv-toc-item .num{width:22px;height:22px;border-radius:6px;background:var(--dark-4);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0}
  .prv-toc-item.active .num{background:var(--violet);color:#fff}
  .highlight-box{padding:14px 18px;border-radius:12px;font-size:12px;font-weight:600;line-height:1.7;margin-bottom:10px}
`;

const SECTIONS = [
  { id:"overview",    icon:"🛡️", title:"Overview",                num:"01" },
  { id:"collection",  icon:"📦", title:"Data We Collect",         num:"02" },
  { id:"use",         icon:"⚙️", title:"How We Use Your Data",    num:"03" },
  { id:"sharing",     icon:"🤝", title:"Data Sharing",            num:"04" },
  { id:"ai",          icon:"🤖", title:"AI & Your Data",          num:"05" },
  { id:"retention",   icon:"🗄️", title:"Data Retention",         num:"06" },
  { id:"security",    icon:"🔒", title:"Security",                num:"07" },
  { id:"rights",      icon:"✅", title:"Your Rights",             num:"08" },
  { id:"cookies",     icon:"🍪", title:"Cookies",                 num:"09" },
  { id:"children",    icon:"👶", title:"Children's Privacy",      num:"10" },
  { id:"contact",     icon:"📬", title:"Contact Us",              num:"11" },
];

export default function Privacy() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const id = "tracklio-prv-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = S;
      document.head.prepend(s);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark-1)", fontFamily: "Montserrat, sans-serif", position: "relative" }}>
      <div className="orb orb-1" /><div className="orb orb-2" />

      {/* Sticky nav accent */}
      <div className="nav-accent" style={{ position: "sticky", top: 0, zIndex: 100 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", background: "rgba(124,58,237,.12)", border: "1px solid rgba(124,58,237,.28)", borderRadius: 20, marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#C4B5FD", textTransform: "uppercase", letterSpacing: 1.2 }}>Legal</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 36, letterSpacing: -1, marginBottom: 12 }}>
            Privacy{" "}
            <span style={{ background: "linear-gradient(90deg,#8B5CF6,#22D3EE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Policy
            </span>
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)", fontWeight: 500 }}>
            Effective Date: April 9, 2026 &nbsp;·&nbsp; Last Updated: April 9, 2026
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32, alignItems: "start" }}>

          {/* Sticky TOC */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ background: "var(--dark-3)", border: "1px solid var(--glass-b)", borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1.2, padding: "4px 14px 10px" }}>
                Contents
              </div>
              {SECTIONS.map(s => (
                <button key={s.id} className={`prv-toc-item ${active === s.id ? "active" : ""}`} onClick={() => scrollTo(s.id)}>
                  <span className="num">{s.num}</span>
                  <span>{s.icon} {s.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>

            <section id="overview" className="prv-section fade-up">
              <div className="prv-h2">🛡️ Overview</div>
              <div className="highlight-box" style={{ background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", color: "#C4B5FD" }}>
                Tracklio ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and the choices you have. We follow GDPR, CCPA, and Kenya's Data Protection Act, 2019.
              </div>
              <p className="prv-p">We built Tracklio to help you manage your tasks, finances, and daily habits — all in one intelligent platform. To deliver AI-powered insights and personalised recommendations, we process some of your data. We do this transparently and with your explicit consent.</p>
              <p className="prv-p">If you have any questions about this policy, contact us at <strong style={{ color: "var(--text-1)" }}>privacy@tracklio.app</strong></p>
            </section>

            <section id="collection" className="prv-section fade-up">
              <div className="prv-h2">📦 Data We Collect</div>
              <p className="prv-p"><strong style={{ color: "var(--text-1)" }}>Account Information</strong></p>
              <ul className="prv-ul">
                <li>Full name and email address when you register</li>
                <li>Password (stored as a bcrypt hash — we never store plaintext passwords)</li>
                <li>Profile photo if you choose to upload one</li>
                <li>Account preferences and settings</li>
              </ul>
              <p className="prv-p"><strong style={{ color: "var(--text-1)" }}>Usage Data</strong></p>
              <ul className="prv-ul">
                <li>Tasks you create, update, and complete — titles, priorities, due dates, categories</li>
                <li>Financial transactions you log — amounts, categories, types (income/expense), notes</li>
                <li>Habit check-ins and streak data you record</li>
                <li>Chat messages sent to Tracklio AI (used only to generate your response)</li>
              </ul>
              <p className="prv-p"><strong style={{ color: "var(--text-1)" }}>Technical Data</strong></p>
              <ul className="prv-ul">
                <li>Device type, browser, and operating system</li>
                <li>IP address and general location (country/city level)</li>
                <li>Session duration, feature usage, and error logs for debugging</li>
                <li>JWT authentication tokens stored in your browser's localStorage</li>
              </ul>
              <div className="highlight-box" style={{ background: "rgba(16,185,129,.07)", border: "1px solid rgba(16,185,129,.2)", color: "#6EE7B7" }}>
                ✅ We do <strong>not</strong> collect payment card details. All billing (where applicable) is processed through Stripe or another PCI-DSS-compliant provider. We never see your raw card numbers.
              </div>
            </section>

            <section id="use" className="prv-section fade-up">
              <div className="prv-h2">⚙️ How We Use Your Data</div>
              <ul className="prv-ul">
                <li><strong style={{ color: "var(--text-1)" }}>Providing the service</strong> — your tasks, transactions, and habits are stored so the app works correctly across sessions and devices.</li>
                <li><strong style={{ color: "var(--text-1)" }}>AI insights and recommendations</strong> — we send your tasks and transaction data to our OpenAI-powered backend to generate personalised productivity scores, financial insights, and coaching suggestions.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Authentication</strong> — JWTs are issued so you stay logged in securely without re-entering your password every session.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Product improvement</strong> — aggregated, anonymised usage patterns help us understand which features are valuable and where to improve.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Security and fraud prevention</strong> — IP addresses and login events help us detect suspicious access and protect your account.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Legal compliance</strong> — we may retain certain data to comply with tax, accounting, or other legal obligations.</li>
              </ul>
              <p className="prv-p">We do <strong style={{ color: "var(--text-1)" }}>not</strong> use your data to train AI models, sell advertising, or share your personal information with data brokers.</p>
            </section>

            <section id="sharing" className="prv-section fade-up">
              <div className="prv-h2">🤝 Data Sharing</div>
              <p className="prv-p">We share your data only in the following limited circumstances:</p>
              <ul className="prv-ul">
                <li><strong style={{ color: "var(--text-1)" }}>OpenAI</strong> — task and transaction data is sent to OpenAI's API solely to generate your AI insights. OpenAI does not use API-submitted data to train its models (per their API data usage policy).</li>
                <li><strong style={{ color: "var(--text-1)" }}>MongoDB Atlas</strong> — your data is stored on MongoDB Atlas (cloud database). Data is encrypted at rest and in transit.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Hosting provider</strong> — our servers are hosted on a reputable cloud provider (e.g. AWS / DigitalOcean / Render). They process data on our behalf under a data processing agreement.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Legal requirements</strong> — we may disclose data if required by law, court order, or to protect the rights and safety of Tracklio and its users.</li>
              </ul>
              <div className="highlight-box" style={{ background: "rgba(244,63,94,.07)", border: "1px solid rgba(244,63,94,.2)", color: "#FCA5A5" }}>
                🚫 We never sell, rent, or trade your personal data to third parties for marketing or commercial purposes.
              </div>
            </section>

            <section id="ai" className="prv-section fade-up">
              <div className="prv-h2">🤖 AI & Your Data</div>
              <p className="prv-p">Tracklio uses AI in two ways: <strong style={{ color: "var(--text-1)" }}>Analysis</strong> (generating productivity scores and financial insights from your tasks and transactions) and <strong style={{ color: "var(--text-1)" }}>Chat</strong> (the conversational AI assistant).</p>
              <ul className="prv-ul">
                <li>Data sent to the AI is contextual and minimal — only what's needed for the specific request.</li>
                <li>AI chat messages are not stored beyond your current session unless you explicitly save a conversation.</li>
                <li>AI insights are generated fresh each time you load your dashboard — no persistent AI memory is maintained about you without your consent.</li>
                <li>You can opt out of AI analysis entirely in Settings → AI Insights.</li>
              </ul>
            </section>

            <section id="retention" className="prv-section fade-up">
              <div className="prv-h2">🗄️ Data Retention</div>
              <ul className="prv-ul">
                <li>Your account and all associated data is retained for as long as your account is active.</li>
                <li>If you delete your account, all personal data is permanently deleted within 30 days.</li>
                <li>Anonymised, aggregated analytics data may be retained indefinitely.</li>
                <li>Server access logs (IP addresses, request metadata) are retained for 90 days for security purposes, then deleted.</li>
                <li>Backups may retain your data for up to 60 days after account deletion; these are encrypted and inaccessible to staff.</li>
              </ul>
            </section>

            <section id="security" className="prv-section fade-up">
              <div className="prv-h2">🔒 Security</div>
              <p className="prv-p">We take security seriously and implement the following measures:</p>
              <ul className="prv-ul">
                <li><strong style={{ color: "var(--text-1)" }}>Encryption in transit</strong> — all data is transmitted over HTTPS/TLS 1.2+.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Encryption at rest</strong> — database storage is encrypted at rest via MongoDB Atlas.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Password hashing</strong> — passwords are hashed with bcrypt (cost factor ≥ 12) and are never stored in plaintext.</li>
                <li><strong style={{ color: "var(--text-1)" }}>JWT expiry</strong> — authentication tokens expire after 7 days. Short-lived tokens reduce risk if a token is compromised.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Rate limiting</strong> — API endpoints are rate-limited to prevent brute-force attacks.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Input validation</strong> — all user input is validated and sanitised server-side to prevent injection attacks.</li>
              </ul>
              <p className="prv-p">No system is 100% secure. If you suspect your account has been compromised, contact us immediately at <strong style={{ color: "var(--text-1)" }}>security@tracklio.app</strong></p>
            </section>

            <section id="rights" className="prv-section fade-up">
              <div className="prv-h2">✅ Your Rights</div>
              <p className="prv-p">Under GDPR, CCPA, and the Kenya Data Protection Act, you have the following rights:</p>
              <ul className="prv-ul">
                <li><strong style={{ color: "var(--text-1)" }}>Access</strong> — request a copy of all personal data we hold about you.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Rectification</strong> — correct inaccurate or incomplete data.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Erasure</strong> — request deletion of your account and all associated data ("right to be forgotten").</li>
                <li><strong style={{ color: "var(--text-1)" }}>Portability</strong> — export your tasks, transactions, and habits as CSV or JSON at any time via Reports → Download.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Object</strong> — opt out of AI analysis, analytics tracking, or marketing communications at any time.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Restriction</strong> — request that we limit processing of your data in certain circumstances.</li>
              </ul>
              <p className="prv-p">To exercise any of these rights, email <strong style={{ color: "var(--text-1)" }}>privacy@tracklio.app</strong> or use the account deletion option in Settings → Account → Delete Account. We will respond within 30 days.</p>
            </section>

            <section id="cookies" className="prv-section fade-up">
              <div className="prv-h2">🍪 Cookies</div>
              <p className="prv-p">Tracklio uses minimal cookies and browser storage:</p>
              <ul className="prv-ul">
                <li><strong style={{ color: "var(--text-1)" }}>localStorage (auth token)</strong> — your JWT is stored in localStorage to keep you logged in. This is essential for the app to function.</li>
                <li><strong style={{ color: "var(--text-1)" }}>No third-party advertising cookies</strong> — we do not use Google Ads, Facebook Pixel, or any other ad-tracking technology.</li>
                <li><strong style={{ color: "var(--text-1)" }}>Analytics (optional)</strong> — if enabled, we use a privacy-first analytics tool (no personally identifiable data). You can opt out in Settings.</li>
              </ul>
            </section>

            <section id="children" className="prv-section fade-up">
              <div className="prv-h2">👶 Children's Privacy</div>
              <p className="prv-p">Tracklio is not intended for children under 13 years of age (or under 16 in the EU/UK). We do not knowingly collect personal information from children. If you believe a child has created an account, please contact us at <strong style={{ color: "var(--text-1)" }}>privacy@tracklio.app</strong> and we will delete the account immediately.</p>
            </section>

            <section id="contact" className="prv-section fade-up">
              <div className="prv-h2">📬 Contact Us</div>
              <p className="prv-p">If you have questions, concerns, or requests related to this Privacy Policy:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                {[
                  { label: "Privacy enquiries", value: "privacy@tracklio.app", icon: "📧" },
                  { label: "Security issues",   value: "security@tracklio.app", icon: "🔒" },
                  { label: "General support",   value: "support@tracklio.app",  icon: "💬" },
                  { label: "Business address",  value: "Nairobi, Kenya",         icon: "📍" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ padding: "14px 16px", background: "var(--dark-4)", borderRadius: 12, border: "1px solid var(--glass-b)" }}>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginTop: 3 }}>{value}</div>
                  </div>
                ))}
              </div>
              <p className="prv-p" style={{ marginTop: 16 }}>We may update this Privacy Policy from time to time. We will notify you of material changes by email or via an in-app notification. Continued use of Tracklio after changes constitutes acceptance of the updated policy.</p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}