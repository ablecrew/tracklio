import { useEffect, useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--v:#7C3AED;--vl:#8B5CF6;--c:#06B6D4;--cl:#22D3EE;--e:#10B981;--r:#F43F5E;--a:#F59E0B;--d1:#080810;--d2:#0E0E18;--d3:#14141F;--d4:#1A1A28;--d5:#222235;--g:rgba(255,255,255,0.04);--gb:rgba(255,255,255,0.07);--t1:#F0F0FF;--t2:#9090B8;--t3:#505075;}
  html,body{font-family:'Montserrat',sans-serif;background:var(--d1);color:var(--t1)}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--d5);border-radius:99px}
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .orb1{width:600px;height:600px;background:var(--a);top:-200px;left:-150px;opacity:.08}
  .orb2{width:500px;height:500px;background:var(--v);bottom:-100px;right:-150px;opacity:.09}
  @keyframes float-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .45s ease both}
  .gradient-text{background:linear-gradient(90deg,var(--a),var(--r));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:20px;padding:24px;transition:border-color .25s,transform .25s}
  .card:hover{border-color:rgba(255,255,255,0.12);transform:translateY(-2px)}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6);background-size:300% 100%;animation:accent-flow 5s linear infinite;position:sticky;top:0;z-index:100}
  .btn-primary{padding:11px 22px;background:linear-gradient(135deg,var(--v),var(--c));border:none;border-radius:11px;color:#fff;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:7px;text-decoration:none}
  .btn-primary:hover{opacity:.88;transform:scale(1.02)}
  .btn-ghost{padding:10px 18px;background:var(--g);border:1px solid var(--gb);border-radius:11px;color:var(--t2);font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
  .btn-ghost:hover{background:var(--gb);color:var(--t1)}
  .asset-card{background:var(--d4);border:1px solid var(--gb);border-radius:14px;overflow:hidden;transition:all .2s;cursor:pointer}
  .asset-card:hover{border-color:rgba(124,58,237,.35);transform:translateY(-2px);box-shadow:0 10px 30px rgba(124,58,237,.12)}
  .asset-preview{height:120px;display:flex;align-items:center;justify-content:center;font-size:40px}
  .coverage-item{display:flex;align-items:flex-start;gap:16px;padding:18px;background:var(--d4);border:1px solid var(--gb);border-radius:14px;transition:all .2s}
  .coverage-item:hover{border-color:rgba(255,255,255,.12);background:var(--d5)}
  .stat-pill{display:inline-flex;flex-direction:column;align-items:center;padding:16px 20px;background:var(--d4);border-radius:14px;border:1px solid var(--gb)}
  .input-field{width:100%;padding:11px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .input-field:focus{border-color:var(--vl)}.input-field::placeholder{color:var(--t3)}
  .textarea-field{width:100%;padding:11px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s;resize:vertical;min-height:100px}
  .textarea-field:focus{border-color:var(--vl)}
`;

const COVERAGE = [
  { outlet:"TechCabal",    date:"Mar 2026", title:"Tracklio is building the Notion of personal finance for East Africa", tag:"Feature", color:"rgba(124,58,237,.2)", icon:"📰" },
  { outlet:"Disrupt Africa",date:"Jan 2026", title:"Nairobi startup Tracklio raises Series A to scale across the continent", tag:"Funding", color:"rgba(16,185,129,.2)", icon:"💰" },
  { outlet:"Business Daily",date:"Nov 2025", title:"AI-powered productivity app Tracklio hits 10,000 users in 9 months", tag:"Milestone", color:"rgba(6,182,212,.2)", icon:"🚀" },
  { outlet:"Wired Africa",  date:"Aug 2025", title:"The startup making financial tracking feel like a superpower", tag:"Profile", color:"rgba(245,158,11,.2)", icon:"⭐" },
  { outlet:"KBC Tech",      date:"Jun 2025", title:"Kenyan app Tracklio wins Best Fintech Product at AfriTech Awards", tag:"Award", color:"rgba(244,63,94,.2)", icon:"🏆" },
];

const ASSETS = [
  { label:"Primary Logo (SVG)",       icon:"🔷", desc:"Full-colour on dark backgrounds",            bg:"linear-gradient(135deg,#7C3AED22,#06B6D422)" },
  { label:"Logo (White)",             icon:"⬜", desc:"White monochrome for dark surfaces",          bg:"rgba(255,255,255,.04)" },
  { label:"Logo (Black)",             icon:"⬛", desc:"Black monochrome for light backgrounds",       bg:"rgba(255,255,255,.03)" },
  { label:"App Icon (PNG 1024px)",    icon:"📱", desc:"App store and social profile icon",           bg:"linear-gradient(135deg,#7C3AED,#06B6D4)" },
  { label:"Brand Guidelines (PDF)",  icon:"📋", desc:"Colours, typography, usage rules",            bg:"rgba(245,158,11,.08)" },
  { label:"Screenshot Pack",         icon:"🖥️", desc:"Dashboard, mobile, feature screenshots",      bg:"rgba(16,185,129,.08)" },
  { label:"Founder Photos (HiRes)",  icon:"👥", desc:"Professional headshots for publication",      bg:"rgba(124,58,237,.08)" },
  { label:"Product Demo Video",      icon:"🎬", desc:"60-sec product walkthrough MP4",              bg:"rgba(244,63,94,.08)" },
];

const KEY_FACTS = [
  { num:"April 2024", label:"Founded",              color:"var(--vl)" },
  { num:"Nairobi, Kenya", label:"Headquarters",     color:"var(--c)"  },
  { num:"6",          label:"Full-time team",       color:"var(--e)"  },
  { num:"12,400+",    label:"Active users",         color:"var(--a)"  },
  { num:"KES 15M",    label:"Seed raised",          color:"var(--r)"  },
  { num:"Series A",   label:"Current round",        color:"var(--vl)" },
];

export default function Press() {
  useEffect(()=>{
    const id="trkl-press";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [form,    setForm]    = useState({name:"",outlet:"",email:"",message:""});
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);

  const handleDownload = (label) => {
    // In production, point to real asset URLs
    alert(`Downloading: ${label}\n\nIn production, this links to your CDN-hosted press kit file.`);
  };

  const handleSend = async () => {
    if (!form.name.trim()||!form.email.trim()) return;
    setSending(true);
    await new Promise(r=>setTimeout(r,1200));
    setSent(true); setSending(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--d1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="nav-accent"/>

      <div style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"60px 28px 80px"}}>

        {/* Hero */}
        <div className="fade-up" style={{marginBottom:52}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 16px",background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.25)",borderRadius:20,marginBottom:18}}>
            <span style={{fontSize:11,fontWeight:700,color:"var(--a)",textTransform:"uppercase",letterSpacing:1.2}}>Media & Press</span>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
            <div>
              <h1 style={{fontWeight:900,fontSize:44,letterSpacing:-1.8,marginBottom:16,lineHeight:1.1}}>
                Tracklio<br/><span className="gradient-text">Press Room</span>
              </h1>
              <p style={{fontSize:15,color:"var(--t2)",fontWeight:500,maxWidth:500,lineHeight:1.8}}>
                Download brand assets, read our story, and get in touch with the team for media enquiries, interviews, and story ideas.
              </p>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-start",marginTop:8}}>
              <button className="btn-primary" onClick={()=>handleDownload("Full Press Kit")}>
                ⬇ Download Press Kit
              </button>
              <a href="mailto:press@tracklio.app" className="btn-ghost">📧 press@tracklio.app</a>
            </div>
          </div>
        </div>

        {/* Key facts */}
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:48}}>
          {KEY_FACTS.map(f=>(
            <div key={f.label} className="stat-pill">
              <div style={{fontSize:20,fontWeight:900,letterSpacing:-0.5,color:f.color}}>{f.num}</div>
              <div style={{fontSize:10,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:0.8,marginTop:4}}>{f.label}</div>
            </div>
          ))}
        </div>

        {/* Company overview */}
        <div className="card fade-up" style={{marginBottom:40,background:"linear-gradient(135deg,rgba(124,58,237,.06),rgba(245,158,11,.04))",border:"1px solid rgba(124,58,237,.18)"}}>
          <div style={{fontSize:11,fontWeight:800,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:14}}>Company Boilerplate</div>
          <p style={{fontSize:14,color:"var(--t2)",lineHeight:1.85,fontWeight:500}}>
            <strong style={{color:"var(--t1)"}}>Tracklio</strong> is an AI-powered productivity platform that helps individuals manage their tasks, finances, and habits in one unified interface. Founded in Nairobi, Kenya in 2024, Tracklio has grown to serve over 12,400 active users across East Africa. The company's AI engine delivers personalised productivity scores, financial insights, and habit coaching — making enterprise-grade productivity tools accessible to the global majority. Tracklio is backed by seed funding of KES 15M and is currently raising its Series A to expand across sub-Saharan Africa.
          </p>
          <button className="btn-ghost" style={{marginTop:16}} onClick={()=>navigator.clipboard.writeText("Tracklio is an AI-powered productivity platform…").then(()=>alert("Copied!"))}>
            📋 Copy boilerplate
          </button>
        </div>

        {/* Brand assets */}
        <div style={{marginBottom:48}}>
          <h2 style={{fontWeight:800,fontSize:22,letterSpacing:-0.6,marginBottom:8}}>Brand Assets</h2>
          <p style={{fontSize:13,color:"var(--t3)",fontWeight:500,marginBottom:20}}>All assets are free to use with appropriate attribution. See brand guidelines for usage rules.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
            {ASSETS.map((a,i) => (
              <div key={a.label} className="asset-card fade-up" style={{animationDelay:`${i*40}ms`}} onClick={()=>handleDownload(a.label)}>
                <div className="asset-preview" style={{background:a.bg}}>{a.icon}</div>
                <div style={{padding:"12px 14px"}}>
                  <div style={{fontWeight:700,fontSize:12,marginBottom:4}}>{a.label}</div>
                  <div style={{fontSize:11,color:"var(--t3)",fontWeight:500}}>{a.desc}</div>
                  <div style={{marginTop:10,fontSize:11,fontWeight:700,color:"var(--vl)"}}>⬇ Download</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand colours */}
        <div className="card fade-up" style={{marginBottom:40}}>
          <h3 style={{fontWeight:800,fontSize:16,marginBottom:18}}>Brand Colours</h3>
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            {[
              {name:"Violet",    hex:"#7C3AED",use:"Primary / CTA"},
              {name:"Violet Lt", hex:"#8B5CF6",use:"Accents"},
              {name:"Cyan",      hex:"#06B6D4",use:"Secondary"},
              {name:"Emerald",   hex:"#10B981",use:"Success / Income"},
              {name:"Rose",      hex:"#F43F5E",use:"Alerts / Expenses"},
              {name:"Amber",     hex:"#F59E0B",use:"Warnings"},
              {name:"Dark BG",   hex:"#080810",use:"Main background"},
              {name:"Card BG",   hex:"#14141F",use:"Card surface"},
            ].map(c=>(
              <div key={c.name} style={{display:"flex",flex:"1",minWidth:100,flexDirection:"column",gap:8}}>
                <div style={{height:52,borderRadius:10,background:c.hex,boxShadow:`0 4px 14px ${c.hex}44`}}/>
                <div style={{fontSize:12,fontWeight:700}}>{c.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <code style={{fontSize:11,background:"var(--d4)",padding:"2px 7px",borderRadius:5,color:"#67E8F9",fontFamily:"monospace"}}>{c.hex}</code>
                </div>
                <div style={{fontSize:10,color:"var(--t3)",fontWeight:600}}>{c.use}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage */}
        <div style={{marginBottom:48}}>
          <h2 style={{fontWeight:800,fontSize:22,letterSpacing:-0.6,marginBottom:20}}>Media Coverage</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {COVERAGE.map((c,i)=>(
              <div key={i} className="coverage-item fade-up" style={{animationDelay:`${i*50}ms`}}>
                <div style={{width:44,height:44,borderRadius:12,background:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{c.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{fontWeight:800,fontSize:13,color:"var(--vl)"}}>{c.outlet}</span>
                    <span style={{padding:"2px 9px",borderRadius:7,background:"rgba(255,255,255,.06)",fontSize:10,fontWeight:700,color:"var(--t3)"}}>{c.tag}</span>
                    <span style={{fontSize:11,color:"var(--t3)",fontWeight:500}}>{c.date}</span>
                  </div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--t1)",lineHeight:1.5}}>{c.title}</div>
                </div>
                <a href="#" style={{padding:"7px 14px",background:"var(--g)",border:"1px solid var(--gb)",borderRadius:9,fontSize:11,fontWeight:700,color:"var(--t2)",textDecoration:"none",flexShrink:0,transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.color="var(--t1)";e.currentTarget.style.borderColor="rgba(255,255,255,.15)"}}
                  onMouseLeave={e=>{e.currentTarget.style.color="var(--t2)";e.currentTarget.style.borderColor="var(--gb)"}}>
                  Read →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Media enquiry form */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
          <div className="card">
            <h3 style={{fontWeight:800,fontSize:17,marginBottom:6}}>Media Enquiry</h3>
            <p style={{fontSize:12,color:"var(--t2)",marginBottom:18,fontWeight:500}}>Interview requests, story pitches, product demos. We respond within 4 business hours.</p>
            {sent ? (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:40,marginBottom:10}}>📬</div>
                <div style={{fontWeight:800,fontSize:16,marginBottom:8}}>Enquiry received!</div>
                <p style={{fontSize:13,color:"var(--t2)"}}>We'll get back to you at <strong style={{color:"var(--t1)"}}>{form.email}</strong> within 4 hours.</p>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <label style={{fontSize:10,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:5}}>Name *</label>
                    <input className="input-field" placeholder="Jane Smith" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={{fontSize:10,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:5}}>Email *</label>
                    <input className="input-field" type="email" placeholder="jane@outlet.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
                  </div>
                </div>
                <div>
                  <label style={{fontSize:10,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:5}}>Publication / Outlet</label>
                  <input className="input-field" placeholder="TechCrunch, Reuters, etc." value={form.outlet} onChange={e=>setForm(p=>({...p,outlet:e.target.value}))}/>
                </div>
                <div>
                  <label style={{fontSize:10,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:5}}>Message</label>
                  <textarea className="textarea-field" placeholder="Tell us about your story…" value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} style={{minHeight:80}}/>
                </div>
                <button className="btn-primary" onClick={handleSend} disabled={sending||!form.name.trim()||!form.email.trim()} style={{width:"100%",justifyContent:"center"}}>
                  {sending?"Sending…":"Submit Enquiry →"}
                </button>
              </div>
            )}
          </div>

          {/* Quick contacts */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="card">
              <h3 style={{fontWeight:800,fontSize:15,marginBottom:14}}>Press Contacts</h3>
              {[
                { name:"Amara Osei",    role:"CEO (Interviews)",    email:"ceo@tracklio.app",   emoji:"👩‍💼" },
                { name:"Press Team",    role:"General media",       email:"press@tracklio.app", emoji:"📰" },
                { name:"Partnerships", role:"Business enquiries",   email:"biz@tracklio.app",   emoji:"🤝" },
              ].map(c=>(
                <div key={c.name} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <div style={{width:36,height:36,borderRadius:50,background:"rgba(124,58,237,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
                    <div style={{fontSize:10,color:"var(--t3)",fontWeight:600}}>{c.role}</div>
                  </div>
                  <a href={`mailto:${c.email}`} style={{fontSize:11,fontWeight:700,color:"var(--vl)",textDecoration:"none"}}>{c.email}</a>
                </div>
              ))}
            </div>
            <div className="card" style={{background:"linear-gradient(135deg,rgba(124,58,237,.08),rgba(6,182,212,.05))",border:"1px solid rgba(124,58,237,.2)"}}>
              <div style={{fontSize:11,fontWeight:800,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Press response SLA</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[["Breaking / urgent","&lt; 2 hours","var(--r)"],["Interview requests","4 business hours","var(--a)"],["Asset requests","Same day","var(--e)"],["General enquiries","1 business day","var(--c)"]].map(([type,time,color])=>(
                  <div key={type} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                    <span style={{color:"var(--t2)",fontWeight:500}} dangerouslySetInnerHTML={{__html:type}}/>
                    <span style={{fontWeight:700,color}} dangerouslySetInnerHTML={{__html:time}}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}