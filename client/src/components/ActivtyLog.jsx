import { useEffect, useState } from "react";
import API from "../api/api";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--v:#7C3AED;--vl:#8B5CF6;--c:#06B6D4;--e:#10B981;--r:#F43F5E;--a:#F59E0B;
    --d1:#080810;--d3:#14141F;--d4:#1A1A28;--d5:#222235;
    --gb:rgba(255,255,255,0.07);--t1:#F0F0FF;--t2:#9090B8;--t3:#505075;}
  html,body{font-family:'Montserrat',sans-serif;background:var(--d1);color:var(--t1)}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--d5);border-radius:99px}
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .orb1{width:500px;height:500px;background:var(--c);top:-150px;left:-100px;opacity:.09}
  .orb2{width:400px;height:400px;background:var(--v);bottom:-100px;right:-100px;opacity:.08}
  @keyframes float-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .4s ease both}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:18px;padding:22px;margin-bottom:16px}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6);background-size:300% 100%;animation:accent-flow 5s linear infinite;position:sticky;top:0;z-index:100}
  .act-item{display:flex;align-items:flex-start;gap:14px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.04);position:relative}
  .act-item:last-child{border-bottom:none}
  .act-line{position:absolute;left:17px;top:44px;width:1px;bottom:0;background:rgba(255,255,255,.05)}
  .act-item:last-child .act-line{display:none}
  .filter-btn{padding:6px 14px;border-radius:9px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
  .filter-btn.active{background:var(--v);color:#fff}
  .filter-btn:not(.active){background:transparent;color:var(--t3)}
  .filter-btn:not(.active):hover{color:var(--t1)}
  .input-field{padding:9px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .input-field:focus{border-color:var(--vl)}
`;

const TYPE_META = {
  task_created:   {icon:"➕", bg:"rgba(124,58,237,.2)",  color:"#C4B5FD", label:"Task Created"    },
  task_completed: {icon:"✅", bg:"rgba(16,185,129,.2)",   color:"#6EE7B7", label:"Task Completed"  },
  task_deleted:   {icon:"🗑", bg:"rgba(244,63,94,.15)",   color:"#FCA5A5", label:"Task Deleted"    },
  task_updated:   {icon:"✏", bg:"rgba(245,158,11,.15)",   color:"#FCD34D", label:"Task Updated"    },
  transaction:    {icon:"💳", bg:"rgba(6,182,212,.2)",    color:"#67E8F9", label:"Transaction"     },
  income:         {icon:"💰", bg:"rgba(16,185,129,.2)",   color:"#6EE7B7", label:"Income Logged"   },
  habit_checkin:  {icon:"🎯", bg:"rgba(124,58,237,.15)",  color:"#C4B5FD", label:"Habit Check-in"  },
  ai_insight:     {icon:"🤖", bg:"rgba(124,58,237,.2)",   color:"#C4B5FD", label:"AI Insight"      },
  login:          {icon:"🔐", bg:"rgba(255,255,255,.08)", color:"#9090B8", label:"Login"           },
  settings:       {icon:"⚙️", bg:"rgba(255,255,255,.06)", color:"#9090B8", label:"Settings Changed"},
};

function buildActivityFromRealData(tasks, transactions) {
  const activities = [];
  /* From tasks */
  tasks.forEach(t => {
    activities.push({
      _id:       `t-${t._id}-created`,
      type:      "task_created",
      title:     "Task created",
      detail:    t.title,
      createdAt: t.createdAt,
    });
    if (t.status === "done" && t.completedAt) {
      activities.push({
        _id:       `t-${t._id}-done`,
        type:      "task_completed",
        title:     "Task completed",
        detail:    t.title,
        createdAt: t.completedAt,
      });
    }
  });
  /* From transactions */
  transactions.forEach(tx => {
    activities.push({
      _id:       `tx-${tx._id}`,
      type:      tx.type === "income" ? "income" : "transaction",
      title:     tx.type === "income" ? "Income received" : "Expense logged",
      detail:    `${tx.title} · KES ${Number(tx.amount).toLocaleString("en-KE")}`,
      createdAt: tx.createdAt || tx.date,
    });
  });
  /* Sort newest first */
  return activities.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function Spinner() {
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:50}}><div style={{width:34,height:34,borderRadius:"50%",border:"3px solid rgba(255,255,255,.07)",borderTopColor:"var(--vl)",animation:"spin .8s linear infinite"}}/></div>;
}

export default function ActivityLog() {
  useEffect(()=>{
    const id="trkl-activity";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const PER_PAGE = 20;

  useEffect(()=>{
    setLoading(true);
    /* Try dedicated /activity endpoint first, fall back to building from tasks+transactions */
    API.get("/activity")
      .then(res => { setActivities(res.data || []); setLoading(false); })
      .catch(()=>{
        /* Build from real task + transaction data */
        Promise.all([
          API.get("/tasks").catch(()=>({data:[]})),
          API.get("/transactions").catch(()=>({data:[]})),
        ]).then(([tRes, txRes])=>{
          setActivities(buildActivityFromRealData(tRes.data||[], txRes.data||[]));
        }).finally(()=>setLoading(false));
      });
  },[]);

  const FILTER_TYPES = ["all","task_created","task_completed","transaction","income","habit_checkin","ai_insight"];

  const visible = activities
    .filter(a => filter==="all" || a.type===filter)
    .filter(a => !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.detail?.toLowerCase().includes(search.toLowerCase()));

  const paginated = visible.slice(0, page * PER_PAGE);
  const hasMore   = paginated.length < visible.length;

  const fmtTime = d => {
    if (!d) return ""; const diff = Date.now()-new Date(d).getTime();
    if (diff<60000)    return "just now";
    if (diff<3600000)  return `${Math.floor(diff/60000)}m ago`;
    if (diff<86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(d).toLocaleDateString("en-KE",{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
  };

  const fmtDay = d => {
    const today  = new Date(); today.setHours(0,0,0,0);
    const yest   = new Date(today); yest.setDate(yest.getDate()-1);
    const date   = new Date(d); date.setHours(0,0,0,0);
    if (+date===+today) return "Today";
    if (+date===+yest)  return "Yesterday";
    return new Date(d).toLocaleDateString("en-KE",{weekday:"long",day:"2-digit",month:"long"});
  };

  /* Group by day */
  const grouped = paginated.reduce((acc, a) => {
    const day = fmtDay(a.createdAt);
    if (!acc[day]) acc[day] = [];
    acc[day].push(a);
    return acc;
  }, {});

  /* Summary stats */
  const today = new Date().toISOString().split("T")[0];
  const todayCount    = activities.filter(a => a.createdAt?.startsWith(today)).length;
  const tasksCount    = activities.filter(a => a.type?.startsWith("task")).length;
  const financeCount  = activities.filter(a => ["transaction","income"].includes(a.type)).length;

  return (
    <div style={{minHeight:"100vh",background:"var(--d1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="nav-accent"/>

      <div style={{position:"relative",zIndex:1,maxWidth:820,margin:"0 auto",padding:"40px 28px 80px"}}>
        {/* Header */}
        <div className="fade-up" style={{marginBottom:28}}>
          <h1 style={{fontWeight:900,fontSize:28,letterSpacing:-0.8,marginBottom:6}}>Activity Log</h1>
          <p style={{fontSize:13,color:"var(--t3)",fontWeight:500}}>A full timeline of everything you've done in Tracklio</p>
        </div>

        {/* Summary */}
        <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
          {[
            {label:"Today",    val:todayCount,        color:"var(--vl)"},
            {label:"Total",    val:activities.length,  color:"var(--c)"},
            {label:"Tasks",    val:tasksCount,         color:"var(--e)"},
            {label:"Finance",  val:financeCount,       color:"var(--a)"},
          ].map(({label,val,color})=>(
            <div key={label} style={{background:"var(--d3)",border:"1px solid var(--gb)",borderRadius:14,padding:"14px 20px",flex:1,minWidth:100}}>
              <div style={{fontSize:24,fontWeight:900,color,letterSpacing:-0.5}}>{val}</div>
              <div style={{fontSize:10,fontWeight:700,color:"var(--t3)",marginTop:3,textTransform:"uppercase",letterSpacing:.7}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:1,minWidth:180}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"var(--t3)"}}>🔍</span>
            <input className="input-field" style={{width:"100%",paddingLeft:34}} placeholder="Search activity…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{display:"flex",gap:4,background:"var(--d3)",borderRadius:10,padding:4,flexWrap:"wrap"}}>
            {[["all","All"],["task_created","Created"],["task_completed","Done"],["transaction","Finance"],["habit_checkin","Habits"]].map(([v,l])=>(
              <button key={v} className={`filter-btn ${filter===v?"active":""}`} onClick={()=>{setFilter(v);setPage(1);}}>{l}</button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          {loading ? <Spinner/> : visible.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 0",color:"var(--t3)"}}>
              <div style={{fontSize:40,marginBottom:10}}>📭</div>
              <div style={{fontSize:14,fontWeight:600}}>{search?"No activity matches your search":"No activity yet"}</div>
            </div>
          ) : (
            Object.entries(grouped).map(([day, items]) => (
              <div key={day} style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:800,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1,marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
                  <div style={{height:1,flex:1,background:"rgba(255,255,255,.06)"}}/>
                  {day}
                  <div style={{height:1,flex:1,background:"rgba(255,255,255,.06)"}}/>
                </div>
                {items.map((a, i) => {
                  const meta = TYPE_META[a.type] || TYPE_META.task_created;
                  return (
                    <div key={a._id} className="act-item">
                      <div className="act-line"/>
                      <div style={{width:36,height:36,borderRadius:"50%",background:meta.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,zIndex:1}}>{meta.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                          <span style={{fontSize:12,fontWeight:700,color:"var(--t1)"}}>{a.title}</span>
                          <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:6,background:meta.bg,color:meta.color}}>{meta.label}</span>
                        </div>
                        {a.detail && <div style={{fontSize:12,color:"var(--t2)",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.detail}</div>}
                      </div>
                      <span style={{fontSize:11,color:"var(--t3)",fontWeight:500,flexShrink:0,marginTop:2}}>{fmtTime(a.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {hasMore && (
            <div style={{textAlign:"center",paddingTop:16}}>
              <button onClick={()=>setPage(p=>p+1)} style={{padding:"9px 24px",background:"rgba(124,58,237,.1)",border:"1px solid rgba(124,58,237,.2)",borderRadius:11,color:"#C4B5FD",fontFamily:"Montserrat,sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                Load more ({visible.length - paginated.length} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}