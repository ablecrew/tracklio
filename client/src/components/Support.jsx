import { useEffect, useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--v:#7C3AED;--vl:#8B5CF6;--c:#06B6D4;--cl:#22D3EE;--e:#10B981;--r:#F43F5E;--a:#F59E0B;--d1:#080810;--d2:#0E0E18;--d3:#14141F;--d4:#1A1A28;--d5:#222235;--g:rgba(255,255,255,0.04);--gb:rgba(255,255,255,0.07);--t1:#F0F0FF;--t2:#9090B8;--t3:#505075;}
  html,body{font-family:'Montserrat',sans-serif;background:var(--d1);color:var(--t1)}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--d5);border-radius:99px}
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .orb1{width:600px;height:600px;background:var(--e);top:-200px;right:-150px;opacity:.08}
  .orb2{width:500px;height:500px;background:var(--v);bottom:-100px;left:-150px;opacity:.09}
  @keyframes float-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .45s ease both}
  .gradient-text{background:linear-gradient(90deg,var(--e),var(--c));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:20px;padding:22px;transition:border-color .25s,transform .25s}
  .card:hover{border-color:rgba(255,255,255,0.12);transform:translateY(-2px)}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6);background-size:300% 100%;animation:accent-flow 5s linear infinite;position:sticky;top:0;z-index:100}
  .input-field{width:100%;padding:12px 16px;background:var(--d4);border:1px solid var(--gb);border-radius:12px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:14px;font-weight:500;outline:none;transition:border-color .2s}
  .input-field:focus{border-color:var(--vl)}.input-field::placeholder{color:var(--t3)}
  .cat-btn{display:flex;align-items:center;gap:10px;padding:14px 16px;background:var(--d4);border:1px solid var(--gb);border-radius:13px;cursor:pointer;transition:all .2s;text-align:left;width:100%}
  .cat-btn:hover,.cat-btn.active{border-color:rgba(124,58,237,.35);background:rgba(124,58,237,.07)}
  .faq-item{background:var(--d4);border:1px solid var(--gb);border-radius:13px;overflow:hidden;transition:border-color .2s;margin-bottom:8px}
  .faq-item:hover{border-color:rgba(255,255,255,.12)}
  .faq-q{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;cursor:pointer;font-weight:600;font-size:14px}
  .faq-a{padding:0 18px 15px;font-size:13px;color:var(--t2);line-height:1.75;font-weight:500}
  .status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
  .feedback-btn{padding:6px 14px;border-radius:8px;border:none;cursor:pointer;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;transition:all .2s}
`;

const CATEGORIES = [
  { icon:"🚀", label:"Getting Started",    color:"rgba(124,58,237,.15)" },
  { icon:"✅", label:"Tasks",              color:"rgba(6,182,212,.15)"  },
  { icon:"💰", label:"Finance",            color:"rgba(16,185,129,.15)" },
  { icon:"🎯", label:"Habits",             color:"rgba(245,158,11,.15)" },
  { icon:"🤖", label:"AI Features",        color:"rgba(124,58,237,.15)" },
  { icon:"🔐", label:"Account & Security", color:"rgba(244,63,94,.15)"  },
  { icon:"💳", label:"Billing",            color:"rgba(16,185,129,.15)" },
  { icon:"📱", label:"Mobile",             color:"rgba(6,182,212,.15)"  },
];

const FAQS = {
  "Getting Started":[
    { q:"How do I create my Tracklio account?", a:"Click 'Get Started' on the homepage, enter your name, email, and password, then confirm your email. You'll be on the dashboard within 60 seconds." },
    { q:"Is Tracklio free to use?", a:"Yes! The free plan gives you unlimited tasks, up to 50 transactions/month, and basic AI insights. Pro unlocks unlimited transactions, advanced AI, and full reports." },
    { q:"Can I import data from other apps?", a:"Yes — you can import tasks from Todoist (CSV) and transactions from any bank via our CSV importer. Go to Settings → Import Data." },
    { q:"Does Tracklio work offline?", a:"Viewing your dashboard works offline via cached data. Creating and syncing tasks/transactions requires an internet connection." },
  ],
  "Tasks":[
    { q:"How do I set a due date for a task?", a:"Open any task → click 'Edit' (pencil icon) → set the Due Date field. Tasks past their due date automatically become 'Overdue'." },
    { q:"Can I assign priorities to tasks?", a:"Yes — every task can be set to High, Medium, or Low priority when creating or editing. The Task Manager page has a filter for priority." },
    { q:"How does the task completion rate work?", a:"It's calculated as: (completed tasks ÷ total tasks) × 100. The AI also factors in how quickly you complete tasks vs. their due dates." },
    { q:"Can I add notes or attachments to tasks?", a:"Notes are supported on every task. File attachments are on the Pro roadmap — expected Q3 2026." },
  ],
  "Finance":[
    { q:"How do I log an expense?", a:"Go to Finance → click '+ Add Transaction' → fill in title, amount, type (expense/income), category, and date. Your totals update instantly." },
    { q:"What categories are available?", a:"Food, Transport, Bills, Shopping, Health, Other (expenses) and Income. Custom categories are on the roadmap." },
    { q:"Can Tracklio connect to my bank?", a:"Direct bank sync (Open Banking) is coming in Q3 2026. Currently you log transactions manually or via CSV import." },
    { q:"How is the 'Budget Health' percentage calculated?", a:"It's (total expenses ÷ total income) × 100 for the selected period. Above 80% triggers a warning. Above 100% means you're in deficit." },
  ],
  "AI Features":[
    { q:"How does the AI productivity score work?", a:"Our AI analyses your task completion rate, timing patterns, financial health, and habit consistency to produce a score from 0–100. It's recalculated each time your dashboard loads." },
    { q:"Can I turn off AI features?", a:"Yes — go to Settings → AI Insights → toggle off. This stops all AI analysis. Your data will not be sent to OpenAI while disabled." },
    { q:"Does the AI learn my personal data?", a:"Your data is sent to OpenAI's API to generate insights but is not used to train AI models (per OpenAI's API data policy). The AI has no persistent memory between sessions." },
    { q:"Why are my AI insights sometimes generic?", a:"AI insights improve with more data. Add more tasks and transactions — after 2–3 weeks of usage, insights become noticeably more personalised." },
  ],
  "Account & Security":[
    { q:"How do I change my password?", a:"Settings → Account → Change Password. You'll need your current password. If you've forgotten it, use 'Forgot Password' on the login page." },
    { q:"How do I delete my account?", a:"Settings → Account → Delete Account. All your data is permanently deleted within 30 days. This action cannot be undone." },
    { q:"Is my data encrypted?", a:"Yes. Data in transit is encrypted via TLS 1.2+. Data at rest is encrypted via MongoDB Atlas. Passwords are hashed with bcrypt." },
    { q:"Can I use Tracklio on multiple devices?", a:"Yes — log in with the same credentials on any device. Data syncs in real-time via the API." },
  ],
  "Billing":[
    { q:"What's included in the Pro plan?", a:"Unlimited transactions, advanced AI insights, full reports, export (CSV/PDF), priority support, and all future Pro features." },
    { q:"Can I cancel my subscription?", a:"Yes, at any time via Settings → Billing → Cancel Subscription. You keep Pro access until the end of the billing period. No refunds for partial months." },
    { q:"What payment methods do you accept?", a:"Credit/debit cards (Visa, Mastercard), M-Pesa (Kenya), and PayPal. More African payment methods coming soon." },
    { q:"Do you offer discounts for students?", a:"Yes — 50% off Pro with a valid student email (.ac.ke, .edu, etc.). Apply at tracklio.app/student." },
  ],
};

const STATUS_ITEMS = [
  { service:"API & Core Services",     status:"operational" },
  { service:"AI Insights Engine",      status:"operational" },
  { service:"Authentication",          status:"operational" },
  { service:"Database (MongoDB)",       status:"operational" },
  { service:"File Storage",            status:"degraded"    },
];

export default function Support() {
  useEffect(()=>{
    const id="trkl-support";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [search,    setSearch]    = useState("");
  const [activecat, setActivecat] = useState("Getting Started");
  const [openFAQ,   setOpenFAQ]   = useState(null);
  const [helpful,   setHelpful]   = useState({});

  const statusColor = s => s==="operational"?"var(--e)":s==="degraded"?"var(--a)":"var(--r)";
  const statusLabel = s => s==="operational"?"Operational":s==="degraded"?"Degraded":"Outage";

  const allFAQs = Object.entries(FAQS).flatMap(([cat,qs])=>qs.map(q=>({...q,cat})));
  const filteredFAQs = search
    ? allFAQs.filter(f=>f.q.toLowerCase().includes(search.toLowerCase())||f.a.toLowerCase().includes(search.toLowerCase()))
    : FAQS[activecat]||[];

  return (
    <div style={{minHeight:"100vh",background:"var(--d1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="nav-accent"/>

      <div style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"60px 28px 80px"}}>

        {/* Hero + search */}
        <div className="fade-up" style={{textAlign:"center",marginBottom:44}}>
          <h1 style={{fontWeight:900,fontSize:42,letterSpacing:-1.5,marginBottom:14}}>
            How can we <span className="gradient-text">help?</span>
          </h1>
          <p style={{fontSize:14,color:"var(--t2)",fontWeight:500,marginBottom:28}}>Search our knowledge base or browse by category</p>
          <div style={{position:"relative",maxWidth:560,margin:"0 auto"}}>
            <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"var(--t3)"}}>🔍</span>
            <input className="input-field" style={{paddingLeft:44,fontSize:15}} placeholder="e.g. how to delete a task, change password, export CSV…"
              value={search} onChange={e=>{setSearch(e.target.value);if(e.target.value) setOpenFAQ(null);}}/>
          </div>
        </div>

        {/* Status bar */}
        <div className="card fade-up" style={{marginBottom:32,animationDelay:"80ms"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"var(--e)",display:"inline-block",animation:"pulse 2.5s infinite"}}/>
              System Status
            </div>
            <span style={{fontSize:11,fontWeight:700,color:"var(--e)",background:"rgba(16,185,129,.1)",padding:"3px 10px",borderRadius:20}}>All systems go</span>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {STATUS_ITEMS.map(s=>(
              <div key={s.service} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 12px",background:"var(--d4)",borderRadius:10}}>
                <span className="status-dot" style={{background:statusColor(s.status),boxShadow:`0 0 6px ${statusColor(s.status)}`}}/>
                <span style={{fontSize:11,fontWeight:600,color:"var(--t2)"}}>{s.service}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search results */}
        {search ? (
          <div>
            <div style={{fontSize:13,color:"var(--t3)",fontWeight:600,marginBottom:14}}>{filteredFAQs.length} result{filteredFAQs.length!==1?"s":""} for "{search}"</div>
            {filteredFAQs.length===0 ? (
              <div style={{textAlign:"center",padding:"40px 0",color:"var(--t3)",fontSize:14}}>
                No results found. <a href="/contact" style={{color:"var(--vl)"}}>Contact us directly →</a>
              </div>
            ) : filteredFAQs.map((f,i)=>(
              <div key={i} className="faq-item fade-up" style={{animationDelay:`${i*40}ms`}}>
                <div className="faq-q" onClick={()=>setOpenFAQ(openFAQ===`s${i}`?null:`s${i}`)}>
                  <span>{f.q}</span>
                  <span style={{color:"var(--t3)",fontSize:16,transform:openFAQ===`s${i}`?"rotate(180deg)":"none",transition:"transform .2s"}}>▼</span>
                </div>
                {openFAQ===`s${i}` && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:24,alignItems:"start"}}>
            {/* Category sidebar */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {CATEGORIES.map(cat=>(
                <button key={cat.label} className={`cat-btn ${activecat===cat.label?"active":""}`} onClick={()=>{setActivecat(cat.label);setOpenFAQ(null);}}>
                  <div style={{width:32,height:32,borderRadius:9,background:cat.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{cat.icon}</div>
                  <span style={{fontFamily:"Montserrat,sans-serif",fontSize:13,fontWeight:600,color:activecat===cat.label?"#C4B5FD":"var(--t2)"}}>{cat.label}</span>
                  <span style={{marginLeft:"auto",fontSize:11,color:"var(--t3)",fontWeight:700}}>{(FAQS[cat.label]||[]).length}</span>
                </button>
              ))}
            </div>

            {/* FAQ list */}
            <div>
              <div style={{fontWeight:800,fontSize:18,marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
                {CATEGORIES.find(c=>c.label===activecat)?.icon} {activecat}
              </div>
              {(FAQS[activecat]||[]).map((f,i)=>(
                <div key={i} className="faq-item fade-up" style={{animationDelay:`${i*50}ms`}}>
                  <div className="faq-q" onClick={()=>setOpenFAQ(openFAQ===i?null:i)}>
                    <span>{f.q}</span>
                    <span style={{color:"var(--t3)",fontSize:16,flexShrink:0,transition:"transform .2s",transform:openFAQ===i?"rotate(180deg)":"none"}}>▼</span>
                  </div>
                  {openFAQ===i && (
                    <div>
                      <div className="faq-a">{f.a}</div>
                      <div style={{padding:"0 18px 14px",display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:11,color:"var(--t3)",fontWeight:600}}>Was this helpful?</span>
                        {["👍","👎"].map(em=>(
                          <button key={em} className="feedback-btn"
                            style={{background:helpful[`${activecat}-${i}`]===em?"rgba(124,58,237,.2)":"var(--g)",border:`1px solid ${helpful[`${activecat}-${i}`]===em?"rgba(124,58,237,.4)":"var(--gb)"}`,color:helpful[`${activecat}-${i}`]===em?"#C4B5FD":"var(--t3)"}}
                            onClick={()=>setHelpful(p=>({...p,[`${activecat}-${i}`]:em}))}>
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact options */}
        <div style={{marginTop:48,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[
            { icon:"💬", title:"Live Chat",      sub:"Chat with our team in real-time",          action:"Start chat →",   color:"rgba(124,58,237,.15)", href:"#" },
            { icon:"📧", title:"Email Support",  sub:"support@tracklio.app · reply in <4h",      action:"Send email →",   color:"rgba(6,182,212,.15)",  href:"mailto:support@tracklio.app" },
            { icon:"📖", title:"Video Tutorials",sub:"Step-by-step guides for every feature",    action:"Watch now →",    color:"rgba(16,185,129,.15)", href:"#" },
          ].map(c=>(
            <a key={c.title} href={c.href} className="card" style={{display:"block",textDecoration:"none"}}>
              <div style={{width:44,height:44,borderRadius:12,background:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:12}}>{c.icon}</div>
              <div style={{fontWeight:800,fontSize:15,marginBottom:6}}>{c.title}</div>
              <div style={{fontSize:12,color:"var(--t2)",marginBottom:12,lineHeight:1.65,fontWeight:500}}>{c.sub}</div>
              <div style={{fontSize:12,fontWeight:700,color:"var(--vl)"}}>{c.action}</div>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}