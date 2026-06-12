import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const FEATURES = [
    { icon: "✅", color: "text-violet-400", bg: "bg-violet-500/15", title: "Smart Task Manager", desc: "Prioritise, categorise, and track tasks with AI-powered suggestions. Due-date reminders, completion analytics, and productivity scoring." },
    { icon: "💰", color: "text-emerald-400", bg: "bg-emerald-500/15", title: "Finance Tracker", desc: "Log income and expenses in KES. Visual breakdowns, budget health warnings, and AI-generated financial insights tailored for East Africa." },
    { icon: "🎯", color: "text-amber-400", bg: "bg-amber-500/15", title: "Habit Builder", desc: "Build daily habits with streak tracking, 28-day heatmaps, and habit radar charts. See your consistency at a glance." },
    { icon: "🤖", color: "text-cyan-400", bg: "bg-cyan-500/15", title: "AI Intelligence", desc: "Personalised productivity scores, financial insights, and daily recommendations — powered by GPT and your own real data." },
    { icon: "📊", color: "text-violet-400", bg: "bg-violet-500/15", title: "Advanced Reports", desc: "Weekly and monthly reports with area charts, category breakdowns, and CSV/PDF export. See trends before they become problems." },
    { icon: "💬", color: "text-rose-400", bg: "bg-rose-500/15", title: "AI Chat Assistant", desc: "Ask your data anything. 'Am I overspending on food?' 'How many tasks did I complete this week?' Instant, data-backed answers." },
  ];

  const TESTIMONIALS = [
    { name: "Amara K.", role: "Freelance Designer · Nairobi", text: "I tried Notion, Trello, YNAB — nothing clicked for my lifestyle. Tracklio does all three in one place, in KES, and the AI actually gives useful advice.", emoji: "👩‍🎨" },
    { name: "David M.", role: "Software Engineer · Kisumu", text: "The habit streaks alone changed my mornings. Add the budget alerts and I'm saving 30% more than I was six months ago. Genuinely life-changing app.", emoji: "👨‍💻" },
    { name: "Zara A.", role: "MBA Student · Nairobi", text: "Built for how we actually live in Nairobi — KES currency, M-Pesa-aware, fast on 4G. This is what productivity software should look like for Africa.", emoji: "👩‍🎓" },
    { name: "Brian O.", role: "Entrepreneur · Mombasa", text: "My team of 4 all use it now. The weekly AI report is the first thing I read on Monday mornings. It keeps everyone accountable.", emoji: "👨‍💼" },
    { name: "Fatima H.", role: "Doctor · Nairobi", text: "I have 15 minutes between shifts. Tracklio lets me log expenses, check tasks, and get AI insights in under 2 minutes. Nothing else comes close.", emoji: "👩‍⚕️" },
    { name: "Kevin N.", role: "Content Creator · Nairobi", text: "The chatbot is insane. I asked 'where did my money go this month' and it gave me a breakdown with advice. No other app does that.", emoji: "🎬" },
  ];

  const FAQS = [
    { q: "Is Tracklio free?", a: "Yes. The free plan includes unlimited tasks, up to 50 transactions/month, and basic AI insights. Pro unlocks unlimited everything, advanced AI, full reports, and priority support." },
    { q: "Does it work offline?", a: "Your dashboard loads from cache when offline. Creating and syncing tasks or transactions requires an internet connection." },
    { q: "Is my financial data safe?", a: "Yes. All data is encrypted in transit (TLS) and at rest (MongoDB Atlas). We never sell your data, and AI insights use your data only to generate your response — it is not stored by OpenAI per their API policy." },
    { q: "Can I export my data?", a: "Absolutely. Export any data as CSV from the Reports page at any time. Your data is always yours." },
    { q: "Does it work with M-Pesa?", a: "Manual logging with M-Pesa transactions is fully supported. Direct M-Pesa sync via Open Banking is on the roadmap for Q3 2026." },
    { q: "Is there a mobile app?", a: "The web app is fully responsive and works great on mobile browsers. Native iOS and Android apps are in development." },
  ];

  const STATS = [
    { num: "12,400+", label: "Active Users", color: "text-violet-400" },
    { num: "2.4M+", label: "Tasks Tracked", color: "text-cyan-400" },
    { num: "KES 1B+", label: "Finance Managed", color: "text-emerald-400" },
    { num: "4.9★", label: "User Rating", color: "text-amber-400" },
    { num: "50+", label: "AI Insights Daily", color: "text-rose-400" },
  ];

  // Reusable button classes
  const btnPrimary = "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-bold text-sm sm:text-base no-underline transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_12px_40px_rgba(124,58,237,0.35)] whitespace-nowrap";
  const btnGhost = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-text-muted font-semibold text-sm no-underline transition-all duration-200 hover:bg-white/10 hover:text-text-primary hover:border-white/20 whitespace-nowrap";

  return (
    <div className="min-h-screen bg-ink-900 font-montserrat text-text-primary overflow-x-hidden">

      {/* ══ NAVBAR ══ */}
      <div className="h-0.5 bg-gradient-to-r from-violet-600 via-cyan-400 to-violet-500 bg-[length:300%_100%] animate-gradient-x" />
      <nav className="sticky top-0 z-50 bg-ink-900/85 backdrop-blur-2xl border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden shadow-[0_4px_16px_rgba(124,58,237,0.4)] flex items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-500">
              <img src="/trcklo logo.png" alt="Tracklio" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
            <div>
              <div className="font-black text-lg leading-none tracking-tight bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Tracklio</div>
              <div className="text-[8px] font-semibold text-text-dim uppercase tracking-[0.14em] mt-0.5 hidden sm:block">Smart Life OS</div>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-7">
            {["Features", "Pricing", "About", "Blog"].map((l) => (
              <a key={l} href={`/${l.toLowerCase()}`} className="text-[13px] font-semibold text-text-dim hover:text-text-primary transition-colors no-underline">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/login" className={`${btnGhost} !px-4 !py-2 !text-xs sm:!text-sm hidden sm:inline-flex`}>Log In</a>
            <a href="/register" className={`${btnPrimary} !px-4 !py-2 !text-xs sm:!text-sm`}>Start Free →</a>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center px-4 sm:px-6 py-16 sm:py-20">
        {/* Decorative orbs */}
        <div className="absolute -top-72 -left-48 w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] bg-violet-600 opacity-[0.12] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-48 -right-48 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-cyan-500 opacity-[0.09] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-2/5 left-2/5 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] bg-rose-500 opacity-[0.06] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 bg-violet-500/10 border border-violet-500/25 rounded-full mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse-dot" />
                <span className="text-[11px] font-bold text-violet-300 uppercase tracking-wider">AI-Powered · Built for Africa</span>
              </div>

              <h1 className="animate-fade-up font-black text-4xl sm:text-5xl lg:text-[52px] tracking-tight leading-[1.05] mb-5" style={{ animationDelay: "80ms" }}>
                Your entire life,<br />
                <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">beautifully organised</span>
              </h1>

              <p className="animate-fade-up text-base sm:text-lg text-text-muted font-medium leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0" style={{ animationDelay: "160ms" }}>
                Tracklio combines tasks, finances, and habits into one AI-powered platform. Built in Nairobi for the way East Africa actually works.
              </p>

              <div className="animate-fade-up flex flex-col sm:flex-row gap-3 mb-10 justify-center lg:justify-start" style={{ animationDelay: "240ms" }}>
                <a href="/register" className={btnPrimary}>Start free — no card needed →</a>
                <a href="/dashboard" className={btnGhost}>▶ Live demo</a>
              </div>

              {/* Social proof */}
              <div className="animate-fade-up flex items-center gap-4 justify-center lg:justify-start" style={{ animationDelay: "320ms" }}>
                <div className="flex">
                  {[
                    { c: "bg-violet-600", e: "👩" },
                    { c: "bg-cyan-500", e: "👨" },
                    { c: "bg-emerald-500", e: "👩" },
                    { c: "bg-amber-500", e: "👨" },
                    { c: "bg-rose-500", e: "👩" },
                  ].map(({ c, e }, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-ink-900 flex items-center justify-center text-sm ${i > 0 ? "-ml-2.5" : ""}`}>{e}</div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-xs mb-0.5">⭐⭐⭐⭐⭐</div>
                  <div className="text-xs text-text-dim font-semibold">Loved by <strong className="text-text-primary">12,400+</strong> people in East Africa</div>
                </div>
              </div>
            </div>

            {/* Right: dashboard mockup */}
            <div className="animate-fade-up lg:animate-float" style={{ animationDelay: "200ms" }}>
              <div className="bg-ink-700 border border-white/[0.07] rounded-3xl p-4 sm:p-5 shadow-[0_40px_120px_rgba(0,0,0,0.6)] max-w-md mx-auto lg:max-w-none">
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-violet-500/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                  <span className="text-[11px] font-bold text-emerald-300">AI Score: 84%</span>
                  <div className="ml-auto text-[11px] text-text-dim hidden sm:block">Good morning, Alex 👋</div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  {[
                    { l: "Tasks Done", v: "7/9", c: "text-violet-400" },
                    { l: "KES Income", v: "85K", c: "text-emerald-400" },
                    { l: "KES Spend", v: "42K", c: "text-rose-400" },
                    { l: "Habit Streak", v: "🔥 14d", c: "text-amber-400" },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="bg-ink-600 rounded-xl px-3 py-3">
                      <div className="text-[9px] text-text-dim font-bold uppercase tracking-wider">{l}</div>
                      <div className={`text-lg font-black mt-1 ${c}`}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-ink-600 rounded-xl px-3 py-3">
                  <div className="text-[11px] font-bold text-text-dim mb-2">🤖 AI Insight</div>
                  <div className="text-xs text-text-muted leading-relaxed">Your food spending is 28% above last month. Consider setting a KES 6,000 weekly budget.</div>
                </div>
                <div className="mt-3 flex gap-2">
                  {["Tasks", "Finance", "Habits", "Reports"].map((tab) => {
                    const active = tab === "Tasks";
                    return (
                      <div key={tab} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg text-center ${active ? "bg-violet-500/15 border border-violet-500/30 text-violet-300" : "bg-white/[0.04] border border-white/[0.07] text-text-dim"}`}>{tab}</div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section ref={statsRef} className="bg-ink-700 border-y border-white/[0.07] px-4 sm:px-6 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {STATS.map(({ num, label, color }) => (
            <div key={label} className="bg-ink-700 border border-white/[0.07] rounded-2xl p-4 sm:p-6 text-center transition-all hover:border-violet-500/30 hover:-translate-y-1">
              <div className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight mb-1.5 ${color}`}>{statsVisible ? num : "—"}</div>
              <div className="text-[10px] sm:text-[11px] font-bold text-text-dim uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 rounded-full text-[11px] font-bold mb-4">✨ Everything you need</div>
            <h2 className="font-black text-3xl sm:text-4xl lg:text-[40px] tracking-tight mb-4">
              One app. <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Total control.</span>
            </h2>
            <p className="text-sm sm:text-base text-text-muted font-medium max-w-xl mx-auto">
              Stop switching between 5 apps. Tracklio gives you tasks, money, habits, and AI intelligence — beautifully unified.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="animate-fade-up bg-ink-700 border border-white/[0.07] rounded-2xl p-6 sm:p-7 transition-all hover:-translate-y-1.5 hover:border-violet-500/30 hover:shadow-[0_20px_60px_rgba(124,58,237,0.12)]" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center text-2xl mb-4 ${f.bg}`}>{f.icon}</div>
                <h3 className="font-extrabold text-lg mb-2.5">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 bg-ink-700 border-y border-white/[0.07]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-black text-3xl sm:text-4xl tracking-tight mb-3">How it works</h2>
            <p className="text-sm sm:text-base text-text-muted font-medium">From sign-up to insights in 60 seconds</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "01", icon: "📝", title: "Sign up free", desc: "Create an account in 30 seconds. No credit card. No friction." },
              { n: "02", icon: "➕", title: "Add your data", desc: "Log tasks, expenses, and habits. Import from CSV or start fresh." },
              { n: "03", icon: "🤖", title: "AI analyses", desc: "Our AI reads your data and generates your personalised score + insights." },
              { n: "04", icon: "🚀", title: "Level up", desc: "Follow your AI recommendations. Watch your productivity compound." },
            ].map((s) => (
              <div key={s.n} className="text-center px-4 py-6">
                <div className="w-14 h-14 rounded-full bg-violet-500/12 border-2 border-violet-500/25 flex items-center justify-center text-2xl mx-auto mb-3.5">{s.icon}</div>
                <div className="text-[11px] font-extrabold text-violet-400 uppercase tracking-wider mb-2">Step {s.n}</div>
                <h3 className="font-extrabold text-base mb-2">{s.title}</h3>
                <p className="text-[13px] text-text-muted leading-relaxed font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 rounded-full text-[11px] font-bold mb-4">Simple pricing</div>
            <h2 className="font-black text-3xl sm:text-4xl lg:text-[40px] tracking-tight mb-3">
              Start free. <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Scale when ready.</span>
            </h2>
            <p className="text-sm sm:text-base text-text-muted font-medium">No hidden fees. Cancel anytime. Priced for the global majority.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Free */}
            <div className="bg-ink-700 border border-white/[0.07] rounded-3xl p-7 sm:p-8 transition-all hover:-translate-y-1">
              <div className="text-[11px] font-extrabold text-text-dim uppercase tracking-wider mb-3">Free Forever</div>
              <div className="text-4xl sm:text-[40px] font-black tracking-tight mb-1">KES 0<span className="text-base text-text-dim font-medium">/month</span></div>
              <p className="text-[13px] text-text-muted mb-6 font-medium">Everything you need to get started</p>
              <div className="mb-7 space-y-2.5">
                {["Unlimited tasks", "50 transactions/month", "Basic AI insights", "Habit tracking (3 habits)", "CSV export", "Email support"].map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm font-medium text-text-muted">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[11px] shrink-0 mt-0.5 text-emerald-300">✓</div>
                    {f}
                  </div>
                ))}
              </div>
              <a href="/register" className={`${btnGhost} w-full`}>Get started free</a>
            </div>

            {/* Pro */}
            <div className="relative bg-ink-700 border border-violet-500/40 rounded-3xl p-7 sm:p-8 shadow-[0_0_60px_rgba(124,58,237,0.12),inset_0_0_60px_rgba(124,58,237,0.03)] transition-all hover:-translate-y-1">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-1 rounded-full text-[11px] font-bold text-white whitespace-nowrap">✨ Most Popular</div>
              <div className="text-[11px] font-extrabold text-violet-300 uppercase tracking-wider mb-3">Pro</div>
              <div className="text-4xl sm:text-[40px] font-black tracking-tight mb-1">
                <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">KES 2,999</span>
                <span className="text-base text-text-dim font-medium">/month</span>
              </div>
              <p className="text-[13px] text-text-muted mb-6 font-medium">For people serious about their potential</p>
              <div className="mb-7 space-y-2.5">
                {["Everything in Free", "Unlimited transactions", "Advanced AI insights & coaching", "Unlimited habits", "Full reports & analytics", "Priority support", "M-Pesa integration (Q3 2026)", "API access"].map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-[11px] shrink-0 mt-0.5 text-violet-300">✓</div>
                    <span className="text-text-primary">{f}</span>
                  </div>
                ))}
              </div>
              <a href="/register" className={`${btnPrimary} w-full`}>Start 14-day free trial →</a>
              <p className="text-[11px] text-text-dim text-center mt-2.5 font-medium">No card required during trial</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 bg-ink-700 border-y border-white/[0.07]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-black text-3xl sm:text-4xl tracking-tight mb-3">Loved by thousands across East Africa</h2>
            <p className="text-sm sm:text-base text-text-muted font-medium">Real people. Real results. No cherry-picking.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="animate-fade-up bg-ink-700 border border-white/[0.07] rounded-2xl p-6 transition-all hover:border-white/[0.12]" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="text-sm mb-2.5">⭐⭐⭐⭐⭐</div>
                <p className="text-sm text-text-muted leading-relaxed font-medium mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-lg">{t.emoji}</div>
                  <div>
                    <div className="font-bold text-[13px]">{t.name}</div>
                    <div className="text-[11px] text-text-dim font-medium">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-black text-3xl sm:text-4xl tracking-tight mb-3">Frequently asked</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-ink-700 border border-white/[0.07] rounded-2xl overflow-hidden transition-colors hover:border-white/[0.12]">
                <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)} className="w-full px-5 py-4 flex items-center justify-between cursor-pointer text-left bg-transparent border-0">
                  <span className="font-bold text-sm sm:text-base text-text-primary">{f.q}</span>
                  <span className={`text-violet-400 text-lg transition-transform ${openFAQ === i ? "rotate-180" : ""}`}>▼</span>
                </button>
                {openFAQ === i && <div className="px-5 pb-4 text-sm text-text-muted leading-relaxed font-medium">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 bg-gradient-to-br from-violet-500/[0.12] to-cyan-500/[0.08] border-t border-violet-500/15">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="font-black text-3xl sm:text-4xl lg:text-[40px] tracking-tight mb-4">Ready to take control?</h2>
          <p className="text-sm sm:text-base text-text-muted font-medium mb-8">
            Join 12,400+ people who start every day with Tracklio. It takes 60 seconds to sign up, and it costs nothing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/register" className={`${btnPrimary} !text-base !py-4`}>Create your free account →</a>
            <a href="/support" className={btnGhost}>Talk to us</a>
          </div>
          <p className="text-[11px] text-text-dim mt-4 font-medium">No credit card · Cancel anytime · GDPR + Kenya DPA compliant</p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-ink-700 border-t border-white/[0.07] px-4 sm:px-6 pt-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="font-black text-xl bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent mb-2.5">Tracklio</div>
              <p className="text-[13px] text-text-dim leading-relaxed font-medium max-w-xs">The AI-powered productivity OS built for East Africa. Tasks, finances, and habits — unified.</p>
              <div className="flex gap-2.5 mt-4">
                {["𝕏", "in", "📘", "📸"].map((s, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-[13px] cursor-pointer hover:bg-white/10 transition-colors">{s}</div>
                ))}
              </div>
            </div>
            {[
              { title: "Product", links: ["Dashboard", "Tasks", "Finance", "Habits", "AI Chat", "Reports"] },
              { title: "Company", links: ["About", "Careers", "Blog", "Press", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"] },
              { title: "Support", links: ["Help Centre", "API Docs", "Status", "Community"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="font-extrabold text-[12px] text-text-dim uppercase tracking-wider mb-3.5">{col.title}</div>
                {col.links.map((l) => (
                  <a key={l} href={`/${l.toLowerCase().replace(/ /g, "-")}`} className="block text-[13px] text-text-dim hover:text-text-primary no-underline mb-2 font-medium transition-colors">{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 flex-wrap">
            <span className="text-[12px] text-text-dim font-medium text-center sm:text-left">© 2026 Tracklio Technologies Ltd. Nairobi, Kenya. All rights reserved.</span>
            <span className="text-[12px] text-text-dim font-medium text-center sm:text-right">Made with ❤️ in Nairobi · Serving East Africa 🌍</span>
          </div>
        </div>
      </footer>
    </div>
  );
}