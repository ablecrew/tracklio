import { useEffect, useState } from "react";
import API from "../api/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
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
  .orb-2{width:500px;height:500px;background:var(--emerald);bottom:-120px;right:-150px;opacity:.09}
  .orb-3{width:350px;height:350px;background:var(--amber);bottom:20%;left:35%;opacity:.06}
  @keyframes float-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse-dot{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes streak-pop{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .4s ease both}
  .hab-card{background:var(--dark-3);border:1px solid var(--glass-b);border-radius:20px;padding:22px;transition:border-color .25s,transform .25s}
  .hab-card:hover{border-color:rgba(255,255,255,0.13);transform:translateY(-2px)}
  .hab-input{width:100%;padding:10px 14px;background:var(--dark-4);border:1px solid var(--glass-b);border-radius:11px;color:var(--text-1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .hab-input:focus{border-color:var(--violet-light)}
  .hab-input::placeholder{color:var(--text-3)}
  .hab-select{width:100%;padding:10px 14px;background:var(--dark-4);border:1px solid var(--glass-b);border-radius:11px;color:var(--text-1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;outline:none;cursor:pointer;appearance:none}
  .hab-select:focus{border-color:var(--violet-light)}
  .hab-btn-primary{padding:10px 20px;background:linear-gradient(135deg,var(--violet),var(--emerald));border:none;border-radius:11px;color:#fff;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s}
  .hab-btn-primary:hover:not(:disabled){opacity:.88;transform:scale(1.03)}
  .hab-btn-primary:disabled{opacity:.4;cursor:not-allowed}
  .hab-btn-ghost{padding:8px 14px;background:var(--glass);border:1px solid var(--glass-b);border-radius:10px;color:var(--text-2);font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
  .hab-btn-ghost:hover{background:var(--glass-b);color:var(--text-1)}
  .streak-cell{width:22px;height:22px;border-radius:5px;cursor:pointer;transition:transform .15s;flex-shrink:0}
  .streak-cell:hover{transform:scale(1.2)}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:1000;animation:float-up .2s ease}
  .check-ring{width:44px;height:44px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .25s}
`;

const HABIT_ICONS = ["🏃","💪","📚","🧘","💧","🥗","😴","✍️","🎯","💻","🎵","🌿"];
const HABIT_COLORS = [
  {label:"Violet", val:"#7C3AED"}, {label:"Cyan",    val:"#06B6D4"},
  {label:"Emerald",val:"#10B981"}, {label:"Amber",   val:"#F59E0B"},
  {label:"Rose",   val:"#F43F5E"}, {label:"Blue",    val:"#3B82F6"},
];
const DAYS_SHORT = ["M","T","W","T","F","S","S"];

/* Build last-N-days array */
function lastNDays(n) {
  return Array.from({length:n},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(n-1-i));
    return d.toISOString().split("T")[0];
  });
}

function Spinner() {
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:50}}><div style={{width:34,height:34,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.07)",borderTopColor:"var(--violet-light)",animation:"spin .8s linear infinite"}}/></div>;
}

/* ── Streak Grid (28-day heatmap) ── */
function StreakGrid({ logs=[], color="#7C3AED" }) {
  const days = lastNDays(28);
  const set  = new Set(logs.map(l=>l.date?.split("T")[0]));
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:8}}>
      {days.map((d,i) => {
        const done = set.has(d);
        const isToday = d === new Date().toISOString().split("T")[0];
        return (
          <div key={d} className="streak-cell" title={d}
            style={{
              background: done ? color : "rgba(255,255,255,0.05)",
              border: isToday ? `2px solid ${color}` : "2px solid transparent",
              boxShadow: done ? `0 0 6px ${color}55` : "none",
            }}/>
        );
      })}
    </div>
  );
}

const EMPTY_FORM = { name:"", icon:"🎯", color:"#7C3AED", frequency:"daily", target:1, unit:"times", note:"" };

export default function Habits() {
  useEffect(() => {
    const id="tracklio-hab-styles";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [habits,  setHabits]  = useState([]);
  const [logs,    setLogs]    = useState({});   // { habitId: [{date, count}] }
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [showForm,setShowForm]= useState(false);
  const [editH,   setEditH]   = useState(null);
  const [viewH,   setViewH]   = useState(null);
  const [delH,    setDelH]    = useState(null);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const today = new Date().toISOString().split("T")[0];

  /* ── Fetch habits (from /api/habits if exists, else use tasks endpoint as proxy) ── */
  const fetchHabits = async () => {
    setLoading(true); setError("");
    try {
      /* Try dedicated /habits endpoint; gracefully fall back */
      const res = await API.get("/habits").catch(()=>({data:[]}));
      setHabits(res.data || []);
      /* Fetch logs per habit */
      const logMap = {};
      await Promise.all((res.data||[]).map(async h => {
        const lr = await API.get(`/habits/${h._id}/logs`).catch(()=>({data:[]}));
        logMap[h._id] = lr.data || [];
      }));
      setLogs(logMap);
    } catch { setError("Failed to load habits."); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ fetchHabits(); },[]);

  /* ── Save habit ── */
  const saveHabit = async () => {
    if(!form.name.trim()) return;
    setSaving(true);
    try {
      if(editH) {
        const res = await API.put(`/habits/${editH._id}`, form);
        setHabits(p=>p.map(h=>h._id===editH._id?res.data:h));
      } else {
        const res = await API.post("/habits", form);
        setHabits(p=>[...p, res.data]);
        setLogs(p=>({...p,[res.data._id]:[]}));
      }
      setForm(EMPTY_FORM); setEditH(null); setShowForm(false);
    } catch { setError("Failed to save habit."); }
    finally { setSaving(false); }
  };

  /* ── Log today's check-in ── */
  const logToday = async habit => {
    const habitLogs = logs[habit._id]||[];
    const alreadyDone = habitLogs.some(l=>l.date?.split("T")[0]===today);
    try {
      if(alreadyDone) {
        // un-log: delete today's log
        await API.delete(`/habits/${habit._id}/logs/today`).catch(()=>{});
        setLogs(p=>({...p,[habit._id]:habitLogs.filter(l=>l.date?.split("T")[0]!==today)}));
      } else {
        const res = await API.post(`/habits/${habit._id}/logs`, { date: today, count: 1 });
        setLogs(p=>({...p,[habit._id]:[...habitLogs, res.data||{date:today,count:1}]}));
      }
    } catch { setError("Failed to log habit."); }
  };

  /* ── Delete habit ── */
  const deleteHabit = async () => {
    if(!delH) return;
    setHabits(p=>p.filter(h=>h._id!==delH._id));
    try { await API.delete(`/habits/${delH._id}`); }
    catch { fetchHabits(); }
    setDelH(null);
  };

  /* ── Streak calculator ── */
  const calcStreak = habitId => {
    const habitLogs = (logs[habitId]||[]).map(l=>l.date?.split("T")[0]).sort().reverse();
    let streak = 0;
    let check = new Date();
    for(let i=0;i<60;i++) {
      const d = check.toISOString().split("T")[0];
      if(habitLogs.includes(d)) { streak++; check.setDate(check.getDate()-1); }
      else { if(i===0) { check.setDate(check.getDate()-1); continue; } break; }
    }
    return streak;
  };

  const completionRate = (habitId, days=30) => {
    const d = lastNDays(days);
    const set = new Set((logs[habitId]||[]).map(l=>l.date?.split("T")[0]));
    return Math.round((d.filter(x=>set.has(x)).length/days)*100);
  };

  /* ── Aggregate analytics ── */
  const totalLogs    = Object.values(logs).flat().length;
  const todayDone    = habits.filter(h=>(logs[h._id]||[]).some(l=>l.date?.split("T")[0]===today)).length;
  const topStreak    = habits.reduce((best,h)=>{ const s=calcStreak(h._id); return s>best?s:best; },0);
  const overallRate  = habits.length ? Math.round(habits.reduce((s,h)=>s+completionRate(h._id),0)/habits.length) : 0;

  /* Weekly bar data */
  const weeklyData = lastNDays(7).map(d => ({
    day: new Date(d).toLocaleDateString("en-KE",{weekday:"short"}),
    done: Object.values(logs).flat().filter(l=>l.date?.split("T")[0]===d).length,
  }));

  const radarData = habits.slice(0,6).map(h=>({
    habit: h.icon+" "+(h.name.length>8?h.name.slice(0,8)+"…":h.name),
    rate: completionRate(h._id),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if(!active||!payload?.length) return null;
    return <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:12,padding:"10px 14px",fontFamily:"Montserrat",fontSize:12,fontWeight:700}}><div style={{color:"var(--text-2)",marginBottom:4}}>{label}</div>{payload.map((p,i)=><div key={i} style={{color:"#8B5CF6"}}>{p.name}: {p.value}</div>)}</div>;
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--dark-1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      <div style={{position:"relative",zIndex:1,padding:"32px 28px 60px"}}>
        {/* Header */}
        <div className="fade-up" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:28}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,var(--emerald),var(--violet))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎯</div>
              <h1 style={{fontWeight:900,fontSize:24,letterSpacing:-0.8}}>Habit Tracker</h1>
            </div>
            <p style={{fontSize:13,color:"var(--text-3)",fontWeight:500}}>{habits.length} habits · {todayDone}/{habits.length} done today · {overallRate}% consistency</p>
          </div>
          <button className="hab-btn-primary" onClick={()=>{setEditH(null);setForm(EMPTY_FORM);setShowForm(true);}}>+ New Habit</button>
        </div>

        {error && <div style={{background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.3)",borderRadius:12,padding:"12px 18px",marginBottom:20,color:"#FCA5A5",fontSize:13,fontWeight:600}}>⚠ {error}</div>}

        {/* Stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
          {[
            {icon:"🎯",label:"Total Habits",    value:habits.length,     color:"var(--violet-light)",sub:"Tracked"},
            {icon:"✅",label:"Done Today",      value:`${todayDone}/${habits.length}`,color:"var(--emerald)",sub:"Check-ins"},
            {icon:"🔥",label:"Best Streak",     value:`${topStreak}d`,   color:"var(--amber)",sub:"Consecutive days"},
            {icon:"📈",label:"30-Day Rate",     value:`${overallRate}%`, color:"var(--cyan)",sub:"Overall consistency"},
          ].map((c,i)=>(
            <div key={c.label} className="hab-card fade-up" style={{animationDelay:`${i*60}ms`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontSize:22}}>{c.icon}</span>
                <div style={{width:8,height:8,borderRadius:"50%",background:c.color,animation:"pulse-dot 2.5s infinite"}}/>
              </div>
              <div style={{fontFamily:"Montserrat",fontSize:10,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:1}}>{c.label}</div>
              <div style={{fontFamily:"Montserrat",fontSize:22,fontWeight:900,letterSpacing:-0.8,marginTop:4,color:c.color}}>{c.value}</div>
              <div style={{fontFamily:"Montserrat",fontSize:11,fontWeight:500,color:"var(--text-3)",marginTop:4}}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
          <div className="hab-card fade-up" style={{animationDelay:"260ms"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:14}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"var(--violet-light)",display:"inline-block"}}/>
              7-Day Check-in Activity
            </div>
            <div style={{height:180}}>
              <ResponsiveContainer>
                <BarChart data={weeklyData} margin={{top:5,right:5,left:-25,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="day" tick={{fill:"var(--text-3)",fontSize:11,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:"var(--text-3)",fontSize:11,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="done" name="Check-ins" radius={[6,6,0,0]} fill="url(#habGrad)"/>
                  <defs><linearGradient id="habGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="hab-card fade-up" style={{animationDelay:"300ms"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:14}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"var(--emerald)",display:"inline-block"}}/>
              Consistency Radar
            </div>
            {radarData.length < 3 ? (
              <div style={{height:180,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:13}}>Add 3+ habits to see radar</div>
            ) : (
              <div style={{height:180}}>
                <ResponsiveContainer>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={65}>
                    <PolarGrid stroke="rgba(255,255,255,0.07)"/>
                    <PolarAngleAxis dataKey="habit" tick={{fill:"var(--text-3)",fontSize:9,fontFamily:"Montserrat",fontWeight:600}}/>
                    <Radar name="Rate %" dataKey="rate" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.25} strokeWidth={2}/>
                    <Tooltip content={<CustomTooltip/>}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Today's check-in grid */}
        {habits.length > 0 && (
          <div className="hab-card fade-up" style={{marginBottom:24,animationDelay:"320ms"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:14,marginBottom:16}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"var(--amber)",display:"inline-block",animation:"pulse-dot 2s infinite"}}/>
              Today's Check-ins
              <span style={{background:"rgba(16,185,129,.15)",color:"#6EE7B7",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:20,marginLeft:4}}>
                {todayDone}/{habits.length} done
              </span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
              {habits.map(h => {
                const done = (logs[h._id]||[]).some(l=>l.date?.split("T")[0]===today);
                return (
                  <div key={h._id} onClick={()=>logToday(h)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:done?"rgba(16,185,129,0.08)":"var(--dark-4)",border:`1px solid ${done?"rgba(16,185,129,0.3)":"var(--glass-b)"}`,borderRadius:13,cursor:"pointer",transition:"all .2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=done?"rgba(16,185,129,0.5)":h.color+"55";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=done?"rgba(16,185,129,0.3)":"var(--glass-b)";}}>
                    <div style={{width:36,height:36,borderRadius:10,background:h.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{h.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,color:done?"var(--emerald)":"var(--text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.name}</div>
                      <div style={{fontSize:10,color:"var(--text-3)",fontWeight:600,marginTop:2}}>{calcStreak(h._id)}d streak</div>
                    </div>
                    <div style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${done?"#10B981":h.color}`,background:done?"#10B981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                      {done&&<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Habit cards with 28-day heatmap */}
        {loading ? <Spinner/> : habits.length === 0 ? (
          <div className="hab-card" style={{textAlign:"center",padding:"48px 24px"}}>
            <div style={{fontSize:48,marginBottom:12}}>🎯</div>
            <h3 style={{fontWeight:800,fontSize:18,marginBottom:8}}>No habits yet</h3>
            <p style={{color:"var(--text-3)",fontSize:13,marginBottom:20}}>Start building powerful habits that stick.</p>
            <button className="hab-btn-primary" onClick={()=>{setEditH(null);setForm(EMPTY_FORM);setShowForm(true);}}>+ Create Your First Habit</button>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:18}}>
            {habits.map((h,i) => {
              const streak = calcStreak(h._id);
              const rate   = completionRate(h._id);
              const hLogs  = logs[h._id]||[];
              const doneToday = hLogs.some(l=>l.date?.split("T")[0]===today);
              return (
                <div key={h._id} className="hab-card fade-up" style={{animationDelay:`${i*50}ms`,borderTop:`3px solid ${h.color}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:40,height:40,borderRadius:11,background:h.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{h.icon}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:"var(--text-1)"}}>{h.name}</div>
                        <div style={{fontSize:11,color:"var(--text-3)",fontWeight:600,marginTop:2}}>{h.frequency||"daily"} · {h.target||1}× {h.unit||"times"}</div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{display:"flex",gap:5}}>
                      <button onClick={()=>setViewH(h)} title="Details"
                        style={{width:28,height:28,borderRadius:8,background:"rgba(6,182,212,.1)",border:"1px solid rgba(6,182,212,.2)",color:"#67E8F9",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(6,182,212,.22)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(6,182,212,.1)"}>👁</button>
                      <button onClick={()=>{setEditH(h);setForm({name:h.name,icon:h.icon,color:h.color,frequency:h.frequency||"daily",target:h.target||1,unit:h.unit||"times",note:h.note||""});setShowForm(true);}} title="Edit"
                        style={{width:28,height:28,borderRadius:8,background:"rgba(124,58,237,.12)",border:"1px solid rgba(124,58,237,.25)",color:"#C4B5FD",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(124,58,237,.28)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(124,58,237,.12)"}>✏</button>
                      <button onClick={()=>setDelH(h)} title="Delete"
                        style={{width:28,height:28,borderRadius:8,background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.2)",color:"#FCA5A5",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(244,63,94,.25)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(244,63,94,.1)"}>🗑</button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{display:"flex",gap:16,marginBottom:12}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:18,fontWeight:900,color:h.color}}>🔥{streak}</div>
                      <div style={{fontSize:9,color:"var(--text-3)",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Streak</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:18,fontWeight:900,color:"var(--cyan)"}}>{rate}%</div>
                      <div style={{fontSize:9,color:"var(--text-3)",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>30-Day</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:18,fontWeight:900,color:"var(--text-1)"}}>{hLogs.length}</div>
                      <div style={{fontSize:9,color:"var(--text-3)",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5}}>Total</div>
                    </div>
                    {/* Consistency bar */}
                    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:4}}>
                      <div style={{fontSize:10,color:"var(--text-3)",fontWeight:600}}>Consistency</div>
                      <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${rate}%`,background:h.color,borderRadius:99,transition:"width 1s ease"}}/>
                      </div>
                    </div>
                  </div>

                  {/* 28-day heatmap */}
                  <div style={{fontSize:10,color:"var(--text-3)",fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,marginBottom:4}}>28-Day Activity</div>
                  <StreakGrid logs={hLogs} color={h.color}/>

                  {/* Check-in button */}
                  <button onClick={()=>logToday(h)}
                    style={{width:"100%",marginTop:14,padding:"10px",background:doneToday?"rgba(16,185,129,.12)":"linear-gradient(135deg,"+h.color+","+h.color+"99)",border:doneToday?"1px solid rgba(16,185,129,.3)":"none",borderRadius:11,color:doneToday?"#6EE7B7":"#fff",fontFamily:"Montserrat",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>
                    {doneToday ? "✅ Done today · Tap to undo" : `✓ Mark done for today`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:24,padding:30,width:460,boxShadow:"0 30px 80px rgba(0,0,0,.6)",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{fontFamily:"Montserrat",fontWeight:800,fontSize:17,marginBottom:20}}>{editH?"✏️ Edit Habit":"➕ New Habit"}</h3>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Habit Name *</label>
                <input className="hab-input" placeholder="e.g. Morning Run" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:8}}>Icon</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {HABIT_ICONS.map(ic=>(
                    <button key={ic} onClick={()=>setForm(p=>({...p,icon:ic}))}
                      style={{width:36,height:36,borderRadius:9,border:`2px solid ${form.icon===ic?"var(--violet-light)":"var(--glass-b)"}`,background:form.icon===ic?"rgba(124,58,237,.15)":"var(--dark-4)",cursor:"pointer",fontSize:18,transition:"all .15s"}}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:8}}>Colour</label>
                <div style={{display:"flex",gap:8}}>
                  {HABIT_COLORS.map(c=>(
                    <button key={c.val} onClick={()=>setForm(p=>({...p,color:c.val}))}
                      style={{width:28,height:28,borderRadius:"50%",background:c.val,border:`3px solid ${form.color===c.val?"#fff":"transparent"}`,cursor:"pointer",transition:"all .15s",boxShadow:form.color===c.val?`0 0 10px ${c.val}`:"none"}}/>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Frequency</label>
                  <select className="hab-select" value={form.frequency} onChange={e=>setForm(p=>({...p,frequency:e.target.value}))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="weekdays">Weekdays</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Target</label>
                  <input className="hab-input" type="number" min="1" value={form.target} onChange={e=>setForm(p=>({...p,target:e.target.value}))} style={{textAlign:"center"}}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Unit</label>
                  <input className="hab-input" placeholder="times" value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))}/>
                </div>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Note (optional)</label>
                <input className="hab-input" placeholder="Why this habit matters…" value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:22}}>
              <button className="hab-btn-ghost" style={{flex:1}} onClick={()=>{setShowForm(false);setEditH(null);setForm(EMPTY_FORM);}}>Cancel</button>
              <button className="hab-btn-primary" style={{flex:2}} onClick={saveHabit} disabled={saving||!form.name.trim()}>{saving?"Saving…":editH?"Update Habit":"Create Habit"}</button>
            </div>
          </div>
        </div>
      )}

      {/* View detail */}
      {viewH && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setViewH(null)}>
          <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:24,padding:30,width:420,boxShadow:"0 30px 80px rgba(0,0,0,.6)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:28}}>{viewH.icon}</span>
                <h3 style={{fontFamily:"Montserrat",fontWeight:800,fontSize:17}}>{viewH.name}</h3>
              </div>
              <button onClick={()=>setViewH(null)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:18}}>✕</button>
            </div>
            {[["Frequency",viewH.frequency||"daily"],["Target",`${viewH.target||1} ${viewH.unit||"times"}`],["Current Streak",`🔥 ${calcStreak(viewH._id)} days`],["30-Day Rate",`${completionRate(viewH._id)}%`],["Total Logs",(logs[viewH._id]||[]).length],["Note",viewH.note||"—"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <span style={{fontSize:12,color:"var(--text-3)",fontWeight:600}}>{k}</span>
                <span style={{fontSize:12,fontWeight:700,color:"var(--text-1)"}}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:14}}>
              <div style={{fontSize:10,color:"var(--text-3)",fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,marginBottom:6}}>28-Day Heatmap</div>
              <StreakGrid logs={logs[viewH._id]||[]} color={viewH.color}/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button className="hab-btn-ghost" style={{flex:1}} onClick={()=>setViewH(null)}>Close</button>
              <button className="hab-btn-primary" style={{flex:1}} onClick={()=>{setViewH(null);setEditH(viewH);setForm({name:viewH.name,icon:viewH.icon,color:viewH.color,frequency:viewH.frequency||"daily",target:viewH.target||1,unit:viewH.unit||"times",note:viewH.note||""});setShowForm(true);}}>✏ Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delH && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDelH(null)}>
          <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:20,padding:28,width:360,boxShadow:"0 30px 80px rgba(0,0,0,.6)"}}>
            <div style={{fontSize:32,textAlign:"center",marginBottom:12}}>⚠️</div>
            <h3 style={{fontFamily:"Montserrat",fontWeight:800,fontSize:16,textAlign:"center",marginBottom:8}}>Delete Habit</h3>
            <p style={{fontFamily:"Montserrat",fontSize:13,color:"var(--text-2)",textAlign:"center",marginBottom:22,lineHeight:1.6}}>Delete <strong style={{color:"var(--text-1)"}}>{delH.name}</strong> and all its logs? This cannot be undone.</p>
            <div style={{display:"flex",gap:10}}>
              <button className="hab-btn-ghost" style={{flex:1}} onClick={()=>setDelH(null)}>Cancel</button>
              <button onClick={deleteHabit} style={{flex:1,padding:"10px",background:"var(--rose)",border:"none",borderRadius:11,color:"#fff",fontFamily:"Montserrat",fontWeight:700,fontSize:13,cursor:"pointer"}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}