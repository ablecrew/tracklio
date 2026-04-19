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
  .orb1{width:500px;height:500px;background:var(--r);top:-150px;right:-100px;opacity:.08}
  .orb2{width:400px;height:400px;background:var(--v);bottom:-100px;left:-100px;opacity:.09}
  @keyframes float-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .4s ease both}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:18px;overflow:hidden;margin-bottom:16px}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6);background-size:300% 100%;animation:accent-flow 5s linear infinite;position:sticky;top:0;z-index:100}
  .notif-row{display:flex;align-items:flex-start;gap:14px;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;transition:background .15s}
  .notif-row:last-child{border-bottom:none}
  .notif-row:hover{background:rgba(255,255,255,.02)}
  .notif-row.unread{background:rgba(124,58,237,.04)}
  .notif-row.unread:hover{background:rgba(124,58,237,.07)}
  .filter-btn{padding:6px 14px;border-radius:9px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
  .filter-btn.active{background:var(--v);color:#fff}
  .filter-btn:not(.active){background:transparent;color:var(--t3)}
  .filter-btn:not(.active):hover{color:var(--t1)}
  .btn-ghost{padding:8px 16px;background:rgba(255,255,255,.04);border:1px solid var(--gb);border-radius:10px;color:var(--t2);font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
  .btn-ghost:hover{background:rgba(255,255,255,.07);color:var(--t1)}
  .notif-pref-toggle{width:40px;height:22px;border-radius:11px;position:relative;cursor:pointer;transition:background .3s;flex-shrink:0}
  .notif-pref-thumb{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .3s;box-shadow:0 2px 4px rgba(0,0,0,.4)}
`;

const NOTIF_META = {
  ai:      {icon:"🤖", bg:"rgba(124,58,237,0.2)", color:"#C4B5FD", label:"AI"},
  finance: {icon:"💰", bg:"rgba(16,185,129,0.2)",  color:"#6EE7B7", label:"Finance"},
  task:    {icon:"✓",  bg:"rgba(245,158,11,0.2)",  color:"#FCD34D", label:"Tasks"},
  report:  {icon:"📊", bg:"rgba(6,182,212,0.2)",   color:"#67E8F9", label:"Reports"},
  habit:   {icon:"🎯", bg:"rgba(124,58,237,0.15)", color:"#C4B5FD", label:"Habits"},
  system:  {icon:"⚙️", bg:"rgba(255,255,255,0.08)",color:"#9090B8", label:"System"},
};

/* Generate notifications from real data when /notifications endpoint doesn't exist */
function generateFromData(tasks, transactions) {
  const notifs = [];
  const now = new Date();
  /* Overdue tasks */
  const overdue = tasks.filter(t => t.status==="overdue" || (t.dueDate && new Date(t.dueDate)<now && t.status!=="done"));
  if (overdue.length) {
    notifs.push({ _id:"sys-overdue", type:"task", title:"Overdue Tasks", message:`You have ${overdue.length} overdue task${overdue.length>1?"s":""}`, read:false, createdAt:new Date().toISOString(), link:"/tasks" });
  }
  /* Budget warning */
  const income   = transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses = transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const pct      = income > 0 ? Math.round((expenses/income)*100) : 0;
  if (pct > 80) {
    notifs.push({ _id:"sys-budget", type:"finance", title:"Budget Alert", message:`You've used ${pct}% of your income this month`, read:false, createdAt:new Date().toISOString(), link:"/finance" });
  }
  /* Recent task completions */
  const recentDone = tasks.filter(t => t.status==="done" && t.completedAt).slice(-3);
  recentDone.forEach(t => {
    notifs.push({ _id:`done-${t._id}`, type:"task", title:"Task completed", message:t.title, read:true, createdAt:t.completedAt, link:"/tasks" });
  });
  return notifs.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
}

function Spinner() {
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:50}}><div style={{width:32,height:32,borderRadius:"50%",border:"3px solid rgba(255,255,255,.07)",borderTopColor:"var(--vl)",animation:"spin .8s linear infinite"}}/></div>;
}

export default function Notifications() {
  useEffect(()=>{
    const id="trkl-notifs";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("all");
  const [activeTab,     setActiveTab]     = useState("inbox");

  useEffect(()=>{
    setLoading(true);
    API.get("/notifications")
      .then(res => { setNotifications(res.data||[]); setLoading(false); })
      .catch(()=>{
        /* Build from real data */
        Promise.all([
          API.get("/tasks").catch(()=>({data:[]})),
          API.get("/transactions").catch(()=>({data:[]})),
        ]).then(([tRes, txRes])=>{
          setNotifications(generateFromData(tRes.data||[], txRes.data||[]));
        }).finally(()=>setLoading(false));
      });
  },[]);

  const markRead = (id) => {
    setNotifications(p => p.map(n => n._id===id?{...n,read:true}:n));
    API.put(`/notifications/${id}/read`).catch(()=>{});
  };
  const markAllRead = () => {
    setNotifications(p => p.map(n=>({...n,read:true})));
    API.put("/notifications/read-all").catch(()=>{});
  };
  const deleteNotif = (id) => {
    setNotifications(p => p.filter(n=>n._id!==id));
    API.delete(`/notifications/${id}`).catch(()=>{});
  };
  const clearAll = () => {
    setNotifications([]);
    API.delete("/notifications/all").catch(()=>{});
  };

  const filtered = notifications
    .filter(n => filter==="all" || n.type===filter)
    .filter(n => activeTab==="unread" ? !n.read : true);

  const unreadCount = notifications.filter(n=>!n.read).length;
  const fmtTime = d => {
    if(!d) return ""; const diff=Date.now()-new Date(d).getTime();
    if(diff<60000)   return "Just now";
    if(diff<3600000) return `${Math.floor(diff/60000)}m ago`;
    if(diff<86400000)return `${Math.floor(diff/3600000)}h ago`;
    return new Date(d).toLocaleDateString("en-KE",{day:"2-digit",month:"short"});
  };

  return (
    <div style={{minHeight:"100vh",background:"var(--d1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="nav-accent"/>

      <div style={{position:"relative",zIndex:1,maxWidth:820,margin:"0 auto",padding:"40px 28px 80px"}}>
        {/* Header */}
        <div className="fade-up" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:14,marginBottom:28}}>
          <div>
            <h1 style={{fontWeight:900,fontSize:28,letterSpacing:-0.8,marginBottom:6}}>
              Notifications
              {unreadCount>0&&<span style={{marginLeft:12,fontSize:16,background:"var(--r)",color:"#fff",padding:"2px 10px",borderRadius:12,fontWeight:700}}>{unreadCount}</span>}
            </h1>
            <p style={{fontSize:13,color:"var(--t3)",fontWeight:500}}>
              {notifications.length} total · {unreadCount} unread
            </p>
          </div>
          <div style={{display:"flex",gap:8}}>
            {unreadCount>0&&<button className="btn-ghost" onClick={markAllRead}>✓ Mark all read</button>}
            {notifications.length>0&&<button className="btn-ghost" onClick={clearAll} style={{color:"#F87171"}}>🗑 Clear all</button>}
          </div>
        </div>

        {/* Tabs + filter */}
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",gap:4,background:"var(--d3)",borderRadius:10,padding:4}}>
            {["inbox","unread"].map(t=>(
              <button key={t} className={`filter-btn ${activeTab===t?"active":""}`} onClick={()=>setActiveTab(t)} style={{textTransform:"capitalize"}}>
                {t==="unread"?`Unread (${unreadCount})`:"All"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:4,background:"var(--d3)",borderRadius:10,padding:4,flexWrap:"wrap"}}>
            {["all","task","finance","ai","habit","system"].map(f=>(
              <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)} style={{textTransform:"capitalize"}}>{f==="all"?"All":NOTIF_META[f]?.label||f}</button>
            ))}
          </div>
        </div>

        {/* Notification list */}
        <div className="card fade-up">
          {loading ? <Spinner/> : filtered.length===0 ? (
            <div style={{textAlign:"center",padding:"50px 20px"}}>
              <div style={{fontSize:48,marginBottom:12}}>🔔</div>
              <h3 style={{fontWeight:800,fontSize:18,marginBottom:8}}>You're all caught up!</h3>
              <p style={{fontSize:13,color:"var(--t3)",fontWeight:500}}>
                {activeTab==="unread"?"No unread notifications":"No notifications yet"}
              </p>
            </div>
          ) : (
            filtered.map((n, i) => {
              const meta = NOTIF_META[n.type] || NOTIF_META.system;
              return (
                <div key={n._id} className={`notif-row${n.read?"":" unread"} fade-up`}
                  style={{animationDelay:`${i*30}ms`}}
                  onClick={()=>{ markRead(n._id); if(n.link) window.location.href=n.link; }}>
                  {/* Unread dot */}
                  {!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:"var(--vl)",flexShrink:0,marginTop:5,animation:"pulse 2s infinite"}}/>}
                  {n.read&&<div style={{width:7,height:7,flexShrink:0}}/>}
                  {/* Icon */}
                  <div style={{width:40,height:40,borderRadius:"50%",background:meta.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{meta.icon}</div>
                  {/* Content */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <span style={{fontWeight:700,fontSize:14,color:n.read?"var(--t2)":"var(--t1)"}}>{n.title}</span>
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,background:meta.bg,color:meta.color}}>{meta.label}</span>
                    </div>
                    {n.message&&<div style={{fontSize:13,color:"var(--t2)",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{n.message}</div>}
                    <div style={{fontSize:11,color:"var(--t3)",fontWeight:600}}>{fmtTime(n.createdAt)}</div>
                  </div>
                  {/* Delete */}
                  <button onClick={e=>{e.stopPropagation();deleteNotif(n._id);}}
                    style={{width:28,height:28,borderRadius:8,background:"none",border:"none",color:"var(--t3)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(244,63,94,.1)";e.currentTarget.style.color="#FCA5A5";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="var(--t3)";}}>
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}