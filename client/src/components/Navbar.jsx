import { useState, useEffect, useRef } from "react";
import API from "../api/api";

function decodeToken(t){try{const b=t.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");return JSON.parse(atob(b));}catch{return null;}}
function getUserFromJWT(){const t=localStorage.getItem("token");if(!t)return null;const p=decodeToken(t);if(!p)return null;const n=p.name||p.username||p.email||"";return{id:p.id||p._id||p.sub||"",name:n,email:p.email||"",initials:bi(n),role:p.role||"user"};}
function bi(name){if(!name)return"?";return name.split(" ").filter(Boolean).map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?";}
function getActivePage(){const p=window.location.pathname.toLowerCase();if(p.includes("/admin/users"))return"Users";if(p.includes("/admin/analytics"))return"Analytics";if(p.includes("/admin/alerts"))return"Alerts";if(p.includes("/admin"))return"Admin";if(p.includes("/tasks"))return"Tasks";if(p.includes("/finance"))return"Finance";if(p.includes("/habits"))return"Habits";if(p.includes("/ai"))return"AI Chat";if(p.includes("/reports"))return"Reports";return"Dashboard";}

const USER_NAV=[{label:"Dashboard",href:"/dashboard",icon:"⊞"},{label:"Tasks",href:"/tasks",icon:"✓"},{label:"Finance",href:"/finance",icon:"$"},{label:"Habits",href:"/habits",icon:"◎"},{label:"AI Chat",href:"/ai",icon:"✦"}];
const ADMIN_NAV=[{label:"Admin",href:"/admin",icon:"🛡️"},{label:"Users",href:"/admin/users",icon:"👥"},{label:"Analytics",href:"/admin/analytics",icon:"📊"},{label:"Alerts",href:"/admin/alerts",icon:"⚡"}];
const NM={ai:{icon:"🤖",bg:"rgba(124,58,237,0.2)"},finance:{icon:"💰",bg:"rgba(16,185,129,0.2)"},task:{icon:"✓",bg:"rgba(245,158,11,0.2)"},report:{icon:"📊",bg:"rgba(6,182,212,0.2)"},system:{icon:"⚙️",bg:"rgba(255,255,255,0.08)"},habit:{icon:"🎯",bg:"rgba(16,185,129,0.15)"}};

const S=`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
@keyframes nav-af{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes nav-p{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0.6}}
@keyframes nav-sd{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.nav-ab{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6,#06B6D4);background-size:300% 100%;animation:nav-af 5s linear infinite}
.nav-aab{height:2px;background:linear-gradient(90deg,#F43F5E,#F59E0B,#7C3AED,#06B6D4);background-size:300% 100%;animation:nav-af 4s linear infinite}
.nl{font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;color:#505075;text-decoration:none;padding:6px 0;border-bottom:2px solid transparent;transition:color .2s,border-color .2s;white-space:nowrap}
.nl:hover{color:#F0F0FF;border-bottom-color:rgba(255,255,255,0.15)}
.nl.active{color:#8B5CF6;border-bottom-color:#8B5CF6;font-weight:700}
.nl.aactive{color:#F43F5E;border-bottom-color:#F43F5E;font-weight:700}
.nib{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s,border-color .2s,transform .2s;position:relative;flex-shrink:0}
.nib:hover{background:rgba(255,255,255,0.07);border-color:#8B5CF6;transform:scale(1.05)}
.ndrop{position:absolute;top:calc(100% + 10px);right:0;min-width:220px;background:#14141F;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;z-index:300;box-shadow:0 20px 60px rgba(0,0,0,0.6);animation:nav-sd 0.2s ease both}
.ndi{display:flex;align-items:center;gap:10px;padding:12px 16px;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;color:#9090B8;cursor:pointer;transition:background .15s,color .15s;border:none;background:none;width:100%;text-align:left;text-decoration:none}
.ndi:hover{background:rgba(255,255,255,0.04);color:#F0F0FF}
.ndi.danger{color:#F87171}.ndi.danger:hover{background:rgba(244,63,94,0.08);color:#F43F5E}
.ndi.adi{color:#FCA5A5}.ndi.adi:hover{background:rgba(244,63,94,0.06)}
.nds{height:1px;background:rgba(255,255,255,0.06);margin:4px 0}
.nnp{position:absolute;top:calc(100% + 10px);right:0;width:340px;background:#14141F;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;z-index:300;box-shadow:0 20px 60px rgba(0,0,0,0.6);animation:nav-sd 0.2s ease both}
.nni{display:flex;gap:12px;align-items:flex-start;padding:12px 16px;cursor:pointer;transition:background .15s;border-bottom:1px solid rgba(255,255,255,0.04)}
.nni:last-child{border-bottom:none}.nni:hover{background:rgba(255,255,255,0.03)}.nni.ur{background:rgba(124,58,237,0.04)}
.nav-av{border-radius:50%;border:2px solid #8B5CF6;display:flex;align-items:center;justify-content:center;font-family:'Montserrat',sans-serif;font-weight:800;color:#fff;cursor:pointer;overflow:hidden;transition:border-color .2s,transform .2s;flex-shrink:0;background-size:cover;background-position:center}
.nav-av.aav{border-color:#F43F5E}.nav-av:hover{border-color:#22D3EE;transform:scale(1.06)}
@media(max-width:768px){.ndl{display:none !important}.nmm{display:flex !important}}.nmm{display:none}`;

export default function Navbar({onLogout=null,onSettings=null,externalUser=null,externalAvatar=null,onAvatarChange=null}){
  const[ap,setAp]=useState(getActivePage);
  const[user,setUser]=useState(()=>externalUser||getUserFromJWT());
  const[av,setAv]=useState(externalAvatar||null);
  const[notifs,setNotifs]=useState([]);
  const[uc,setUc]=useState(0);
  const[no,setNo]=useState(false);
  const[dro,setDro]=useState(false);
  const[mob,setMob]=useState(false);
  const nr=useRef(null),dr=useRef(null),fr=useRef(null);
  const isAdmin=user?.role==="admin";

  useEffect(()=>{const id="tnav";if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.appendChild(s);}}, []);
  useEffect(()=>{const h=()=>setAp(getActivePage());window.addEventListener("popstate",h);return()=>window.removeEventListener("popstate",h);},[]);
  useEffect(()=>{
    if(externalUser){setUser(externalUser);return;}
    API.get("/auth/me").then(r=>{const u=r.data;if(!u)return;const n=u.name||u.username||u.email||"";setUser({id:u._id||u.id||"",name:n,email:u.email||"",initials:bi(n),role:u.role||"user"});if(u.avatarUrl)setAv(u.avatarUrl);}).catch(()=>{});
  },[externalUser]);
  useEffect(()=>{if(externalAvatar!==null)setAv(externalAvatar);},[externalAvatar]);
  const fn=()=>{API.get("/notifications").then(r=>{const d=r.data||[];setNotifs(d);setUc(d.filter(n=>!n.read).length);}).catch(()=>{});};
  useEffect(()=>{fn();const t=setInterval(fn,60000);return()=>clearInterval(t);},[]);
  useEffect(()=>{const h=e=>{if(nr.current&&!nr.current.contains(e.target))setNo(false);if(dr.current&&!dr.current.contains(e.target))setDro(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);

  const mr=id=>{setNotifs(p=>p.map(n=>n._id===id?{...n,read:true}:n));setUc(p=>Math.max(0,p-1));API.put(`/notifications/${id}/read`).catch(()=>{});};
  const mar=()=>{setNotifs(p=>p.map(n=>({...n,read:true})));setUc(0);API.put("/notifications/read-all").catch(()=>{});};
  const haf=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=ev=>setAv(ev.target.result);rd.readAsDataURL(f);const fd=new FormData();fd.append("avatar",f);API.post("/users/avatar",fd,{headers:{"Content-Type":"multipart/form-data"}}).then(r=>{if(r.data?.avatarUrl)setAv(r.data.avatarUrl);}).catch(()=>{});if(onAvatarChange)onAvatarChange(e);setDro(false);};
  const hlo=()=>{setDro(false);if(window.confirm(`Log out, ${user?.name?.split(" ")[0]||"there"}?`)){localStorage.removeItem("token");localStorage.removeItem("user");if(onLogout)onLogout();else window.location.href="/login";}};

  const dn=user?.name||user?.email||"Loading…";
  const fn2=(()=>{const n=user?.name;if(!n)return user?.email?.split("@")[0]||"…";return n.split(" ")[0];})();
  const ini=user?.initials||bi(user?.name||user?.email||"");
  const em=user?.email||"";
  const as=av?{backgroundImage:`url(${av})`,backgroundSize:"cover",backgroundPosition:"center"}:{background:isAdmin?"linear-gradient(135deg,#F43F5E,#7C3AED)":"linear-gradient(135deg,#7C3AED,#06B6D4)"};
  const ft=d=>{if(!d)return"";const df=Date.now()-new Date(d).getTime();if(df<60000)return"just now";if(df<3600000)return`${Math.floor(df/60000)}m ago`;if(df<86400000)return`${Math.floor(df/3600000)}h ago`;return new Date(d).toLocaleDateString("en-KE",{day:"2-digit",month:"short"});};
  const NI=isAdmin?ADMIN_NAV:USER_NAV;

  return(
    <nav style={{position:"sticky",top:0,zIndex:200,background:isAdmin?"rgba(10,4,14,0.9)":"rgba(8,8,16,0.82)",backdropFilter:"blur(24px) saturate(180%)",WebkitBackdropFilter:"blur(24px) saturate(180%)",borderBottom:`1px solid ${isAdmin?"rgba(244,63,94,0.15)":"rgba(255,255,255,0.07)"}`,fontFamily:"'Montserrat',sans-serif"}}>
      <div className={isAdmin?"nav-aab":"nav-ab"}/>
      <div style={{maxWidth:1300,margin:"0 auto",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>

        {/* Brand */}
        <a href={isAdmin?"/admin":"/dashboard"} style={{display:"flex",alignItems:"center",gap:11,textDecoration:"none",flexShrink:0}}>
          <div style={{width:36,height:36,borderRadius:10,flexShrink:0,overflow:"hidden",boxShadow:`0 4px 16px ${isAdmin?"rgba(244,63,94,0.4)":"rgba(124,58,237,0.4)"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <img src="/trcklo logo.png" alt="Tracklio" style={{width:"100%",height:"100%",objectFit:"contain"}} onError={e=>{e.currentTarget.style.display="none";e.currentTarget.parentElement.style.background=isAdmin?"linear-gradient(135deg,#F43F5E,#7C3AED)":"linear-gradient(135deg,#7C3AED,#06B6D4)";}}/>
          </div>
          <div>
            <div style={{fontWeight:900,fontSize:19,letterSpacing:-0.8,lineHeight:1,background:isAdmin?"linear-gradient(90deg,#F43F5E,#F59E0B)":"linear-gradient(90deg,#8B5CF6,#22D3EE)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Tracklio</div>
            <div style={{fontSize:9,fontWeight:700,color:isAdmin?"#F87171":"#505075",textTransform:"uppercase",letterSpacing:1.4,marginTop:1}}>{isAdmin?"Admin Console":"Smart Life OS"}</div>
          </div>
        </a>

        {/* Nav links — role-based */}
        <div className="ndl" style={{display:"flex",alignItems:"center",gap:28,flex:1,justifyContent:"center"}}>
          {NI.map(({label,href})=>(
            <a key={label} href={href} className={`nl${ap===label?(isAdmin?" aactive":" active"):""}`} onClick={()=>setAp(label)}>{label}</a>
          ))}
          {isAdmin&&(
            <a href="/dashboard" style={{fontSize:12,fontWeight:600,color:"#505075",textDecoration:"none",padding:"4px 10px",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(244,63,94,.3)";e.currentTarget.style.color="#FCA5A5";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.07)";e.currentTarget.style.color="#505075";}}>
              ↗ User View
            </a>
          )}
        </div>

        {/* Right */}
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          {isAdmin?(
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",background:"rgba(244,63,94,0.1)",border:"1px solid rgba(244,63,94,0.25)",borderRadius:20}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#F43F5E",display:"inline-block",animation:"nav-p 2.5s infinite"}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#F87171",whiteSpace:"nowrap"}}>Admin Mode</span>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",background:"rgba(16,185,129,0.09)",border:"1px solid rgba(16,185,129,0.22)",borderRadius:20}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#10B981",display:"inline-block",animation:"nav-p 2.5s infinite"}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#10B981",whiteSpace:"nowrap"}}>AI Online</span>
            </div>
          )}

          {/* Bell */}
          <div ref={nr} style={{position:"relative"}}>
            <button className="nib" onClick={()=>{setNo(o=>!o);setDro(false);}} aria-label="Notifications">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9090B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {uc>0&&<span style={{position:"absolute",top:7,right:7,width:8,height:8,borderRadius:"50%",background:"#F43F5E",border:"1.5px solid #080810",animation:"nav-p 2s infinite"}}/>}
            </button>
            {no&&(
              <div className="nnp">
                <div style={{padding:"14px 16px 10px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:800,fontSize:13,color:"#F0F0FF"}}>Notifications</span>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {uc>0&&<span style={{background:"#F43F5E",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>{uc} new</span>}
                    {uc>0&&<button onClick={mar} style={{fontSize:10,fontWeight:700,color:"#8B5CF6",background:"none",border:"none",cursor:"pointer"}}>Mark all read</button>}
                  </div>
                </div>
                <div style={{maxHeight:340,overflowY:"auto"}}>
                  {notifs.length===0?(<div style={{padding:"28px 16px",textAlign:"center",color:"#505075",fontSize:13}}><div style={{fontSize:32,marginBottom:8}}>🔔</div>All caught up!</div>)
                    :notifs.slice(0,10).map((n,i)=>{const m=NM[n.type]||NM.system;return(
                      <div key={n._id||i} className={`nni${n.read?"":" ur"}`} onClick={()=>{mr(n._id);if(n.link)window.location.href=n.link;}}>
                        <div style={{width:34,height:34,borderRadius:"50%",background:m.bg,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{m.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:12,color:"#F0F0FF",display:"flex",alignItems:"center",gap:6}}>{n.title}{!n.read&&<span style={{width:5,height:5,borderRadius:"50%",background:"#8B5CF6",display:"inline-block"}}/>}</div>
                          <div style={{fontSize:11,color:"#505075",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.message}</div>
                          <div style={{fontSize:10,color:"#505075",marginTop:3,fontWeight:600}}>{ft(n.createdAt)}</div>
                        </div>
                      </div>
                    );})}
                </div>
                <div style={{padding:"10px 16px",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                  <a href="/notifications" style={{display:"block",padding:"8px",background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:10,fontSize:12,fontWeight:700,color:"#C4B5FD",textAlign:"center",textDecoration:"none"}}>View all →</a>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div ref={dr} style={{position:"relative"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>{setDro(o=>!o);setNo(false);}}>
              <div className={`nav-av${isAdmin?" aav":""}`} style={{width:38,height:38,fontSize:13,...as}}>{!av&&<span style={{userSelect:"none"}}>{ini}</span>}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{display:"flex",flexDirection:"column"}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#F0F0FF",lineHeight:1.2,whiteSpace:"nowrap"}}>{fn2}</span>
                  <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.6,color:isAdmin?"#F87171":"#505075"}}>{isAdmin?"Administrator":"Pro Plan"}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#505075" strokeWidth="2.5" strokeLinecap="round" style={{transition:"transform .25s",transform:dro?"rotate(180deg)":"rotate(0)",flexShrink:0}}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            {dro&&(
              <div className="ndrop">
                <div style={{padding:"14px 16px 12px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:10}}>
                  <div className={`nav-av${isAdmin?" aav":""}`} style={{width:38,height:38,fontSize:13,flexShrink:0,...as}}>{!av&&<span style={{userSelect:"none"}}>{ini}</span>}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"#F0F0FF"}}>{dn}</div>
                    {em&&<div style={{fontSize:10,color:"#505075",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:140}}>{em}</div>}
                    <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:4,padding:"2px 8px",background:isAdmin?"rgba(244,63,94,0.12)":"rgba(124,58,237,0.12)",border:isAdmin?"1px solid rgba(244,63,94,0.25)":"1px solid rgba(124,58,237,0.25)",borderRadius:8,fontSize:10,fontWeight:700,color:isAdmin?"#FCA5A5":"#C4B5FD"}}>{isAdmin?"🛡️ Admin":"✦ Pro Plan"}</div>
                  </div>
                </div>
                {isAdmin&&<>
                  <a className="ndi adi" href="/admin"><span>🛡️</span>Admin Dashboard</a>
                  <a className="ndi adi" href="/admin/users"><span>👥</span>Manage Users</a>
                  <a className="ndi" href="/admin/analytics" style={{color:"#FCD34D"}}><span>📊</span>Analytics</a>
                  <div className="nds"/>
                  <a className="ndi" href="/dashboard"><span style={{fontSize:14}}>⊞</span>User Dashboard</a>
                  <div className="nds"/>
                </>}
                <button className="ndi" onClick={()=>fr.current?.click()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>Change Photo
                </button>
                <input ref={fr} type="file" accept="image/*" style={{display:"none"}} onChange={haf}/>
                <a className="ndi" href="/settings"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</a>
                <a className="ndi" href="/profile"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>My Profile</a>
                <a className="ndi" href="/notifications"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Notifications{uc>0&&<span style={{marginLeft:"auto",background:"#F43F5E",color:"#fff",fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:8}}>{uc}</span>}</a>
                <div className="nds"/>
                <button className="ndi danger" onClick={hlo}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Log Out</button>
              </div>
            )}
          </div>

          <button className="nib nmm" onClick={()=>setMob(o=>!o)} aria-label="Menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9090B8" strokeWidth="2" strokeLinecap="round">
              {mob?<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>:<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {mob&&(
        <div style={{borderTop:`1px solid ${isAdmin?"rgba(244,63,94,0.15)":"rgba(255,255,255,0.06)"}`,background:"rgba(8,8,16,0.96)",padding:"12px 24px 16px",animation:"nav-sd .2s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:4}}>
            <div className={`nav-av${isAdmin?" aav":""}`} style={{width:40,height:40,fontSize:14,...as}}>{!av&&<span style={{userSelect:"none"}}>{ini}</span>}</div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#F0F0FF"}}>{dn}</div>
              {em&&<div style={{fontSize:11,color:"#505075",marginTop:1}}>{em}</div>}
              {isAdmin&&<div style={{fontSize:10,fontWeight:700,color:"#F87171",marginTop:2}}>🛡️ Administrator</div>}
            </div>
          </div>
          {NI.map(({label,href,icon})=>(
            <a key={label} href={href} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",fontFamily:"'Montserrat',sans-serif",fontSize:14,fontWeight:ap===label?700:600,color:ap===label?(isAdmin?"#F87171":"#8B5CF6"):"#9090B8",textDecoration:"none",transition:"color .2s"}} onClick={()=>{setAp(label);setMob(false);}}>
              <span style={{fontSize:16}}>{icon}</span>{label}
              {ap===label&&<span style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:isAdmin?"#F43F5E":"#8B5CF6"}}/>}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}