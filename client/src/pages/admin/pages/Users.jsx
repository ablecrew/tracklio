import { useEffect, useState, useCallback, useRef } from "react";
import API from "../../../api/api";

/* ─── Styles ─── */
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--v:#7C3AED;--vl:#8B5CF6;--c:#06B6D4;--e:#10B981;--r:#F43F5E;--a:#F59E0B;
    --d1:#080810;--d3:#14141F;--d4:#1A1A28;--d5:#222235;
    --gb:rgba(255,255,255,0.07);--t1:#F0F0FF;--t2:#9090B8;--t3:#505075;}
  html,body{font-family:'Montserrat',sans-serif;background:var(--d1);color:var(--t1)}
  ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:var(--d5);border-radius:99px}
  .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes af{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
  .fu{animation:fu .4s ease both}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:20px;padding:22px;transition:border-color .25s}
  .card:hover{border-color:rgba(255,255,255,.11)}
  .nav-accent{height:2px;background:linear-gradient(90deg,#F43F5E,#F59E0B,#7C3AED);background-size:300% 100%;animation:af 4s linear infinite;position:sticky;top:0;z-index:100}
  .dt{width:100%;border-collapse:collapse;font-size:13px}
  .dt th{padding:10px 14px;text-align:left;font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid rgba(255,255,255,.07);white-space:nowrap}
  .dt td{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
  .dt tr{transition:background .15s;cursor:pointer}
  .dt tr:hover td{background:rgba(255,255,255,.02)}
  .dt tr.susp td{background:rgba(244,63,94,.03)}
  .dt tr.online td{background:rgba(16,185,129,.02)}
  .badge{padding:3px 9px;border-radius:7px;font-size:10px;font-weight:700;white-space:nowrap}
  .si{padding:9px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .si:focus{border-color:var(--vl)}.si::placeholder{color:var(--t3)}
  .tb{padding:7px 14px;border-radius:9px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
  .tb.a{background:var(--v);color:#fff}
  .tb:not(.a){background:transparent;color:var(--t3)}.tb:not(.a):hover{color:var(--t1)}
  .bs{padding:5px 12px;border-radius:8px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;border:none;white-space:nowrap}
  .modal-o{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:1000;animation:fu .2s ease;padding:20px}
  .online-dot{width:8px;height:8px;border-radius:50%;background:var(--e);animation:pulse 2s infinite;flex-shrink:0}
  .flag-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.2);border-radius:6px;font-size:10px;font-weight:700;color:#FCA5A5;margin-bottom:4px}
  .input-field{width:100%;padding:10px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .input-field:focus{border-color:var(--vl)}.input-field::placeholder{color:var(--t3)}
  .action-btn{display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;background:none;border:none;border-radius:11px;cursor:pointer;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;transition:all .2s;text-align:left;text-decoration:none}
  .action-btn:hover{background:rgba(255,255,255,.04)}
`;

function isSuspicious(u) {
  const flags = [];
  const ageDays = (Date.now() - new Date(u.createdAt).getTime()) / 86400000;
  if (ageDays < 0.5 && (u.taskCount || 0) > 50) flags.push("Unusual task volume for new account");
  if (!u.name || u.name.trim().length < 2)        flags.push("Invalid display name");
  if (u.email?.includes("+") && ageDays < 1)      flags.push("Plus-alias email, new account");
  if (u.status === "suspended")                    flags.push("Previously suspended");
  return flags;
}

const fmtDate = d => d ? new Date(d).toLocaleDateString("en-KE", { day:"2-digit", month:"short", year:"numeric" }) : "—";
const fmtTime = d => {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000)    return "Just now";
  if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  return fmtDate(d);
};

function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:60 }}>
      <div style={{ width:38, height:38, borderRadius:"50%", border:"3px solid rgba(255,255,255,.07)", borderTopColor:"var(--vl)", animation:"spin .8s linear infinite" }}/>
    </div>
  );
}

const PER_PAGE = 25;
const COLS = ["User","Email","Plan","Role","Tasks","Joined","Last Login","Status","Risk","Actions"];

export default function AdminUsers() {
  useEffect(() => {
    const id = "adm-users-s";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = S;
      document.head.prepend(s);
    }
  }, []);

  const [users,      setUsers]      = useState([]);
  const [onlineIds,  setOnlineIds]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [statusF,    setStatusF]    = useState("all");
  const [planF,      setPlanF]      = useState("all");
  const [riskF,      setRiskF]      = useState("all");
  const [sortBy,     setSortBy]     = useState("createdAt");
  const [sortDir,    setSortDir]    = useState("desc");
  const [page,       setPage]       = useState(1);
  const [selUser,    setSelUser]    = useState(null);
  const [editMode,   setEditMode]   = useState(false);
  const [editForm,   setEditForm]   = useState({});
  const [toast,      setToast]      = useState("");
  const [toastErr,   setToastErr]   = useState("");
  const [notifModal, setNotifModal] = useState(null);
  const [notifForm,  setNotifForm]  = useState({ title:"", message:"", type:"system" });
  const [sending,    setSending]    = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);

  const showToast = (msg, err=false) => {
    if (err) { setToastErr(msg); setTimeout(() => setToastErr(""), 4000); }
    else     { setToast(msg);    setTimeout(() => setToast(""),    4000); }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        API.get("/admin/users?limit=500"),
        API.get("/admin/presence").catch(() => ({ data: { onlineIds: [] } })),
      ]);
      const rawUsers = uRes.data?.users || uRes.data || [];
      setUsers(rawUsers);
      setOnlineIds(pRes.data?.onlineIds || []);
    } catch { showToast("Failed to load users", true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Sort handler */
  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
    setPage(1);
  };

  /* Filter + search + sort */
  const filtered = users
    .filter(u => statusF === "all" || u.status === statusF)
    .filter(u => planF === "all" || u.plan === planF)
    .filter(u => {
      if (riskF === "all")        return true;
      if (riskF === "suspicious") return isSuspicious(u).length > 0;
      if (riskF === "online")     return onlineIds.includes(String(u._id));
      return true;
    })
    .filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (sortBy === "taskCount") { av = a.taskCount||0; bv = b.taskCount||0; }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const paginated     = filtered.slice(0, page * PER_PAGE);
  const suspiciousCount = users.filter(u => isSuspicious(u).length > 0).length;

  /* Actions */
  const suspend = async (id) => {
    try { await API.put(`/admin/users/${id}/suspend`); setUsers(p => p.map(u => u._id===id ? {...u,status:"suspended"} : u)); showToast("User suspended"); }
    catch { showToast("Failed", true); }
  };
  const activate = async (id) => {
    try { await API.put(`/admin/users/${id}/activate`); setUsers(p => p.map(u => u._id===id ? {...u,status:"active"} : u)); showToast("User activated"); }
    catch { showToast("Failed", true); }
  };
  const upgradePro = async (id) => {
    try { await API.put(`/admin/users/${id}/upgrade`); setUsers(p => p.map(u => u._id===id ? {...u,plan:"pro"} : u)); showToast("Upgraded to Pro ✓"); }
    catch { showToast("Failed", true); }
  };
  const downgrade = async (id) => {
    try { await API.put(`/admin/users/${id}`, { plan:"free" }); setUsers(p => p.map(u => u._id===id ? {...u,plan:"free"} : u)); showToast("Downgraded to Free"); }
    catch { showToast("Failed", true); }
  };
  const makeAdmin = async (id) => {
    if (!window.confirm("Grant admin access to this user?")) return;
    try { await API.put(`/admin/users/${id}`, { role:"admin" }); setUsers(p => p.map(u => u._id===id ? {...u,role:"admin"} : u)); showToast("Admin role granted"); }
    catch { showToast("Failed", true); }
  };
  const revokeAdmin = async (id) => {
    if (!window.confirm("Revoke admin access?")) return;
    try { await API.put(`/admin/users/${id}`, { role:"user" }); setUsers(p => p.map(u => u._id===id ? {...u,role:"user"} : u)); showToast("Admin role revoked"); }
    catch { showToast("Failed", true); }
  };
  const autoBan = async (user) => {
    if (!window.confirm(`Auto-ban ${user.name} (${user.email})?`)) return;
    const flags = isSuspicious(user);
    try {
      await API.put(`/admin/users/${user._id}/autoban`, { reason: flags.join("; ") });
      setUsers(p => p.map(u => u._id===user._id ? {...u,status:"suspended"} : u));
      showToast(`🚫 ${user.name} banned`);
      if (selUser?._id === user._id) setSelUser(null);
    } catch { showToast("Failed", true); }
  };
  const deleteUser = async (id, name) => {
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(p => p.filter(u => u._id !== id));
      setDelConfirm(null); setSelUser(null);
      showToast(`${name} deleted`);
    } catch { showToast("Delete failed", true); }
  };
  const saveEdit = async () => {
    try {
      await API.put(`/admin/users/${selUser._id}`, editForm);
      setUsers(p => p.map(u => u._id===selUser._id ? {...u,...editForm} : u));
      setSelUser(prev => ({...prev,...editForm}));
      setEditMode(false);
      showToast("User updated ✓");
    } catch { showToast("Update failed", true); }
  };
  const sendNotif = async () => {
    if (!notifForm.title || !notifForm.message) return;
    setSending(true);
    try {
      await API.post("/notifications", { ...notifForm, user: notifModal._id });
      setNotifModal(null); setNotifForm({ title:"", message:"", type:"system" });
      showToast("Notification sent ✓");
    } catch { showToast("Failed to send", true); }
    finally { setSending(false); }
  };

  const SortIcon = ({ col }) => (
    <span style={{ marginLeft:4, opacity:sortBy===col?1:0.3, fontSize:10 }}>
      {sortBy===col ? (sortDir==="asc" ? "▲" : "▼") : "↕"}
    </span>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--d1)", fontFamily:"Montserrat,sans-serif", position:"relative" }}>
      <div className="orb" style={{ width:600, height:600, background:"var(--v)", top:-200, left:-150, opacity:.08 }}/>
      <div className="orb" style={{ width:500, height:500, background:"var(--r)", bottom:-150, right:-150, opacity:.06 }}/>
      <div className="nav-accent"/>

      <div style={{ position:"relative", zIndex:1, maxWidth:1500, margin:"0 auto", padding:"32px 24px 60px" }}>

        {/* Header */}
        <div className="fu" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:24 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <a href="/admin" style={{ fontSize:12, color:"var(--t3)", textDecoration:"none", fontWeight:600 }}>← Admin</a>
              <span style={{ color:"var(--t3)" }}>/</span>
              <h1 style={{ fontWeight:900, fontSize:22, letterSpacing:-0.6 }}>User Management</h1>
              <span style={{ padding:"3px 10px", background:"rgba(244,63,94,.12)", border:"1px solid rgba(244,63,94,.25)", borderRadius:8, fontSize:11, fontWeight:700, color:"#FCA5A5" }}>ADMIN</span>
            </div>
            <p style={{ fontSize:13, color:"var(--t3)", fontWeight:500 }}>
              {users.length} total users · {users.filter(u=>u.status==="active").length} active · {onlineIds.length} online now
              {suspiciousCount > 0 && <span style={{ color:"#F43F5E", fontWeight:700 }}> · ⚠ {suspiciousCount} flagged</span>}
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={load} style={{ padding:"9px 16px", background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", borderRadius:11, color:"#C4B5FD", fontFamily:"Montserrat,sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" }}>↻ Refresh</button>
            <a href="/admin" style={{ padding:"9px 16px", background:"rgba(255,255,255,.04)", border:"1px solid var(--gb)", borderRadius:11, color:"var(--t2)", fontFamily:"Montserrat,sans-serif", fontSize:12, fontWeight:700, cursor:"pointer", textDecoration:"none" }}>Dashboard →</a>
          </div>
        </div>

        {/* Toast */}
        {toast    && <div style={{ background:"rgba(16,185,129,.1)",  border:"1px solid rgba(16,185,129,.25)",  borderRadius:12, padding:"10px 16px", marginBottom:14, fontSize:13, fontWeight:600, color:"#6EE7B7" }}>{toast}</div>}
        {toastErr && <div style={{ background:"rgba(244,63,94,.1)",   border:"1px solid rgba(244,63,94,.25)",   borderRadius:12, padding:"10px 16px", marginBottom:14, fontSize:13, fontWeight:600, color:"#FCA5A5" }}>{toastErr}</div>}

        {/* Suspicious banner */}
        {suspiciousCount > 0 && (
          <div style={{ background:"rgba(244,63,94,.06)", border:"1px solid rgba(244,63,94,.18)", borderRadius:12, padding:"10px 16px", marginBottom:14, fontSize:13, fontWeight:600, color:"#FCA5A5", display:"flex", alignItems:"center", gap:10 }}>
            🚨 {suspiciousCount} account{suspiciousCount>1?"s":""} flagged for suspicious activity
            <button onClick={() => { setRiskF("suspicious"); setPage(1); }} style={{ marginLeft:4, background:"rgba(244,63,94,.15)", border:"1px solid rgba(244,63,94,.3)", borderRadius:8, padding:"3px 10px", color:"#FCA5A5", fontFamily:"Montserrat,sans-serif", fontSize:11, fontWeight:700, cursor:"pointer" }}>
              Review →
            </button>
          </div>
        )}

        {/* Controls */}
        <div style={{ display:"flex", gap:12, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
          {/* Search */}
          <div style={{ position:"relative", flex:1, minWidth:220 }}>
            <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"var(--t3)" }}>🔍</span>
            <input className="si" style={{ width:"100%", paddingLeft:36 }} placeholder="Search name or email…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
          </div>

          {/* Status filter */}
          <div style={{ display:"flex", gap:3, background:"var(--d3)", borderRadius:10, padding:4 }}>
            {["all","active","suspended","inactive"].map(f => (
              <button key={f} className={`tb ${statusF===f?"a":""}`} onClick={() => { setStatusF(f); setPage(1); }} style={{ textTransform:"capitalize", padding:"5px 12px", fontSize:11 }}>
                {f}
              </button>
            ))}
          </div>

          {/* Plan filter */}
          <div style={{ display:"flex", gap:3, background:"var(--d3)", borderRadius:10, padding:4 }}>
            {["all","free","pro"].map(f => (
              <button key={f} className={`tb ${planF===f?"a":""}`} onClick={() => { setPlanF(f); setPage(1); }} style={{ textTransform:"capitalize", padding:"5px 12px", fontSize:11 }}>
                {f}
              </button>
            ))}
          </div>

          {/* Risk filter */}
          <div style={{ display:"flex", gap:3, background:"var(--d3)", borderRadius:10, padding:4 }}>
            {[["all","All"],["suspicious","⚠ Risk"],["online","● Online"]].map(([f,l]) => (
              <button key={f} className={`tb ${riskF===f?"a":""}`} onClick={() => { setRiskF(f); setPage(1); }} style={{ padding:"5px 12px", fontSize:11 }}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ fontSize:12, color:"var(--t3)", fontWeight:600, whiteSpace:"nowrap" }}>
            {filtered.length} result{filtered.length!==1?"s":""}
          </div>
        </div>

        {/* Table */}
        <div className="card fu" style={{ padding:0, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            {loading ? <Spinner/> : (
              <table className="dt">
                <thead>
                  <tr>
                    {[["User","name"],["Email","email"],["Plan","plan"],["Role","role"],["Tasks","taskCount"],["Joined","createdAt"],["Last Login","lastLoginAt"],["Status","status"],["Risk",null],["Actions",null]].map(([label,col])=>(
                      <th key={label} onClick={col ? ()=>handleSort(col) : undefined} style={{ cursor:col?"pointer":"default" }}>
                        {label}{col && <SortIcon col={col}/>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(u => {
                    const flags    = isSuspicious(u);
                    const isOnline = onlineIds.includes(String(u._id));
                    return (
                      <tr key={u._id} className={`${flags.length>0?"susp":""}${isOnline?" online":""}`} onClick={() => { setSelUser(u); setEditMode(false); setEditForm({ name:u.name, plan:u.plan, role:u.role }); }}>
                        {/* User */}
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            {isOnline && <div className="online-dot"/>}
                            <div style={{ width:34, height:34, borderRadius:"50%", background: u.avatarUrl ? `url(${u.avatarUrl}) center/cover` : "linear-gradient(135deg,#7C3AED,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0, backgroundSize:"cover", overflow:"hidden" }}>
                              {!u.avatarUrl && (u.name?.charAt(0)?.toUpperCase()||"?")}
                            </div>
                            <div>
                              <div style={{ fontWeight:700, fontSize:13, color:"var(--t1)" }}>{u.name||"—"}</div>
                              <div style={{ fontSize:10, color:"var(--t3)", fontWeight:500 }}>ID: {String(u._id).slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        {/* Email */}
                        <td style={{ maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--t2)", fontSize:12 }}>{u.email}</td>
                        {/* Plan */}
                        <td><span className="badge" style={{ background:u.plan==="pro"?"rgba(124,58,237,.15)":"rgba(255,255,255,.06)", color:u.plan==="pro"?"#C4B5FD":"var(--t3)" }}>{u.plan||"free"}</span></td>
                        {/* Role */}
                        <td><span className="badge" style={{ background:u.role==="admin"?"rgba(244,63,94,.12)":"rgba(255,255,255,.05)", color:u.role==="admin"?"#FCA5A5":"var(--t3)" }}>{u.role||"user"}</span></td>
                        {/* Tasks */}
                        <td style={{ fontWeight:700, color:"var(--t1)" }}>{u.taskCount||0}</td>
                        {/* Joined */}
                        <td style={{ color:"var(--t2)", fontSize:12, whiteSpace:"nowrap" }}>{fmtDate(u.createdAt)}</td>
                        {/* Last login */}
                        <td style={{ color:"var(--t2)", fontSize:12, whiteSpace:"nowrap" }}>{fmtTime(u.lastLoginAt)}</td>
                        {/* Status */}
                        <td>
                          <span className="badge" style={{
                            background: u.status==="active"?"rgba(16,185,129,.12)":u.status==="suspended"?"rgba(244,63,94,.12)":"rgba(255,255,255,.05)",
                            color:      u.status==="active"?"#6EE7B7":u.status==="suspended"?"#FCA5A5":"var(--t3)"
                          }}>
                            {isOnline && u.status==="active" && <span style={{ marginRight:4 }}>●</span>}
                            {u.status||"active"}
                          </span>
                        </td>
                        {/* Risk */}
                        <td onClick={e=>e.stopPropagation()}>
                          {flags.length > 0
                            ? <span className="badge" style={{ background:"rgba(244,63,94,.12)", color:"#FCA5A5", cursor:"pointer" }} title={flags.join("\n")} onClick={() => autoBan(u)}>🚨 {flags.length}</span>
                            : <span className="badge" style={{ background:"rgba(16,185,129,.1)", color:"#6EE7B7" }}>✓</span>
                          }
                        </td>
                        {/* Actions */}
                        <td onClick={e=>e.stopPropagation()}>
                          <div style={{ display:"flex", gap:5 }}>
                            {u.status!=="suspended"
                              ? <button className="bs" onClick={()=>suspend(u._id)} style={{ background:"rgba(244,63,94,.1)", color:"#FCA5A5" }}>Suspend</button>
                              : <button className="bs" onClick={()=>activate(u._id)} style={{ background:"rgba(16,185,129,.1)", color:"#6EE7B7" }}>Activate</button>
                            }
                            {u.plan!=="pro"
                              ? <button className="bs" onClick={()=>upgradePro(u._id)} style={{ background:"rgba(124,58,237,.1)", color:"#C4B5FD" }}>↑ Pro</button>
                              : <button className="bs" onClick={()=>downgrade(u._id)}   style={{ background:"rgba(255,255,255,.05)", color:"var(--t3)" }}>↓ Free</button>
                            }
                            <button className="bs" onClick={()=>setDelConfirm(u)} style={{ background:"rgba(244,63,94,.08)", color:"#F87171" }}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginated.length === 0 && !loading && (
                    <tr><td colSpan={10} style={{ textAlign:"center", padding:"32px 0", color:"var(--t3)", fontSize:14 }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {paginated.length < filtered.length && (
            <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,.04)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, color:"var(--t3)", fontWeight:600 }}>Showing {paginated.length} of {filtered.length}</span>
              <button onClick={()=>setPage(p=>p+1)} style={{ padding:"8px 18px", background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", borderRadius:10, color:"#C4B5FD", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                Load {Math.min(PER_PAGE, filtered.length-paginated.length)} more
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── User detail / edit modal ── */}
      {selUser && (
        <div className="modal-o" onClick={e=>e.target===e.currentTarget&&setSelUser(null)}>
          <div style={{ background:"var(--d3)", border:"1px solid var(--gb)", borderRadius:24, width:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 30px 80px rgba(0,0,0,.65)" }}>
            {/* Modal header */}
            <div style={{ padding:"22px 24px 18px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background: selUser.avatarUrl?`url(${selUser.avatarUrl}) center/cover`:"linear-gradient(135deg,#7C3AED,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:900, color:"#fff", flexShrink:0, backgroundSize:"cover", overflow:"hidden" }}>
                {!selUser.avatarUrl && selUser.name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>{selUser.name}</div>
                <div style={{ fontSize:12, color:"var(--t3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selUser.email}</div>
                <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                  <span className="badge" style={{ background:selUser.plan==="pro"?"rgba(124,58,237,.15)":"rgba(255,255,255,.06)", color:selUser.plan==="pro"?"#C4B5FD":"var(--t3)" }}>{selUser.plan||"free"}</span>
                  <span className="badge" style={{ background:selUser.status==="active"?"rgba(16,185,129,.12)":"rgba(244,63,94,.12)", color:selUser.status==="active"?"#6EE7B7":"#FCA5A5" }}>{selUser.status||"active"}</span>
                  {onlineIds.includes(String(selUser._id)) && <span className="badge" style={{ background:"rgba(16,185,129,.12)", color:"#6EE7B7" }}>● Online</span>}
                  {selUser.role==="admin" && <span className="badge" style={{ background:"rgba(244,63,94,.12)", color:"#FCA5A5" }}>🛡️ Admin</span>}
                </div>
              </div>
              <button onClick={()=>setSelUser(null)} style={{ background:"none", border:"none", color:"var(--t3)", cursor:"pointer", fontSize:22, lineHeight:1, padding:"4px", flexShrink:0 }}>✕</button>
            </div>

            {/* Suspicious flags */}
            {isSuspicious(selUser).length > 0 && (
              <div style={{ padding:"12px 24px", background:"rgba(244,63,94,.05)", borderBottom:"1px solid rgba(244,63,94,.12)" }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#F43F5E", marginBottom:6, textTransform:"uppercase", letterSpacing:.8 }}>🚨 Suspicious Activity Flags</div>
                {isSuspicious(selUser).map(f => <div key={f} className="flag-chip">{f}</div>)}
              </div>
            )}

            {/* Details / edit */}
            <div style={{ padding:"20px 24px" }}>
              {editMode ? (
                <>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8, marginBottom:14 }}>Edit User</div>
                  {[{k:"name",l:"Name"},{k:"plan",l:"Plan",opts:["free","pro"]},{k:"role",l:"Role",opts:["user","admin"]}].map(({k,l,opts})=>(
                    <div key={k} style={{ marginBottom:12 }}>
                      <label style={{ fontSize:10, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>{l}</label>
                      {opts
                        ? <select className="input-field" value={editForm[k]||""} onChange={e=>setEditForm(p=>({...p,[k]:e.target.value}))} style={{ appearance:"none", cursor:"pointer" }}>
                            {opts.map(o=><option key={o} value={o}>{o}</option>)}
                          </select>
                        : <input className="input-field" value={editForm[k]||""} onChange={e=>setEditForm(p=>({...p,[k]:e.target.value}))}/>
                      }
                    </div>
                  ))}
                  <div style={{ display:"flex", gap:10, marginTop:16 }}>
                    <button onClick={()=>setEditMode(false)} style={{ flex:1, padding:"10px", background:"rgba(255,255,255,.05)", border:"1px solid var(--gb)", borderRadius:11, color:"var(--t2)", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
                    <button onClick={saveEdit} style={{ flex:2, padding:"10px", background:"linear-gradient(135deg,var(--v),var(--c))", border:"none", borderRadius:11, color:"#fff", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Save Changes</button>
                  </div>
                </>
              ) : (
                <>
                  {[["MongoDB ID",selUser._id],["Email",selUser.email],["Plan",selUser.plan||"free"],["Role",selUser.role||"user"],["Status",selUser.status||"active"],["Tasks Created",selUser.taskCount||0],["Joined",fmtDate(selUser.createdAt)],["Last Login",fmtTime(selUser.lastLoginAt)]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                      <span style={{ fontSize:12, color:"var(--t3)", fontWeight:600 }}>{k}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:"var(--t1)", maxWidth:"60%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textAlign:"right" }}>{String(v)}</span>
                    </div>
                  ))}

                  {/* Quick actions */}
                  <div style={{ marginTop:18 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8, marginBottom:10 }}>Actions</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <button className="action-btn" onClick={()=>setEditMode(true)} style={{ color:"var(--vl)", border:"1px solid rgba(124,58,237,.2)", borderRadius:11 }}>
                        <span style={{ fontSize:16 }}>✏️</span>Edit User
                      </button>
                      <button className="action-btn" onClick={()=>{ setNotifModal(selUser); setSelUser(null); }} style={{ color:"var(--c)", border:"1px solid rgba(6,182,212,.2)", borderRadius:11 }}>
                        <span style={{ fontSize:16 }}>🔔</span>Send Notification
                      </button>
                      {selUser.status!=="suspended"
                        ? <button className="action-btn" onClick={()=>{ suspend(selUser._id); setSelUser(null); }} style={{ color:"#FCA5A5", border:"1px solid rgba(244,63,94,.2)", borderRadius:11 }}>
                            <span style={{ fontSize:16 }}>🚫</span>Suspend
                          </button>
                        : <button className="action-btn" onClick={()=>{ activate(selUser._id); setSelUser(null); }} style={{ color:"#6EE7B7", border:"1px solid rgba(16,185,129,.2)", borderRadius:11 }}>
                            <span style={{ fontSize:16 }}>✅</span>Activate
                          </button>
                      }
                      {selUser.plan!=="pro"
                        ? <button className="action-btn" onClick={()=>{ upgradePro(selUser._id); setSelUser(p=>({...p,plan:"pro"})); }} style={{ color:"#C4B5FD", border:"1px solid rgba(124,58,237,.2)", borderRadius:11 }}>
                            <span style={{ fontSize:16 }}>⬆️</span>Upgrade Pro
                          </button>
                        : <button className="action-btn" onClick={()=>{ downgrade(selUser._id); setSelUser(p=>({...p,plan:"free"})); }} style={{ color:"var(--t3)", border:"1px solid var(--gb)", borderRadius:11 }}>
                            <span style={{ fontSize:16 }}>⬇️</span>Downgrade
                          </button>
                      }
                      {selUser.role!=="admin"
                        ? <button className="action-btn" onClick={()=>makeAdmin(selUser._id)} style={{ color:"#FCD34D", border:"1px solid rgba(245,158,11,.2)", borderRadius:11 }}>
                            <span style={{ fontSize:16 }}>🛡️</span>Make Admin
                          </button>
                        : <button className="action-btn" onClick={()=>revokeAdmin(selUser._id)} style={{ color:"#FCA5A5", border:"1px solid rgba(244,63,94,.15)", borderRadius:11 }}>
                            <span style={{ fontSize:16 }}>🚫</span>Revoke Admin
                          </button>
                      }
                      {isSuspicious(selUser).length>0 && (
                        <button className="action-btn" onClick={()=>autoBan(selUser)} style={{ color:"#F43F5E", border:"1px solid rgba(244,63,94,.25)", borderRadius:11, gridColumn:"span 2" }}>
                          <span style={{ fontSize:16 }}>🤖</span>Auto-Ban (Suspicious)
                        </button>
                      )}
                      <button className="action-btn" onClick={()=>{ setDelConfirm(selUser); setSelUser(null); }} style={{ color:"#F87171", border:"1px solid rgba(244,63,94,.15)", borderRadius:11, gridColumn:"span 2" }}>
                        <span style={{ fontSize:16 }}>🗑️</span>Delete Account & All Data
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Send notification modal ── */}
      {notifModal && (
        <div className="modal-o" onClick={e=>e.target===e.currentTarget&&setNotifModal(null)}>
          <div style={{ background:"var(--d3)", border:"1px solid var(--gb)", borderRadius:20, padding:28, width:440, boxShadow:"0 30px 80px rgba(0,0,0,.65)" }}>
            <div style={{ fontWeight:800, fontSize:17, marginBottom:4 }}>Send Notification</div>
            <div style={{ fontSize:12, color:"var(--t3)", marginBottom:18 }}>To: {notifModal.name} ({notifModal.email})</div>
            {[{k:"title",l:"Title *",p:"e.g. Account update"},{k:"message",l:"Message *",p:"Write your message…",ta:true}].map(({k,l,p,ta})=>(
              <div key={k} style={{ marginBottom:13 }}>
                <label style={{ fontSize:10, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>{l}</label>
                {ta
                  ? <textarea className="input-field" style={{ minHeight:80, resize:"vertical", fontFamily:"Montserrat,sans-serif" }} placeholder={p} value={notifForm[k]} onChange={e=>setNotifForm(p=>({...p,[k]:e.target.value}))}/>
                  : <input className="input-field" placeholder={p} value={notifForm[k]} onChange={e=>setNotifForm(p=>({...p,[k]:e.target.value}))}/>
                }
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:10, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:5 }}>Type</label>
              <select className="input-field" style={{ appearance:"none", cursor:"pointer" }} value={notifForm.type} onChange={e=>setNotifForm(p=>({...p,type:e.target.value}))}>
                {["system","ai","finance","task","habit","report"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setNotifModal(null)} style={{ flex:1, padding:"10px", background:"rgba(255,255,255,.05)", border:"1px solid var(--gb)", borderRadius:11, color:"var(--t2)", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={sendNotif} disabled={sending||!notifForm.title||!notifForm.message} style={{ flex:2, padding:"10px", background:"linear-gradient(135deg,var(--v),var(--c))", border:"none", borderRadius:11, color:"#fff", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", opacity:sending||!notifForm.title||!notifForm.message?.4:1 }}>
                {sending?"Sending…":"Send →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {delConfirm && (
        <div className="modal-o" onClick={e=>e.target===e.currentTarget&&setDelConfirm(null)}>
          <div style={{ background:"var(--d3)", border:"1px solid rgba(244,63,94,.2)", borderRadius:20, padding:28, width:380, boxShadow:"0 30px 80px rgba(0,0,0,.65)", textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>Delete Account?</h3>
            <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.7, marginBottom:22 }}>
              Permanently delete <strong style={{ color:"var(--t1)" }}>{delConfirm.name}</strong> and all their tasks, transactions, and habits? This cannot be undone.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setDelConfirm(null)} style={{ flex:1, padding:"11px", background:"rgba(255,255,255,.05)", border:"1px solid var(--gb)", borderRadius:11, color:"var(--t2)", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>deleteUser(delConfirm._id, delConfirm.name)} style={{ flex:1, padding:"11px", background:"var(--r)", border:"none", borderRadius:11, color:"#fff", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor:"pointer" }}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}