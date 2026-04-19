import { useEffect, useState, useRef } from "react";
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
  .orb1{width:500px;height:500px;background:var(--v);top:-150px;right:-100px;opacity:.10}
  .orb2{width:400px;height:400px;background:var(--c);bottom:-100px;left:-100px;opacity:.08}
  @keyframes float-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .4s ease both}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:18px;padding:24px;margin-bottom:16px}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6);background-size:300% 100%;animation:accent-flow 5s linear infinite;position:sticky;top:0;z-index:100}
  .input-field{width:100%;padding:10px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .input-field:focus{border-color:var(--vl)}.input-field::placeholder{color:var(--t3)}
  .btn-primary{padding:11px 22px;background:linear-gradient(135deg,var(--v),var(--c));border:none;border-radius:11px;color:#fff;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s}
  .btn-primary:hover:not(:disabled){opacity:.88;transform:scale(1.02)}.btn-primary:disabled{opacity:.4;cursor:not-allowed}
  .btn-ghost{padding:9px 18px;background:rgba(255,255,255,.04);border:1px solid var(--gb);border-radius:11px;color:var(--t2);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
  .btn-ghost:hover{background:rgba(255,255,255,.07);color:var(--t1)}
  .stat-box{background:var(--d4);border:1px solid var(--gb);border-radius:13px;padding:16px;text-align:center;flex:1}
  .avatar-upload-zone{width:120px;height:120px;border-radius:50%;cursor:pointer;position:relative;overflow:hidden;border:3px solid var(--vl);transition:border-color .2s;flex-shrink:0}
  .avatar-upload-zone:hover{border-color:var(--c)}.avatar-upload-zone:hover .avatar-overlay{opacity:1}
  .avatar-overlay{position:absolute;inset:0;background:rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;color:#fff;font-size:11px;font-weight:700;gap:4px}
`;

function buildInitials(name) {
  if(!name) return "?";
  return name.split(" ").filter(Boolean).map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?";
}

export default function MyProfile() {
  useEffect(()=>{
    const id="trkl-profile";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [user,      setUser]      = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [stats,     setStats]     = useState({ tasks:0, done:0, transactions:0, habits:0, joinedDays:0 });
  const [form,      setForm]      = useState({ name:"", bio:"", location:"", website:"" });
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg,       setMsg]       = useState("");
  const fileRef = useRef(null);

  useEffect(()=>{
    Promise.all([
      API.get("/auth/me"),
      API.get("/tasks").catch(()=>({data:[]})),
      API.get("/transactions").catch(()=>({data:[]})),
      API.get("/habits").catch(()=>({data:[]})),
    ]).then(([uRes, tRes, txRes, hRes])=>{
      const u   = uRes.data || {};
      const tasks = tRes.data || [];
      const tx    = txRes.data || [];
      const habits= hRes.data || [];
      setUser(u);
      if(u.avatarUrl) setAvatarSrc(u.avatarUrl);
      setForm({ name:u.name||"", bio:u.bio||"", location:u.location||"", website:u.website||"" });
      const joinedMs = u.createdAt ? Date.now()-new Date(u.createdAt).getTime() : 0;
      setStats({
        tasks:        tasks.length,
        done:         tasks.filter(t=>t.status==="done").length,
        transactions: tx.length,
        habits:       habits.length,
        joinedDays:   Math.floor(joinedMs/86400000),
      });
    }).catch(()=>{});
  },[]);

  /* PERSISTENT avatar upload — saves to server so it survives refresh */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]; if(!file) return;
    /* Instant preview */
    const reader = new FileReader();
    reader.onload = ev => setAvatarSrc(ev.target.result);
    reader.readAsDataURL(file);
    /* Upload */
    setUploading(true);
    const fd = new FormData(); fd.append("avatar", file);
    try {
      const res = await API.post("/users/avatar", fd, { headers:{"Content-Type":"multipart/form-data"} });
      if(res.data?.avatarUrl) setAvatarSrc(res.data.avatarUrl);
      setMsg("Photo updated ✓");
    } catch { setMsg("Failed to upload photo."); }
    finally { setUploading(false); setTimeout(()=>setMsg(""),3000); }
  };

  const saveProfile = async () => {
    setSaving(true); setMsg("");
    try {
      await API.put("/users/profile", form);
      setMsg("Profile saved ✓");
    } catch(e) { setMsg(e.response?.data?.message||"Failed to save."); }
    finally { setSaving(false); setTimeout(()=>setMsg(""),3000); }
  };

  const initials = buildInitials(user?.name || form.name);

  return (
    <div style={{minHeight:"100vh",background:"var(--d1)",fontFamily:"Montserrat,sans-serif",position:"relative",overflow:"hidden"}}>
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="nav-accent"/>

      <div style={{position:"relative",zIndex:1,maxWidth:820,margin:"0 auto",padding:"40px 28px 80px"}}>
        {/* Header */}
        <div className="fade-up" style={{marginBottom:32}}>
          <h1 style={{fontWeight:900,fontSize:28,letterSpacing:-0.8,marginBottom:6}}>My Profile</h1>
          <p style={{fontSize:13,color:"var(--t3)",fontWeight:500}}>Manage your public profile and personal information</p>
        </div>

        {msg && (
          <div style={{background:msg.includes("✓")?"rgba(16,185,129,.1)":"rgba(244,63,94,.1)",border:`1px solid ${msg.includes("✓")?"rgba(16,185,129,.3)":"rgba(244,63,94,.3)"}`,borderRadius:12,padding:"10px 16px",marginBottom:20,fontSize:13,fontWeight:600,color:msg.includes("✓")?"#6EE7B7":"#FCA5A5"}}>
            {msg}
          </div>
        )}

        {/* Profile card */}
        <div className="card fade-up">
          <div style={{display:"flex",alignItems:"flex-start",gap:24,flexWrap:"wrap",marginBottom:24}}>
            {/* Avatar — click to upload, persists to server */}
            <div className="avatar-upload-zone" onClick={()=>fileRef.current?.click()}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              ) : (
                <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,var(--v),var(--c))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,fontWeight:900,color:"#fff"}}>
                  {initials}
                </div>
              )}
              <div className="avatar-overlay">
                {uploading ? <div style={{width:24,height:24,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .7s linear infinite"}}/> : <>📷<span>Change photo</span></>}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarChange}/>

            {/* User info */}
            <div style={{flex:1,minWidth:200}}>
              <div style={{fontWeight:900,fontSize:22,letterSpacing:-0.5,marginBottom:4}}>{user?.name || "—"}</div>
              <div style={{fontSize:13,color:"var(--t3)",fontWeight:500,marginBottom:10}}>{user?.email || "—"}</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",background:"rgba(124,58,237,.12)",border:"1px solid rgba(124,58,237,.25)",borderRadius:20,fontSize:11,fontWeight:700,color:"#C4B5FD"}}>
                ✦ Pro Plan · {stats.joinedDays > 0 ? `Member for ${stats.joinedDays}d` : "New member"}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
            {[
              {label:"Tasks Created",   val:stats.tasks,        color:"var(--vl)"},
              {label:"Tasks Done",      val:stats.done,         color:"var(--e)"},
              {label:"Transactions",    val:stats.transactions, color:"var(--c)"},
              {label:"Active Habits",   val:stats.habits,       color:"var(--a)"},
            ].map(({label,val,color})=>(
              <div key={label} className="stat-box">
                <div style={{fontSize:24,fontWeight:900,color,letterSpacing:-0.5}}>{val}</div>
                <div style={{fontSize:10,fontWeight:700,color:"var(--t3)",marginTop:4,textTransform:"uppercase",letterSpacing:.7}}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Editable fields */}
        <div className="card fade-up" style={{animationDelay:"80ms"}}>
          <h3 style={{fontWeight:800,fontSize:15,marginBottom:18}}>Edit Profile</h3>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {[
              {k:"name",     l:"Full Name *",     t:"text",  p:"Your full name"},
              {k:"bio",      l:"Bio",             t:"text",  p:"Tell people about yourself"},
              {k:"location", l:"Location",        t:"text",  p:"e.g. Nairobi, Kenya"},
              {k:"website",  l:"Website / LinkedIn",t:"url", p:"https://…"},
            ].map(({k,l,t,p})=>(
              <div key={k}>
                <label style={{fontSize:11,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:.8,display:"block",marginBottom:6}}>{l}</label>
                <input className="input-field" type={t} placeholder={p} value={form[k]}
                  onChange={e=>setForm(prev=>({...prev,[k]:e.target.value}))}/>
              </div>
            ))}
          </div>
          <div style={{marginTop:20,display:"flex",gap:10}}>
            <button className="btn-primary" onClick={saveProfile} disabled={saving||!form.name.trim()}>
              {saving?"Saving…":"Save Changes"}
            </button>
            <button className="btn-ghost" onClick={()=>window.location.href="/settings"}>Settings →</button>
          </div>
        </div>

        {/* Account actions */}
        <div className="card fade-up" style={{animationDelay:"160ms"}}>
          <h3 style={{fontWeight:800,fontSize:15,marginBottom:14}}>Quick Links</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[
              {label:"Activity Log", href:"/activity",      icon:"📊"},
              {label:"Settings",     href:"/settings",      icon:"⚙️"},
              {label:"Export Data",  href:"/reports",       icon:"⬇"},
              {label:"Notifications",href:"/notifications", icon:"🔔"},
              {label:"Privacy",      href:"/privacy",       icon:"🔒"},
              {label:"Support",      href:"/support",       icon:"💬"},
            ].map(({label,href,icon})=>(
              <a key={label} href={href} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 14px",background:"var(--d4)",border:"1px solid var(--gb)",borderRadius:12,textDecoration:"none",fontSize:13,fontWeight:600,color:"var(--t2)",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,.3)";e.currentTarget.style.color="var(--t1)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--gb)";e.currentTarget.style.color="var(--t2)"}}>
                <span style={{fontSize:16}}>{icon}</span>{label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}