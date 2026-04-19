import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
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
  @keyframes slide-in{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes check-pop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
  .fade-up{animation:float-up .4s ease both}
  .slide-in{animation:slide-in .3s ease both}
  .tsk-card{background:var(--dark-3);border:1px solid var(--glass-b);border-radius:20px;padding:22px;transition:border-color .25s,transform .25s}
  .tsk-card:hover{border-color:rgba(255,255,255,0.13);transform:translateY(-2px)}
  .tsk-input{width:100%;padding:10px 14px;background:var(--dark-4);border:1px solid var(--glass-b);border-radius:11px;color:var(--text-1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .tsk-input:focus{border-color:var(--violet-light)}
  .tsk-input::placeholder{color:var(--text-3)}
  .tsk-select{width:100%;padding:10px 14px;background:var(--dark-4);border:1px solid var(--glass-b);border-radius:11px;color:var(--text-1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;outline:none;cursor:pointer;transition:border-color .2s;appearance:none}
  .tsk-select:focus{border-color:var(--violet-light)}
  .tsk-btn-primary{padding:10px 20px;background:linear-gradient(135deg,var(--violet),var(--cyan));border:none;border-radius:11px;color:#fff;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
  .tsk-btn-primary:hover:not(:disabled){opacity:.88;transform:scale(1.03)}
  .tsk-btn-primary:disabled{opacity:.4;cursor:not-allowed}
  .tsk-btn-ghost{padding:8px 14px;background:var(--glass);border:1px solid var(--glass-b);border-radius:10px;color:var(--text-2);font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
  .tsk-btn-ghost:hover{background:var(--glass-b);color:var(--text-1)}
  .tsk-tab{padding:7px 16px;border-radius:9px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
  .tsk-tab.active{background:var(--violet);color:#fff}
  .tsk-tab:not(.active){background:transparent;color:var(--text-3)}
  .tsk-tab:not(.active):hover{color:var(--text-1)}
  .tsk-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--dark-4);border:1px solid var(--glass-b);border-radius:13px;transition:all .2s;cursor:default}
  .tsk-row:hover{border-color:rgba(255,255,255,0.12);background:var(--dark-5)}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:1000;animation:float-up .2s ease}
  .icon-btn{width:32px;height:32px;border-radius:9px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;transition:all .2s;flex-shrink:0}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6,#06B6D4);background-size:300% 100%;animation:accent-flow 5s linear infinite}
`;

const PRIORITY_META = {
  high:   { color:"#F87171", bg:"rgba(244,63,94,.15)",   dot:"var(--rose)",   label:"High"   },
  medium: { color:"#FCD34D", bg:"rgba(245,158,11,.15)",  dot:"var(--amber)",  label:"Medium" },
  low:    { color:"#6EE7B7", bg:"rgba(16,185,129,.15)",  dot:"var(--emerald)",label:"Low"    },
};
const STATUS_META = {
  pending:  { color:"#9090B8", bg:"rgba(144,144,184,.15)", label:"Pending"     },
  done:     { color:"#10B981", bg:"rgba(16,185,129,.15)",  label:"Done"        },
  overdue:  { color:"#F43F5E", bg:"rgba(244,63,94,.15)",  label:"Overdue"     },
};
const CATEGORIES = ["general","work","personal","health","learning","shopping"];

const fmtDate = d => d ? new Date(d).toLocaleDateString("en-KE",{day:"2-digit",month:"short",year:"numeric"}) : "";
const fmtMins = m => m < 60 ? `${Math.round(m)}m` : `${(m/60).toFixed(1)}h`;

function Spinner() {
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:50}}><div style={{width:34,height:34,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.07)",borderTopColor:"var(--violet-light)",animation:"spin .8s linear infinite"}}/></div>;
}

function StatCard({ icon, label, value, sub, color, delay=0 }) {
  return (
    <div className="tsk-card fade-up" style={{animationDelay:`${delay}ms`}}>
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

const EMPTY_FORM = { title:"", priority:"medium", category:"general", status:"pending", dueDate:"", note:"" };

export default function Tasks() {
  useEffect(() => {
    const id="tracklio-tsk-styles";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [sortBy,      setSortBy]      = useState("newest");
  const [showForm,    setShowForm]    = useState(false);
  const [editTask,    setEditTask]    = useState(null);
  const [viewTask,    setViewTask]    = useState(null);
  const [deleteTarget,setDeleteTarget]= useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);

  /* ── Fetch ── */
  const fetchTasks = async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get("/tasks");
      setTasks(res.data || []);
    } catch { setError("Failed to load tasks."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchTasks(); }, []);

  /* ── Save (Create / Update) ── */
  const saveTask = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    /* Normalise: empty string dueDate → null so MongoDB actually clears it */
    const payload = {
      ...form,
      dueDate:     form.dueDate     || null,
      note:        form.note        || "",
      priority:    form.priority    || "medium",
      category:    form.category    || "general",
      status:      form.status      || "pending",
    };
    try {
      if (editTask) {
        /* Merge with existing task so no fields are lost */
        const merged = { ...editTask, ...payload };
        const res = await API.put(`/tasks/${editTask._id}`, merged);
        setTasks(p => p.map(t => t._id === editTask._id ? (res.data || merged) : t));
      } else {
        const res = await API.post("/tasks", { ...payload, createdAt: new Date() });
        setTasks(p => [...p, res.data]);
      }
      setForm(EMPTY_FORM); setEditTask(null); setShowForm(false);
    } catch (err) {
      console.error("Save task failed:", err);
      setError("Failed to save task. Please try again.");
    }
    finally { setSaving(false); }
  };

  /* ── Toggle status ── */
  const toggleTask = async task => {
    const next = task.status === "done" ? "pending" : "done";
    const updated = { ...task, status: next, completedAt: next === "done" ? new Date() : null };
    setTasks(p => p.map(t => t._id === task._id ? updated : t)); // optimistic
    try {
      const res = await API.put(`/tasks/${task._id}`, updated);
      setTasks(p => p.map(t => t._id === task._id ? res.data : t));
    } catch { fetchTasks(); } // revert
  };

  /* ── Delete ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setTasks(p => p.filter(t => t._id !== deleteTarget._id));
    try { await API.delete(`/tasks/${deleteTarget._id}`); }
    catch { fetchTasks(); }
    setDeleteTarget(null);
  };

  const startEdit = task => { setEditTask(task); setForm({ title:task.title, priority:task.priority||"medium", category:task.category||"general", status:task.status||"pending", dueDate:task.dueDate?.split("T")[0]||"", note:task.note||"" }); setShowForm(true); };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = [["Title","Priority","Category","Status","Due Date","Created","Note"]];
    tasks.forEach(t => rows.push([t.title,t.priority||"",t.category||"",t.status||"",fmtDate(t.dueDate),fmtDate(t.createdAt),t.note||""]));
    const csv = rows.map(r=>r.join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download=`tracklio-tasks-${new Date().toISOString().split("T")[0]}.csv`; a.click();
  };

  /* ── Computed ── */
  const done    = tasks.filter(t=>t.status==="done").length;
  const pending = tasks.filter(t=>t.status==="pending").length;
  const overdue = tasks.filter(t=>t.status==="overdue").length;
  const completion = tasks.length ? Math.round((done/tasks.length)*100) : 0;

  const avgTime = (() => {
    const timed = tasks.filter(t=>t.completedAt&&t.createdAt);
    if (!timed.length) return 0;
    return timed.reduce((a,t)=>a+(new Date(t.completedAt)-new Date(t.createdAt))/60000,0)/timed.length;
  })();

  /* Filter + search + sort */
  const visible = tasks
    .filter(t => filter==="all" || t.status===filter || t.priority===filter || t.category===filter)
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      if (sortBy==="newest")   return new Date(b.createdAt)-new Date(a.createdAt);
      if (sortBy==="oldest")   return new Date(a.createdAt)-new Date(b.createdAt);
      if (sortBy==="priority") { const o={high:0,medium:1,low:2}; return (o[a.priority]||1)-(o[b.priority]||1); }
      if (sortBy==="az")       return a.title.localeCompare(b.title);
      return 0;
    });

  /* Chart data */
  const statusChart = [
    { name:"Done",    value:done,    fill:"#7C3AED" },
    { name:"Pending", value:pending, fill:"#06B6D4" },
    { name:"Overdue", value:overdue, fill:"#F43F5E" },
  ].filter(d=>d.value>0);

  const priorityChart = ["high","medium","low"].map(p => ({
    name: PRIORITY_META[p].label,
    value: tasks.filter(t=>t.priority===p).length,
    fill: PRIORITY_META[p].color,
  }));

  const categoryChart = CATEGORIES.map(c => ({
    name: c.charAt(0).toUpperCase()+c.slice(1),
    done:    tasks.filter(t=>t.category===c&&t.status==="done").length,
    pending: tasks.filter(t=>t.category===c&&t.status!=="done").length,
  })).filter(d=>d.done+d.pending>0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:12,padding:"10px 14px",fontFamily:"Montserrat",fontSize:12,fontWeight:700}}>
        {label && <div style={{color:"var(--text-2)",marginBottom:4}}>{label}</div>}
        {payload.map((p,i)=><div key={i} style={{color:p.fill||p.color}}>{p.name}: {p.value}</div>)}
      </div>
    );
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--dark-1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      <div style={{position:"relative",zIndex:1,padding:"32px 28px 60px"}}>
        {/* Page header */}
        <div className="fade-up" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:16,marginBottom:28}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,var(--violet),var(--cyan))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>✓</div>
              <h1 style={{fontWeight:900,fontSize:24,letterSpacing:-0.8}}>Task Manager</h1>
            </div>
            <p style={{fontSize:13,color:"var(--text-3)",fontWeight:500}}>
              {tasks.length} total tasks · {completion}% completion rate
            </p>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="tsk-btn-ghost" onClick={exportCSV}>⬇ Export CSV</button>
            <button className="tsk-btn-primary" onClick={()=>{setEditTask(null);setForm(EMPTY_FORM);setShowForm(true);}}>
              + New Task
            </button>
          </div>
        </div>

        {error && (
          <div style={{background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.3)",borderRadius:12,padding:"12px 18px",marginBottom:20,color:"#FCA5A5",fontSize:13,fontWeight:600,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            ⚠ {error}
            <button onClick={fetchTasks} style={{background:"rgba(244,63,94,.2)",border:"none",borderRadius:8,padding:"5px 12px",color:"#FCA5A5",fontSize:12,fontWeight:700,cursor:"pointer"}}>Retry</button>
          </div>
        )}

        {/* Stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:16,marginBottom:24}}>
          <StatCard icon="📋" label="Total Tasks"   value={tasks.length}     color="var(--text-1)"      sub="All tasks"          delay={0}/>
          <StatCard icon="✅" label="Completed"     value={done}             color="var(--emerald)"     sub={`${completion}%`}   delay={60}/>
          <StatCard icon="⏳" label="Pending"       value={pending}          color="var(--cyan)"        sub="To do"              delay={120}/>
          <StatCard icon="⚠️" label="Overdue"       value={overdue}          color="var(--rose)"        sub="Needs attention"    delay={180}/>
          <StatCard icon="⏱" label="Avg Completion" value={fmtMins(avgTime)} color="var(--violet-light)" sub="Per task"          delay={240}/>
        </div>

        {/* Progress bar */}
        <div className="tsk-card fade-up" style={{marginBottom:24,animationDelay:"260ms"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontWeight:700,fontSize:13}}>Overall Completion</span>
            <span style={{fontSize:13,fontWeight:800,color:"var(--violet-light)"}}>{completion}%</span>
          </div>
          <div style={{height:12,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${completion}%`,background:"linear-gradient(90deg,var(--violet),var(--cyan))",borderRadius:99,transition:"width 1.2s ease"}}/>
          </div>
          <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
            {[["✅","Done",done,"var(--emerald)"],["⏳","Pending",pending,"var(--cyan)"],["⚠️","Overdue",overdue,"var(--rose)"]].map(([ic,lb,vl,cl])=>(
              <div key={lb} style={{display:"flex",alignItems:"center",gap:6}}>
                <span>{ic}</span>
                <span style={{fontSize:11,color:"var(--text-3)",fontWeight:600}}>{lb}:</span>
                <span style={{fontSize:11,fontWeight:800,color:cl}}>{vl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Charts row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,marginBottom:24}}>
          {/* Status pie */}
          <div className="tsk-card fade-up" style={{animationDelay:"280ms"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:13,marginBottom:14}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"var(--violet-light)",display:"inline-block"}}/>Status Split
            </div>
            {statusChart.length===0 ? <div style={{height:160,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:13}}>No data</div> : (
              <div style={{height:160}}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusChart} dataKey="value" cx="50%" cy="50%" outerRadius={65} paddingAngle={4} strokeWidth={0}>
                      {statusChart.map((e,i)=><Cell key={i} fill={e.fill} style={{filter:`drop-shadow(0 4px 8px ${e.fill}55)`}}/>)}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:6}}>
              {statusChart.map(d=><div key={d.name} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:d.fill}}/><span style={{fontSize:10,fontWeight:600,color:"var(--text-2)"}}>{d.name} ({d.value})</span></div>)}
            </div>
          </div>

          {/* Priority bar */}
          <div className="tsk-card fade-up" style={{animationDelay:"320ms"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:13,marginBottom:14}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"var(--amber)",display:"inline-block"}}/>Priority Split
            </div>
            <div style={{height:160}}>
              <ResponsiveContainer>
                <BarChart data={priorityChart} margin={{top:5,right:5,left:-25,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="name" tick={{fill:"var(--text-3)",fontSize:10,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:"var(--text-3)",fontSize:10,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="value" radius={[5,5,0,0]}>
                    {priorityChart.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category stacked */}
          <div className="tsk-card fade-up" style={{animationDelay:"360ms"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:13,marginBottom:14}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"var(--cyan)",display:"inline-block"}}/>By Category
            </div>
            {categoryChart.length===0 ? <div style={{height:160,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-3)",fontSize:13}}>No data</div> : (
              <div style={{height:160}}>
                <ResponsiveContainer>
                  <BarChart data={categoryChart} margin={{top:5,right:5,left:-25,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="name" tick={{fill:"var(--text-3)",fontSize:9,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"var(--text-3)",fontSize:10,fontFamily:"Montserrat",fontWeight:600}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="done"    name="Done"    fill="#7C3AED" stackId="a" radius={[0,0,0,0]}/>
                    <Bar dataKey="pending" name="Pending" fill="#06B6D4" stackId="a" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Task list */}
        <div className="tsk-card fade-up" style={{animationDelay:"380ms"}}>
          {/* Controls */}
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginBottom:18}}>
            {/* Search */}
            <div style={{position:"relative",flex:1,minWidth:180}}>
              <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"var(--text-3)"}}>🔍</span>
              <input className="tsk-input" placeholder="Search tasks…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:36}}/>
            </div>
            {/* Filter tabs */}
            <div style={{display:"flex",gap:4,background:"var(--dark-4)",borderRadius:10,padding:4}}>
              {["all","done","pending","overdue"].map(f=>(
                <button key={f} className={`tsk-tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)} style={{textTransform:"capitalize"}}>{f}</button>
              ))}
            </div>
            {/* Sort */}
            <select className="tsk-select" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:"auto",minWidth:130}}>
              <option value="newest">↓ Newest</option>
              <option value="oldest">↑ Oldest</option>
              <option value="priority">🔴 Priority</option>
              <option value="az">A → Z</option>
            </select>
          </div>

          {loading ? <Spinner/> : visible.length===0 ? (
            <div style={{textAlign:"center",color:"var(--text-3)",fontSize:13,padding:"32px 0"}}>
              {search ? `No tasks matching "${search}"` : "No tasks found. Create your first one!"}
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {visible.map((task,i) => {
                const pm = PRIORITY_META[task.priority]||PRIORITY_META.medium;
                const sm = STATUS_META[task.status]||STATUS_META.pending;
                return (
                  <div key={task._id} className="tsk-row slide-in" style={{animationDelay:`${Math.min(i*25,300)}ms`}}>
                    {/* Checkbox */}
                    <div onClick={()=>toggleTask(task)}
                      style={{width:22,height:22,borderRadius:"50%",flexShrink:0,cursor:"pointer",
                        border:task.status==="done"?"none":"2px solid rgba(255,255,255,0.12)",
                        background:task.status==="done"?"var(--emerald)":"transparent",
                        display:"flex",alignItems:"center",justifyContent:"center",transition:"all .25s"}}
                      title="Toggle status">
                      {task.status==="done"&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                    </div>

                    {/* Title + meta */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,color:task.status==="done"?"var(--text-3)":"var(--text-1)",textDecoration:task.status==="done"?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {task.title}
                      </div>
                      <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,fontWeight:600,color:"var(--text-3)"}}>
                          {task.category||"general"} · {fmtDate(task.createdAt)}
                        </span>
                        {task.dueDate && (
                          <span style={{fontSize:10,fontWeight:700,color:new Date(task.dueDate)<new Date()&&task.status!=="done"?"var(--rose)":"var(--text-3)"}}>
                            Due: {fmtDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Priority badge */}
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:7,background:pm.bg,color:pm.color,flexShrink:0}}>{pm.label}</span>

                    {/* Status badge */}
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:7,background:sm.bg,color:sm.color,flexShrink:0,display:"none"}} className="status-badge">{sm.label}</span>

                    {/* Action buttons */}
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      {/* View */}
                      <button className="icon-btn" onClick={()=>setViewTask(task)} title="View details"
                        style={{background:"rgba(6,182,212,.1)",border:"1px solid rgba(6,182,212,.2)",color:"#67E8F9"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(6,182,212,.22)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(6,182,212,.1)"}>👁</button>
                      {/* Edit */}
                      <button className="icon-btn" onClick={()=>startEdit(task)} title="Edit task"
                        style={{background:"rgba(124,58,237,.12)",border:"1px solid rgba(124,58,237,.25)",color:"#C4B5FD"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(124,58,237,.28)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(124,58,237,.12)"}>✏</button>
                      {/* Delete */}
                      <button className="icon-btn" onClick={()=>setDeleteTarget(task)} title="Delete task"
                        style={{background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.2)",color:"#FCA5A5"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(244,63,94,.25)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(244,63,94,.1)"}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{marginTop:12,fontSize:11,color:"var(--text-3)",fontWeight:500,textAlign:"right"}}>
            Showing {visible.length} of {tasks.length} tasks
          </div>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:24,padding:30,width:480,boxShadow:"0 30px 80px rgba(0,0,0,.6)",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{fontFamily:"Montserrat",fontWeight:800,fontSize:17,marginBottom:20}}>
              {editTask ? "✏️ Edit Task" : "➕ New Task"}
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Title *</label>
                <input className="tsk-input" placeholder="What needs to be done?" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}
                  onKeyDown={e=>e.key==="Enter"&&saveTask()}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Priority</label>
                  <select className="tsk-select" value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Category</label>
                  <select className="tsk-select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Status</label>
                  <select className="tsk-select" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                    <option value="pending">⏳ Pending</option>
                    <option value="done">✅ Done</option>
                    <option value="overdue">⚠️ Overdue</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Due Date</label>
                  <input className="tsk-input" type="date" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))} style={{colorScheme:"dark"}}/>
                </div>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:700,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:0.8,display:"block",marginBottom:6}}>Note (optional)</label>
                <textarea className="tsk-input" placeholder="Any extra details…" value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} rows={2} style={{resize:"none",fontFamily:"Montserrat"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:22}}>
              <button className="tsk-btn-ghost" style={{flex:1}} onClick={()=>{setShowForm(false);setEditTask(null);setForm(EMPTY_FORM);}}>Cancel</button>
              <button className="tsk-btn-primary" style={{flex:2}} onClick={saveTask} disabled={saving||!form.title.trim()}>
                {saving?"Saving…":editTask?"Update Task":"Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Detail Modal ── */}
      {viewTask && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setViewTask(null)}>
          <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:24,padding:30,width:440,boxShadow:"0 30px 80px rgba(0,0,0,.6)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
              <h3 style={{fontFamily:"Montserrat",fontWeight:800,fontSize:17}}>Task Details</h3>
              <button onClick={()=>setViewTask(null)} style={{background:"none",border:"none",color:"var(--text-3)",cursor:"pointer",fontSize:18,lineHeight:1}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{padding:"14px 16px",background:"var(--dark-4)",borderRadius:13}}>
                <div style={{fontWeight:700,fontSize:15,color:"var(--text-1)",marginBottom:4}}>{viewTask.title}</div>
                {viewTask.note && <div style={{fontSize:12,color:"var(--text-2)",lineHeight:1.6}}>{viewTask.note}</div>}
              </div>
              {[
                ["Status",   STATUS_META[viewTask.status]?.label||"Pending"],
                ["Priority", PRIORITY_META[viewTask.priority]?.label||"Medium"],
                ["Category", viewTask.category||"general"],
                ["Created",  fmtDate(viewTask.createdAt)],
                ["Due Date", viewTask.dueDate?fmtDate(viewTask.dueDate):"—"],
                ["Completed",viewTask.completedAt?fmtDate(viewTask.completedAt):"—"],
              ].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontSize:12,color:"var(--text-3)",fontWeight:600}}>{k}</span>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--text-1)"}}>{v}</span>
                </div>
              ))}
              {viewTask.completedAt&&viewTask.createdAt && (
                <div style={{padding:"10px 14px",background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.2)",borderRadius:10,fontSize:12,color:"#6EE7B7",fontWeight:600}}>
                  ⚡ Completed in {fmtMins((new Date(viewTask.completedAt)-new Date(viewTask.createdAt))/60000)}
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button className="tsk-btn-ghost" style={{flex:1}} onClick={()=>setViewTask(null)}>Close</button>
              <button className="tsk-btn-primary" style={{flex:1}} onClick={()=>{setViewTask(null);startEdit(viewTask);}}>✏ Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDeleteTarget(null)}>
          <div style={{background:"var(--dark-3)",border:"1px solid var(--glass-b)",borderRadius:20,padding:28,width:360,boxShadow:"0 30px 80px rgba(0,0,0,.6)"}}>
            <div style={{fontSize:32,textAlign:"center",marginBottom:12}}>⚠️</div>
            <h3 style={{fontFamily:"Montserrat",fontWeight:800,fontSize:16,textAlign:"center",marginBottom:8}}>Delete Task</h3>
            <p style={{fontFamily:"Montserrat",fontSize:13,color:"var(--text-2)",textAlign:"center",marginBottom:22,lineHeight:1.6}}>
              Delete <strong style={{color:"var(--text-1)"}}>{deleteTarget.title}</strong>? This cannot be undone.
            </p>
            <div style={{display:"flex",gap:10}}>
              <button className="tsk-btn-ghost" style={{flex:1}} onClick={()=>setDeleteTarget(null)}>Cancel</button>
              <button onClick={confirmDelete} style={{flex:1,padding:"10px",background:"var(--rose)",border:"none",borderRadius:11,color:"#fff",fontFamily:"Montserrat",fontWeight:700,fontSize:13,cursor:"pointer"}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}