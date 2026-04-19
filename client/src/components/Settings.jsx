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
  .orb1{width:500px;height:500px;background:var(--v);top:-150px;left:-100px;opacity:.10}
  .orb2{width:400px;height:400px;background:var(--c);bottom:-100px;right:-100px;opacity:.08}
  @keyframes float-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .4s ease both}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:18px;padding:24px;margin-bottom:16px;transition:border-color .2s}
  .card:hover{border-color:rgba(255,255,255,0.11)}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6);background-size:300% 100%;animation:accent-flow 5s linear infinite;position:sticky;top:0;z-index:100}
  .toggle-track{width:44px;height:26px;border-radius:13px;position:relative;cursor:pointer;transition:background .3s;flex-shrink:0}
  .toggle-thumb{width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .3s;box-shadow:0 2px 6px rgba(0,0,0,.4)}
  .settings-input{width:100%;padding:10px 14px;background:var(--d4);border:1px solid var(--gb);border-radius:11px;color:var(--t1);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .2s}
  .settings-input:focus{border-color:var(--vl)}
  .settings-input::placeholder{color:var(--t3)}
  .btn-primary{padding:11px 22px;background:linear-gradient(135deg,var(--v),var(--c));border:none;border-radius:11px;color:#fff;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s}
  .btn-primary:hover:not(:disabled){opacity:.88;transform:scale(1.02)}
  .btn-primary:disabled{opacity:.4;cursor:not-allowed}
  .btn-ghost{padding:9px 18px;background:rgba(255,255,255,.04);border:1px solid var(--gb);border-radius:11px;color:var(--t2);font-family:'Montserrat',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
  .btn-ghost:hover{background:rgba(255,255,255,.07);color:var(--t1)}
  .btn-danger{padding:9px 18px;background:rgba(244,63,94,.08);border:1px solid rgba(244,63,94,.25);border-radius:11px;color:#F87171;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s}
  .btn-danger:hover{background:rgba(244,63,94,.15)}
  .tab-btn{padding:8px 18px;border-radius:10px;font-family:'Montserrat',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
  .tab-btn.active{background:var(--v);color:#fff}
  .tab-btn:not(.active){background:transparent;color:var(--t3)}
  .tab-btn:not(.active):hover{color:var(--t1)}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:1000;animation:float-up .2s ease}
  .danger-zone{background:rgba(244,63,94,.04);border:1px solid rgba(244,63,94,.15);border-radius:16px;padding:20px 24px;margin-bottom:16px}
`;

function Toggle({ on, onToggle, disabled=false }) {
  return (
    <div className="toggle-track"
      style={{ background: on ? "var(--vl)" : "var(--d5)", opacity: disabled ? .4 : 1, cursor: disabled ? "not-allowed":"pointer" }}
      onClick={() => !disabled && onToggle()}>
      <div className="toggle-thumb" style={{ transform: on ? "translateX(18px)" : "translateX(0)" }}/>
    </div>
  );
}

function Row({ label, sub, children }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:"var(--t1)" }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:"var(--t3)", marginTop:3, fontWeight:500 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

const TABS = ["Preferences","Account","Notifications","Privacy","Danger Zone"];

const DEFAULT_PREFS = {
  aiInsights: true, budgetWarnings: true, weeklyReport: false,
  darkMode: true, compactView: false, animations: true,
  currency: "KES", timezone: "Africa/Nairobi", language: "en",
  taskReminders: true, habitReminders: true, financeAlerts: true,
  emailNotifications: true, pushNotifications: false,
  shareAnalytics: false, dataRetention: "1year",
};

export default function Settings() {
  useEffect(() => {
    const id="trkl-settings";
    if(!document.getElementById(id)){const s=document.createElement("style");s.id=id;s.textContent=S;document.head.prepend(s);}
  },[]);

  const [tab,       setTab]       = useState("Preferences");
  const [prefs,     setPrefs]     = useState(DEFAULT_PREFS);
  const [profile,   setProfile]   = useState({ name:"", email:"", currentPassword:"", newPassword:"", confirmPassword:"" });
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState("");
  const [loading,   setLoading]   = useState(true);
  const [delModal,  setDelModal]  = useState(false);
  const [delInput,  setDelInput]  = useState("");

  /* Load current user + settings */
  useEffect(() => {
    Promise.all([
      API.get("/auth/me").catch(()=>({data:null})),
      API.get("/users/settings").catch(()=>({data:null})),
    ]).then(([uRes, sRes]) => {
      if (uRes.data) {
        const u = uRes.data;
        setProfile(p => ({ ...p, name:u.name||"", email:u.email||"" }));
      }
      if (sRes.data) setPrefs(p => ({ ...p, ...sRes.data }));
    }).finally(() => setLoading(false));
  }, []);

  const savePrefs = async () => {
    setSaving(true); setSaveMsg("");
    try {
      await API.put("/users/settings", prefs);
      setSaveMsg("Settings saved ✓");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch { setSaveMsg("Failed to save."); }
    finally { setSaving(false); }
  };

  const saveProfile = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const payload = { name: profile.name };
      if (profile.newPassword) {
        if (profile.newPassword !== profile.confirmPassword) {
          setSaveMsg("New passwords don't match."); setSaving(false); return;
        }
        payload.currentPassword = profile.currentPassword;
        payload.newPassword     = profile.newPassword;
      }
      await API.put("/users/profile", payload);
      setSaveMsg("Profile updated ✓");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) { setSaveMsg(e.response?.data?.message || "Failed to update profile."); }
    finally { setSaving(false); }
  };

  const deleteAccount = async () => {
    if (delInput !== profile.email) return;
    try {
      await API.delete("/users/account");
      localStorage.removeItem("token");
      window.location.href = "/goodbye";
    } catch { setSaveMsg("Failed to delete account."); }
    setDelModal(false);
  };

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

  return (
    <div style={{ minHeight:"100vh", background:"var(--d1)", fontFamily:"Montserrat,sans-serif", position:"relative", overflow:"hidden" }}>
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="nav-accent"/>

      <div style={{ position:"relative", zIndex:1, maxWidth:820, margin:"0 auto", padding:"40px 28px 80px" }}>
        {/* Header */}
        <div className="fade-up" style={{ marginBottom:32 }}>
          <h1 style={{ fontWeight:900, fontSize:28, letterSpacing:-0.8, marginBottom:6 }}>Settings</h1>
          <p style={{ fontSize:13, color:"var(--t3)", fontWeight:500 }}>Manage your account, preferences and privacy</p>
        </div>

        {/* Save message */}
        {saveMsg && (
          <div style={{ background: saveMsg.includes("✓") ? "rgba(16,185,129,.1)" : "rgba(244,63,94,.1)", border:`1px solid ${saveMsg.includes("✓")?"rgba(16,185,129,.3)":"rgba(244,63,94,.3)"}`, borderRadius:12, padding:"10px 16px", marginBottom:20, fontSize:13, fontWeight:600, color: saveMsg.includes("✓") ? "#6EE7B7" : "#FCA5A5" }}>
            {saveMsg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"var(--d3)", borderRadius:12, padding:4, marginBottom:24, flexWrap:"wrap" }}>
          {TABS.map(t => (
            <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}
              style={{ color: t==="Danger Zone" && tab!==t ? "#F87171" : undefined }}>{t}</button>
          ))}
        </div>

        {/* ── PREFERENCES ── */}
        {tab === "Preferences" && (
          <>
            <div className="card fade-up">
              <h3 style={{ fontWeight:800, fontSize:15, marginBottom:2 }}>AI & Intelligence</h3>
              <div style={{ fontSize:12, color:"var(--t3)", marginBottom:16, fontWeight:500 }}>Control how Tracklio AI analyses your data</div>
              <Row label="AI Insights" sub="Real-time AI analysis on your tasks and finances"><Toggle on={prefs.aiInsights} onToggle={()=>set("aiInsights",!prefs.aiInsights)}/></Row>
              <Row label="Budget Warnings" sub="Alert when spending exceeds 80% of income"><Toggle on={prefs.budgetWarnings} onToggle={()=>set("budgetWarnings",!prefs.budgetWarnings)}/></Row>
              <Row label="Weekly AI Report" sub="Email summary every Sunday"><Toggle on={prefs.weeklyReport} onToggle={()=>set("weeklyReport",!prefs.weeklyReport)}/></Row>
            </div>

            <div className="card fade-up" style={{ animationDelay:"60ms" }}>
              <h3 style={{ fontWeight:800, fontSize:15, marginBottom:2 }}>Appearance</h3>
              <div style={{ fontSize:12, color:"var(--t3)", marginBottom:16, fontWeight:500 }}>Customise how Tracklio looks and feels</div>
              <Row label="Dark Mode" sub="Always on — light mode coming soon"><Toggle on={prefs.darkMode} onToggle={()=>set("darkMode",!prefs.darkMode)} disabled/></Row>
              <Row label="Compact View" sub="Reduce spacing for more information density"><Toggle on={prefs.compactView} onToggle={()=>set("compactView",!prefs.compactView)}/></Row>
              <Row label="Animations" sub="Smooth transitions and micro-interactions"><Toggle on={prefs.animations} onToggle={()=>set("animations",!prefs.animations)}/></Row>
            </div>

            <div className="card fade-up" style={{ animationDelay:"120ms" }}>
              <h3 style={{ fontWeight:800, fontSize:15, marginBottom:16 }}>Regional Settings</h3>
              {[
                { label:"Currency", key:"currency", opts:[{v:"KES",l:"KES — Kenyan Shilling"},{v:"USD",l:"USD — US Dollar"},{v:"EUR",l:"EUR — Euro"},{v:"GBP",l:"GBP — Pound Sterling"},{v:"NGN",l:"NGN — Nigerian Naira"},{v:"GHS",l:"GHS — Ghanaian Cedi"}] },
                { label:"Language", key:"language", opts:[{v:"en",l:"English"},{v:"sw",l:"Swahili"},{v:"fr",l:"French"}] },
              ].map(({ label, key, opts }) => (
                <div key={key} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 }}>{label}</label>
                  <select className="settings-input" value={prefs[key]} onChange={e=>set(key,e.target.value)}
                    style={{ appearance:"none", cursor:"pointer" }}>
                    {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={savePrefs} disabled={saving}>{saving?"Saving…":"Save Preferences"}</button>
          </>
        )}

        {/* ── ACCOUNT ── */}
        {tab === "Account" && (
          <>
            <div className="card fade-up">
              <h3 style={{ fontWeight:800, fontSize:15, marginBottom:16 }}>Profile Information</h3>
              {[{k:"name",l:"Full Name",t:"text",p:"Your full name"},{k:"email",l:"Email Address",t:"email",p:"your@email.com",dis:true}].map(({k,l,t,p,dis})=>(
                <div key={k} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 }}>{l}</label>
                  <input className="settings-input" type={t} placeholder={p} value={profile[k]}
                    onChange={e=>setProfile(p=>({...p,[k]:e.target.value}))} disabled={dis}
                    style={{ opacity:dis?.5:1, cursor:dis?"not-allowed":"text" }}/>
                  {dis && <div style={{ fontSize:11, color:"var(--t3)", marginTop:4, fontWeight:500 }}>Email cannot be changed. Contact support to update.</div>}
                </div>
              ))}
            </div>

            <div className="card fade-up" style={{ animationDelay:"60ms" }}>
              <h3 style={{ fontWeight:800, fontSize:15, marginBottom:16 }}>Change Password</h3>
              {[{k:"currentPassword",l:"Current Password"},{k:"newPassword",l:"New Password"},{k:"confirmPassword",l:"Confirm New Password"}].map(({k,l})=>(
                <div key={k} style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:6 }}>{l}</label>
                  <input className="settings-input" type="password" placeholder="••••••••" value={profile[k]}
                    onChange={e=>setProfile(p=>({...p,[k]:e.target.value}))}/>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={saveProfile} disabled={saving||!profile.name.trim()}>{saving?"Saving…":"Update Profile"}</button>
          </>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab === "Notifications" && (
          <div className="card fade-up">
            <h3 style={{ fontWeight:800, fontSize:15, marginBottom:2 }}>Notification Preferences</h3>
            <div style={{ fontSize:12, color:"var(--t3)", marginBottom:16, fontWeight:500 }}>Choose when and how Tracklio notifies you</div>
            <Row label="Task Reminders"       sub="Alerts for due and overdue tasks">      <Toggle on={prefs.taskReminders}      onToggle={()=>set("taskReminders",     !prefs.taskReminders)}/></Row>
            <Row label="Habit Reminders"      sub="Daily habit check-in prompts">          <Toggle on={prefs.habitReminders}     onToggle={()=>set("habitReminders",    !prefs.habitReminders)}/></Row>
            <Row label="Finance Alerts"       sub="Budget warnings and income notifications"><Toggle on={prefs.financeAlerts}      onToggle={()=>set("financeAlerts",     !prefs.financeAlerts)}/></Row>
            <Row label="Email Notifications"  sub="Receive notifications via email">       <Toggle on={prefs.emailNotifications} onToggle={()=>set("emailNotifications",!prefs.emailNotifications)}/></Row>
            <Row label="Push Notifications"   sub="Browser push notifications (coming soon)"><Toggle on={prefs.pushNotifications}  onToggle={()=>set("pushNotifications", !prefs.pushNotifications)} disabled/></Row>
            <div style={{ paddingTop:18 }}>
              <button className="btn-primary" onClick={savePrefs} disabled={saving}>{saving?"Saving…":"Save Notification Settings"}</button>
            </div>
          </div>
        )}

        {/* ── PRIVACY ── */}
        {tab === "Privacy" && (
          <>
            <div className="card fade-up">
              <h3 style={{ fontWeight:800, fontSize:15, marginBottom:2 }}>Data & Privacy</h3>
              <div style={{ fontSize:12, color:"var(--t3)", marginBottom:16, fontWeight:500 }}>Control how your data is used</div>
              <Row label="Share Usage Analytics" sub="Help improve Tracklio by sharing anonymised usage data"><Toggle on={prefs.shareAnalytics} onToggle={()=>set("shareAnalytics",!prefs.shareAnalytics)}/></Row>
              <Row label="Data Retention">
                <select className="settings-input" style={{ width:160, appearance:"none", cursor:"pointer" }} value={prefs.dataRetention} onChange={e=>set("dataRetention",e.target.value)}>
                  <option value="3months">3 Months</option>
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                  <option value="forever">Forever</option>
                </select>
              </Row>
            </div>
            <div className="card fade-up" style={{ animationDelay:"60ms" }}>
              <h3 style={{ fontWeight:800, fontSize:15, marginBottom:14 }}>Data Export</h3>
              <p style={{ fontSize:13, color:"var(--t2)", marginBottom:16, fontWeight:500, lineHeight:1.7 }}>
                Download all your data including tasks, transactions, habits, and AI insights as a CSV archive.
              </p>
              <button className="btn-ghost" onClick={()=>window.location.href="/reports"}>⬇ Export All Data</button>
            </div>
            <button className="btn-primary" onClick={savePrefs} disabled={saving}>{saving?"Saving…":"Save Privacy Settings"}</button>
          </>
        )}

        {/* ── DANGER ZONE ── */}
        {tab === "Danger Zone" && (
          <>
            <div className="danger-zone">
              <h3 style={{ fontWeight:800, fontSize:15, color:"#F87171", marginBottom:8 }}>⚠️ Danger Zone</h3>
              <p style={{ fontSize:13, color:"var(--t2)", fontWeight:500, lineHeight:1.7, marginBottom:16 }}>
                Actions here are permanent and cannot be undone. Please proceed with caution.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ padding:"16px", background:"var(--d4)", borderRadius:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Reset All Data</div>
                    <div style={{ fontSize:12, color:"var(--t3)", fontWeight:500 }}>Delete all tasks, transactions and habits. Keep your account.</div>
                  </div>
                  <button className="btn-danger" onClick={()=>{if(window.confirm("Reset ALL data? This cannot be undone.")) API.delete("/users/data").then(()=>window.location.reload()).catch(()=>setSaveMsg("Failed to reset data."));}}>
                    Reset Data
                  </button>
                </div>
                <div style={{ padding:"16px", background:"var(--d4)", borderRadius:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:"#F87171", marginBottom:4 }}>Delete Account</div>
                    <div style={{ fontSize:12, color:"var(--t3)", fontWeight:500 }}>Permanently delete your account and all associated data.</div>
                  </div>
                  <button className="btn-danger" onClick={()=>setDelModal(true)}>Delete Account</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete modal */}
      {delModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDelModal(false)}>
          <div style={{ background:"var(--d3)", border:"1px solid var(--gb)", borderRadius:20, padding:28, width:400, boxShadow:"0 30px 80px rgba(0,0,0,.6)" }}>
            <div style={{ fontSize:40, textAlign:"center", marginBottom:12 }}>💀</div>
            <h3 style={{ fontWeight:800, fontSize:17, textAlign:"center", marginBottom:8 }}>Delete Account?</h3>
            <p style={{ fontSize:13, color:"var(--t2)", textAlign:"center", marginBottom:20, lineHeight:1.6 }}>
              This will permanently delete your account and all data. Type your email to confirm.
            </p>
            <input className="settings-input" placeholder={profile.email} value={delInput} onChange={e=>setDelInput(e.target.value)} style={{ marginBottom:16 }}/>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn-ghost" style={{ flex:1 }} onClick={()=>setDelModal(false)}>Cancel</button>
              <button onClick={deleteAccount} disabled={delInput !== profile.email}
                style={{ flex:1, padding:"10px", background: delInput===profile.email?"var(--r)":"var(--d5)", border:"none", borderRadius:11, color: delInput===profile.email?"#fff":"var(--t3)", fontFamily:"Montserrat,sans-serif", fontWeight:700, fontSize:13, cursor: delInput===profile.email?"pointer":"not-allowed" }}>
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}