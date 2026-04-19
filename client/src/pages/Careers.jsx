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
  .orb1{width:600px;height:600px;background:var(--v);top:-200px;right:-150px;opacity:.10}
  .orb2{width:500px;height:500px;background:var(--c);bottom:-100px;left:-150px;opacity:.08}
  @keyframes float-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .45s ease both}
  .gradient-text{background:linear-gradient(90deg,var(--vl),var(--cl));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:20px;padding:24px;transition:border-color .25s,transform .25s}
  .card:hover{border-color:rgba(255,255,255,0.13);transform:translateY(-2px)}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6);background-size:300% 100%;animation:accent-flow 5s linear infinite;position:sticky;top:0;z-index:100}
  .job-card{background:var(--d3);border:1px solid var(--gb);border-radius:16px;padding:22px 24px;cursor:pointer;transition:all .25s}
  .job-card:hover{border-color:rgba(124,58,237,.4);transform:translateY(-2px);box-shadow:0 12px 40px rgba(124,58,237,.12)}
  .filter-btn{padding:7px 16px;border-radius:9px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
  .filter-btn.active{background:var(--v);color:#fff}
  .filter-btn:not(.active){background:transparent;color:var(--t3)}
  .filter-btn:not(.active):hover{color:var(--t1)}
  .input-field{width:100%;padding:11px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .input-field:focus{border-color:var(--vl)}
  .input-field::placeholder{color:var(--t3)}
  .textarea-field{width:100%;padding:11px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s;resize:vertical;min-height:100px}
  .textarea-field:focus{border-color:var(--vl)}
  .btn-primary{padding:12px 24px;background:linear-gradient(135deg,var(--v),var(--c));border:none;border-radius:11px;color:#fff;font-family:'Montserrat',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s}
  .btn-primary:hover{opacity:.88;transform:scale(1.02)}
  .btn-primary:disabled{opacity:.4;cursor:not-allowed;transform:none}
  .btn-ghost{padding:10px 20px;background:var(--g);border:1px solid var(--gb);border-radius:11px;color:var(--t2);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
  .btn-ghost:hover{background:var(--gb);color:var(--t1)}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;z-index:1000;animation:float-up .2s ease}
  .perk-item{display:flex;align-items:flex-start;gap:12px;padding:14px;background:var(--d4);border-radius:12px}
  .tag{padding:3px 10px;border-radius:7px;font-size:11px;font-weight:700}
`;

const DEPARTMENTS = ["All","Engineering","Design","Product","Growth","Operations","AI/ML"];

const JOBS = [
  { id:1,  title:"Senior Full-Stack Engineer",   dept:"Engineering", type:"Full-time", location:"Nairobi / Remote",    level:"Senior",  salary:"KES 250–380K/mo", description:"Build the core platform. Own features end-to-end from API to UI. Node.js, React, MongoDB stack.",  requirements:["4+ yrs Node.js/React","MongoDB experience","REST API design","Bonus: AI/ML familiarity"] },
  { id:2,  title:"AI/ML Engineer",               dept:"AI/ML",       type:"Full-time", location:"Remote (EA timezone)", level:"Mid-Senior",salary:"KES 300–450K/mo", description:"Own the intelligence layer. Build and improve our productivity scoring models and OpenAI integrations.", requirements:["Python + LangChain/OpenAI API","ML model deployment","Data pipeline experience","NLP background preferred"] },
  { id:3,  title:"Product Designer",             dept:"Design",      type:"Full-time", location:"Nairobi",             level:"Mid",     salary:"KES 150–220K/mo", description:"Design the future of Tracklio. Own the design system, run user research, and ship beautiful UIs.",     requirements:["Figma expert","Design system experience","User research skills","Dark UI portfolio preferred"] },
  { id:4,  title:"Growth Engineer",              dept:"Growth",      type:"Full-time", location:"Remote",              level:"Mid",     salary:"KES 180–260K/mo", description:"Own our growth loops. Build referral systems, analytics dashboards, A/B testing infrastructure.",        requirements:["React + analytics stack","Experimentation frameworks","SQL proficiency","Startup experience"] },
  { id:5,  title:"Product Manager",              dept:"Product",     type:"Full-time", location:"Nairobi",             level:"Senior",  salary:"KES 200–320K/mo", description:"Drive roadmap for our core productivity features. Work directly with founders.",                         requirements:["3+ yrs PM experience","B2C product background","Data-driven decision making","Africa market context"] },
  { id:6,  title:"Customer Success Lead",        dept:"Operations",  type:"Full-time", location:"Nairobi",             level:"Mid",     salary:"KES 100–160K/mo", description:"Own user onboarding, support, and retention. Be the voice of the user internally.",                   requirements:["Customer-facing experience","Excellent written English + Swahili","Empathy-first mindset","CRM tools"] },
  { id:7,  title:"Frontend Engineer (React)",    dept:"Engineering", type:"Full-time", location:"Remote",              level:"Mid",     salary:"KES 180–280K/mo", description:"Build stunning, performant UIs. Own the component library and design system implementation.",            requirements:["React + TypeScript","CSS animations","Performance optimisation","Tailwind/styled-components"] },
  { id:8,  title:"DevOps / Infrastructure Eng.", dept:"Engineering", type:"Full-time", location:"Remote",              level:"Senior",  salary:"KES 220–350K/mo", description:"Own our cloud infrastructure, CI/CD pipelines, and reliability engineering.",                          requirements:["AWS/GCP","Docker + Kubernetes","CI/CD (GitHub Actions)","MongoDB Atlas ops"] },
];

const PERKS = [
  { icon:"💰", label:"Competitive Pay",     desc:"Market-rate salaries benchmarked quarterly. Equity for all full-time team members." },
  { icon:"🏡", label:"Remote-First",        desc:"Work from anywhere in Africa (EA/WAT timezone). 2 in-person summits per year." },
  { icon:"🏥", label:"Health Cover",        desc:"Comprehensive medical + dental for you and one dependent." },
  { icon:"📚", label:"Learning Budget",     desc:"KES 50,000/year for courses, books, conferences, anything that makes you better." },
  { icon:"💻", label:"Top-Tier Equipment",  desc:"MacBook Pro + any peripherals you need. We invest in your workspace." },
  { icon:"🎯", label:"Real Impact",         desc:"Your work ships to 12,000+ real people. No fake projects, no internal tools nobody uses." },
  { icon:"🍼", label:"Parental Leave",      desc:"16 weeks fully paid for primary caregiver, 8 weeks for secondary — regardless of gender." },
  { icon:"🔥", label:"Burn Carefully",     desc:"No crunch culture. Sustainable pace, async-first, respect for your evenings and weekends." },
];

export default function Careers() {
  useEffect(() => {
    const id="trkl-careers";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [dept,    setDept]    = useState("All");
  const [search,  setSearch]  = useState("");
  const [viewJob, setViewJob] = useState(null);
  const [applying,setApplying]= useState(false);
  const [form,    setForm]    = useState({ name:"", email:"", role:"", linkedin:"", why:"", file:null });
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);

  const filtered = JOBS.filter(j =>
    (dept === "All" || j.dept === dept) &&
    (!search || j.title.toLowerCase().includes(search.toLowerCase()))
  );

  const openApply = (job) => { setForm(p => ({...p, role:job.title})); setViewJob(null); setApplying(true); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.why.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1400)); // simulate API
    setSent(true); setSending(false);
  };

  const levelColor = l => l==="Senior"?"rgba(124,58,237,.15)":l==="Mid-Senior"?"rgba(6,182,212,.15)":"rgba(16,185,129,.15)";
  const levelText  = l => l==="Senior"?"#C4B5FD":l==="Mid-Senior"?"#67E8F9":"#6EE7B7";

  return (
    <div style={{minHeight:"100vh",background:"var(--d1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="nav-accent"/>

      <div style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"60px 28px 80px"}}>

        {/* Hero */}
        <div className="fade-up" style={{textAlign:"center",marginBottom:56}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 16px",background:"rgba(16,185,129,.1)",border:"1px solid rgba(16,185,129,.25)",borderRadius:20,marginBottom:18}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--e)",animation:"pulse 2s infinite",display:"inline-block"}}/>
            <span style={{fontSize:11,fontWeight:700,color:"var(--e)",textTransform:"uppercase",letterSpacing:1.2}}>We're Hiring</span>
          </div>
          <h1 style={{fontWeight:900,fontSize:44,letterSpacing:-2,lineHeight:1.1,marginBottom:18}}>
            Build the future of<br/><span className="gradient-text">African productivity</span>
          </h1>
          <p style={{fontSize:15,color:"var(--t2)",fontWeight:500,maxWidth:560,margin:"0 auto",lineHeight:1.8}}>
            We're a small team doing outsized work. If you want to build something that genuinely changes how people live and work, this is your place.
          </p>
          <div style={{display:"flex",gap:24,justifyContent:"center",marginTop:24,flexWrap:"wrap"}}>
            {[["🌍","Remote-first"],["💰","Competitive pay"],["🚀","Real impact"],["🏥","Full benefits"]].map(([ic,lb]) => (
              <div key={lb} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:600,color:"var(--t2)"}}>
                <span>{ic}</span>{lb}
              </div>
            ))}
          </div>
        </div>

        {/* Search + filter */}
        <div style={{display:"flex",gap:16,marginBottom:28,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:1,minWidth:200}}>
            <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"var(--t3)"}}>🔍</span>
            <input className="input-field" placeholder="Search roles…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:38}}/>
          </div>
          <div style={{display:"flex",gap:4,background:"var(--d3)",borderRadius:12,padding:4,flexWrap:"wrap"}}>
            {DEPARTMENTS.map(d => (
              <button key={d} className={`filter-btn ${dept===d?"active":""}`} onClick={()=>setDept(d)}>{d}</button>
            ))}
          </div>
        </div>

        {/* Job count */}
        <div style={{fontSize:13,color:"var(--t3)",fontWeight:600,marginBottom:16}}>
          {filtered.length} open position{filtered.length!==1?"s":""} {dept!=="All"?`in ${dept}`:""}
        </div>

        {/* Job listings */}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:60}}>
          {filtered.map((job,i) => (
            <div key={job.id} className="job-card fade-up" style={{animationDelay:`${i*50}ms`}} onClick={()=>setViewJob(job)}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:800,fontSize:16,marginBottom:8}}>{job.title}</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <span className="tag" style={{background:"rgba(124,58,237,.12)",color:"#C4B5FD"}}>{job.dept}</span>
                    <span className="tag" style={{background:"rgba(6,182,212,.1)",color:"#67E8F9"}}>{job.type}</span>
                    <span className="tag" style={{background:"rgba(255,255,255,.05)",color:"var(--t2)"}}>📍 {job.location}</span>
                    <span className="tag" style={{background:levelColor(job.level),color:levelText(job.level)}}>{job.level}</span>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,fontSize:14,color:"var(--e)"}}>{job.salary}</div>
                    <div style={{fontSize:10,color:"var(--t3)",fontWeight:600,marginTop:2}}>per month</div>
                  </div>
                  <div style={{padding:"8px 16px",background:"rgba(124,58,237,.12)",border:"1px solid rgba(124,58,237,.25)",borderRadius:10,fontSize:12,fontWeight:700,color:"#C4B5FD",cursor:"pointer"}}>
                    View →
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0 && (
            <div style={{textAlign:"center",padding:"40px 0",color:"var(--t3)",fontSize:14}}>No roles match your search. <a href="#" onClick={()=>{setDept("All");setSearch("");}} style={{color:"var(--vl)"}}>Clear filters</a></div>
          )}
        </div>

        {/* Perks */}
        <h2 style={{fontWeight:800,fontSize:24,letterSpacing:-0.6,marginBottom:20}}>Why Tracklio?</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:56}}>
          {PERKS.map((p,i) => (
            <div key={p.label} className="card fade-up" style={{animationDelay:`${i*40}ms`}}>
              <div style={{fontSize:26,marginBottom:10}}>{p.icon}</div>
              <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{p.label}</div>
              <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.65,fontWeight:500}}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* General apply CTA */}
        <div className="card" style={{textAlign:"center",padding:"40px 28px",background:"linear-gradient(135deg,rgba(124,58,237,.08),rgba(6,182,212,.06))",border:"1px solid rgba(124,58,237,.22)"}}>
          <h3 style={{fontWeight:800,fontSize:22,marginBottom:10}}>Don't see your role?</h3>
          <p style={{fontSize:13,color:"var(--t2)",marginBottom:22,maxWidth:480,margin:"0 auto 22px"}}>We're always looking for exceptional people. Send us a general application and tell us how you'd contribute.</p>
          <button className="btn-primary" onClick={()=>{setForm({name:"",email:"",role:"General Application",linkedin:"",why:"",file:null});setApplying(true);}}>
            Apply Anyway →
          </button>
        </div>

      </div>

      {/* Job detail modal */}
      {viewJob && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setViewJob(null)}>
          <div style={{background:"var(--d3)",border:"1px solid var(--gb)",borderRadius:24,padding:32,width:560,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 30px 80px rgba(0,0,0,.65)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <h2 style={{fontWeight:800,fontSize:20,marginBottom:8}}>{viewJob.title}</h2>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  <span className="tag" style={{background:"rgba(124,58,237,.12)",color:"#C4B5FD"}}>{viewJob.dept}</span>
                  <span className="tag" style={{background:"rgba(6,182,212,.1)",color:"#67E8F9"}}>{viewJob.location}</span>
                  <span className="tag" style={{background:"rgba(16,185,129,.1)",color:"#6EE7B7",fontSize:12,fontWeight:800}}>{viewJob.salary}</span>
                </div>
              </div>
              <button onClick={()=>setViewJob(null)} style={{background:"none",border:"none",color:"var(--t3)",cursor:"pointer",fontSize:20,lineHeight:1}}>✕</button>
            </div>
            <p style={{fontSize:14,color:"var(--t2)",lineHeight:1.75,fontWeight:500,marginBottom:20}}>{viewJob.description}</p>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:800,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Requirements</div>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
                {viewJob.requirements.map(r => (
                  <li key={r} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,color:"var(--t2)",fontWeight:500}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:"var(--vl)",flexShrink:0}}/>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-ghost" style={{flex:1}} onClick={()=>setViewJob(null)}>Close</button>
              <button className="btn-primary" style={{flex:2}} onClick={()=>openApply(viewJob)}>Apply for this role →</button>
            </div>
          </div>
        </div>
      )}

      {/* Apply modal */}
      {applying && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setApplying(false)}>
          <div style={{background:"var(--d3)",border:"1px solid var(--gb)",borderRadius:24,padding:32,width:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 30px 80px rgba(0,0,0,.65)"}}>
            {sent ? (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:52,marginBottom:16}}>🎉</div>
                <h3 style={{fontWeight:800,fontSize:20,marginBottom:10}}>Application received!</h3>
                <p style={{fontSize:13,color:"var(--t2)",lineHeight:1.7,marginBottom:24}}>Thanks for applying for <strong style={{color:"var(--t1)"}}>{form.role}</strong>. We read every application personally and will get back to you within 5 business days.</p>
                <button className="btn-primary" onClick={()=>{setApplying(false);setSent(false);}}>Done</button>
              </div>
            ) : (
              <>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:22}}>
                  <h2 style={{fontWeight:800,fontSize:18}}>Apply — {form.role}</h2>
                  <button onClick={()=>setApplying(false)} style={{background:"none",border:"none",color:"var(--t3)",cursor:"pointer",fontSize:20}}>✕</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:13}}>
                  {[{k:"name",l:"Full Name *",p:"Jane Muthoni"},{k:"email",l:"Email *",p:"jane@example.com"},{k:"linkedin",l:"LinkedIn / Portfolio URL",p:"https://linkedin.com/in/…"}].map(({k,l,p}) => (
                    <div key={k}>
                      <label style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:6}}>{l}</label>
                      <input className="input-field" placeholder={p} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}/>
                    </div>
                  ))}
                  <div>
                    <label style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:6}}>Why Tracklio? *</label>
                    <textarea className="textarea-field" placeholder="Tell us what excites you about this role and what you'd bring to the team…" value={form.why} onChange={e=>setForm(p=>({...p,why:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:6}}>CV / Resume (optional)</label>
                    <input type="file" accept=".pdf,.doc,.docx" style={{fontSize:12,color:"var(--t2)",fontFamily:"Montserrat,sans-serif"}} onChange={e=>setForm(p=>({...p,file:e.target.files[0]}))}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:22}}>
                  <button className="btn-ghost" style={{flex:1}} onClick={()=>setApplying(false)}>Cancel</button>
                  <button className="btn-primary" style={{flex:2}} onClick={handleSubmit} disabled={sending||!form.name.trim()||!form.email.trim()||!form.why.trim()}>
                    {sending?"Sending…":"Submit Application →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}