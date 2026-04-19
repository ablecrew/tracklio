import { useEffect, useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --v:#7C3AED;--vl:#8B5CF6;--c:#06B6D4;--cl:#22D3EE;
    --e:#10B981;--r:#F43F5E;--a:#F59E0B;
    --d1:#080810;--d2:#0E0E18;--d3:#14141F;--d4:#1A1A28;--d5:#222235;
    --g:rgba(255,255,255,0.04);--gb:rgba(255,255,255,0.07);
    --t1:#F0F0FF;--t2:#9090B8;--t3:#505075;
  }
  html,body{font-family:'Montserrat',sans-serif;background:var(--d1);color:var(--t1)}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:var(--d5);border-radius:99px}
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .orb1{width:700px;height:700px;background:var(--v);top:-250px;left:-200px;opacity:.10}
  .orb2{width:500px;height:500px;background:var(--c);bottom:-150px;right:-150px;opacity:.09}
  .orb3{width:400px;height:400px;background:var(--e);top:50%;left:50%;transform:translate(-50%,-50%);opacity:.05}
  @keyframes float-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  .fade-up{animation:float-up .5s ease both}
  .gradient-text{background:linear-gradient(90deg,var(--vl),var(--cl));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:20px;padding:24px;transition:border-color .25s,transform .25s}
  .card:hover{border-color:rgba(255,255,255,0.13);transform:translateY(-3px)}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6);background-size:300% 100%;animation:accent-flow 5s linear infinite;position:sticky;top:0;z-index:100}
  .stat-num{font-size:36px;font-weight:900;letter-spacing:-1.5px}
  .team-avatar{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
  .value-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:14px}
  .timeline-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;margin-top:4px}
`;

const STATS = [
  { num:"12K+",  label:"Active Users",       icon:"👥", color:"var(--vl)"  },
  { num:"2.4M",  label:"Tasks Tracked",      icon:"✅", color:"var(--c)"   },
  { num:"KES 1B+",label:"Finances Managed",  icon:"💰", color:"var(--e)"   },
  { num:"99.5%", label:"Uptime SLA",         icon:"⚡", color:"var(--a)"   },
  { num:"4.9★",  label:"User Rating",        icon:"⭐", color:"var(--r)"   },
  { num:"50+",   label:"AI Insights Daily",  icon:"🤖", color:"var(--vl)"  },
];

const VALUES = [
  { icon:"🎯", label:"Radical Clarity",     color:"rgba(124,58,237,.15)", desc:"We strip away noise. Every feature must make your life simpler, not more complicated." },
  { icon:"🔒", label:"Privacy First",       color:"rgba(6,182,212,.15)",  desc:"Your data is yours. We never sell it, never share it, never train on it without consent." },
  { icon:"🤖", label:"AI with Integrity",   color:"rgba(16,185,129,.15)", desc:"Our AI gives honest insights — even when the truth is inconvenient. No hype, just signal." },
  { icon:"🚀", label:"Ship Fast, Care Deeply",color:"rgba(245,158,11,.15)",desc:"We move quickly because we care about the time you spend waiting. But never at the cost of quality." },
  { icon:"🌍", label:"Built for Africa",    color:"rgba(244,63,94,.15)",  desc:"Designed with Nairobi as ground zero. KES-first, Swahili-aware, M-Pesa-ready — genuinely local." },
  { icon:"♿", label:"Access for All",      color:"rgba(124,58,237,.15)", desc:"Premium productivity tools shouldn't require a Silicon Valley salary. We price for the global majority." },
];

const TEAM = [
  { name:"Amara Osei",     role:"Co-founder & CEO",    emoji:"👩‍💼", bg:"rgba(124,58,237,.2)", bio:"Ex-Safaricom product lead. Obsessed with making AI useful for real people." },
  { name:"Kelvin Mutuku",  role:"Co-founder & CTO",    emoji:"👨‍💻", bg:"rgba(6,182,212,.2)",  bio:"Full-stack engineer. Built Tracklio's entire AI pipeline from the ground up." },
  { name:"Zara Mohamed",   role:"Head of Design",      emoji:"👩‍🎨", bg:"rgba(16,185,129,.2)", bio:"Former Andela designer. Every pixel in Tracklio has her fingerprints." },
  { name:"David Kariuki",  role:"Head of Growth",      emoji:"📈",   bg:"rgba(245,158,11,.2)", bio:"Growth hacker. Took us from 0 to 10,000 users in 6 months with zero ad spend." },
  { name:"Fatima Al-Hassan",role:"AI Engineer",         emoji:"🤖",   bg:"rgba(244,63,94,.2)",  bio:"PhD ML from Strathmore. Makes the AI insights actually accurate and useful." },
  { name:"Brian Otieno",   role:"Community & Support", emoji:"🤝",   bg:"rgba(124,58,237,.2)", bio:"The human behind every support ticket. Fluent in 4 Kenyan languages." },
];

const TIMELINE = [
  { year:"Jan 2024", event:"Idea born in a Nairobi co-working space", color:"var(--v)" },
  { year:"Mar 2024", event:"First 100 beta users across EA", color:"var(--c)" },
  { year:"Jul 2024", event:"Seed funding raised — KES 15M", color:"var(--e)" },
  { year:"Sep 2024", event:"AI insights engine launched", color:"var(--vl)" },
  { year:"Jan 2025", event:"10,000 active users milestone", color:"var(--a)" },
  { year:"Apr 2025", event:"Finance tracker & habits module shipped", color:"var(--r)" },
  { year:"Jan 2026", event:"Series A — expanding across Africa", color:"var(--e)" },
  { year:"Apr 2026", event:"12,400+ users · v2.4 launched", color:"var(--vl)" },
];

export default function About() {
  useEffect(() => {
    const id="trkl-about";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  return (
    <div style={{minHeight:"100vh",background:"var(--d1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
      <div className="nav-accent"/>

      <div style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"60px 28px 80px"}}>

        {/* Hero */}
        <div className="fade-up" style={{textAlign:"center",marginBottom:64}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 16px",background:"rgba(124,58,237,.12)",border:"1px solid rgba(124,58,237,.28)",borderRadius:20,marginBottom:20}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#8B5CF6",animation:"pulse 2s infinite",display:"inline-block"}}/>
            <span style={{fontSize:11,fontWeight:700,color:"#C4B5FD",textTransform:"uppercase",letterSpacing:1.2}}>Our Story</span>
          </div>
          <h1 style={{fontWeight:900,fontSize:48,letterSpacing:-2,lineHeight:1.1,marginBottom:20}}>
            We built the OS<br/>
            <span className="gradient-text">your life deserves</span>
          </h1>
          <p style={{fontSize:16,color:"var(--t2)",fontWeight:500,maxWidth:600,margin:"0 auto",lineHeight:1.8}}>
            Tracklio started as a simple question: <em style={{color:"var(--t1)"}}>why do smart, driven people still feel behind?</em> The answer wasn't effort — it was tooling. We built what we wished existed.
          </p>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:60}}>
          {STATS.map((s,i) => (
            <div key={s.label} className="card fade-up" style={{animationDelay:`${i*60}ms`,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
              <div className="stat-num" style={{color:s.color}}>{s.num}</div>
              <div style={{fontSize:12,fontWeight:600,color:"var(--t3)",marginTop:4,textTransform:"uppercase",letterSpacing:0.8}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="card fade-up" style={{marginBottom:48,background:"linear-gradient(135deg,rgba(124,58,237,.08),rgba(6,182,212,.06))",border:"1px solid rgba(124,58,237,.2)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"var(--vl)",display:"inline-block"}}/>
            <span style={{fontSize:11,fontWeight:800,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1.2}}>Our Mission</span>
          </div>
          <p style={{fontSize:20,fontWeight:700,color:"var(--t1)",lineHeight:1.7,letterSpacing:-0.3}}>
            To give every person on Earth — regardless of where they live or what they earn — access to the kind of intelligent, AI-powered productivity system that used to be reserved for Fortune 500 executives.
          </p>
          <p style={{fontSize:14,color:"var(--t2)",fontWeight:500,lineHeight:1.8,marginTop:14}}>
            We're starting in Africa because that's home, and because the continent's 1.4 billion people deserve tools built <em style={{color:"var(--t1)"}}>for them</em>, not adapted for them. Tracklio works in Kenya, Nigeria, Ghana, and South Africa today. The world is next.
          </p>
        </div>

        {/* Values */}
        <div style={{marginBottom:60}}>
          <h2 style={{fontWeight:800,fontSize:24,letterSpacing:-0.6,marginBottom:24}}>
            What we stand for
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {VALUES.map((v,i) => (
              <div key={v.label} className="card fade-up" style={{animationDelay:`${i*50}ms`}}>
                <div className="value-icon" style={{background:v.color}}>{v.icon}</div>
                <div style={{fontWeight:800,fontSize:15,marginBottom:8}}>{v.label}</div>
                <div style={{fontSize:13,color:"var(--t2)",lineHeight:1.7,fontWeight:500}}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{marginBottom:60}}>
          <h2 style={{fontWeight:800,fontSize:24,letterSpacing:-0.6,marginBottom:28}}>How we got here</h2>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {TIMELINE.map((t,i) => (
              <div key={t.year} style={{display:"flex",gap:20,paddingBottom:i<TIMELINE.length-1?28:0,position:"relative"}}>
                {i < TIMELINE.length-1 && <div style={{position:"absolute",left:5,top:20,width:1,bottom:0,background:"rgba(255,255,255,0.06)"}}/>}
                <div className="timeline-dot" style={{background:t.color,boxShadow:`0 0 10px ${t.color}`}}/>
                <div>
                  <div style={{fontSize:11,fontWeight:800,color:t.color,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>{t.year}</div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--t1)"}}>{t.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{marginBottom:60}}>
          <h2 style={{fontWeight:800,fontSize:24,letterSpacing:-0.6,marginBottom:8}}>Meet the team</h2>
          <p style={{fontSize:13,color:"var(--t3)",marginBottom:28,fontWeight:500}}>Six people. One obsession: making your life better.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {TEAM.map((m,i) => (
              <div key={m.name} className="card fade-up" style={{animationDelay:`${i*60}ms`}}>
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                  <div className="team-avatar" style={{background:m.bg}}>{m.emoji}</div>
                  <div>
                    <div style={{fontWeight:800,fontSize:14}}>{m.name}</div>
                    <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginTop:2}}>{m.role}</div>
                  </div>
                </div>
                <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.7,fontWeight:500}}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card" style={{textAlign:"center",background:"linear-gradient(135deg,rgba(124,58,237,.1),rgba(6,182,212,.08))",border:"1px solid rgba(124,58,237,.25)",padding:"48px 32px"}}>
          <h2 style={{fontWeight:900,fontSize:28,letterSpacing:-0.8,marginBottom:12}}>
            Ready to take control of your life?
          </h2>
          <p style={{fontSize:14,color:"var(--t2)",marginBottom:28,maxWidth:480,margin:"0 auto 28px"}}>
            Join 12,400+ people who use Tracklio daily to track tasks, manage money, and build habits that stick.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/login" style={{padding:"13px 28px",background:"linear-gradient(135deg,var(--v),var(--c))",border:"none",borderRadius:12,color:"#fff",fontFamily:"Montserrat,sans-serif",fontSize:14,fontWeight:700,textDecoration:"none",transition:"all .2s",display:"inline-block"}}>
              Get Started Free →
            </a>
            <a href="/contact" style={{padding:"13px 28px",background:"var(--g)",border:"1px solid var(--gb)",borderRadius:12,color:"var(--t2)",fontFamily:"Montserrat,sans-serif",fontSize:14,fontWeight:600,textDecoration:"none"}}>
              Talk to Us
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}