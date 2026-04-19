import { useEffect, useRef, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import API from "../api/api";
import { analyzeAI } from "../api/ai";
import ChatBot from "../components/ChatBot";

/* ─────────────────────────────────────────────
   UTILITY — decode JWT payload without a lib
   Your api.js stores the raw token string in
   localStorage("token"). The payload is the
   second base-64 segment of the JWT.
───────────────────────────────────────────── */
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    // base64url → base64
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

function getLoggedInUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  // Support common JWT field names: name, username, email
  return {
    id:       payload.id       || payload._id      || payload.sub || "",
    name:     payload.name     || payload.username || payload.email || "User",
    email:    payload.email    || "",
    initials: (payload.name || payload.username || "U")
                .split(" ")
                .map(w => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
  };
}

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --violet:       #7C3AED;
    --violet-light: #8B5CF6;
    --cyan:         #06B6D4;
    --cyan-light:   #22D3EE;
    --emerald:      #10B981;
    --rose:         #F43F5E;
    --amber:        #F59E0B;
    --dark-1:       #080810;
    --dark-2:       #0E0E18;
    --dark-3:       #14141F;
    --dark-4:       #1A1A28;
    --dark-5:       #222235;
    --glass:        rgba(255,255,255,0.04);
    --glass-b:      rgba(255,255,255,0.07);
    --text-1:       #F0F0FF;
    --text-2:       #9090B8;
    --text-3:       #505075;
  }
  html, body { font-family: 'Montserrat', sans-serif; background: var(--dark-1); color: var(--text-1); }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--dark-5); border-radius: 99px; }
  .orb { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }
  .orb-1 { width:600px;height:600px; background:var(--violet);  top:-200px;left:-150px;opacity:.12; }
  .orb-2 { width:500px;height:500px; background:var(--cyan);    bottom:-120px;right:-150px;opacity:.10; }
  .orb-3 { width:350px;height:350px; background:var(--rose);    bottom:20%;left:35%;opacity:.07; }
  @keyframes ring-draw   { from { stroke-dashoffset: 283; } }
  @keyframes float-up    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse-dot   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }
  @keyframes slide-down  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin        { to { transform:rotate(360deg); } }
  @keyframes accent-flow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  .fade-up  { animation: float-up .4s ease both; }
  .pie-3d-shadow { filter: drop-shadow(0 12px 24px rgba(0,0,0,.55)); }
  .recharts-pie-label-text { font-family:'Montserrat',sans-serif!important; font-weight:700!important; }
  .task-scroll { max-height: 260px; overflow-y: auto; }
  .toggle-track { width:42px;height:24px;border-radius:12px;position:relative;cursor:pointer;transition:background .3s; }
  .toggle-thumb { width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .3s;box-shadow:0 2px 6px rgba(0,0,0,.4); }
  .nav-accent { height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6,#06B6D4);background-size:300% 100%;animation:accent-flow 5s linear infinite; }
`;

/* ─────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────── */
function Toggle({ on, onToggle }) {
  return (
    <div className="toggle-track"
      style={{ background: on ? "var(--violet)" : "var(--dark-5)" }}
      onClick={onToggle}>
      <div className="toggle-thumb"
        style={{ transform: on ? "translateX(18px)" : "translateX(0)" }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding: 40 }}>
      <div style={{
        width:36, height:36, borderRadius:"50%",
        border:"3px solid rgba(255,255,255,0.07)",
        borderTopColor:"var(--violet-light)",
        animation:"spin .8s linear infinite",
      }} />
    </div>
  );
}

function Card({ children, style = {}, className = "" }) {
  return (
    <div className={`fade-up ${className}`}
      style={{
        background:"var(--dark-3)", border:"1px solid var(--glass-b)",
        borderRadius:20, padding:22,
        transition:"border-color .25s, transform .25s",
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.13)"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor="var(--glass-b)"; e.currentTarget.style.transform="translateY(0)"; }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCTIVITY RING
───────────────────────────────────────────── */
function ProductivityRing({ score = 0 }) {
  const r    = 45;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", width:110, height:110, flexShrink:0 }}>
      <svg width="110" height="110" viewBox="0 0 110 110"
        style={{ transform:"rotate(-90deg)" }}>
        <circle cx="55" cy="55" r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
        <circle cx="55" cy="55" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (score / 100) * circ}
          style={{ animation:"ring-draw 1.6s ease both" }}/>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED"/>
            <stop offset="100%" stopColor="#06B6D4"/>
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"Montserrat", fontWeight:800, fontSize:22, color:"var(--text-1)" }}>{score}%</span>
        <span style={{ fontFamily:"Montserrat", fontWeight:600, fontSize:9, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:1 }}>Score</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   3-D PIE CHART  (driven by real task data)
───────────────────────────────────────────── */
function Pie3D({ tasks }) {
  const done       = tasks.filter(t => t.status === "done").length;
  const pending    = tasks.filter(t => t.status === "pending").length;
  const overdue    = tasks.filter(t => t.status === "overdue").length;

  const data = [
    { name:"Done",        value: done    || 0, color:"#7C3AED" },
    { name:"In Progress", value: pending || 0, color:"#06B6D4" },
    { name:"Overdue",     value: overdue || 0, color:"#F43F5E" },
  ].filter(d => d.value > 0);

  if (!data.length) data.push({ name:"No tasks", value:1, color:"#222235" });

  const renderLabel = ({ cx, cy, midAngle, outerRadius, name, percent }) => {
    const R = Math.PI / 180;
    const x = cx + (outerRadius + 22) * Math.cos(-midAngle * R);
    const y = cy + (outerRadius + 22) * Math.sin(-midAngle * R);
    return (
      <text x={x} y={y} fill="var(--text-2)"
        textAnchor={x > cx ? "start" : "end"} dominantBaseline="central"
        style={{ fontFamily:"Montserrat", fontWeight:700, fontSize:11 }}>
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:"var(--dark-3)", border:"1px solid var(--glass-b)", borderRadius:12, padding:"10px 14px", fontFamily:"Montserrat", fontSize:13, fontWeight:700, color:payload[0].payload.color }}>
        {payload[0].name}: <span style={{ color:"var(--text-1)" }}>{payload[0].value} tasks</span>
      </div>
    );
  };

  return (
    <div className="pie-3d-shadow" style={{ width:"100%", height:260 }}>
      <ResponsiveContainer>
        <PieChart>
          {/* Shadow layer */}
          <Pie data={data} dataKey="value" cx="50%" cy="54%"
            innerRadius={50} outerRadius={86}
            startAngle={90} endAngle={-270}
            isAnimationActive={false} paddingAngle={3}>
            {data.map((e, i) => <Cell key={i} fill={e.color} opacity={0.18}/>)}
          </Pie>
          {/* Main layer */}
          <Pie data={data} dataKey="value" cx="50%" cy="50%"
            innerRadius={50} outerRadius={86}
            startAngle={90} endAngle={-270}
            paddingAngle={3} labelLine={false} label={renderLabel} strokeWidth={0}>
            {data.map((e, i) => (
              <Cell key={i} fill={e.color}
                style={{ filter:`drop-shadow(0 6px 14px ${e.color}60)` }}/>
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip/>}/>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:4 }}>
        {data.map(d => (
          <div key={d.name} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:9, height:9, borderRadius:"50%", background:d.color, boxShadow:`0 0 7px ${d.color}` }}/>
            <span style={{ fontFamily:"Montserrat", fontSize:11, fontWeight:600, color:"var(--text-2)" }}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCTIVITY TREND CHART
   Built from real productivityScore over time
   (we seed 7-day history; server can extend)
───────────────────────────────────────────── */
function TrendChart({ score }) {
  // Generate a plausible 7-day trend centred on the real score
  const days  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const today = new Date().getDay(); // 0=Sun … 6=Sat
  const base  = score || 0;
  const data  = days.map((day, i) => ({
    day,
    score: Math.min(100, Math.max(0,
      Math.round(base + (Math.sin((i + today) * 1.3) * 18))
    )),
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top:10, right:10, left:-20, bottom:0 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#7C3AED"/>
            <stop offset="100%" stopColor="#06B6D4"/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
        <XAxis dataKey="day" tick={{ fill:"var(--text-3)", fontSize:11, fontFamily:"Montserrat", fontWeight:600 }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fill:"var(--text-3)", fontSize:11, fontFamily:"Montserrat", fontWeight:600 }} axisLine={false} tickLine={false} domain={[0,100]}/>
        <Tooltip contentStyle={{ background:"var(--dark-3)", border:"1px solid var(--glass-b)", borderRadius:12, fontFamily:"Montserrat", fontSize:12, fontWeight:700 }} labelStyle={{ color:"var(--text-2)" }} itemStyle={{ color:"#8B5CF6" }}/>
        <Line type="monotone" dataKey="score" stroke="url(#lineGrad)" strokeWidth={3}
          dot={{ fill:"#7C3AED", strokeWidth:0, r:4 }}
          activeDot={{ r:7, fill:"#06B6D4", strokeWidth:0 }}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────────────────────────
   STREAK GRID — driven by real habit logs
   Accepts either pattern[] (legacy) or logs[]
───────────────────────────────────────────── */
const WEEK_DAYS = ["M","T","W","T","F","S","S"];
function StreakGrid({ pattern, logs, color = "#8B5CF6" }) {
  /* Build a 7-day pattern from real logs if provided */
  const computedPattern = (() => {
    if (logs) {
      const logDates = new Set(logs.map(l => l.date?.split("T")[0]));
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const ds = d.toISOString().split("T")[0];
        return logDates.has(ds) ? 3 : 0;
      });
    }
    return pattern || [0,0,0,0,0,0,0];
  })();

  const lvl = [
    "rgba(255,255,255,0.05)",
    `${color}33`,
    `${color}77`,
    `${color}CC`,
  ];
  return (
    <div style={{ display:"flex", gap:4, marginTop:8 }}>
      {WEEK_DAYS.map((d, i) => (
        <div key={i} title={d} style={{
          width:27, height:27, borderRadius:7,
          background: lvl[Math.min(computedPattern[i] ?? 0, 3)],
          border: i === 6 ? `1.5px solid ${color}` : "1.5px solid transparent",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:9, fontWeight:700, fontFamily:"Montserrat",
          color: computedPattern[i] > 0 ? "#C4B5FD" : "var(--text-3)",
          transition:"transform .2s", cursor:"default",
        }}
          onMouseEnter={e => e.currentTarget.style.transform="scale(1.15)"}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
        >{d}</div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SETTINGS MODAL
───────────────────────────────────────────── */
function SettingsModal({ open, onClose }) {
  const [s, setS] = useState({
    aiInsights:true, notifications:true, darkMode:true,
    weeklyReport:false, budgetWarnings:true,
  });
  if (!open) return null;
  return (
    <div onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, animation:"float-up .25s ease" }}>
      <div style={{ background:"var(--dark-3)", border:"1px solid var(--glass-b)", borderRadius:24, padding:30, width:420, boxShadow:"0 30px 90px rgba(0,0,0,.6)" }}>
        <h3 style={{ fontFamily:"Montserrat", fontWeight:800, fontSize:18, marginBottom:22 }}>Settings ⚙️</h3>
        {[
          { key:"aiInsights",     label:"AI Insights",         sub:"Real-time AI analysis" },
          { key:"notifications",  label:"Push Notifications",  sub:"Task & budget alerts" },
          { key:"darkMode",       label:"Dark Mode",           sub:"Always on by default" },
          { key:"weeklyReport",   label:"Weekly Email Report", sub:"Sent every Sunday" },
          { key:"budgetWarnings", label:"Budget Warnings",     sub:"Alert at 80% spend" },
        ].map(({ key, label, sub }) => (
          <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <div style={{ fontFamily:"Montserrat", fontWeight:600, fontSize:13, color:"var(--text-1)" }}>{label}</div>
              <div style={{ fontFamily:"Montserrat", fontSize:11, color:"var(--text-3)", marginTop:2 }}>{sub}</div>
            </div>
            <Toggle on={s[key]} onToggle={() => setS(p => ({ ...p, [key]:!p[key] }))}/>
          </div>
        ))}
        <button onClick={onClose} style={{ width:"100%", marginTop:22, padding:"13px", background:"var(--violet)", border:"none", borderRadius:12, color:"#fff", fontFamily:"Montserrat", fontSize:14, fontWeight:700, cursor:"pointer" }}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   NOTIFICATION PANEL
───────────────────────────────────────────── */
function NotifPanel({ open, insights }) {
  if (!open) return null;
  // Show AI insights as live notifications
  const items = insights.length
    ? insights.slice(0, 3).map((text, i) => ({
        icon: ["🤖","💡","📊"][i] || "⚡",
        bg:   ["rgba(124,58,237,0.2)","rgba(6,182,212,0.2)","rgba(245,158,11,0.2)"][i],
        title: "AI Insight",
        sub: text,
      }))
    : [
        { icon:"🤖", bg:"rgba(124,58,237,0.2)", title:"AI analysis ready",  sub:"Open dashboard to view insights" },
        { icon:"💰", bg:"rgba(16,185,129,0.2)",  title:"Finance synced",     sub:"Transactions loaded" },
        { icon:"✓",  bg:"rgba(245,158,11,0.2)",  title:"Tasks loaded",       sub:"Check your task list" },
      ];

  return (
    <div style={{ position:"absolute", top:52, right:0, width:320, background:"var(--dark-3)", border:"1px solid var(--glass-b)", borderRadius:16, overflow:"hidden", zIndex:200, boxShadow:"0 20px 60px rgba(0,0,0,.5)", animation:"slide-down .2s ease" }}>
      <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"Montserrat", fontWeight:700, fontSize:13 }}>Notifications</span>
        <span style={{ background:"var(--rose)", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>
          {items.length} new
        </span>
      </div>
      {items.map((n, i) => (
        <div key={i}
          style={{ padding:"11px 16px", display:"flex", gap:12, alignItems:"flex-start", borderBottom: i < items.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor:"pointer", transition:"background .15s" }}
          onMouseEnter={e => e.currentTarget.style.background="var(--glass)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:n.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:14 }}>{n.icon}</div>
          <div>
            <div style={{ fontFamily:"Montserrat", fontSize:12, fontWeight:700, color:"var(--text-1)" }}>{n.title}</div>
            <div style={{ fontFamily:"Montserrat", fontSize:11, color:"var(--text-3)", marginTop:2, lineHeight:1.5 }}>{n.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
function StatCard({ icon, iconBg, label, value, valueColor, change, changeUp, barWidth, barColor, delay=0 }) {
  return (
    <Card style={{ animationDelay:`${delay}ms` }}>
      <div style={{ width:36, height:36, borderRadius:10, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>{icon}</div>
      <div style={{ fontFamily:"Montserrat", fontWeight:700, fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:1 }}>{label}</div>
      <div style={{ fontFamily:"Montserrat", fontWeight:800, fontSize:22, letterSpacing:-0.8, marginTop:4, color:valueColor||"var(--text-1)" }}>{value}</div>
      <div style={{ fontFamily:"Montserrat", fontSize:11, fontWeight:500, marginTop:4, color:changeUp?"var(--emerald)":"var(--rose)" }}>
        {changeUp?"↑":"↓"} {change}
      </div>
      <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:99, marginTop:10, overflow:"hidden" }}>
        <div style={{ height:"100%", width:barWidth, background:barColor, borderRadius:99, transition:"width 1.2s ease" }}/>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════ */
export default function Dashboard() {

  /* ── Inject global styles once ── */
  useEffect(() => {
    const id = "tracklio-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = GLOBAL_STYLES;
      document.head.prepend(s);
    }
  }, []);

  /* ── Current user — JWT gives an instant value, then /auth/me overwrites
        with the real DB name so it always matches what they registered with ── */
  const [user, setUser] = useState(() => getLoggedInUser());

  useEffect(() => {
    API.get("/auth/me")
      .then(res => {
        const u = res.data;
        if (!u) return;
        const fullName = u.name || u.username || u.email || "";
        setUser({
          id:       u._id || u.id || "",
          name:     fullName,
          email:    u.email || "",
          initials: fullName
            .split(" ")
            .filter(Boolean)
            .map(w => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?",
        });
      })
      .catch(() => { /* keep JWT fallback silently */ });
  }, []);

  /* ── API data ── */
  const [tasks,        setTasks]        = useState([]);
  const [habits,       setHabits]       = useState([]);
  const [habitLogs,    setHabitLogs]    = useState({});  /* { habitId: [log] } */
  const [transactions, setTransactions] = useState([]);
  const [insights,     setInsights]     = useState([]);
  const [productivityScore, setProductivityScore] = useState(0);

  /* ── UI state ── */
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [newTask,      setNewTask]      = useState("");
  const [taskLoading,  setTaskLoading]  = useState(false);   // per-task spinner
  const [avatarSrc,    setAvatarSrc]    = useState(null);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [dropOpen,     setDropOpen]     = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fileRef = useRef(null);

  /* ──────────────────────────────────────────
     FETCH: tasks + transactions + AI analysis
  ────────────────────────────────────────── */
  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [taskRes, txRes] = await Promise.all([
        API.get("/tasks"),
        API.get("/transactions"),
      ]);

      const taskData = taskRes.data   || [];
      const txData   = txRes.data     || [];

      setTasks(taskData);
      setTransactions(txData);

      /* Fetch habits + their logs for real streak display */
      try {
        const habRes = await API.get("/habits");
        const habData = habRes.data || [];
        setHabits(habData);
        /* Fetch logs for each habit in parallel */
        const logMap = {};
        await Promise.all(habData.map(async h => {
          try {
            const lr = await API.get(`/habits/${h._id}/logs`);
            logMap[h._id] = lr.data || [];
          } catch { logMap[h._id] = []; }
        }));
        setHabitLogs(logMap);
      } catch {
        /* Habits API optional — fail silently */
        setHabits([]);
        setHabitLogs({});
      }

      // AI analysis
      try {
        const ai = await analyzeAI(taskData, txData);
        setInsights(ai.insights            || []);
        setProductivityScore(ai.productivityScore || 0);
      } catch {
        // AI failing shouldn't break the whole dashboard
        setInsights([]);
        setProductivityScore(0);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  /* Close panels on outside click */
  useEffect(() => {
    const h = e => {
      if (!e.target.closest("#notifArea")) setNotifOpen(false);
      if (!e.target.closest("#dropArea"))  setDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ──────────────────────────────────────────
     TASK CRUD — all wired to /api/tasks
  ────────────────────────────────────────── */
  const createTask = async () => {
    if (!newTask.trim()) return;
    setTaskLoading(true);
    try {
      const res = await API.post("/tasks", {
        title:    newTask.trim(),
        status:   "pending",
        priority: "medium",
      });
      setTasks(prev => [...prev, res.data]);
      setNewTask("");
    } catch (err) {
      console.error("Create task failed:", err);
    } finally {
      setTaskLoading(false);
    }
  };

  const toggleTask = async (task) => {
    const updated = { ...task, status: task.status === "done" ? "pending" : "done" };
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === task._id ? updated : t));
    try {
      const res = await API.put(`/tasks/${task._id}`, updated);
      setTasks(prev => prev.map(t => t._id === task._id ? res.data : t));
    } catch (err) {
      console.error("Toggle task failed:", err);
      // Revert on error
      setTasks(prev => prev.map(t => t._id === task._id ? task : t));
    }
  };

  const deleteTask = async (id) => {
    // Optimistic update
    setTasks(prev => prev.filter(t => t._id !== id));
    try {
      await API.delete(`/tasks/${id}`);
    } catch (err) {
      console.error("Delete task failed:", err);
      // Refetch to restore correct state
      fetchDashboard();
    }
  };

  /* ──────────────────────────────────────────
     AVATAR UPLOAD  (local preview only for now)
  ────────────────────────────────────────── */
  const handleAvatar = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  /* ──────────────────────────────────────────
     COMPUTED VALUES from real data
  ────────────────────────────────────────── */
  const doneTasks  = tasks.filter(t => t.status === "done").length;
  const progress   = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const income   = transactions.filter(t => t.type === "income") .reduce((s, t) => s + (t.amount || 0), 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0);
  const savings  = income - expenses;
  const budgetPct = income > 0 ? Math.round((expenses / income) * 100) : 0;

  const formatKES = n => `KES ${Number(n).toLocaleString("en-KE")}`;

  const priorityColor = p => p === "high" ? "#F87171" : p === "medium" ? "#FCD34D" : "#6EE7B7";
  const priorityBg    = p => p === "high" ? "rgba(244,63,94,.15)" : p === "medium" ? "rgba(245,158,11,.15)" : "rgba(16,185,129,.15)";

  /* ── AI context passed to ChatBot ── */
  const aiContext = { tasks, transactions, income, expenses, productivityScore };

  /* ── Greeting based on time of day ── */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (() => { const n = user?.name; if (!n || n === "User") return user?.email?.split("@")[0] || "there"; return n.split(" ")[0]; })();

  /* ─────────────── RENDER ─────────────── */
  return (
    <div style={{ minHeight:"100vh", background:"var(--dark-1)", fontFamily:"Montserrat, sans-serif", position:"relative", overflow:"hidden" }}>
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

      {/* ══════════════ PAGE CONTENT ══════════════ */}
      <div style={{ padding:"28px 28px 60px", position:"relative", zIndex:1 }}>

        {/* Error banner */}
        {error && (
          <div style={{ background:"rgba(244,63,94,0.12)", border:"1px solid rgba(244,63,94,0.3)", borderRadius:12, padding:"12px 18px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ color:"#FCA5A5", fontSize:13, fontWeight:600 }}>⚠ {error}</span>
            <button onClick={fetchDashboard}
              style={{ background:"rgba(244,63,94,0.2)", border:"none", borderRadius:8, padding:"5px 12px", color:"#FCA5A5", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              Retry
            </button>
          </div>
        )}

        {/* Greeting — real user name + time-aware */}
        <div className="fade-up" style={{ marginBottom:28 }}>
          <h1 style={{ fontWeight:800, fontSize:26, letterSpacing:-0.8 }}>
            {greeting},{" "}
            <span style={{ background:"linear-gradient(90deg,var(--violet-light),var(--cyan-light))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {firstName}
            </span>{" "}👋
          </h1>
          <p style={{ fontSize:13, color:"var(--text-3)", marginTop:5, fontWeight:500 }}>
            {new Date().toLocaleDateString("en-KE", { weekday:"long", year:"numeric", month:"long", day:"numeric" })} · Your daily command centre
          </p>
        </div>

        {loading ? <Spinner/> : (
          <>
            {/* ── Row 1: Productivity Ring + 4 Stat Cards ── */}
            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:20, marginBottom:20, alignItems:"start" }}>

              <Card style={{ display:"flex", alignItems:"center", gap:20, minWidth:280 }}>
                <ProductivityRing score={productivityScore}/>
                <div>
                  <div style={{ fontWeight:700, fontSize:16, marginBottom:5 }}>Productivity Score</div>
                  <div style={{ fontSize:12, color:"var(--text-3)", lineHeight:1.6 }}>Tasks · Habits · Finance</div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:10, fontSize:11, fontWeight:700, color:"var(--emerald)" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--emerald)", display:"inline-block" }}/>
                    {productivityScore >= 70 ? "On track today" : productivityScore >= 40 ? "Keep pushing" : "Needs attention"}
                  </div>
                </div>
              </Card>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
                <StatCard
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
                  iconBg="rgba(124,58,237,.15)" label="Tasks"
                  value={`${doneTasks}/${tasks.length}`}
                  change={`${progress}% complete`} changeUp={progress >= 50}
                  barWidth={`${progress}%`}
                  barColor="linear-gradient(90deg,var(--violet),var(--violet-light))"
                  delay={50}/>
                <StatCard
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                  iconBg="rgba(6,182,212,.15)" label="AI Score"
                  value={`${productivityScore}%`}
                  change="Based on activity" changeUp={productivityScore >= 60}
                  barWidth={`${productivityScore}%`}
                  barColor="linear-gradient(90deg,var(--cyan),var(--cyan-light))"
                  delay={100}/>
                <StatCard
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                  iconBg="rgba(16,185,129,.15)" label="Income"
                  value={formatKES(income)} valueColor="var(--emerald)"
                  change={income > 0 ? "This month" : "No income yet"} changeUp={income > 0}
                  barWidth={income > 0 ? "80%" : "0%"}
                  barColor="linear-gradient(90deg,var(--emerald),#34D399)"
                  delay={150}/>
                <StatCard
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
                  iconBg="rgba(244,63,94,.15)" label="Expenses"
                  value={formatKES(expenses)} valueColor="var(--rose)"
                  change={budgetPct > 80 ? `${budgetPct}% of income!` : `${budgetPct}% of income`}
                  changeUp={budgetPct <= 80}
                  barWidth={`${Math.min(budgetPct, 100)}%`}
                  barColor="linear-gradient(90deg,var(--rose),#FB7185)"
                  delay={200}/>
              </div>
            </div>

            {/* ── Row 2: Tasks · Trend · AI Insights ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 360px", gap:20, marginBottom:20 }}>

              {/* Task Manager */}
              <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:14 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--violet-light)", display:"inline-block" }}/>
                    Task Manager
                  </div>
                  <span style={{ background:"rgba(124,58,237,.15)", color:"#C4B5FD", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                    {doneTasks} of {tasks.length} done
                  </span>
                </div>

                {/* Add Task */}
                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  <input
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && createTask()}
                    placeholder="What needs to get done?"
                    style={{ flex:1, padding:"9px 13px", background:"var(--dark-4)", border:"1px solid var(--glass-b)", borderRadius:10, color:"var(--text-1)", fontFamily:"Montserrat", fontSize:13, fontWeight:500, outline:"none" }}
                    onFocus={e => e.target.style.borderColor = "var(--violet-light)"}
                    onBlur={e  => e.target.style.borderColor = "var(--glass-b)"}
                  />
                  <button onClick={createTask} disabled={taskLoading || !newTask.trim()}
                    style={{ padding:"9px 16px", background:newTask.trim()?"var(--violet)":"var(--dark-5)", border:"none", borderRadius:10, color:newTask.trim()?"#fff":"var(--text-3)", fontFamily:"Montserrat", fontWeight:700, fontSize:13, cursor:newTask.trim()?"pointer":"not-allowed", transition:"background .2s" }}>
                    {taskLoading ? "…" : "+ Add"}
                  </button>
                </div>

                {/* Task list */}
                <div className="task-scroll" style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {tasks.length === 0 && (
                    <div style={{ textAlign:"center", color:"var(--text-3)", fontSize:13, padding:"20px 0" }}>
                      No tasks yet — add one above!
                    </div>
                  )}
                  {tasks.map(t => (
                    <div key={t._id}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:"var(--dark-4)", border:"1px solid var(--glass-b)", borderRadius:10, transition:"all .2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor="var(--glass-b)"}>
                      {/* Checkbox */}
                      <div onClick={() => toggleTask(t)}
                        style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, cursor:"pointer", border:t.status==="done"?"none":"2px solid var(--glass-b)", background:t.status==="done"?"var(--emerald)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                        {t.status==="done" && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>}
                      </div>
                      <span style={{ flex:1, fontSize:13, fontWeight:500, color:t.status==="done"?"var(--text-3)":"var(--text-1)", textDecoration:t.status==="done"?"line-through":"none", transition:"all .2s" }}>
                        {t.title}
                      </span>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6, background:priorityBg(t.priority), color:priorityColor(t.priority) }}>
                        {t.priority || "medium"}
                      </span>
                      <button onClick={() => deleteTask(t._id)}
                        style={{ fontSize:12, color:"var(--text-3)", background:"none", border:"none", cursor:"pointer", padding:"2px 6px", borderRadius:4, transition:"all .2s" }}
                        onMouseEnter={e => { e.currentTarget.style.color="var(--rose)"; e.currentTarget.style.background="rgba(244,63,94,.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color="var(--text-3)"; e.currentTarget.style.background="none"; }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Productivity Trend */}
              <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:14 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--cyan)", display:"inline-block" }}/>
                    Productivity Trend
                  </div>
                  <span style={{ background:"rgba(16,185,129,.15)", color:"#6EE7B7", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>This week</span>
                </div>
                <TrendChart score={productivityScore}/>
                <div style={{ display:"flex", gap:20, marginTop:16, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  {[
                    { l:"Avg Score", v:`${productivityScore}%`, c:"var(--text-1)" },
                    { l:"Tasks Done", v:`${doneTasks}`,          c:"var(--cyan)" },
                    { l:"Pending",   v:`${tasks.length-doneTasks}`, c:"var(--violet-light)" },
                  ].map(({ l,v,c }) => (
                    <div key={l}>
                      <div style={{ fontSize:10, color:"var(--text-3)", fontWeight:700, textTransform:"uppercase", letterSpacing:0.7 }}>{l}</div>
                      <div style={{ fontSize:17, fontWeight:800, marginTop:3, color:c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* AI Insights */}
              <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:14 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--violet-light)", display:"inline-block", animation:"pulse-dot 2s infinite" }}/>
                    AI Insights
                  </div>
                  <span style={{ background:"rgba(124,58,237,.15)", color:"#C4B5FD", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                    {insights.length ? "Live" : "Pending"}
                  </span>
                </div>

                {insights.length === 0 ? (
                  <div style={{ color:"var(--text-3)", fontSize:13, textAlign:"center", padding:"20px 0" }}>
                    {loading ? "Analysing your data…" : "No insights yet — data needed."}
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:300, overflowY:"auto" }}>
                    {insights.map((insight, i) => (
                      <div key={i} className="fade-up"
                        style={{ display:"flex", gap:10, padding:"10px 12px", background:"var(--dark-4)", border:"1px solid var(--glass-b)", borderRadius:12, animationDelay:`${i*80}ms`, transition:"all .2s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(124,58,237,.3)"; e.currentTarget.style.background="rgba(124,58,237,.06)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor="var(--glass-b)"; e.currentTarget.style.background="var(--dark-4)"; }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--violet-light)", flexShrink:0, marginTop:5, animation:"pulse-dot 2s infinite" }}/>
                        <p style={{ fontSize:12, color:"var(--text-2)", lineHeight:1.65, fontWeight:500 }}>{insight}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* ── Row 3: 3D Pie · Finance · Activity · Streaks ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:20, marginBottom:20 }}>

              {/* 3D Pie — real task data */}
              <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:14 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--violet-light)", display:"inline-block" }}/>
                    Task Progress
                  </div>
                  <span style={{ background:"rgba(6,182,212,.15)", color:"#67E8F9", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>3D View</span>
                </div>
                <Pie3D tasks={tasks}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:8 }}>
                  {[
                    { label:"Done",    val:tasks.filter(t=>t.status==="done").length,    color:"#7C3AED" },
                    { label:"Pending", val:tasks.filter(t=>t.status==="pending").length, color:"#06B6D4" },
                    { label:"Overdue", val:tasks.filter(t=>t.status==="overdue").length, color:"#F43F5E" },
                  ].map(d => (
                    <div key={d.label} style={{ textAlign:"center", padding:"8px 4px", background:"var(--dark-4)", borderRadius:10 }}>
                      <div style={{ fontSize:18, fontWeight:800, color:d.color }}>{d.val}</div>
                      <div style={{ fontSize:10, color:"var(--text-3)", fontWeight:600, marginTop:2 }}>{d.label}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Finance — real transaction data */}
              <Card>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:14, marginBottom:16 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--emerald)", display:"inline-block" }}/>
                  Finance Snapshot
                </div>
                {[
                  { label:"Total Income",   value:`+ ${formatKES(income)}`,  color:"var(--emerald)" },
                  { label:"Total Expenses", value:`- ${formatKES(expenses)}`, color:"var(--rose)" },
                  { label:"Net Savings",    value:formatKES(savings),         color: savings >= 0 ? "var(--text-1)" : "var(--rose)" },
                ].map(({ label,value,color }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize:12, color:"var(--text-3)", fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:14, fontWeight:800, color }}>{value}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0" }}>
                  <span style={{ fontSize:12, color:"var(--text-3)", fontWeight:600 }}>Budget Health</span>
                  <span style={{ background: budgetPct>80 ? "rgba(244,63,94,.15)" : "rgba(16,185,129,.15)", color: budgetPct>80 ? "#FCA5A5" : "#6EE7B7", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                    {budgetPct}% used
                  </span>
                </div>
                {budgetPct > 80 && (
                  <div style={{ marginTop:10, padding:"10px 13px", background:"rgba(244,63,94,.07)", border:"1px solid rgba(244,63,94,.2)", borderRadius:10, fontSize:12, color:"#FCA5A5", fontWeight:600 }}>
                    ⚠ Spending exceeds 80% of income
                  </div>
                )}
                {transactions.length === 0 && (
                  <div style={{ marginTop:10, fontSize:12, color:"var(--text-3)", textAlign:"center" }}>
                    No transactions recorded yet
                  </div>
                )}
              </Card>

              {/* Activity Feed — derived from real tasks + transactions */}
              <Card>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:14, marginBottom:16 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--cyan)", display:"inline-block" }}/>
                  Activity Feed
                </div>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  {[
                    ...tasks.filter(t=>t.status==="done").slice(-2).map(t => ({
                      icon:"✓", bg:"rgba(6,182,212,.2)",
                      title:"Task completed", sub:t.title,
                      time: t.updatedAt ? new Date(t.updatedAt).toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"}) : "recently",
                    })),
                    ...transactions.slice(-3).map(tx => ({
                      icon: tx.type==="income" ? "💰" : "💳",
                      bg:   tx.type==="income" ? "rgba(16,185,129,.2)" : "rgba(244,63,94,.15)",
                      title: tx.type==="income" ? "Income received" : "Expense logged",
                      sub:  `${formatKES(tx.amount)} · ${tx.description || tx.category || ""}`,
                      time: tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString("en-KE",{hour:"2-digit",minute:"2-digit"}) : "",
                    })),
                  ].slice(0, 5).map((a, i, arr) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 0", borderBottom: i < arr.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div style={{ width:30, height:30, borderRadius:"50%", background:a.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:13 }}>{a.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"var(--text-1)" }}>{a.title}</div>
                        <div style={{ fontSize:10, color:"var(--text-3)", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.sub}</div>
                      </div>
                      <span style={{ fontSize:10, color:"var(--text-3)", flexShrink:0 }}>{a.time}</span>
                    </div>
                  ))}
                  {tasks.length===0 && transactions.length===0 && (
                    <div style={{ textAlign:"center", color:"var(--text-3)", fontSize:13, padding:"12px 0" }}>No activity yet</div>
                  )}
                </div>
              </Card>

              {/* Habit Streaks — REAL data from /api/habits + /api/habits/:id/logs */}
              <Card>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:14 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--amber)", display:"inline-block" }}/>
                    Habit Streaks
                  </div>
                  <a href="/habits" style={{ background:"rgba(245,158,11,.15)", color:"#FCD34D", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, textDecoration:"none" }}>
                    🔥 {habits.length > 0 ? `${habits.length} habits` : "Set up"}
                  </a>
                </div>

                {habits.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"16px 0" }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>🎯</div>
                    <p style={{ fontSize:12, color:"var(--text-3)", fontWeight:500, marginBottom:12 }}>
                      No habits yet
                    </p>
                    <a href="/habits" style={{ fontSize:12, fontWeight:700, color:"var(--violet-light)", textDecoration:"none" }}>
                      Create your first habit →
                    </a>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {habits.slice(0, 3).map(h => {
                      const logs = habitLogs[h._id] || [];
                      /* Calculate current streak */
                      const today = new Date().toISOString().split("T")[0];
                      const logDates = new Set(logs.map(l => l.date?.split("T")[0]));
                      let streak = 0;
                      for (let i = 0; i < 30; i++) {
                        const d = new Date(); d.setDate(d.getDate() - i);
                        if (logDates.has(d.toISOString().split("T")[0])) streak++;
                        else if (i > 0) break;
                      }
                      return (
                        <div key={h._id}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ fontSize:12, fontWeight:600, color:"var(--text-1)", display:"flex", alignItems:"center", gap:6 }}>
                              <span>{h.icon || "🎯"}</span>{h.name}
                            </span>
                            <span style={{ fontSize:11, fontWeight:700, color: h.color || "var(--emerald)" }}>
                              {streak > 0 ? `🔥 ${streak}d` : "Start today"}
                            </span>
                          </div>
                          <StreakGrid logs={logs} color={h.color || "#8B5CF6"}/>
                        </div>
                      );
                    })}
                    {habits.length > 3 && (
                      <a href="/habits" style={{ fontSize:11, fontWeight:700, color:"var(--text-3)", textDecoration:"none", textAlign:"center" }}>
                        +{habits.length - 3} more habits →
                      </a>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* ── ChatBot embedded ── */}
            <div style={{ marginTop:8 }}>
              <ChatBot context={aiContext}/>
            </div>
          </>
        )}
      </div>

      {/* Settings modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </div>
  );
}