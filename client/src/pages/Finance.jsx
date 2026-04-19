import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area,
} from "recharts";

/* ── Shared design tokens (mirrors Dashboard) ── */
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
  .orb-3{width:350px;height:350px;background:var(--emerald);bottom:20%;left:35%;opacity:.06}
  @keyframes float-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse-dot{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slide-in{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .4s ease both}
  .slide-in{animation:slide-in .35s ease both}
  .fin-card{background:var(--dark-3);border:1px solid var(--glass-b);border-radius:20px;padding:22px;transition:border-color .25s,transform .25s}
  .fin-card:hover{border-color:rgba(255,255,255,0.13);transform:translateY(-2px)}
  .fin-input{width:100%;padding:10px 14px;background:var(--dark-4);border:1px solid var(--glass-b);border-radius:11px;color:var(--text-1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .fin-input:focus{border-color:var(--violet-light)}
  .fin-input::placeholder{color:var(--text-3)}
  .fin-select{width:100%;padding:10px 14px;background:var(--dark-4);border:1px solid var(--glass-b);border-radius:11px;color:var(--text-1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;outline:none;cursor:pointer;transition:border-color .2s;appearance:none}
  .fin-select:focus{border-color:var(--violet-light)}
  .fin-btn-primary{padding:10px 20px;background:linear-gradient(135deg,var(--violet),var(--cyan));border:none;border-radius:11px;color:#fff;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
  .fin-btn-primary:hover{opacity:.88;transform:scale(1.03)}
  .fin-btn-primary:disabled{opacity:.4;cursor:not-allowed;transform:none}
  .fin-btn-ghost{padding:8px 14px;background:var(--glass);border:1px solid var(--glass-b);border-radius:10px;color:var(--text-2);font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
  .fin-btn-ghost:hover{background:var(--glass-b);color:var(--text-1)}
  .fin-row-item{display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--dark-4);border:1px solid var(--glass-b);border-radius:12px;transition:all .2s}
  .fin-row-item:hover{border-color:rgba(255,255,255,0.12);background:var(--dark-5)}
  .fin-tab{padding:7px 16px;border-radius:9px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
  .fin-tab.active{background:var(--violet);color:#fff}
  .fin-tab:not(.active){background:transparent;color:var(--text-3)}
  .fin-tab:not(.active):hover{color:var(--text-1)}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:1000;animation:float-up .2s ease}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6,#06B6D4);background-size:300% 100%;animation:accent-flow 5s linear infinite}
`;

const CATS = {
  food:       { label:"Food",       icon:"🍔", color:"#FACC15", bg:"rgba(250,204,21,0.15)"  },
  transport:  { label:"Transport",  icon:"🚗", color:"#84CC16", bg:"rgba(132,204,22,0.15)"  },
  bills:      { label:"Bills",      icon:"💡", color:"#38BDF8", bg:"rgba(56,189,248,0.15)"  },
  shopping:   { label:"Shopping",   icon:"🛍️", color:"#F472B6", bg:"rgba(244,114,182,0.15)" },
  health:     { label:"Health",     icon:"🏥", color:"#34D399", bg:"rgba(52,211,153,0.15)"  },
  income:     { label:"Income",     icon:"💰", color:"#10B981", bg:"rgba(16,185,129,0.15)"  },
  other:      { label:"Other",      icon:"📦", color:"#9090B8", bg:"rgba(144,144,184,0.15)" },
};

const fmtKES  = n => `KES ${Number(n || 0).toLocaleString("en-KE")}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-KE",{day:"2-digit",month:"short"}) : "";

function Spinner() {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60}}>
      <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.07)",borderTopColor:"var(--violet-light)",animation:"spin .8s linear infinite"}}/>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, delay=0 }) {
  return (
    <div className="fin-card fade-up" style={{animationDelay:`${delay}ms`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <span style={{fontSize:22}}>{icon}</span>
        <div style={{width:8,height:8,borderRadius:"50%",background:color,animation:"pulse-dot 2.5s infinite"}}/>
      </div>
      <div style={{fontFamily:"Montserrat",fontSize:10,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:1}}>{label}</div>
      <div style={{fontFamily:"Montserrat",fontSize:22,fontWeight:900,letterSpacing:-0.8,marginTop:4,color}}>{value}</div>
      {sub && <div style={{fontFamily:"Montserrat",fontSize:11,fontWeight:500,color:"var(--text-3)",marginTop:4}}>{sub}</div>}
    </div>
  );
}

function DeleteConfirm({ onConfirm, onCancel, label }) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:20,padding:28,width:360,boxShadow:"0 30px 80px rgba(0,0,0,.6)"}}>
        <div style={{fontSize:32,textAlign:"center",marginBottom:12}}>⚠️</div>
        <h3 style={{fontFamily:"Montserrat",fontWeight:800,fontSize:16,textAlign:"center",marginBottom:8}}>Delete Transaction</h3>
        <p style={{fontFamily:"Montserrat",fontSize:13,color:"var(--text-2)",textAlign:"center",marginBottom:22,lineHeight:1.6}}>
          Are you sure you want to delete <strong style={{color:"var(--text-1)"}}>{label}</strong>? This cannot be undone.
        </p>
        <div style={{display:"flex",gap:10}}>
          <button className="fin-btn-ghost" style={{flex:1}} onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"10px",background:"var(--rose)",border:"none",borderRadius:11,color:"#fff",fontFamily:"Montserrat",fontWeight:700,fontSize:13,cursor:"pointer"}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Finance() {
  useEffect(() => {
    const id="tracklio-fin-styles";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [transactions, setTransactions] = useState([]);
  const [summary,      setSummary]      = useState("");
  const [insights,     setInsights]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [activeTab,    setActiveTab]    = useState("all");
  const [chartView,    setChartView]    = useState("pie");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget,   setEditTarget]   = useState(null);
  const [showForm,     setShowForm]     = useState(false);

  const EMPTY = { title:"", amount:"", category:"food", type:"expense", date:"", note:"" };
  const [form, setForm] = useState(EMPTY);

  /* ── Fetch ── */
  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get("/transactions");
      const data = res.data || [];
      setTransactions(data);
      try {
        const ai = await API.post("/ai/finance", { transactions: data });
        setSummary(ai.data.summary || "");
        setInsights(ai.data.insights || []);
      } catch { /* AI optional */ }
    } catch (e) { setError("Failed to load transactions."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  /* ── Create / Update ── */
  const saveTransaction = async () => {
    if (!form.title.trim() || !form.amount) return;
    setSaving(true);
    try {
      if (editTarget) {
        const res = await API.put(`/transactions/${editTarget._id}`, { ...form, amount: Number(form.amount) });
        setTransactions(p => p.map(t => t._id === editTarget._id ? res.data : t));
      } else {
        const res = await API.post("/transactions", { ...form, amount: Number(form.amount) });
        setTransactions(p => [...p, res.data]);
      }
      setForm(EMPTY); setEditTarget(null); setShowForm(false);
    } catch { setError("Failed to save transaction."); }
    finally { setSaving(false); }
  };

  const startEdit = tx => { setEditTarget(tx); setForm({ title:tx.title, amount:tx.amount, category:tx.category||"other", type:tx.type||"expense", date:tx.date?.split("T")[0]||"", note:tx.note||"" }); setShowForm(true); };

  /* ── Delete ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/transactions/${deleteTarget._id}`);
      setTransactions(p => p.filter(t => t._id !== deleteTarget._id));
    } catch { setError("Failed to delete."); }
    setDeleteTarget(null);
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = [["Date","Title","Category","Type","Amount (KES)","Note"]];
    transactions.forEach(t => rows.push([fmtDate(t.createdAt||t.date), t.title, t.category||"", t.type||"", t.amount, t.note||""]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `tracklio-finance-${new Date().toISOString().split("T")[0]}.csv`; a.click();
  };

  /* ── Computed ── */
  const income   = transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses = transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const savings  = income - expenses;
  const budgetPct = income > 0 ? Math.round((expenses/income)*100) : 0;

  const filtered = activeTab === "all" ? transactions : transactions.filter(t => t.type === activeTab || t.category === activeTab);

  const catTotals = Object.keys(CATS).map(cat => ({
    name: CATS[cat].label, value: transactions.filter(t=>t.category===cat).reduce((s,t)=>s+t.amount,0), color: CATS[cat].color, icon: CATS[cat].icon,
  })).filter(d=>d.value>0);

  /* Monthly bar data */
  const monthlyMap = {};
  transactions.forEach(t => {
    const m = t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-KE",{month:"short"}) : "?";
    if (!monthlyMap[m]) monthlyMap[m] = { month:m, income:0, expenses:0 };
    if (t.type==="income") monthlyMap[m].income += t.amount;
    else monthlyMap[m].expenses += t.amount;
  });
  const monthlyData = Object.values(monthlyMap).slice(-6);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:12,padding:"10px 14px",fontFamily:"Montserrat",fontSize:12,fontWeight:700}}>
        <div style={{color:"var(--text-2)",marginBottom:4}}>{label}</div>
        {payload.map((p,i) => <div key={i} style={{color:p.color}}>{p.name}: {fmtKES(p.value)}</div>)}
      </div>
    );
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--dark-1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      {/* Page header */}
      <div style={{position:"relative",zIndex:1,padding:"32px 28px 0"}}>
        <div className="fade-up" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:28}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,var(--emerald),var(--cyan))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💰</div>
              <h1 style={{fontWeight:900,fontSize:24,letterSpacing:-0.8}}>Finance Tracker</h1>
            </div>
            <p style={{fontSize:13,color:"var(--text-3)",fontWeight:500}}>
              {transactions.length} transactions · {summary || "Loading AI summary…"}
            </p>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="fin-btn-ghost" onClick={exportCSV}>
              <span style={{marginRight:6}}>⬇</span> Export CSV
            </button>
            <button className="fin-btn-primary" onClick={()=>{ setEditTarget(null); setForm(EMPTY); setShowForm(true); }}>
              + Add Transaction
            </button>
          </div>
        </div>

        {error && (
          <div style={{background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.3)",borderRadius:12,padding:"12px 18px",marginBottom:20,color:"#FCA5A5",fontSize:13,fontWeight:600}}>
            ⚠ {error}
          </div>
        )}

        {/* Stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
          <StatCard icon="💰" label="Total Income"  value={fmtKES(income)}   color="var(--emerald)" sub={`${transactions.filter(t=>t.type==="income").length} entries`}  delay={0}/>
          <StatCard icon="💸" label="Total Expenses" value={fmtKES(expenses)} color="var(--rose)"    sub={`${transactions.filter(t=>t.type==="expense").length} entries`} delay={60}/>
          <StatCard icon="🏦" label="Net Savings"    value={fmtKES(savings)}  color={savings>=0?"var(--emerald)":"var(--rose)"} sub={savings>=0?"Positive balance":"Deficit"} delay={120}/>
          <StatCard icon="📊" label="Budget Used"    value={`${budgetPct}%`}  color={budgetPct>80?"var(--rose)":budgetPct>60?"var(--amber)":"var(--cyan)"} sub={budgetPct>80?"Over budget!":"Healthy"} delay={180}/>
        </div>

        {/* Budget progress bar */}
        <div className="fin-card fade-up" style={{marginBottom:24,animationDelay:"200ms"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontWeight:700,fontSize:13}}>Monthly Budget Health</span>
            <span style={{fontSize:12,fontWeight:700,color:budgetPct>80?"var(--rose)":"var(--emerald)"}}>{budgetPct}% used</span>
          </div>
          <div style={{height:10,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(budgetPct,100)}%`,background:budgetPct>80?"linear-gradient(90deg,var(--rose),#FB7185)":budgetPct>60?"linear-gradient(90deg,var(--amber),#FCD34D)":"linear-gradient(90deg,var(--emerald),#34D399)",borderRadius:99,transition:"width 1.2s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:"var(--text-3)",fontWeight:600}}>
            <span>{fmtKES(expenses)} spent</span>
            <span>{fmtKES(income)} earned</span>
          </div>
        </div>

        {/* Charts */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
          {/* Spending by category */}
          <div className="fin-card fade-up" style={{animationDelay:"240ms"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:"var(--violet-light)",display:"inline-block"}}/>
                Spending Breakdown
              </div>
              <div style={{display:"flex",gap:6}}>
                {["pie","bar"].map(v => <button key={v} className={`fin-tab ${chartView===v?"active":""}`} onClick={()=>setChartView(v)}>{v==="pie"?"🥧 Pie":"📊 Bar"}</button>)}
              </div>
            </div>
            {catTotals.length === 0 ? (
              <div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:13}}>No data yet</div>
            ) : chartView === "pie" ? (
              <div style={{height:220}}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={catTotals} dataKey="value" cx="50%" cy="50%" outerRadius={85} paddingAngle={3} strokeWidth={0}>
                      {catTotals.map((e,i) => <Cell key={i} fill={e.color} style={{filter:`drop-shadow(0 4px 8px ${e.color}50)`}}/>)}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{height:220}}>
                <ResponsiveContainer>
                  <BarChart data={catTotals} margin={{top:10,right:10,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="name" tick={{fill:"var(--text-3)",fontSize:10,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"var(--text-3)",fontSize:10,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="value" radius={[6,6,0,0]}>
                      {catTotals.map((e,i) => <Cell key={i} fill={e.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Legend */}
            <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:8}}>
              {catTotals.map(d => (
                <div key={d.name} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:d.color}}/>
                  <span style={{fontSize:10,fontWeight:600,color:"var(--text-2)"}}>{d.icon} {d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly income vs expenses */}
          <div className="fin-card fade-up" style={{animationDelay:"280ms"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:16}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"var(--cyan)",display:"inline-block"}}/>
              Monthly Overview
            </div>
            {monthlyData.length === 0 ? (
              <div style={{height:220,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:13}}>No monthly data yet</div>
            ) : (
              <div style={{height:220}}>
                <ResponsiveContainer>
                  <BarChart data={monthlyData} margin={{top:10,right:10,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="month" tick={{fill:"var(--text-3)",fontSize:10,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"var(--text-3)",fontSize:10,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="income"   name="Income"   fill="#10B981" radius={[4,4,0,0]}/>
                    <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Transactions list */}
        <div className="fin-card fade-up" style={{animationDelay:"320ms",marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"var(--amber)",display:"inline-block"}}/>
              Transactions
              <span style={{background:"rgba(124,58,237,.15)",color:"#C4B5FD",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:20,marginLeft:4}}>
                {filtered.length}
              </span>
            </div>
            {/* Filter tabs */}
            <div style={{display:"flex",gap:4,background:"var(--dark-4)",borderRadius:10,padding:4}}>
              {["all","income","expense"].map(tab => (
                <button key={tab} className={`fin-tab ${activeTab===tab?"active":""}`} onClick={()=>setActiveTab(tab)} style={{textTransform:"capitalize"}}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? <Spinner/> : filtered.length === 0 ? (
            <div style={{textAlign:"center",color:"var(--text-3)",fontSize:13,padding:"30px 0"}}>
              {activeTab==="all" ? "No transactions yet. Add your first one!" : `No ${activeTab} transactions.`}
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:7,maxHeight:380,overflowY:"auto"}}>
              {filtered.slice().reverse().map((t,i) => {
                const cat = CATS[t.category] || CATS.other;
                return (
                  <div key={t._id} className="fin-row-item slide-in" style={{animationDelay:`${i*30}ms`}}>
                    <div style={{width:36,height:36,borderRadius:10,background:cat.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>{cat.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,color:"var(--text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div>
                      <div style={{fontSize:10,color:"var(--text-3)",fontWeight:600,marginTop:2}}>
                        {cat.label} · {fmtDate(t.createdAt||t.date)}
                        {t.note && ` · ${t.note}`}
                      </div>
                    </div>
                    <div style={{fontWeight:800,fontSize:14,color:t.type==="income"?"var(--emerald)":"var(--rose)",flexShrink:0}}>
                      {t.type==="income"?"+":"-"}{fmtKES(t.amount)}
                    </div>
                    {/* Action buttons */}
                    <div style={{display:"flex",gap:5,flexShrink:0}}>
                      <button onClick={()=>startEdit(t)} title="Edit"
                        style={{width:30,height:30,borderRadius:8,background:"rgba(124,58,237,.15)",border:"1px solid rgba(124,58,237,.25)",color:"#C4B5FD",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(124,58,237,.3)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(124,58,237,.15)"}>
                        ✏
                      </button>
                      <button onClick={()=>setDeleteTarget(t)} title="Delete"
                        style={{width:30,height:30,borderRadius:8,background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.2)",color:"#FCA5A5",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(244,63,94,.25)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(244,63,94,.1)"}>
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="fin-card fade-up" style={{marginBottom:40,animationDelay:"360ms"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:14}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"var(--violet-light)",display:"inline-block",animation:"pulse-dot 2s infinite"}}/>
            AI Financial Insights
            <span style={{background:"rgba(124,58,237,.15)",color:"#C4B5FD",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:20,marginLeft:4}}>Live</span>
          </div>
          {insights.length === 0 ? (
            <p style={{color:"var(--text-3)",fontSize:13}}>{loading?"Analysing your finances…":"Add transactions for AI insights."}</p>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
              {insights.map((ins,i) => (
                <div key={i} style={{display:"flex",gap:10,padding:"11px 13px",background:"var(--dark-4)",border:"1px solid var(--glass-b)",borderRadius:12,transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,.3)";e.currentTarget.style.background="rgba(124,58,237,.06)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--glass-b)";e.currentTarget.style.background="var(--dark-4)"}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"var(--violet-light)",flexShrink:0,marginTop:5,animation:"pulse-dot 2s infinite"}}/>
                  <p style={{fontSize:12,color:"var(--text-2)",lineHeight:1.65,fontWeight:500}}>{ins}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:24,padding:30,width:460,boxShadow:"0 30px 80px rgba(0,0,0,.6)",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{fontFamily:"Montserrat",fontWeight:800,fontSize:17,marginBottom:20}}>
              {editTarget ? "✏️ Edit Transaction" : "➕ Add Transaction"}
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Title *</label>
                <input className="fin-input" placeholder="e.g. Lunch at Java" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Amount (KES) *</label>
                  <input className="fin-input" type="number" placeholder="0" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Type</label>
                  <select className="fin-select" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                    <option value="expense">💸 Expense</option>
                    <option value="income">💰 Income</option>
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Category</label>
                  <select className="fin-select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    {Object.entries(CATS).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Date</label>
                  <input className="fin-input" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={{colorScheme:"dark"}}/>
                </div>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Note (optional)</label>
                <input className="fin-input" placeholder="Any extra details…" value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:22}}>
              <button className="fin-btn-ghost" style={{flex:1}} onClick={()=>{setShowForm(false);setEditTarget(null);setForm(EMPTY);}}>Cancel</button>
              <button className="fin-btn-primary" style={{flex:2}} onClick={saveTransaction} disabled={saving||!form.title.trim()||!form.amount}>
                {saving ? "Saving…" : editTarget ? "Update Transaction" : "Add Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && <DeleteConfirm onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)} label={deleteTarget.title}/>}
    </div>
  );
}