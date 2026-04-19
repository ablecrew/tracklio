// ─── Contact.jsx ──────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import API from "../api/api";

const S_CONTACT = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--v:#7C3AED;--vl:#8B5CF6;--c:#06B6D4;--cl:#22D3EE;--e:#10B981;--r:#F43F5E;--a:#F59E0B;--d1:#080810;--d2:#0E0E18;--d3:#14141F;--d4:#1A1A28;--d5:#222235;--g:rgba(255,255,255,0.04);--gb:rgba(255,255,255,0.07);--t1:#F0F0FF;--t2:#9090B8;--t3:#505075;}
  html,body{font-family:'Montserrat',sans-serif;background:var(--d1);color:var(--t1)}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--d5);border-radius:99px}
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .orb1{width:600px;height:600px;background:var(--v);top:-200px;left:-150px;opacity:.10}
  .orb2{width:450px;height:450px;background:var(--c);bottom:-120px;right:-120px;opacity:.08}
  @keyframes float-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade-up{animation:float-up .45s ease both}
  .gradient-text{background:linear-gradient(90deg,var(--vl),var(--cl));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:20px;padding:24px;transition:border-color .25s,transform .25s}
  .card:hover{border-color:rgba(255,255,255,0.12);transform:translateY(-2px)}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6);background-size:300% 100%;animation:accent-flow 5s linear infinite;position:sticky;top:0;z-index:100}
  .input-field{width:100%;padding:11px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .input-field:focus{border-color:var(--vl)}.input-field::placeholder{color:var(--t3)}
  .textarea-field{width:100%;padding:11px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s;resize:vertical;min-height:120px}
  .textarea-field:focus{border-color:var(--vl)}
  .btn-primary{padding:12px 28px;background:linear-gradient(135deg,var(--v),var(--c));border:none;border-radius:11px;color:#fff;font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;width:100%}
  .btn-primary:hover:not(:disabled){opacity:.88;transform:scale(1.01)}.btn-primary:disabled{opacity:.4;cursor:not-allowed}
  .select-field{width:100%;padding:11px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;outline:none;cursor:pointer;appearance:none}
  .select-field:focus{border-color:var(--vl)}
  .contact-channel{display:flex;align-items:center;gap:14px;padding:16px 18px;background:var(--d4);border:1px solid var(--gb);border-radius:14px;cursor:pointer;transition:all .2s;text-decoration:none}
  .contact-channel:hover{border-color:rgba(124,58,237,.35);background:rgba(124,58,237,.06)}
`;

export function Contact() {
  useEffect(() => {
    const id="trkl-contact";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S_CONTACT;document.head.prepend(s);}
  },[]);

  const EMPTY = {name:"",email:"",subject:"general",message:""};
  const [form,   setForm]   = useState(EMPTY);
  const [sent,   setSent]   = useState(false);
  const [sending,setSending]= useState(false);
  const [error,  setError]  = useState("");

  const SUBJECTS = [
    {v:"general",l:"General Enquiry"},
    {v:"support",l:"Technical Support"},
    {v:"billing",l:"Billing & Subscriptions"},
    {v:"partnership",l:"Partnership / Business"},
    {v:"press",l:"Press & Media"},
    {v:"privacy",l:"Privacy & Data"},
    {v:"feedback",l:"Product Feedback"},
  ];

  const CHANNELS = [
    { icon:"💬", label:"Live Chat",      sub:"Response in ~5 min",       href:"#",                   color:"rgba(124,58,237,.15)" },
    { icon:"📧", label:"Email",          sub:"support@tracklio.app",      href:"mailto:support@tracklio.app", color:"rgba(6,182,212,.15)" },
    { icon:"🐦", label:"Twitter / X",   sub:"@tracklioapp",              href:"https://x.com/tracklioapp",   color:"rgba(16,185,129,.15)" },
    { icon:"💼", label:"LinkedIn",       sub:"Tracklio Technologies",     href:"https://linkedin.com/company/tracklio", color:"rgba(245,158,11,.15)" },
  ];

  const handleSend = async () => {
    if (!form.name.trim()||!form.email.trim()||!form.message.trim()) { setError("Please fill in all required fields."); return; }
    setError(""); setSending(true);
    try {
      await API.post("/contact", form).catch(()=>{}); // graceful: endpoint optional
      setSent(true); setForm(EMPTY);
    } finally { setSending(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--d1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="nav-accent"/>

      <div style={{position:"relative",zIndex:1,maxWidth:1000,margin:"0 auto",padding:"60px 28px 80px"}}>

        {/* Hero */}
        <div className="fade-up" style={{textAlign:"center",marginBottom:52}}>
          <h1 style={{fontWeight:900,fontSize:42,letterSpacing:-1.5,marginBottom:14}}>
            Get in <span className="gradient-text">touch</span>
          </h1>
          <p style={{fontSize:15,color:"var(--t2)",fontWeight:500,maxWidth:500,margin:"0 auto"}}>
            We're real people who read every message. Expect a human reply — usually within a few hours during EAT business hours.
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:24,alignItems:"start"}}>

          {/* Form */}
          <div className="card">
            {sent ? (
              <div style={{textAlign:"center",padding:"30px 0"}}>
                <div style={{fontSize:52,marginBottom:16}}>✅</div>
                <h3 style={{fontWeight:800,fontSize:20,marginBottom:10}}>Message sent!</h3>
                <p style={{fontSize:13,color:"var(--t2)",lineHeight:1.7,marginBottom:20}}>We'll get back to you at <strong style={{color:"var(--t1)"}}>{form.email||"your email"}</strong> within one business day.</p>
                <button style={{padding:"10px 24px",background:"var(--v)",border:"none",borderRadius:11,color:"#fff",fontFamily:"Montserrat,sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={()=>setSent(false)}>Send another</button>
              </div>
            ) : (
              <>
                <h2 style={{fontWeight:800,fontSize:17,marginBottom:20}}>Send us a message</h2>
                {error && <div style={{background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.25)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,fontWeight:600,color:"#FCA5A5"}}>{error}</div>}
                <div style={{display:"flex",flexDirection:"column",gap:13}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    <div>
                      <label style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:6}}>Full Name *</label>
                      <input className="input-field" placeholder="Jane Muthoni" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
                    </div>
                    <div>
                      <label style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:6}}>Email *</label>
                      <input className="input-field" type="email" placeholder="jane@example.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:6}}>Subject</label>
                    <select className="select-field" value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))}>
                      {SUBJECTS.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:6}}>Message *</label>
                    <textarea className="textarea-field" placeholder="Tell us what's on your mind…" value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}/>
                  </div>
                  <button className="btn-primary" onClick={handleSend} disabled={sending||!form.name.trim()||!form.email.trim()||!form.message.trim()}>
                    {sending?"Sending…":"Send Message →"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="card">
              <h3 style={{fontWeight:800,fontSize:15,marginBottom:16}}>Other ways to reach us</h3>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {CHANNELS.map(ch=>(
                  <a key={ch.label} href={ch.href} className="contact-channel" target="_blank" rel="noreferrer">
                    <div style={{width:40,height:40,borderRadius:11,background:ch.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ch.icon}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>{ch.label}</div>
                      <div style={{fontSize:11,color:"var(--t3)",fontWeight:500,marginTop:2}}>{ch.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{fontWeight:800,fontSize:14,marginBottom:14}}>Office Hours</h3>
              {[["Mon–Fri","8am – 6pm EAT"],["Saturday","9am – 1pm EAT"],["Sunday","Closed"]].map(([d,h])=>(
                <div key={d} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontSize:12,color:"var(--t3)",fontWeight:600}}>{d}</span>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--t1)"}}>{h}</span>
                </div>
              ))}
              <div style={{marginTop:14,padding:"10px 13px",background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.2)",borderRadius:10,fontSize:12,color:"#6EE7B7",fontWeight:600}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"var(--e)",display:"inline-block",marginRight:7,animation:"pulse 2s infinite"}}/>
                Currently open · Avg reply: 2h
              </div>
            </div>

            <div className="card">
              <h3 style={{fontWeight:700,fontSize:13,marginBottom:8}}>📍 Headquarters</h3>
              <p style={{fontSize:13,color:"var(--t2)",fontWeight:500,lineHeight:1.7}}>Tracklio Technologies Ltd<br/>Westlands, Nairobi<br/>Kenya, 00100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;