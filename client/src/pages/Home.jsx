import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.id = "home-styles";
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{--v:#7C3AED;--vl:#8B5CF6;--c:#06B6D4;--cl:#22D3EE;--e:#10B981;--r:#F43F5E;--a:#F59E0B;--d1:#080810;--d3:#14141F;--d4:#1A1A28;--gb:rgba(255,255,255,0.07);--t1:#F0F0FF;--t2:#9090B8;--t3:#505075;}
      html,body{font-family:'Montserrat',sans-serif;background:var(--d1);color:var(--t1);overflow-x:hidden}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#222235;border-radius:99px}
      @keyframes af{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      @keyframes fu{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
      @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes count{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
      .gt{background:linear-gradient(90deg,var(--vl),var(--cl));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .gtr{background:linear-gradient(90deg,var(--r),var(--a));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .gte{background:linear-gradient(90deg,var(--e),var(--c));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .fu{animation:fu .6s ease both}
      .float{animation:float 4s ease-in-out infinite}
      .nav-af{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6,#06B6D4);background-size:300% 100%;animation:af 5s linear infinite}
      .orb{position:absolute;border-radius:50%;filter:blur(120px);pointer-events:none}
      .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:linear-gradient(135deg,var(--v),var(--c));border:none;border-radius:12px;color:#fff;font-family:'Montserrat',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .25s;text-decoration:none;white-space:nowrap}
      .btn-primary:hover{transform:scale(1.04);box-shadow:0 12px 40px rgba(124,58,237,.35)}
      .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:13px 24px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:var(--t2);font-family:'Montserrat',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .25s;text-decoration:none}
      .btn-ghost:hover{background:rgba(255,255,255,.08);color:var(--t1);border-color:rgba(255,255,255,.2)}
      .feature-card{background:var(--d3);border:1px solid var(--gb);border-radius:20px;padding:28px;transition:all .3s;position:relative;overflow:hidden}
      .feature-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.02),transparent);pointer-events:none}
      .feature-card:hover{transform:translateY(-6px);border-color:rgba(124,58,237,.3);box-shadow:0 20px 60px rgba(124,58,237,.12)}
      .pricing-card{background:var(--d3);border:1px solid var(--gb);border-radius:24px;padding:32px;transition:all .3s}
      .pricing-card.featured{border-color:rgba(124,58,237,.4);box-shadow:0 0 60px rgba(124,58,237,.12),inset 0 0 60px rgba(124,58,237,.03)}
      .pricing-card:hover{transform:translateY(-4px)}
      .stat-box{background:var(--d3);border:1px solid var(--gb);border-radius:18px;padding:24px;text-align:center;transition:all .3s}
      .stat-box:hover{border-color:rgba(124,58,237,.3);transform:translateY(-3px)}
      .testimonial{background:var(--d3);border:1px solid var(--gb);border-radius:20px;padding:26px;transition:all .3s}
      .testimonial:hover{border-color:rgba(255,255,255,.12)}
      .check-item{display:flex;align-items:flex-start;gap:10px;font-size:14px;font-weight:500;color:var(--t2);margin-bottom:10px}
      .check-item .dot{width:20px;height:20px;border-radius:"50%";background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.3);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:1px;border-radius:50%}
      .faq-item{background:var(--d3);border:1px solid var(--gb);border-radius:14px;overflow:hidden;margin-bottom:8px;transition:border-color .2s}
      .faq-item:hover{border-color:rgba(255,255,255,.12)}
      .tag{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700}
    `;
    if (!document.getElementById("home-styles")) { s.id = "home-styles"; document.head.prepend(s); }
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const [openFAQ, setOpenFAQ] = useState(null);

  const FEATURES = [
    { icon:"✅", color:"#7C3AED", bg:"rgba(124,58,237,.15)", title:"Smart Task Manager", desc:"Prioritise, categorise, and track tasks with AI-powered suggestions. Due-date reminders, completion analytics, and productivity scoring." },
    { icon:"💰", color:"#10B981", bg:"rgba(16,185,129,.15)", title:"Finance Tracker", desc:"Log income and expenses in KES. Visual breakdowns, budget health warnings, and AI-generated financial insights tailored for East Africa." },
    { icon:"🎯", color:"#F59E0B", bg:"rgba(245,158,11,.15)", title:"Habit Builder", desc:"Build daily habits with streak tracking, 28-day heatmaps, and habit radar charts. See your consistency at a glance." },
    { icon:"🤖", color:"#06B6D4", bg:"rgba(6,182,212,.15)",  title:"AI Intelligence", desc:"Personalised productivity scores, financial insights, and daily recommendations — powered by GPT and your own real data." },
    { icon:"📊", color:"#8B5CF6", bg:"rgba(139,92,246,.15)", title:"Advanced Reports", desc:"Weekly and monthly reports with area charts, category breakdowns, and CSV/PDF export. See trends before they become problems." },
    { icon:"💬", color:"#F43F5E", bg:"rgba(244,63,94,.15)",  title:"AI Chat Assistant", desc:"Ask your data anything. 'Am I overspending on food?' 'How many tasks did I complete this week?' Instant, data-backed answers." },
  ];

  const TESTIMONIALS = [
    { name:"Amara K.", role:"Freelance Designer · Nairobi", text:"I tried Notion, Trello, YNAB — nothing clicked for my lifestyle. Tracklio does all three in one place, in KES, and the AI actually gives useful advice.", stars:5, emoji:"👩‍🎨" },
    { name:"David M.", role:"Software Engineer · Kisumu", text:"The habit streaks alone changed my mornings. Add the budget alerts and I'm saving 30% more than I was six months ago. Genuinely life-changing app.", stars:5, emoji:"👨‍💻" },
    { name:"Zara A.", role:"MBA Student · Nairobi", text:"Built for how we actually live in Nairobi — KES currency, M-Pesa-aware, fast on 4G. This is what productivity software should look like for Africa.", stars:5, emoji:"👩‍🎓" },
    { name:"Brian O.", role:"Entrepreneur · Mombasa", text:"My team of 4 all use it now. The weekly AI report is the first thing I read on Monday mornings. It keeps everyone accountable.", stars:5, emoji:"👨‍💼" },
    { name:"Fatima H.", role:"Doctor · Nairobi", text:"I have 15 minutes between shifts. Tracklio lets me log expenses, check tasks, and get AI insights in under 2 minutes. Nothing else comes close.", stars:5, emoji:"👩‍⚕️" },
    { name:"Kevin N.", role:"Content Creator · Nairobi", text:"The chatbot is insane. I asked 'where did my money go this month' and it gave me a breakdown with advice. No other app does that.", stars:5, emoji:"🎬" },
  ];

  const FAQS = [
    { q:"Is Tracklio free?", a:"Yes. The free plan includes unlimited tasks, up to 50 transactions/month, and basic AI insights. Pro unlocks unlimited everything, advanced AI, full reports, and priority support." },
    { q:"Does it work offline?", a:"Your dashboard loads from cache when offline. Creating and syncing tasks or transactions requires an internet connection." },
    { q:"Is my financial data safe?", a:"Yes. All data is encrypted in transit (TLS) and at rest (MongoDB Atlas). We never sell your data, and AI insights use your data only to generate your response — it is not stored by OpenAI per their API policy." },
    { q:"Can I export my data?", a:"Absolutely. Export any data as CSV from the Reports page at any time. Your data is always yours." },
    { q:"Does it work with M-Pesa?", a:"Manual logging with M-Pesa transactions is fully supported. Direct M-Pesa sync via Open Banking is on the roadmap for Q3 2026." },
    { q:"Is there a mobile app?", a:"The web app is fully responsive and works great on mobile browsers. Native iOS and Android apps are in development." },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--d1)", fontFamily:"Montserrat,sans-serif", color:"var(--t1)" }}>

      {/* ══ NAVBAR ══ */}
      <div className="nav-af"/>
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(8,8,16,0.85)", backdropFilter:"blur(24px)", borderBottom:"1px solid var(--gb)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <a href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            <div style={{ width:34, height:34, borderRadius:9, overflow:"hidden", boxShadow:"0 4px 16px rgba(124,58,237,.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <img src="/trcklo logo.png" alt="Tracklio" style={{ width:"100%", height:"100%", objectFit:"contain" }} onError={e=>{e.currentTarget.style.display="none";e.currentTarget.parentElement.style.background="linear-gradient(135deg,#7C3AED,#06B6D4)";}}/>
            </div>
            <div>
              <div style={{ fontWeight:900, fontSize:18, letterSpacing:-0.8, background:"linear-gradient(90deg,#8B5CF6,#22D3EE)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Tracklio</div>
              <div style={{ fontSize:8, fontWeight:600, color:"var(--t3)", textTransform:"uppercase", letterSpacing:1.4, marginTop:0 }}>Smart Life OS</div>
            </div>
          </a>

          <div style={{ display:"flex", alignItems:"center", gap:28 }}>
            {["Features","Pricing","About","Blog"].map(l=>(
              <a key={l} href={`/${l.toLowerCase()}`} style={{ fontSize:13, fontWeight:600, color:"var(--t3)", textDecoration:"none", transition:"color .2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--t1)"} onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}>{l}</a>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <a href="/login"    className="btn-ghost"   style={{ padding:"9px 18px", fontSize:13 }}>Log In</a>
            <a href="/register" className="btn-primary" style={{ padding:"9px 18px", fontSize:13 }}>Start Free →</a>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ position:"relative", overflow:"hidden", minHeight:"92vh", display:"flex", alignItems:"center", padding:"80px 24px" }}>
        <div className="orb" style={{ width:800, height:800, background:"var(--v)", top:-300, left:-200, opacity:.12 }}/>
        <div className="orb" style={{ width:600, height:600, background:"var(--c)", bottom:-200, right:-200, opacity:.09 }}/>
        <div className="orb" style={{ width:400, height:400, background:"var(--r)", top:"40%", left:"45%", opacity:.06 }}/>

        <div style={{ maxWidth:1200, margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
            <div>
              <div className="fu" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.28)", borderRadius:20, marginBottom:20 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#8B5CF6", animation:"pulse 2s infinite", display:"inline-block" }}/>
                <span style={{ fontSize:11, fontWeight:700, color:"#C4B5FD", textTransform:"uppercase", letterSpacing:1.2 }}>AI-Powered · Built for Africa</span>
              </div>

              <h1 className="fu" style={{ fontWeight:900, fontSize:52, letterSpacing:-2.5, lineHeight:1.05, marginBottom:20, animationDelay:"80ms" }}>
                Your entire life,<br/>
                <span className="gt">beautifully organised</span>
              </h1>

              <p className="fu" style={{ fontSize:17, color:"var(--t2)", fontWeight:500, lineHeight:1.8, marginBottom:32, animationDelay:"160ms", maxWidth:520 }}>
                Tracklio combines tasks, finances, and habits into one AI-powered platform. Built in Nairobi for the way East Africa actually works.
              </p>

              <div className="fu" style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:40, animationDelay:"240ms" }}>
                <a href="/register" className="btn-primary" style={{ fontSize:15, padding:"14px 28px" }}>
                  Start free — no card needed →
                </a>
                <a href="/dashboard" className="btn-ghost">
                  ▶ Live demo
                </a>
              </div>

              {/* Social proof */}
              <div className="fu" style={{ display:"flex", alignItems:"center", gap:16, animationDelay:"320ms" }}>
                <div style={{ display:"flex" }}>
                  {["#7C3AED","#06B6D4","#10B981","#F59E0B","#F43F5E"].map((c,i)=>(
                    <div key={c} style={{ width:32, height:32, borderRadius:"50%", background:c, border:"2px solid var(--d1)", marginLeft:i>0?-10:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>
                      {["👩","👨","👩","👨","👩"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display:"flex", gap:1, marginBottom:2 }}>{"⭐⭐⭐⭐⭐".split("").map((s,i)=><span key={i} style={{ fontSize:12 }}>{s}</span>)}</div>
                  <div style={{ fontSize:12, color:"var(--t3)", fontWeight:600 }}>Loved by <strong style={{ color:"var(--t1)" }}>12,400+</strong> people in East Africa</div>
                </div>
              </div>
            </div>

            {/* Hero dashboard preview */}
            <div className="fu float" style={{ animationDelay:"200ms" }}>
              <div style={{ background:"var(--d3)", border:"1px solid var(--gb)", borderRadius:24, padding:20, boxShadow:"0 40px 120px rgba(0,0,0,.6), 0 0 0 1px rgba(124,58,237,.1)" }}>
                {/* Mini dashboard mockup */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, padding:"8px 12px", background:"rgba(124,58,237,.08)", borderRadius:12 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--e)", animation:"pulse 2s infinite" }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:"#6EE7B7" }}>AI Score: 84%</span>
                  <div style={{ marginLeft:"auto", fontSize:11, color:"var(--t3)" }}>Good morning, Alex 👋</div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                  {[{l:"Tasks Done",v:"7/9",c:"#8B5CF6"},{l:"KES Income",v:"85K",c:"#10B981"},{l:"KES Spend",v:"42K",c:"#F43F5E"},{l:"Habit Streak",v:"🔥 14d",c:"#F59E0B"}].map(({l,v,c})=>(
                    <div key={l} style={{ background:"var(--d4)", borderRadius:12, padding:"12px 14px" }}>
                      <div style={{ fontSize:9, color:"var(--t3)", fontWeight:700, textTransform:"uppercase", letterSpacing:.7 }}>{l}</div>
                      <div style={{ fontSize:18, fontWeight:900, color:c, marginTop:4 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"var(--d4)", borderRadius:12, padding:"12px 14px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--t3)", marginBottom:8 }}>🤖 AI Insight</div>
                  <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.6 }}>Your food spending is 28% above last month. Consider setting a KES 6,000 weekly budget.</div>
                </div>
                <div style={{ marginTop:12, display:"flex", gap:8 }}>
                  {["Tasks","Finance","Habits","Reports"].map(tab=>(
                    <div key={tab} style={{ flex:1, padding:"7px", background:tab==="Tasks"?"rgba(124,58,237,.15)":"rgba(255,255,255,.04)", border:tab==="Tasks"?"1px solid rgba(124,58,237,.3)":"1px solid var(--gb)", borderRadius:9, fontSize:10, fontWeight:700, color:tab==="Tasks"?"#C4B5FD":"var(--t3)", textAlign:"center" }}>{tab}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section ref={statsRef} style={{ background:"var(--d3)", borderTop:"1px solid var(--gb)", borderBottom:"1px solid var(--gb)", padding:"48px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:20 }}>
          {[{num:"12,400+",label:"Active Users",color:"var(--vl)"},{num:"2.4M+",label:"Tasks Tracked",color:"var(--c)"},{num:"KES 1B+",label:"Finance Managed",color:"var(--e)"},{num:"4.9★",label:"User Rating",color:"var(--a)"},{num:"50+",label:"AI Insights Daily",color:"var(--r)"}].map(({num,label,color},i)=>(
            <div key={label} className="stat-box" style={{ animationDelay:`${i*80}ms` }}>
              <div style={{ fontSize:28, fontWeight:900, color, letterSpacing:-1, marginBottom:6 }}>{statsVisible?num:"—"}</div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ padding:"100px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div className="tag" style={{ background:"rgba(6,182,212,.1)", border:"1px solid rgba(6,182,212,.25)", color:"#67E8F9", marginBottom:16 }}>
              ✨ Everything you need
            </div>
            <h2 style={{ fontWeight:900, fontSize:40, letterSpacing:-1.5, marginBottom:16 }}>
              One app. <span className="gt">Total control.</span>
            </h2>
            <p style={{ fontSize:16, color:"var(--t2)", fontWeight:500, maxWidth:560, margin:"0 auto" }}>
              Stop switching between 5 apps. Tracklio gives you tasks, money, habits, and AI intelligence — beautifully unified.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {FEATURES.map((f,i)=>(
              <div key={f.title} className="feature-card fu" style={{ animationDelay:`${i*60}ms` }}>
                <div style={{ width:52, height:52, borderRadius:14, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:18 }}>{f.icon}</div>
                <h3 style={{ fontWeight:800, fontSize:18, marginBottom:10 }}>{f.title}</h3>
                <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.75, fontWeight:500 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ padding:"80px 24px", background:"var(--d3)", borderTop:"1px solid var(--gb)", borderBottom:"1px solid var(--gb)" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <h2 style={{ fontWeight:900, fontSize:36, letterSpacing:-1.2, marginBottom:12 }}>How it works</h2>
            <p style={{ fontSize:15, color:"var(--t2)", fontWeight:500 }}>From sign-up to insights in 60 seconds</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
            {[{n:"01",icon:"📝",title:"Sign up free",desc:"Create an account in 30 seconds. No credit card. No friction."},{n:"02",icon:"➕",title:"Add your data",desc:"Log tasks, expenses, and habits. Import from CSV or start fresh."},{n:"03",icon:"🤖",title:"AI analyses",desc:"Our AI reads your data and generates your personalised score + insights."},{n:"04",icon:"🚀",title:"Level up",desc:"Follow your AI recommendations. Watch your productivity compound."}].map((s,i)=>(
              <div key={s.n} style={{ textAlign:"center", padding:"24px 16px" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(124,58,237,.12)", border:"2px solid rgba(124,58,237,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 14px" }}>{s.icon}</div>
                <div style={{ fontSize:11, fontWeight:800, color:"var(--vl)", textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>Step {s.n}</div>
                <h3 style={{ fontWeight:800, fontSize:16, marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7, fontWeight:500 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" style={{ padding:"100px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div className="tag" style={{ background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.25)", color:"#6EE7B7", marginBottom:16 }}>Simple pricing</div>
            <h2 style={{ fontWeight:900, fontSize:40, letterSpacing:-1.5, marginBottom:12 }}>Start free. <span className="gte">Scale when ready.</span></h2>
            <p style={{ fontSize:15, color:"var(--t2)", fontWeight:500 }}>No hidden fees. Cancel anytime. Priced for the global majority.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            {/* Free */}
            <div className="pricing-card">
              <div style={{ fontSize:11, fontWeight:800, color:"var(--t3)", textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>Free Forever</div>
              <div style={{ fontSize:40, fontWeight:900, letterSpacing:-1.5, marginBottom:4 }}>KES 0<span style={{ fontSize:16, color:"var(--t3)", fontWeight:500 }}>/month</span></div>
              <p style={{ fontSize:13, color:"var(--t2)", marginBottom:24, fontWeight:500 }}>Everything you need to get started</p>
              <div style={{ marginBottom:28 }}>
                {["Unlimited tasks","50 transactions/month","Basic AI insights","Habit tracking (3 habits)","CSV export","Email support"].map(f=>(
                  <div key={f} className="check-item"><div className="dot">✓</div>{f}</div>
                ))}
              </div>
              <a href="/register" className="btn-ghost" style={{ width:"100%", justifyContent:"center" }}>Get started free</a>
            </div>
            {/* Pro */}
            <div className="pricing-card featured" style={{ position:"relative" }}>
              <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,var(--v),var(--c))", padding:"4px 16px", borderRadius:20, fontSize:11, fontWeight:700, color:"#fff", whiteSpace:"nowrap" }}>✨ Most Popular</div>
              <div style={{ fontSize:11, fontWeight:800, color:"#C4B5FD", textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>Pro</div>
              <div style={{ fontSize:40, fontWeight:900, letterSpacing:-1.5, marginBottom:4 }}>
                <span className="gt">KES 2,999</span><span style={{ fontSize:16, color:"var(--t3)", fontWeight:500 }}>/month</span>
              </div>
              <p style={{ fontSize:13, color:"var(--t2)", marginBottom:24, fontWeight:500 }}>For people serious about their potential</p>
              <div style={{ marginBottom:28 }}>
                {["Everything in Free","Unlimited transactions","Advanced AI insights & coaching","Unlimited habits","Full reports & analytics","Priority support","M-Pesa integration (Q3 2026)","API access"].map(f=>(
                  <div key={f} className="check-item"><div className="dot" style={{ background:"rgba(124,58,237,.2)", borderColor:"rgba(124,58,237,.4)", color:"#C4B5FD" }}>✓</div><span style={{ color:"var(--t1)" }}>{f}</span></div>
                ))}
              </div>
              <a href="/register" className="btn-primary" style={{ width:"100%", justifyContent:"center", fontSize:15 }}>Start 14-day free trial →</a>
              <p style={{ fontSize:11, color:"var(--t3)", textAlign:"center", marginTop:10, fontWeight:500 }}>No card required during trial</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding:"80px 24px", background:"var(--d3)", borderTop:"1px solid var(--gb)", borderBottom:"1px solid var(--gb)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <h2 style={{ fontWeight:900, fontSize:36, letterSpacing:-1.2, marginBottom:12 }}>Loved by thousands across East Africa</h2>
            <p style={{ fontSize:15, color:"var(--t2)", fontWeight:500 }}>Real people. Real results. No cherry-picking.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={t.name} className="testimonial fu" style={{ animationDelay:`${i*60}ms` }}>
                <div style={{ display:"flex", gap:1, marginBottom:10 }}>{"⭐".repeat(t.stars).split("").map((_,i)=><span key={i} style={{ fontSize:14 }}>⭐</span>)}</div>
                <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.75, fontWeight:500, marginBottom:16, fontStyle:"italic" }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(124,58,237,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{t.emoji}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{t.name}</div>
                    <div style={{ fontSize:11, color:"var(--t3)", fontWeight:500 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section style={{ padding:"80px 24px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:44 }}>
            <h2 style={{ fontWeight:900, fontSize:36, letterSpacing:-1.2, marginBottom:12 }}>Frequently asked</h2>
          </div>
          {FAQS.map((f,i)=>(
            <div key={i} className="faq-item">
              <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }} onClick={()=>setOpenFAQ(openFAQ===i?null:i)}>
                <span style={{ fontWeight:700, fontSize:14 }}>{f.q}</span>
                <span style={{ color:"var(--vl)", fontSize:18, transition:"transform .2s", transform:openFAQ===i?"rotate(180deg)":"none" }}>▼</span>
              </div>
              {openFAQ===i&&<div style={{ padding:"0 20px 16px", fontSize:14, color:"var(--t2)", lineHeight:1.75, fontWeight:500 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding:"80px 24px", background:"linear-gradient(135deg,rgba(124,58,237,.12),rgba(6,182,212,.08))", borderTop:"1px solid rgba(124,58,237,.15)" }}>
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🚀</div>
          <h2 style={{ fontWeight:900, fontSize:40, letterSpacing:-1.5, marginBottom:16 }}>
            Ready to take control?
          </h2>
          <p style={{ fontSize:16, color:"var(--t2)", fontWeight:500, marginBottom:32 }}>
            Join 12,400+ people who start every day with Tracklio. It takes 60 seconds to sign up, and it costs nothing.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <a href="/register" className="btn-primary" style={{ fontSize:16, padding:"16px 32px" }}>Create your free account →</a>
            <a href="/support"  className="btn-ghost"  style={{ fontSize:15 }}>Talk to us</a>
          </div>
          <p style={{ fontSize:12, color:"var(--t3)", marginTop:16, fontWeight:500 }}>No credit card · Cancel anytime · GDPR + Kenya DPA compliant</p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background:"var(--d3)", borderTop:"1px solid var(--gb)", padding:"48px 24px 32px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:32, marginBottom:40 }}>
            <div>
              <div style={{ fontWeight:900, fontSize:20, background:"linear-gradient(90deg,#8B5CF6,#22D3EE)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:10 }}>Tracklio</div>
              <p style={{ fontSize:13, color:"var(--t3)", lineHeight:1.75, fontWeight:500, maxWidth:260 }}>The AI-powered productivity OS built for East Africa. Tasks, finances, and habits — unified.</p>
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                {["𝕏","in","📘","📸"].map((s,i)=>(
                  <div key={i} style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,.05)", border:"1px solid var(--gb)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, cursor:"pointer" }}>{s}</div>
                ))}
              </div>
            </div>
            {[{title:"Product",links:["Dashboard","Tasks","Finance","Habits","AI Chat","Reports"]},{title:"Company",links:["About","Careers","Blog","Press","Contact"]},{title:"Legal",links:["Privacy Policy","Terms of Service","Cookie Policy","GDPR"]},{title:"Support",links:["Help Centre","API Docs","Status","Community"]}].map(col=>(
              <div key={col.title}>
                <div style={{ fontWeight:800, fontSize:12, color:"var(--t3)", textTransform:"uppercase", letterSpacing:1.2, marginBottom:14 }}>{col.title}</div>
                {col.links.map(l=>(
                  <a key={l} href={`/${l.toLowerCase().replace(/ /g,"-")}`} style={{ display:"block", fontSize:13, color:"var(--t3)", textDecoration:"none", marginBottom:8, fontWeight:500, transition:"color .2s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--t1)"} onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}>{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid var(--gb)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <span style={{ fontSize:12, color:"var(--t3)", fontWeight:500 }}>© 2026 Tracklio Technologies Ltd. Nairobi, Kenya. All rights reserved.</span>
            <span style={{ fontSize:12, color:"var(--t3)", fontWeight:500 }}>Made with ❤️ in Nairobi · Serving East Africa 🌍</span>
          </div>
        </div>
      </footer>
    </div>
  );
}