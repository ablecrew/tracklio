import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import { analyzeAI } from "../api/ai";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

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
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-thumb{background:var(--dark-5);border-radius:99px}
  .orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0}
  .orb-1{width:600px;height:600px;background:var(--violet);top:-200px;left:-150px;opacity:.12}
  .orb-2{width:500px;height:500px;background:var(--cyan);bottom:-120px;right:-150px;opacity:.10}
  .orb-3{width:350px;height:350px;background:var(--amber);bottom:20%;left:35%;opacity:.06}
  @keyframes float-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse-dot{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .4s ease both}
  .rpt-card{background:var(--dark-3);border:1px solid var(--glass-b);border-radius:20px;padding:22px;transition:border-color .25s,transform .25s}
  .rpt-card:hover{border-color:rgba(255,255,255,0.12)}
  .rpt-btn{padding:9px 18px;border:none;border-radius:10px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:7px;white-space:nowrap}
  .rpt-btn-primary{background:linear-gradient(135deg,var(--violet),var(--cyan));color:#fff}
  .rpt-btn-primary:hover{opacity:.88;transform:scale(1.03)}
  .rpt-btn-ghost{background:var(--glass);border:1px solid var(--glass-b)!important;color:var(--text-2)}
  .rpt-btn-ghost:hover{background:var(--glass-b);color:var(--text-1)}
  .rpt-tab{padding:7px 16px;border-radius:9px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
  .rpt-tab.active{background:var(--violet);color:#fff}
  .rpt-tab:not(.active){background:transparent;color:var(--text-3)}
  .rpt-tab:not(.active):hover{color:var(--text-1)}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6,#06B6D4);background-size:300% 100%;animation:accent-flow 5s linear infinite}
  .print-area{background:var(--dark-1)}
  @media print{
    body{background:#fff!important;color:#000!important}
    .no-print{display:none!important}
    .print-area{background:#fff!important}
    .rpt-card{border:1px solid #ddd!important;background:#fafafa!important}
  }
`;

const fmtKES  = n => `KES ${Number(n||0).toLocaleString("en-KE")}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-KE",{day:"2-digit",month:"short",year:"numeric"}) : "";

function Spinner() {
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:80}}><div style={{width:40,height:40,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.07)",borderTopColor:"var(--violet-light)",animation:"spin .8s linear infinite"}}/></div>;
}

function KpiCard({ icon, label, value, sub, color, change, changeUp, delay=0 }) {
  return (
    <div className="rpt-card fade-up" style={{animationDelay:`${delay}ms`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontSize:22}}>{icon}</span>
        {change !== undefined && (
          <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:8,background:changeUp?"rgba(16,185,129,.15)":"rgba(244,63,94,.15)",color:changeUp?"var(--emerald)":"var(--rose)"}}>
            {changeUp?"↑":"↓"} {change}
          </span>
        )}
      </div>
      <div style={{fontSize:10,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:1}}>{label}</div>
      <div style={{fontSize:24,fontWeight:900,letterSpacing:-0.8,marginTop:4,color}}>{value}</div>
      {sub && <div style={{fontSize:11,fontWeight:500,color:"var(--text-3)",marginTop:4}}>{sub}</div>}
    </div>
  );
}

export default function Reports() {
  useEffect(() => {
    const id="tracklio-rpt-styles";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [tasks,        setTasks]        = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [insights,     setInsights]     = useState([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [period,       setPeriod]       = useState("month");  // week | month | all
  const [activeSection,setActiveSection]= useState("overview");
  const printRef = useRef(null);

  /* ── Fetch all data ── */
  const fetchAll = async () => {
    setLoading(true); setError("");
    try {
      const [tRes, txRes] = await Promise.all([API.get("/tasks"), API.get("/transactions")]);
      const taskData = tRes.data  || [];
      const txData   = txRes.data || [];
      setTasks(taskData);
      setTransactions(txData);
      try {
        const ai = await analyzeAI(taskData, txData);
        setInsights(ai.insights || []);
        setProductivityScore(ai.productivityScore || 0);
      } catch {}
    } catch { setError("Failed to load report data."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  /* ── Period filter ── */
  const periodStart = () => {
    const d = new Date();
    if (period === "week")  { d.setDate(d.getDate()-7); return d; }
    if (period === "month") { d.setDate(d.getDate()-30); return d; }
    return new Date(0);
  };
  const inPeriod = date => !date || new Date(date) >= periodStart();

  const filteredTx   = transactions.filter(t => inPeriod(t.createdAt||t.date));
  const filteredTasks = tasks.filter(t => inPeriod(t.createdAt));

  /* ── KPI computations ── */
  const income   = filteredTx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses = filteredTx.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const savings  = income - expenses;
  const doneTasks= filteredTasks.filter(t=>t.status==="done").length;
  const completion = filteredTasks.length ? Math.round((doneTasks/filteredTasks.length)*100) : 0;
  const savingsRate = income > 0 ? Math.round((savings/income)*100) : 0;

  /* ── Chart data ── */
  /* Daily spending area chart */
  const dailySpend = (() => {
    const map = {};
    filteredTx.forEach(t => {
      const d = (t.createdAt||t.date||"").split("T")[0];
      if (!d) return;
      if (!map[d]) map[d] = { date:d, income:0, expenses:0 };
      if (t.type==="income") map[d].income += t.amount;
      else map[d].expenses += t.amount;
    });
    return Object.values(map).sort((a,b)=>a.date.localeCompare(b.date)).slice(-30);
  })();

  /* Category pie */
  const catPie = (() => {
    const COLORS = {food:"#FACC15",transport:"#84CC16",bills:"#38BDF8",shopping:"#F472B6",health:"#34D399",other:"#9090B8",income:"#10B981"};
    const map = {};
    filteredTx.filter(t=>t.type==="expense").forEach(t => {
      const c = t.category||"other";
      map[c] = (map[c]||0) + t.amount;
    });
    return Object.entries(map).map(([k,v])=>({name:k,value:v,color:COLORS[k]||"#9090B8"}));
  })();

  /* Weekly task completion */
  const weeklyTasks = (() => {
    const days = Array.from({length:7},(_,i)=>{
      const d=new Date(); d.setDate(d.getDate()-6+i);
      return d.toISOString().split("T")[0];
    });
    return days.map(d=>({
      day: new Date(d).toLocaleDateString("en-KE",{weekday:"short"}),
      done:    tasks.filter(t=>t.status==="done"&&t.completedAt?.split("T")[0]===d).length,
      created: tasks.filter(t=>t.createdAt?.split("T")[0]===d).length,
    }));
  })();

  /* ── Export CSV ── */
  const exportCSV = () => {
    const txRows = [["=== TRANSACTIONS ==="],["Date","Title","Type","Category","Amount (KES)"]];
    filteredTx.forEach(t=>txRows.push([fmtDate(t.createdAt||t.date),t.title,t.type||"",t.category||"",t.amount]));
    const taskRows = [[""],["=== TASKS ==="],["Title","Status","Priority","Category","Created","Completed"]];
    filteredTasks.forEach(t=>taskRows.push([t.title,t.status||"",t.priority||"",t.category||"",fmtDate(t.createdAt),fmtDate(t.completedAt)]));
    const csv = [...txRows,...taskRows].map(r=>r.join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download=`tracklio-report-${period}-${new Date().toISOString().split("T")[0]}.csv`; a.click();
  };

  /* ── Print ── */
  const printReport = () => window.print();

  /* ── Share (copy link) ── */
  const shareReport = () => {
    navigator.clipboard.writeText(window.location.href).then(()=>alert("Link copied to clipboard!")).catch(()=>{});
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if(!active||!payload?.length) return null;
    return (
      <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:12,padding:"10px 14px",fontFamily:"Montserrat",fontSize:12,fontWeight:700}}>
        {label&&<div style={{color:"var(--text-2)",marginBottom:4}}>{label}</div>}
        {payload.map((p,i)=><div key={i} style={{color:p.color||p.fill||"var(--violet-light)"}}>{p.name}: {typeof p.value==="number"&&p.value>1000?fmtKES(p.value):p.value}</div>)}
      </div>
    );
  };

  const sections = ["overview","finance","tasks","insights"];

  return (
    <div style={{minHeight:"100vh",background:"var(--dark-1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      <div ref={printRef} className="print-area" style={{position:"relative",zIndex:1,padding:"32px 28px 60px"}}>
        {/* Header */}
        <div className="fade-up no-print" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:28}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,var(--amber),var(--rose))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📊</div>
              <h1 style={{fontWeight:900,fontSize:24,letterSpacing:-0.8}}>Reports & Analytics</h1>
            </div>
            <p style={{fontSize:13,color:"var(--text-3)",fontWeight:500}}>
              Generated {new Date().toLocaleDateString("en-KE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
            </p>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="rpt-btn rpt-btn-ghost" onClick={shareReport}>🔗 Share</button>
            <button className="rpt-btn rpt-btn-ghost" onClick={printReport}>🖨 Print</button>
            <button className="rpt-btn rpt-btn-primary" onClick={exportCSV}>⬇ Download CSV</button>
          </div>
        </div>

        {/* Print-only title */}
        <div style={{display:"none"}} className="print-only">
          <h1 style={{fontSize:24,fontWeight:900,marginBottom:4}}>Tracklio Report</h1>
          <p style={{fontSize:13,color:"#666",marginBottom:24}}>Generated {fmtDate(new Date().toISOString())}</p>
        </div>

        {error && <div style={{background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.3)",borderRadius:12,padding:"12px 18px",marginBottom:20,color:"#FCA5A5",fontSize:13,fontWeight:600,display:"flex",justifyContent:"space-between",alignItems:"center"}}>⚠ {error}<button onClick={fetchAll} style={{background:"rgba(244,63,94,.2)",border:"none",borderRadius:8,padding:"5px 12px",color:"#FCA5A5",fontSize:12,fontWeight:700,cursor:"pointer"}}>Retry</button></div>}

        {/* Period + Section tabs */}
        <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:24}}>
          <div style={{display:"flex",gap:4,background:"var(--dark-3)",borderRadius:12,padding:4}}>
            {["week","month","all"].map(p=>(
              <button key={p} className={`rpt-tab ${period===p?"active":""}`} onClick={()=>setPeriod(p)} style={{textTransform:"capitalize"}}>{p==="all"?"All time":p==="week"?"7 days":"30 days"}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:4,background:"var(--dark-3)",borderRadius:12,padding:4}}>
            {sections.map(s=>(
              <button key={s} className={`rpt-tab ${activeSection===s?"active":""}`} onClick={()=>setActiveSection(s)} style={{textTransform:"capitalize"}}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? <Spinner/> : (
          <>
            {/* ── OVERVIEW ── */}
            {(activeSection==="overview"||activeSection==="all") && (
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:14,marginBottom:24}}>
                  <KpiCard icon="📋" label="Tasks Created"   value={filteredTasks.length}   color="var(--text-1)"       delay={0}/>
                  <KpiCard icon="✅" label="Tasks Done"      value={doneTasks}              color="var(--emerald)"      change={`${completion}%`} changeUp={completion>=50} delay={50}/>
                  <KpiCard icon="💰" label="Income"          value={fmtKES(income)}         color="var(--emerald)"      delay={100}/>
                  <KpiCard icon="💸" label="Expenses"        value={fmtKES(expenses)}       color="var(--rose)"         delay={150}/>
                  <KpiCard icon="🏦" label="Net Savings"     value={fmtKES(savings)}        color={savings>=0?"var(--emerald)":"var(--rose)"} delay={200}/>
                  <KpiCard icon="⚡" label="AI Score"        value={`${productivityScore}%`} color="var(--violet-light)" delay={250}/>
                </div>

                {/* Summary cards */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:24}}>
                  <div className="rpt-card fade-up" style={{animationDelay:"270ms"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Financial Health</div>
                    {[
                      { label: "Savings Rate", value: `${savingsRate}%`, color: savingsRate >= 20 ? "var(--emerald)" : savingsRate >= 10 ? "var(--amber)" : "var(--rose)", },
                      { label: "Income", value: fmtKES(income), color: "var(--emerald)" },
                      { label: "Expenses", value: fmtKES(expenses), color: "var(--rose)" },
                      { label: "Net", value: fmtKES(savings), color: savings >= 0 ? "var(--emerald)" : "var(--rose)" },
                     ].map((r) => (
                    <div
                      key={r.label}
                      style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                   }}
                 >
                  <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: r.color }}>
                    {r.value}
                  </span>
                </div>
                ))}
                  </div>
                  <div className="rpt-card fade-up" style={{animationDelay:"310ms"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Task Performance</div>
                    {[
                      {label:"Total Tasks",    value:filteredTasks.length},
                      {label:"Completed",      value:doneTasks, color:"var(--emerald)"},
                      {label:"Pending",        value:filteredTasks.filter(t=>t.status==="pending").length, color:"var(--cyan)"},
                      {label:"Completion Rate",value:`${completion}%`, color:completion>=70?"var(--emerald)":completion>=40?"var(--amber)":"var(--rose)"},
                    ].map(r=>(
                      <div key={r.label} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                        <span style={{fontSize:12,color:"var(--text-3)",fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:12,fontWeight:800,color:r.color||"var(--text-1)"}}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rpt-card fade-up" style={{animationDelay:"350ms"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>AI Productivity Score</div>
                    <div style={{textAlign:"center",padding:"10px 0"}}>
                      <div style={{fontSize:48,fontWeight:900,color:"var(--violet-light)",letterSpacing:-2}}>{productivityScore}%</div>
                      <div style={{fontSize:12,color:"var(--text-3)",marginTop:4}}>{productivityScore>=70?"On Track 🚀":productivityScore>=40?"Keep Going 💪":"Needs Focus ⚡"}</div>
                    </div>
                    <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:99,marginTop:10,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${productivityScore}%`,background:"linear-gradient(90deg,var(--violet),var(--cyan))",borderRadius:99,transition:"width 1.2s ease"}}/>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── FINANCE SECTION ── */}
            {(activeSection==="finance"||activeSection==="overview") && (
              <div style={{marginBottom:24}}>
                <div style={{fontSize:11,fontWeight:800,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:14}}>💰 Finance Deep-Dive</div>
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20}}>
                  {/* Area chart */}
                  <div className="rpt-card fade-up" style={{animationDelay:"370ms"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:14}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:"var(--emerald)",display:"inline-block"}}/>
                      Cash Flow Over Time
                    </div>
                    {dailySpend.length===0 ? (
                      <div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:13}}>No transaction data for this period</div>
                    ) : (
                      <div style={{height:200}}>
                        <ResponsiveContainer>
                          <AreaChart data={dailySpend} margin={{top:5,right:5,left:-20,bottom:0}}>
                            <defs>
                              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.3}/><stop offset="100%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                              <linearGradient id="expGrad"    x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F43F5E" stopOpacity={0.3}/><stop offset="100%" stopColor="#F43F5E" stopOpacity={0}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="date" tick={{fill:"var(--text-3)",fontSize:9,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false} tickFormatter={d=>d.slice(5)}/>
                            <YAxis tick={{fill:"var(--text-3)",fontSize:9,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Area type="monotone" dataKey="income"   name="Income"   stroke="#10B981" fill="url(#incomeGrad)" strokeWidth={2}/>
                            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F43F5E" fill="url(#expGrad)"    strokeWidth={2}/>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                  {/* Category pie */}
                  <div className="rpt-card fade-up" style={{animationDelay:"400ms"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:14}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:"var(--amber)",display:"inline-block"}}/>
                      By Category
                    </div>
                    {catPie.length===0 ? (
                      <div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:13}}>No expense data</div>
                    ) : (
                      <div style={{height:200}}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie data={catPie} dataKey="value" cx="50%" cy="50%" outerRadius={75} paddingAngle={3} strokeWidth={0}>
                              {catPie.map((e,i)=><Cell key={i} fill={e.color} style={{filter:`drop-shadow(0 4px 10px ${e.color}55)`}}/>)}
                            </Pie>
                            <Tooltip content={<CustomTooltip/>}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
                      {catPie.map(d=><div key={d.name} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:7,height:7,borderRadius:"50%",background:d.color}}/><span style={{fontSize:10,fontWeight:600,color:"var(--text-2)"}}>{d.name}</span></div>)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TASKS SECTION ── */}
            {(activeSection==="tasks"||activeSection==="overview") && (
              <div style={{marginBottom:24}}>
                <div style={{fontSize:11,fontWeight:800,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:14}}>✅ Task Analytics</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                  <div className="rpt-card fade-up" style={{animationDelay:"420ms"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:14}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:"var(--cyan)",display:"inline-block"}}/>
                      7-Day Task Activity
                    </div>
                    <div style={{height:180}}>
                      <ResponsiveContainer>
                        <BarChart data={weeklyTasks} margin={{top:5,right:5,left:-25,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                          <XAxis dataKey="day" tick={{fill:"var(--text-3)",fontSize:11,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:"var(--text-3)",fontSize:11,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false} allowDecimals={false}/>
                          <Tooltip content={<CustomTooltip/>}/>
                          <Bar dataKey="done"    name="Completed" fill="#7C3AED" radius={[4,4,0,0]}/>
                          <Bar dataKey="created" name="Created"   fill="#06B6D4" radius={[4,4,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent completed tasks */}
                  <div className="rpt-card fade-up" style={{animationDelay:"450ms"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:14}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:"var(--emerald)",display:"inline-block"}}/>
                      Recently Completed
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:7,maxHeight:200,overflowY:"auto"}}>
                      {filteredTasks.filter(t=>t.status==="done").slice(-6).reverse().map((t,i)=>(
                        <div key={t._id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--dark-4)",borderRadius:10}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:"var(--emerald)",flexShrink:0}}/>
                          <span style={{flex:1,fontSize:12,fontWeight:600,color:"var(--text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</span>
                          <span style={{fontSize:10,color:"var(--text-3)",flexShrink:0}}>{fmtDate(t.completedAt||t.updatedAt)}</span>
                        </div>
                      ))}
                      {filteredTasks.filter(t=>t.status==="done").length===0 && (
                        <div style={{textAlign:"center",color:"var(--text-3)",fontSize:13,padding:"20px 0"}}>No completed tasks yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── AI INSIGHTS ── */}
            {(activeSection==="insights"||activeSection==="overview") && insights.length > 0 && (
              <div className="rpt-card fade-up" style={{marginBottom:24,animationDelay:"470ms"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:14}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:"var(--violet-light)",display:"inline-block",animation:"pulse-dot 2s infinite"}}/>
                  AI Report Summary
                  <span style={{background:"rgba(124,58,237,.15)",color:"#C4B5FD",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:20,marginLeft:4}}>Live</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
                  {insights.map((ins,i)=>(
                    <div key={i} style={{display:"flex",gap:10,padding:"11px 13px",background:"var(--dark-4)",border:"1px solid var(--glass-b)",borderRadius:12,transition:"all .2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,.3)";e.currentTarget.style.background="rgba(124,58,237,.06)"}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--glass-b)";e.currentTarget.style.background="var(--dark-4)"}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:"var(--violet-light)",flexShrink:0,marginTop:5,animation:"pulse-dot 2s infinite"}}/>
                      <p style={{fontSize:12,color:"var(--text-2)",lineHeight:1.65,fontWeight:500}}>{ins}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw data table — compact */}
            {activeSection==="overview" && (
              <div className="rpt-card fade-up" style={{animationDelay:"490ms"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:14}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:"var(--text-3)",display:"inline-block"}}/>
                  Latest Transactions
                  <span style={{background:"rgba(255,255,255,.06)",color:"var(--text-2)",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:20,marginLeft:4}}>{filteredTx.length}</span>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"Montserrat",fontSize:12}}>
                    <thead>
                      <tr>
                        {["Date","Title","Type","Category","Amount"].map(h=>(
                          <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTx.slice().reverse().slice(0,10).map((t,i)=>(
                        <tr key={t._id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                          <td style={{padding:"9px 12px",color:"var(--text-3)"}}>{fmtDate(t.createdAt||t.date)}</td>
                          <td style={{padding:"9px 12px",fontWeight:600,color:"var(--text-1)"}}>{t.title}</td>
                          <td style={{padding:"9px 12px"}}>
                            <span style={{padding:"2px 8px",borderRadius:7,background:t.type==="income"?"rgba(16,185,129,.15)":"rgba(244,63,94,.12)",color:t.type==="income"?"var(--emerald)":"var(--rose)",fontSize:10,fontWeight:700}}>{t.type||"—"}</span>
                          </td>
                          <td style={{padding:"9px 12px",color:"var(--text-2)"}}>{t.category||"—"}</td>
                          <td style={{padding:"9px 12px",fontWeight:800,color:t.type==="income"?"var(--emerald)":"var(--rose)"}}>
                            {t.type==="income"?"+":"-"}{fmtKES(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTx.length===0 && <div style={{textAlign:"center",color:"var(--text-3)",fontSize:13,padding:"24px 0"}}>No transactions for this period</div>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}