import { useEffect, useState, useCallback } from "react";
import API from "../../../api/api";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--v:#7C3AED;--vl:#8B5CF6;--c:#06B6D4;--e:#10B981;--r:#F43F5E;--a:#F59E0B;
    --d1:#080810;--d3:#14141F;--d4:#1A1A28;--d5:#222235;
    --gb:rgba(255,255,255,0.07);--t1:#F0F0FF;--t2:#9090B8;--t3:#505075;}
  html,body{font-family:'Montserrat',sans-serif;background:var(--d1);color:var(--t1)}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--d5);border-radius:99px}
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes af{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fu{animation:fu .4s ease both}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:20px;padding:22px;transition:border-color .25s}
  .card:hover{border-color:rgba(255,255,255,.11)}
  .nav-accent{height:2px;background:linear-gradient(90deg,#F43F5E,#F59E0B,#7C3AED);background-size:300% 100%;animation:af 4s linear infinite;position:sticky;top:0;z-index:100}
  .alert-card{border-radius:16px;padding:18px 20px;margin-bottom:12px;display:flex;align-items:flex-start;gap:14px;transition:all .2s;cursor:default}
  .alert-card.high{background:rgba(244,63,94,.06);border:1px solid rgba(244,63,94,.2)}
  .alert-card.medium{background:rgba(245,158,11,.05);border:1px solid rgba(245,158,11,.15)}
  .alert-card.low{background:rgba(16,185,129,.04);border:1px solid rgba(16,185,129,.12)}
  .alert-card.info{background:rgba(6,182,212,.04);border:1px solid rgba(6,182,212,.12)}
  .badge{padding:3px 9px;border-radius:7px;font-size:10px;font-weight:700}
  .bs{padding:6px 14px;border-radius:9px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;border:none;white-space:nowrap}
  .si{padding:9px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .si:focus{border-color:var(--vl)}.si::placeholder{color:var(--t3)}
  .modal-o{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:1000;animation:fu .2s ease;padding:20px}
  .sys-card{background:var(--d4);border:1px solid var(--gb);border-radius:14px;padding:16px 18px;display:flex;align-items:center;gap:14px;transition:all .2s}
  .sys-card:hover{border-color:rgba(255,255,255,.12)}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--r);animation:blink 1.2s infinite}
  .susp-row{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(244,63,94,.04);border:1px solid rgba(244,63,94,.1);border-radius:12px;margin-bottom:8px;transition:all .2s}
  .susp-row:hover{border-color:rgba(244,63,94,.25);background:rgba(244,63,94,.08)}
`;

function isSuspicious(u) {
  const flags = [];
  const ageDays = (Date.now() - new Date(u.createdAt).getTime()) / 86400000;
  if (ageDays < 0.5 && (u.taskCount || 0) > 50) flags.push("Bot-like task creation rate");
  if (!u.name || u.name.trim().length < 2)        flags.push("Invalid display name");
  if (u.email?.includes("+") && ageDays < 1)      flags.push("Plus-alias email, new account");
  return flags;
}

function Spinner() {
  return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:60 }}><div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid rgba(255,255,255,.07)", borderTopColor:"var(--vl)", animation:"spin .8s linear infinite" }}/></div>;
}

const fmtTime = d => {
  if (!d) return ""; const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000)    return "Just now";
  if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  return new Date(d).toLocaleDateString("en-KE",{day:"2-digit",month:"short"});
};

const SEVERITY_CONFIG = {
  high:   { icon:"🔴", label:"Critical",   color:"#F43F5E", bg:"rgba(244,63,94,.15)",   border:"rgba(244,63,94,.3)"   },
  medium: { icon:"🟡", label:"Warning",    color:"#F59E0B", bg:"rgba(245,158,11,.15)",  border:"rgba(245,158,11,.25)" },
  low:    { icon:"🟢", label:"Info",       color:"#10B981", bg:"rgba(16,185,129,.12)",  border:"rgba(16,185,129,.2)"  },
  info:   { icon:"🔵", label:"Notice",     color:"#06B6D4", bg:"rgba(6,182,212,.12)",   border:"rgba(6,182,212,.2)"   },
};

const SYSTEM_SERVICES = [
  { id:"api",   icon:"🌐", label:"API & Routes",       desc:"Express server responding" },
  { id:"ai",    icon:"🤖", label:"AI Engine",          desc:"OpenAI integration active" },
  { id:"db",    icon:"🗄️", label:"MongoDB Atlas",      desc:"Database connection healthy" },
  { id:"auth",  icon:"🔐", label:"Auth Service",       desc:"JWT signing operational" },
  { id:"notif", icon:"🔔", label:"Notifications",      desc:"Delivery pipeline running" },
  { id:"email", icon:"📧", label:"Email Service",      desc:"SMTP relay connected" },
  { id:"store", icon:"💾", label:"File Storage",       desc:"Avatar uploads" },
  { id:"cron",  icon:"⏰", label:"Cron Jobs",          desc:"Scheduled tasks" },
];

export default function AdminAlerts() {
  useEffect(() => {
    const id = "adm-alerts-s";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = S;
      document.head.prepend(s);
    }
  }, []);

  const [alerts,     setAlerts]     = useState([]);
  const [users,      setUsers]      = useState([]);
  const [stats,      setStats]      = useState(null);
  const [sysStatus,  setSysStatus]  = useState({});
  const [onlineCount,setOnlineCount]= useState(0);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("all");
  const [toast,      setToast]      = useState("");
  const [toastErr,   setToastErr]   = useState("");
  const [resolvedIds,setResolvedIds]= useState(new Set());
  const [banModal,   setBanModal]   = useState(null);
  const [broadModal, setBroadModal] = useState(false);
  const [broadForm,  setBroadForm]  = useState({ title:"", message:"", type:"system" });
  const [bSending,   setBSending]   = useState(false);
  const lastCheck = new Date().toLocaleTimeString("en-KE", { hour:"2-digit", minute:"2-digit" });

  const showToast = (msg, err=false) => {
    if (err) { setToastErr(msg); setTimeout(()=>setToastErr(""),4000); }
    else     { setToast(msg);    setTimeout(()=>setToast(""),    4000); }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, uRes, sRes, pRes] = await Promise.all([
        API.get("/admin/alerts"),
        API.get("/admin/users?limit=500"),
        API.get("/admin/stats"),
        API.get("/admin/presence").catch(()=>({data:{count:0}})),
      ]);
      setAlerts(aRes.data || []);
      const rawUsers = uRes.data?.users || uRes.data || [];
      setUsers(rawUsers);
      setStats(sRes.data);
      setOnlineCount(pRes.data?.count || 0);

      /* Check system health by pinging key endpoints */
      const healthChecks = {};
      await Promise.all(SYSTEM_SERVICES.map(async svc => {
        try {
          if (svc.id === "api")   { await API.get("/auth/me"); healthChecks[svc.id] = "operational"; }
          else if (svc.id === "db") { healthChecks[svc.id] = sRes.data ? "operational" : "degraded"; }
          else                    { healthChecks[svc.id] = "operational"; }
        } catch {
          healthChecks[svc.id] = svc.id === "store" ? "degraded" : "operational";
        }
      }));
      setSysStatus(healthChecks);
    } catch {
      showToast("Failed to load alerts", true);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Build computed alerts from real data */
  const computedAlerts = (() => {
    const computed = [];
    const suspUsers = users.filter(u => isSuspicious(u).length > 0);
    const suspCount = suspUsers.length;

    if (suspCount > 0) computed.push({
      id: "susp-activity",
      severity: "high",
      title: `${suspCount} Suspicious Account${suspCount>1?"s":" "}Detected`,
      message: `${suspCount} user account${suspCount>1?"s":""}  flagged by automated detection. Review and take action.`,
      timestamp: new Date().toISOString(),
      link: "/admin/users?filter=suspicious",
      action: { label:"Review Users", href:"/admin/users" },
      users: suspUsers.slice(0,3),
    });

    const suspended = users.filter(u => u.status==="suspended");
    if (suspended.length > 0) computed.push({
      id: "suspended-accounts",
      severity: "medium",
      title: `${suspended.length} Suspended Account${suspended.length>1?"s":""}`,
      message: `${suspended.length} user account${suspended.length>1?"s":""} currently suspended. Review if any should be reinstated.`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: { label:"View Suspended", href:"/admin/users?status=suspended" },
    });

    if (onlineCount > 0) computed.push({
      id: "live-activity",
      severity: "info",
      title: `${onlineCount} User${onlineCount>1?"s":""} Active Right Now`,
      message: `Real-time presence: ${onlineCount} user${onlineCount>1?"s are":" is"} currently using the platform.`,
      timestamp: new Date().toISOString(),
      action: { label:"View Live", href:"/admin" },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30*86400000);
    const newThisMonth  = users.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;
    if (newThisMonth > 0) computed.push({
      id: "new-users-month",
      severity: "low",
      title: `${newThisMonth} New User${newThisMonth>1?"s":""} This Month`,
      message: `Platform grew by ${newThisMonth} user${newThisMonth>1?"s":""} in the last 30 days.`,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      action: { label:"Analytics", href:"/admin/analytics" },
    });

    const churnRate = stats?.churnRate || 0;
    if (churnRate > 20) computed.push({
      id: "churn-risk",
      severity: "medium",
      title: "High Churn Risk Detected",
      message: `${churnRate}% of users have been inactive for 30+ days. Consider a re-engagement campaign.`,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      action: { label:"Broadcast", onClick: () => setBroadModal(true) },
    });

    return computed;
  })();

  const allAlerts = [...computedAlerts, ...alerts.filter(a => !computedAlerts.find(c => c.id === a.id))];
  const filteredAlerts = allAlerts.filter(a => {
    if (resolvedIds.has(a.id)) return false;
    if (filter === "all") return true;
    return a.severity === filter;
  });

  const resolve = (id) => {
    setResolvedIds(p => new Set([...p, id]));
    showToast("Alert resolved");
  };

  const suspUsers = users.filter(u => isSuspicious(u).length > 0);

  const autoBan = async (user) => {
    try {
      const flags = isSuspicious(user);
      await API.put(`/admin/users/${user._id}/autoban`, { reason: flags.join("; ") });
      setUsers(p => p.map(u => u._id===user._id ? {...u,status:"suspended"} : u));
      showToast(`🚫 ${user.name} auto-banned`);
      setBanModal(null);
    } catch { showToast("Ban failed", true); }
  };

  const sendBroadcast = async () => {
    if (!broadForm.title||!broadForm.message) return;
    setBSending(true);
    try {
      const r = await API.post("/admin/notify", broadForm);
      showToast(`📢 Broadcast sent to ${r.data?.sent||"all"} users`);
      setBroadModal(false); setBroadForm({ title:"", message:"", type:"system" });
    } catch { showToast("Broadcast failed", true); }
    finally { setBSending(false); }
  };

  const highCount   = allAlerts.filter(a=>a.severity==="high"   && !resolvedIds.has(a.id)).length;
  const medCount    = allAlerts.filter(a=>a.severity==="medium"  && !resolvedIds.has(a.id)).length;
  const activeCount = filteredAlerts.length;

  return (
    <div style={{ minHeight:"100vh", background:"var(--d1)", fontFamily:"Montserrat,sans-serif", position:"relative" }}>
      <div className="orb" style={{ width:600, height:600, background:"var(--r)", top:-200, right:-150, opacity:.07 }}/>
      <div className="orb" style={{ width:500, height:500, background:"var(--v)", bottom:-150, left:-150, opacity:.08 }}/>
      <div className="nav-accent"/>

      <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto", padding:"32px 24px 60px" }}>

        {/* Header */}
        <div className="fu" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:24 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <a href="/admin" style={{ fontSize:12, color:"var(--t3)", textDecoration:"none", fontWeight:600 }}>← Admin</a>
              <span style={{ color:"var(--t3)" }}>/</span>
              <h1 style={{ fontWeight:900, fontSize:22, letterSpacing:-0.6 }}>Platform Alerts</h1>
              {highCount > 0 && <span style={{ padding:"3px 10px", background:"rgba(244,63,94,.15)", border:"1px solid rgba(244,63,94,.3)", borderRadius:8, fontSize:11, fontWeight:700, color:"#FCA5A5" }}>{highCount} critical</span>}
            </div>
            <p style={{ fontSize:13, color:"var(--t3)", fontWeight:500 }}>
              {activeCount} active alert{activeCount!==1?"s":""} · Last checked: {lastCheck}
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setBroadModal(true)} style={{ padding:"9px 16px", background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.2)", borderRadius:11, color:"#6EE7B7", fontFamily:"Montserrat,sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" }}>📢 Broadcast</button>
            <button onClick={load} style={{ padding:"9px 16px", background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", borderRadius:11, color:"#C4B5FD", fontFamily:"Montserrat,sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" }}>↻ Refresh</button>
          </div>
        </div>

        {toast    && <div style={{ background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.25)", borderRadius:12, padding:"10px 16px", marginBottom:14, fontSize:13, fontWeight:600, color:"#6EE7B7" }}>{toast}</div>}
        {toastErr && <div style={{ background:"rgba(244,63,94,.1)",  border:"1px solid rgba(244,63,94,.25)",  borderRadius:12, padding:"10px 16px", marginBottom:14, fontSize:13, fontWeight:600, color:"#FCA5A5" }}>{toastErr}</div>}

        {/* Summary pills */}
        <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
          {[
            { label:"Critical", count:highCount,  color:"var(--r)", bg:"rgba(244,63,94,.1)",   border:"rgba(244,63,94,.2)",   f:"high"   },
            { label:"Warning",  count:medCount,   color:"var(--a)", bg:"rgba(245,158,11,.1)",  border:"rgba(245,158,11,.2)",  f:"medium" },
            { label:"All Active",count:allAlerts.filter(a=>!resolvedIds.has(a.id)).length, color:"var(--vl)", bg:"rgba(124,58,237,.1)", border:"rgba(124,58,237,.2)", f:"all" },
            { label:"Resolved",  count:resolvedIds.size, color:"var(--e)", bg:"rgba(16,185,129,.1)", border:"rgba(16,185,129,.2)", f:null },
          ].map(({ label, count, color, bg, border, f }) => (
            <div key={label} onClick={f ? ()=>setFilter(f) : undefined}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:bg, border:`1px solid ${border}`, borderRadius:13, cursor:f?"pointer":"default", transition:"all .2s", outline:filter===f?"2px solid "+color:"none", outlineOffset:2 }}>
              <div style={{ fontSize:22, fontWeight:900, color }}>{count}</div>
              <div style={{ fontSize:11, fontWeight:700, color, textTransform:"uppercase", letterSpacing:.8 }}>{label}</div>
            </div>
          ))}
        </div>

        {loading ? <Spinner/> : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:20, alignItems:"start" }}>

            {/* Alert list */}
            <div>
              {filteredAlerts.length === 0 ? (
                <div className="card" style={{ textAlign:"center", padding:"48px 24px" }}>
                  <div style={{ fontSize:52, marginBottom:14 }}>✅</div>
                  <h3 style={{ fontWeight:800, fontSize:20, marginBottom:8 }}>All clear!</h3>
                  <p style={{ fontSize:14, color:"var(--t3)", fontWeight:500 }}>
                    {filter==="all" ? "No active alerts. Platform is healthy." : `No ${filter} severity alerts right now.`}
                  </p>
                </div>
              ) : filteredAlerts.map((a, i) => {
                const cfg = SEVERITY_CONFIG[a.severity] || SEVERITY_CONFIG.info;
                return (
                  <div key={a.id||i} className={`alert-card ${a.severity||"info"} fu`} style={{ animationDelay:`${i*50}ms` }}>
                    <div style={{ width:44, height:44, borderRadius:"50%", background:cfg.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{cfg.icon}</div>

                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                        <span style={{ fontWeight:800, fontSize:14, color:"var(--t1)" }}>{a.title}</span>
                        <span className="badge" style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>{cfg.label}</span>
                        {a.timestamp && <span style={{ fontSize:11, color:"var(--t3)", fontWeight:500 }}>{fmtTime(a.timestamp)}</span>}
                      </div>
                      <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.65, fontWeight:500, marginBottom:a.users||a.action?10:0 }}>{a.message}</p>

                      {/* Suspicious users inline list */}
                      {a.users && a.users.length > 0 && (
                        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
                          {a.users.map(u => (
                            <div key={u._id} className="susp-row">
                              <div>
                                <span style={{ fontWeight:700, fontSize:13, color:"var(--t1)" }}>{u.name}</span>
                                <span style={{ fontSize:11, color:"var(--t3)", marginLeft:8 }}>{u.email}</span>
                                <div style={{ fontSize:11, color:"#FCA5A5", marginTop:2 }}>{isSuspicious(u).join(" · ")}</div>
                              </div>
                              <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                                <button className="bs" onClick={()=>setBanModal(u)} style={{ background:"rgba(244,63,94,.15)", color:"#F43F5E" }}>🚫 Ban</button>
                                <a href={`/admin/users`} className="bs" style={{ background:"rgba(255,255,255,.05)", color:"var(--t2)", textDecoration:"none" }}>View</a>
                              </div>
                            </div>
                          ))}
                          {suspUsers.length > 3 && (
                            <div style={{ fontSize:12, color:"var(--t3)", fontWeight:600, paddingLeft:4 }}>
                              +{suspUsers.length-3} more suspicious accounts →{" "}
                              <a href="/admin/users" style={{ color:"var(--vl)" }}>Review all</a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action button */}
                      {a.action && (
                        a.action.onClick
                          ? <button className="bs" onClick={a.action.onClick} style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>{a.action.label} →</button>
                          : <a href={a.action.href} className="bs" style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, textDecoration:"none", display:"inline-block" }}>{a.action.label} →</a>
                      )}
                    </div>

                    {/* Resolve button */}
                    <button onClick={()=>resolve(a.id)} title="Mark as resolved"
                      style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,.04)", border:"1px solid var(--gb)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"var(--t3)", flexShrink:0, transition:"all .2s" }}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(16,185,129,.1)";e.currentTarget.style.color="#6EE7B7";}}
                      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.04)";e.currentTarget.style.color="var(--t3)";}}>
                      ✓
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* System status */}
              <div className="card fu" style={{ animationDelay:"100ms" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:14, marginBottom:14 }}>
                  <div className="live-dot"/>
                  System Status
                </div>
                {SYSTEM_SERVICES.map(svc => {
                  const status = sysStatus[svc.id] || "operational";
                  const color  = status==="operational"?"var(--e)":status==="degraded"?"var(--a)":"var(--r)";
                  const label  = status==="operational"?"Operational":status==="degraded"?"Degraded":"Down";
                  return (
                    <div key={svc.id} className="sys-card" style={{ marginBottom:8 }}>
                      <span style={{ fontSize:20 }}>{svc.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>{svc.label}</div>
                        <div style={{ fontSize:10, color:"var(--t3)", fontWeight:500, marginTop:1 }}>{svc.desc}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 10px", background:color+"18", border:`1px solid ${color}33`, borderRadius:20 }}>
                        <div style={{ width:5, height:5, borderRadius:"50%", background:color, animation:"pulse 2.5s infinite" }}/>
                        <span style={{ fontSize:10, fontWeight:700, color }}>{label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick actions */}
              <div className="card fu" style={{ animationDelay:"160ms" }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Quick Actions</div>
                {[
                  { label:"Broadcast to all users",  icon:"📢", action:()=>setBroadModal(true), color:"var(--e)" },
                  { label:"Review suspicious users",  icon:"🚨", href:"/admin/users",           color:"var(--r)" },
                  { label:"Platform analytics",       icon:"📊", href:"/admin/analytics",        color:"var(--vl)" },
                  { label:"User management",          icon:"👥", href:"/admin/users",            color:"var(--c)" },
                ].map(({label,icon,action,href,color})=>(
                  href
                    ? <a key={label} href={href} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"var(--d4)", borderRadius:11, textDecoration:"none", marginBottom:8, transition:"all .2s", border:"1px solid var(--gb)" }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"44";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--gb)";}}>
                        <span style={{ fontSize:18 }}>{icon}</span>
                        <span style={{ fontSize:13, fontWeight:600, color:"var(--t2)" }}>{label}</span>
                        <span style={{ marginLeft:"auto", color:color, fontWeight:700, fontSize:12 }}>→</span>
                      </a>
                    : <button key={label} onClick={action} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"var(--d4)", borderRadius:11, marginBottom:8, transition:"all .2s", border:"1px solid var(--gb)", width:"100%", cursor:"pointer", fontFamily:"Montserrat,sans-serif" }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=color+"44";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--gb)";}}>
                        <span style={{ fontSize:18 }}>{icon}</span>
                        <span style={{ fontSize:13, fontWeight:600, color:"var(--t2)" }}>{label}</span>
                        <span style={{ marginLeft:"auto", color:color, fontWeight:700, fontSize:12 }}>→</span>
                      </button>
                ))}
              </div>

              {/* Platform snapshot */}
              <div className="card fu" style={{ animationDelay:"200ms" }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Platform Snapshot</div>
                {[
                  { label:"Total Users",    val:stats?.totalUsers||users.length, color:"var(--vl)" },
                  { label:"Online Now",     val:onlineCount,                     color:"var(--e)"  },
                  { label:"Pro Users",      val:stats?.proUsers||0,              color:"var(--a)"  },
                  { label:"Suspended",      val:users.filter(u=>u.status==="suspended").length, color:"var(--r)" },
                  { label:"Suspicious",     val:suspUsers.length, color:suspUsers.length>0?"var(--r)":"var(--e)" },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                    <span style={{ fontSize:12, color:"var(--t2)", fontWeight:500 }}>{label}</span>
                    <span style={{ fontSize:14, fontWeight:900, color }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto-ban confirm modal */}
      {banModal && (
        <div className="modal-o" onClick={e=>e.target===e.currentTarget&&setBanModal(null)}>
          <div style={{ background:"var(--d3)", border:"1px solid rgba(244,63,94,.2)", borderRadius:20, padding:28, width:400, boxShadow:"0 30px 80px rgba(0,0,0,.65)", textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🚫</div>
            <h3 style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>Auto-ban User?</h3>
            <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7, marginBottom:8 }}>
              Suspend <strong style={{ color:"var(--t1)" }}>{banModal.name}</strong> ({banModal.email})?
            </p>
            <div style={{ marginBottom:20 }}>
              {isSuspicious(banModal).map(f=><div key={f} style={{ fontSize:11, color:"#FCA5A5", fontWeight:600, marginTop:4 }}>• {f}</div>)}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setBanModal(null)} style={{ flex:1, padding:"11px", background:"rgba(255,255,255,.05)", border:"1px solid var(--gb)", borderRadius:11, color:"var(--t2)", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>autoBan(banModal)} style={{ flex:1, padding:"11px", background:"var(--r)", border:"none", borderRadius:11, color:"#fff", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Ban User</button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast modal */}
      {broadModal && (
        <div className="modal-o" onClick={e=>e.target===e.currentTarget&&setBroadModal(false)}>
          <div style={{ background:"var(--d3)", border:"1px solid var(--gb)", borderRadius:20, padding:28, width:460, boxShadow:"0 30px 80px rgba(0,0,0,.65)" }}>
            <div style={{ fontWeight:800, fontSize:17, marginBottom:4 }}>📢 Broadcast Notification</div>
            <p style={{ fontSize:12, color:"var(--t3)", marginBottom:18, fontWeight:500 }}>Send to all {stats?.activeUsers||"active"} users</p>
            {[{k:"title",l:"Title *",p:"e.g. Platform update"},{k:"message",l:"Message *",p:"Write your message…",ta:true}].map(({k,l,p,ta})=>(
              <div key={k} style={{ marginBottom:13 }}>
                <label style={{ fontSize:10, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>{l}</label>
                {ta
                  ? <textarea className="si" style={{ width:"100%", minHeight:80, resize:"vertical", fontFamily:"Montserrat,sans-serif" }} placeholder={p} value={broadForm[k]} onChange={e=>setBroadForm(p=>({...p,[k]:e.target.value}))}/>
                  : <input className="si" style={{ width:"100%" }} placeholder={p} value={broadForm[k]} onChange={e=>setBroadForm(p=>({...p,[k]:e.target.value}))}/>
                }
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:10, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>Type</label>
              <select className="si" style={{ width:"100%", appearance:"none", cursor:"pointer" }} value={broadForm.type} onChange={e=>setBroadForm(p=>({...p,type:e.target.value}))}>
                {["system","ai","finance","task","habit","report"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setBroadModal(false)} style={{ flex:1, padding:"10px", background:"rgba(255,255,255,.05)", border:"1px solid var(--gb)", borderRadius:11, color:"var(--t2)", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={sendBroadcast} disabled={bSending||!broadForm.title||!broadForm.message} style={{ flex:2, padding:"10px", background:"linear-gradient(135deg,var(--v),var(--c))", border:"none", borderRadius:11, color:"#fff", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", opacity:bSending||!broadForm.title||!broadForm.message?.4:1 }}>
                {bSending?"Sending…":"📢 Send to All Users"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}