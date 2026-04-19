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
  .orb-1{width:600px;height:600px;background:var(--amber);top:-200px;right:-150px;opacity:.08}
  .orb-2{width:450px;height:450px;background:var(--violet);bottom:-120px;left:-150px;opacity:.09}
  @keyframes float-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .4s ease both}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6,#06B6D4);background-size:300% 100%;animation:accent-flow 5s linear infinite}
  .trm-section{background:var(--dark-3);border:1px solid var(--glass-b);border-radius:18px;padding:28px 32px;margin-bottom:16px;transition:border-color .25s}
  .trm-section:hover{border-color:rgba(255,255,255,0.11)}
  .trm-h2{font-size:16px;font-weight:800;color:var(--text-1);margin-bottom:14px;display:flex;align-items:center;gap:10px}
  .trm-p{font-size:13px;color:var(--text-2);line-height:1.85;font-weight:500;margin-bottom:10px}
  .trm-p:last-child{margin-bottom:0}
  .trm-ul{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
  .trm-ul li{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--text-2);line-height:1.7;font-weight:500}
  .trm-ul li::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--violet-light);flex-shrink:0;margin-top:6px}
  .trm-toc-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text-2);transition:all .2s;border:none;background:none;text-align:left;width:100%}
  .trm-toc-item:hover,.trm-toc-item.active{background:rgba(124,58,237,.1);color:#C4B5FD}
  .trm-toc-item .num{width:22px;height:22px;border-radius:6px;background:var(--dark-4);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0}
  .trm-toc-item.active .num{background:var(--violet);color:#fff}
  .hlbox{padding:14px 18px;border-radius:12px;font-size:12px;font-weight:600;line-height:1.7;margin-bottom:12px}
`;

const SECTIONS = [
  { id:"acceptance",   icon:"✍️", title:"Acceptance of Terms",       num:"01" },
  { id:"account",      icon:"👤", title:"Account & Registration",    num:"02" },
  { id:"service",      icon:"⚡", title:"The Service",               num:"03" },
  { id:"acceptable",   icon:"✅", title:"Acceptable Use",            num:"04" },
  { id:"ip",           icon:"©️",  title:"Intellectual Property",     num:"05" },
  { id:"data",         icon:"🗄️", title:"Your Data",                 num:"06" },
  { id:"ai",           icon:"🤖", title:"AI Features",               num:"07" },
  { id:"payments",     icon:"💳", title:"Payments & Subscriptions",  num:"08" },
  { id:"liability",    icon:"⚖️", title:"Limitation of Liability",   num:"09" },
  { id:"termination",  icon:"🚪", title:"Termination",               num:"10" },
  { id:"changes",      icon:"📝", title:"Changes to Terms",          num:"11" },
  { id:"governing",    icon:"🏛️", title:"Governing Law",             num:"12" },
  { id:"contact",      icon:"📬", title:"Contact",                   num:"13" },
];

export default function Terms() {
  const [active, setActive] = useState("acceptance");

  useEffect(() => {
    const id = "tracklio-trm-styles";
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

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setActive(id); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark-1)", fontFamily: "Montserrat, sans-serif", position: "relative" }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="nav-accent" style={{ position: "sticky", top: 0, zIndex: 100 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 20, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#FCD34D", textTransform: "uppercase", letterSpacing: 1.2 }}>Legal</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 36, letterSpacing: -1, marginBottom: 12 }}>
            Terms of{" "}
            <span style={{ background: "linear-gradient(90deg,#F59E0B,#F43F5E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Service
            </span>
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)", fontWeight: 500 }}>
            Effective Date: April 9, 2026 &nbsp;·&nbsp; Last Updated: April 9, 2026
          </p>
          <div className="hlbox" style={{ background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", color: "#FCD34D", maxWidth: 620, margin: "20px auto 0", textAlign: "left" }}>
            ⚠ Please read these Terms carefully before using Tracklio. By accessing or using the platform, you agree to be bound by these Terms. If you do not agree, do not use the service.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32, alignItems: "start" }}>

          {/* TOC */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ background: "var(--dark-3)", border: "1px solid var(--glass-b)", borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1.2, padding: "4px 14px 10px" }}>Contents</div>
              {SECTIONS.map(s => (
                <button key={s.id} className={`trm-toc-item ${active === s.id ? "active" : ""}`} onClick={() => scrollTo(s.id)}>
                  <span className="num">{s.num}</span>
                  <span>{s.icon} {s.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>

            <section id="acceptance" className="trm-section fade-up">
              <div className="trm-h2">✍️ Acceptance of Terms</div>
              <p className="trm-p">These Terms of Service ("Terms") govern your access to and use of Tracklio, operated by Tracklio Technologies Ltd ("Company", "we", "us"). By creating an account, clicking "I agree", or by using any part of the service, you confirm that you are at least 13 years old (or 16 in the EU), have the legal capacity to enter into this agreement, and accept these Terms in full.</p>
              <p className="trm-p">These Terms apply to all users including free users, Pro subscribers, and API consumers.</p>
            </section>

            <section id="account" className="trm-section fade-up">
              <div className="trm-h2">👤 Account & Registration</div>
              <ul className="trm-ul">
                <li>You must provide a valid email address and accurate information when registering.</li>
                <li>You are responsible for maintaining the confidentiality of your password and all activity under your account.</li>
                <li>You must notify us immediately at security@tracklio.app if you suspect unauthorised access.</li>
                <li>One person may not maintain more than one free account. Multiple accounts created to circumvent subscription limits may be suspended.</li>
                <li>Accounts are non-transferable. You may not sell, assign, or transfer your account to another person.</li>
              </ul>
            </section>

            <section id="service" className="trm-section fade-up">
              <div className="trm-h2">⚡ The Service</div>
              <p className="trm-p">Tracklio provides a productivity platform including task management, financial tracking, habit monitoring, AI-powered insights, and reporting tools ("the Service"). We reserve the right to:</p>
              <ul className="trm-ul">
                <li>Modify, suspend, or discontinue any part of the Service at any time with reasonable notice.</li>
                <li>Introduce new features, some of which may be available only to paid subscribers.</li>
                <li>Perform maintenance, which may result in temporary unavailability.</li>
              </ul>
              <p className="trm-p">We target 99.5% monthly uptime for paid plans. Scheduled maintenance is typically performed outside business hours (EAT) and announced in advance. We are not liable for downtime resulting from force majeure, third-party infrastructure failures, or events beyond our control.</p>
            </section>

            <section id="acceptable" className="trm-section fade-up">
              <div className="trm-h2">✅ Acceptable Use</div>
              <p className="trm-p">You agree not to:</p>
              <ul className="trm-ul">
                <li>Use the Service for any unlawful purpose or in violation of any local, national, or international law.</li>
                <li>Attempt to gain unauthorised access to any part of the Service, other accounts, or connected systems.</li>
                <li>Scrape, crawl, or extract data from the platform without written permission.</li>
                <li>Upload malware, viruses, or any malicious code.</li>
                <li>Abuse the AI features by submitting harmful, illegal, or deceptive prompts.</li>
                <li>Use the Service to spam, phish, or harass other users or third parties.</li>
                <li>Attempt to reverse-engineer, decompile, or disassemble any part of the platform.</li>
                <li>Circumvent rate limits, authentication, or billing controls.</li>
              </ul>
              <p className="trm-p">Violation of these rules may result in immediate account suspension without refund.</p>
            </section>

            <section id="ip" className="trm-section fade-up">
              <div className="trm-h2">©️ Intellectual Property</div>
              <p className="trm-p"><strong style={{ color: "var(--text-1)" }}>Our IP:</strong> All design, code, branding, logos, and content comprising the Tracklio platform are the exclusive property of Tracklio Technologies Ltd, protected by copyright and trademark law. You may not copy, reproduce, or redistribute any part without written consent.</p>
              <p className="trm-p"><strong style={{ color: "var(--text-1)" }}>Your Content:</strong> You retain full ownership of the data you enter into Tracklio (your tasks, transactions, habits, and notes). By using the Service, you grant us a limited, non-exclusive, royalty-free licence to process your data solely to provide the Service to you. We do not claim ownership of your data.</p>
            </section>

            <section id="data" className="trm-section fade-up">
              <div className="trm-h2">🗄️ Your Data</div>
              <p className="trm-p">Your data is yours. Please refer to our <a href="/privacy" style={{ color: "var(--violet-light)", textDecoration: "none" }}>Privacy Policy</a> for full details on how we collect, process, and protect it. Key points:</p>
              <ul className="trm-ul">
                <li>You can export all your data at any time via Reports → Download CSV.</li>
                <li>You can delete your account and all data at any time via Settings → Account → Delete Account.</li>
                <li>We do not use your data to train AI models or sell it to third parties.</li>
              </ul>
            </section>

            <section id="ai" className="trm-section fade-up">
              <div className="trm-h2">🤖 AI Features</div>
              <p className="trm-p">Tracklio's AI features are powered by third-party large language models (currently OpenAI). Important caveats:</p>
              <ul className="trm-ul">
                <li><strong style={{ color: "var(--text-1)" }}>Not professional advice:</strong> AI insights are for informational and productivity purposes only. They do not constitute financial, legal, medical, or investment advice. Always consult a qualified professional for significant decisions.</li>
                <li><strong style={{ color: "var(--text-1)" }}>AI may be wrong:</strong> Language models can produce inaccurate, incomplete, or misleading outputs. You should verify AI-generated insights independently.</li>
                <li><strong style={{ color: "var(--text-1)" }}>You control it:</strong> You can disable AI analysis entirely in Settings at any time.</li>
              </ul>
            </section>

            <section id="payments" className="trm-section fade-up">
              <div className="trm-h2">💳 Payments & Subscriptions</div>
              <ul className="trm-ul">
                <li>Tracklio offers a free tier and paid Pro plan. Pricing is displayed on the pricing page and may change with 30 days' notice.</li>
                <li>Subscriptions are billed monthly or annually in advance. All fees are non-refundable except as required by law.</li>
                <li>If a payment fails, we will retry up to 3 times over 7 days. If payment still fails, your account will be downgraded to the free tier.</li>
                <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No partial refunds are issued.</li>
                <li>We reserve the right to change pricing. Existing subscribers will be notified 30 days before any price change and may cancel before the change takes effect.</li>
              </ul>
            </section>

            <section id="liability" className="trm-section fade-up">
              <div className="trm-h2">⚖️ Limitation of Liability</div>
              <p className="trm-p">To the fullest extent permitted by law:</p>
              <ul className="trm-ul">
                <li>The Service is provided "as is" and "as available" without any warranty of any kind, express or implied.</li>
                <li>We do not warrant that the Service will be uninterrupted, error-free, or free of viruses.</li>
                <li>Tracklio Technologies Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</li>
                <li>Our total cumulative liability to you shall not exceed the amount you paid us in the 12 months preceding the claim, or KES 5,000 (whichever is greater).</li>
              </ul>
              <div className="hlbox" style={{ background: "rgba(244,63,94,.07)", border: "1px solid rgba(244,63,94,.2)", color: "#FCA5A5" }}>
                ⚠ AI financial insights are informational only. Do not make financial decisions solely based on AI-generated content. Tracklio bears no liability for financial outcomes resulting from reliance on AI outputs.
              </div>
            </section>

            <section id="termination" className="trm-section fade-up">
              <div className="trm-h2">🚪 Termination</div>
              <p className="trm-p">You may terminate your account at any time via Settings. We may suspend or terminate your account if:</p>
              <ul className="trm-ul">
                <li>You breach these Terms or our Acceptable Use Policy.</li>
                <li>We are required to do so by law or a court order.</li>
                <li>We discontinue the Service (with reasonable notice).</li>
              </ul>
              <p className="trm-p">Upon termination, your right to use the Service ceases immediately. Provisions of these Terms that by their nature should survive termination will remain in effect (including IP, liability limitations, and governing law).</p>
            </section>

            <section id="changes" className="trm-section fade-up">
              <div className="trm-h2">📝 Changes to Terms</div>
              <p className="trm-p">We may update these Terms from time to time to reflect changes in the law, our service, or business practices. Material changes will be communicated via:</p>
              <ul className="trm-ul">
                <li>Email to your registered address at least 14 days before the change takes effect.</li>
                <li>An in-app notification banner on the dashboard.</li>
              </ul>
              <p className="trm-p">Your continued use of Tracklio after the effective date constitutes acceptance of the revised Terms. If you do not accept the changes, you must stop using the Service and may delete your account.</p>
            </section>

            <section id="governing" className="trm-section fade-up">
              <div className="trm-h2">🏛️ Governing Law</div>
              <p className="trm-p">These Terms are governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes arising from these Terms or the use of Tracklio shall first be subject to good-faith mediation. If mediation fails, disputes shall be submitted to the exclusive jurisdiction of the courts of Nairobi, Kenya.</p>
              <p className="trm-p">For users in the European Union, any mandatory consumer protection rights under EU law remain unaffected.</p>
            </section>

            <section id="contact" className="trm-section fade-up">
              <div className="trm-h2">📬 Contact</div>
              <p className="trm-p">For legal enquiries regarding these Terms:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                {[
                  { label: "Legal enquiries",   value: "legal@tracklio.app",   icon: "⚖️" },
                  { label: "General support",    value: "support@tracklio.app", icon: "💬" },
                  { label: "Abuse reports",      value: "abuse@tracklio.app",   icon: "🚨" },
                  { label: "Registered address", value: "Nairobi, Kenya",        icon: "🏢" },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ padding: "14px 16px", background: "var(--dark-4)", borderRadius: 12, border: "1px solid var(--glass-b)" }}>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginTop: 3 }}>{value}</div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}