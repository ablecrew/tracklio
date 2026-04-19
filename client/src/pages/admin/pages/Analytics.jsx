import { useEffect, useState, useCallback } from "react";
import API from "../../../api/api";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

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
  .fu{animation:fu .4s ease both}
  .card{background:var(--d3);border:1px solid var(--gb);border-radius:20px;padding:22px;transition:border-color .25s,transform .25s}
  .card:hover{border-color:rgba(255,255,255,.11);transform:translateY(-1px)}
  .kpi{background:var(--d3);border:1px solid var(--gb);border-radius:16px;padding:20px;transition:all .25s}
  .kpi:hover{border-color:rgba(255,255,255,.13);transform:translateY(-2px)}
  .nav-accent{height:2px;background:linear-gradient(90deg,#F43F5E,#F59E0B,#7C3AED,#06B6D4);background-size:300% 100%;animation:af 4s linear infinite;position:sticky;top:0;z-index:100}
  .tb{padding:7px 14px;border-radius:9px;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
  .tb.a{background:var(--v);color:#fff}
  .tb:not(.a){background:transparent;color:var(--t3)}.tb:not(.a):hover{color:var(--t1)}
  .metric-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04)}
  .metric-row:last-child{border-bottom:none}
  .progress-bar{height:6px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;margin-top:6px}
  .progress-fill{height:100%;border-radius:99px;transition:width 1.2s ease}
`;

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--d3)", border:"1px solid var(--gb)", borderRadius:12, padding:"10px 14px", fontFamily:"Montserrat", fontSize:12, fontWeight:700 }}>
      {label && <div style={{ color:"var(--t2)", marginBottom:4 }}>{label}</div>}
      {payload.map((p,i) => <div key={i} style={{ color:p.color||p.fill||"var(--vl)" }}>{p.name}: {typeof p.value==="number" && p.value>999 ? p.value.toLocaleString() : p.value}</div>)}
    </div>
  );
};

function Spinner() {
  return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:60 }}><div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid rgba(255,255,255,.07)", borderTopColor:"var(--vl)", animation:"spin .8s linear infinite" }}/></div>;
}

const PERIODS = [["7","7 days"],["30","30 days"],["90","90 days"]];

export default function AdminAnalytics() {
  useEffect(() => {
    const id = "adm-analytics-s";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = S;
      document.head.prepend(s);
    }
  }, []);

  const [period,    setPeriod]    = useState("30");
  const [stats,     setStats]     = useState(null);
  const [users,     setUsers]     = useState([]);
  const [growth,    setGrowth]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);

  const load = useCallback(async (p = period, silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [sRes, uRes, gRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/users?limit=500"),
        API.get(`/admin/growth?days=${p}`),
      ]);
      setStats(sRes.data);
      const rawUsers = uRes.data?.users || uRes.data || [];
      setUsers(rawUsers);
      setGrowth(gRes.data || []);
    } catch (e) {
      console.error("Analytics load failed:", e);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [period]);

  useEffect(() => { load(period); }, [period]);

  /* Build chart data */
  const buildGrowthChart = () => {
    if (growth.length > 0) {
      /* Fill in gaps for days with 0 signups */
      const map = Object.fromEntries(growth.map(d => [d.date, d.new || d.count || 0]));
      const days = Number(period);
      return Array.from({ length: days }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
        const key = d.toISOString().split("T")[0];
        return {
          date: d.toLocaleDateString("en-KE", { day:"2-digit", month:"short" }),
          new:  map[key] || 0,
          cumulative: users.filter(u => u.createdAt?.split("T")[0] <= key).length,
        };
      });
    }
    /* Fallback: build from users array */
    const days = Number(period);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      return {
        date: d.toLocaleDateString("en-KE", { day:"2-digit", month:"short" }),
        new:  users.filter(u => u.createdAt?.startsWith(key)).length,
        cumulative: users.filter(u => u.createdAt?.split("T")[0] <= key).length,
      };
    });
  };

  const gd = buildGrowthChart();

  /* Derived metrics */
  const ds = stats || {
    totalUsers:   users.length,
    activeUsers:  users.filter(u => u.status==="active").length,
    proUsers:     users.filter(u => u.plan==="pro").length,
    newToday:     users.filter(u => u.createdAt?.startsWith(new Date().toISOString().split("T")[0])).length,
    revenue:      users.filter(u => u.plan==="pro").length * 2999,
    churnRate:    0,
    avgTasksPerUser: 0,
  };

  const conversionRate   = ds.totalUsers > 0 ? ((ds.proUsers / ds.totalUsers) * 100).toFixed(1) : 0;
  const engagementRate   = ds.totalUsers > 0 ? ((ds.activeUsers / ds.totalUsers) * 100).toFixed(1) : 0;
  const retentionRate    = Math.max(0, (100 - (ds.churnRate || 0))).toFixed(1);
  const periodNew        = gd.reduce((s, d) => s + d.new, 0);
  const avgDailySignups  = Number(period) > 0 ? (periodNew / Number(period)).toFixed(1) : 0;
  const projectedMonthly = (Number(avgDailySignups) * 30).toFixed(0);
  const mrr              = ds.revenue || 0;
  const arr              = mrr * 12;

  /* Plan + status charts */
  const planChart = [
    { name:"Free", value:users.filter(u=>u.plan!=="pro").length, fill:"#505075" },
    { name:"Pro",  value:ds.proUsers||0, fill:"#7C3AED" },
  ].filter(d => d.value > 0);

  const statusChart = [
    { name:"Active",    value:users.filter(u=>u.status==="active").length,    fill:"#10B981" },
    { name:"Suspended", value:users.filter(u=>u.status==="suspended").length, fill:"#F43F5E" },
    { name:"Inactive",  value:users.filter(u=>u.status==="inactive").length,  fill:"#505075" },
  ].filter(d => d.value > 0);

  /* Daily new users bar chart */
  const dailyNew = gd.slice(-14).map(d => ({ date:d.date, new:d.new }));

  /* Weekly cohorts (signups grouped by week) */
  const weeklyData = (() => {
    const weeks = [];
    for (let w = 0; w < 4; w++) {
      const from = new Date(); from.setDate(from.getDate() - (w+1)*7);
      const to   = new Date(); to.setDate(to.getDate() - w*7);
      const count = users.filter(u => {
        const d = new Date(u.createdAt);
        return d >= from && d < to;
      }).length;
      weeks.unshift({ week:`W-${w+1}`, users:count });
    }
    return weeks;
  })();

  return (
    <div style={{ minHeight:"100vh", background:"var(--d1)", fontFamily:"Montserrat,sans-serif", position:"relative" }}>
      <div className="orb" style={{ width:600, height:600, background:"var(--c)", top:-200, right:-150, opacity:.08 }}/>
      <div className="orb" style={{ width:500, height:500, background:"var(--v)", bottom:-150, left:-150, opacity:.08 }}/>
      <div className="nav-accent"/>

      <div style={{ position:"relative", zIndex:1, maxWidth:1300, margin:"0 auto", padding:"32px 24px 60px" }}>

        {/* Header */}
        <div className="fu" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:24 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <a href="/admin" style={{ fontSize:12, color:"var(--t3)", textDecoration:"none", fontWeight:600 }}>← Admin</a>
              <span style={{ color:"var(--t3)" }}>/</span>
              <h1 style={{ fontWeight:900, fontSize:22, letterSpacing:-0.6 }}>Analytics</h1>
            </div>
            <p style={{ fontSize:13, color:"var(--t3)", fontWeight:500 }}>Platform growth, revenue, and engagement metrics</p>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {/* Period selector */}
            <div style={{ display:"flex", gap:3, background:"var(--d3)", borderRadius:10, padding:4 }}>
              {PERIODS.map(([v,l]) => (
                <button key={v} className={`tb ${period===v?"a":""}`} onClick={() => setPeriod(v)}>{l}</button>
              ))}
            </div>
            <button onClick={() => load(period, true)} style={{ padding:"9px 16px", background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.2)", borderRadius:11, color:"#C4B5FD", fontFamily:"Montserrat,sans-serif", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {refreshing ? "↺…" : "↺ Refresh"}
            </button>
          </div>
        </div>

        {loading ? <Spinner/> : (
          <>
            {/* KPI row 1 — Growth */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:800, color:"var(--t3)", textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>📈 Growth Metrics</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
                {[
                  { icon:"👥", label:"Total Users",         val:ds.totalUsers.toLocaleString(),    color:"var(--vl)", sub:`+${ds.newToday} today` },
                  { icon:"🆕", label:`New (${period}d)`,    val:periodNew.toLocaleString(),        color:"var(--c)",  sub:`${avgDailySignups}/day avg` },
                  { icon:"📊", label:"Projected Monthly",   val:projectedMonthly,                  color:"var(--e)",  sub:"Based on current rate" },
                  { icon:"⚡", label:"Active Users",        val:ds.activeUsers.toLocaleString(),   color:"var(--a)",  sub:`${engagementRate}% of total` },
                ].map((k,i) => (
                  <div key={k.label} className="kpi fu" style={{ animationDelay:`${i*50}ms` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:20 }}>{k.icon}</span>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:k.color, animation:"pulse 2.5s infinite" }}/>
                    </div>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8 }}>{k.label}</div>
                    <div style={{ fontSize:26, fontWeight:900, letterSpacing:-1, marginTop:4, color:k.color }}>{k.val}</div>
                    <div style={{ fontSize:11, color:k.color, fontWeight:600, marginTop:4, opacity:.8 }}>→ {k.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* KPI row 2 — Revenue */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:800, color:"var(--t3)", textTransform:"uppercase", letterSpacing:1.2, marginBottom:12 }}>💰 Revenue Metrics</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
                {[
                  { icon:"✦",  label:"Pro Subscribers",   val:(ds.proUsers||0).toLocaleString(),         color:"var(--vl)", sub:"Paying users" },
                  { icon:"💳", label:"MRR",               val:`KES ${mrr.toLocaleString("en-KE")}`,      color:"var(--e)",  sub:"Monthly recurring" },
                  { icon:"📅", label:"ARR",               val:`KES ${arr.toLocaleString("en-KE")}`,      color:"var(--a)",  sub:"Annual recurring" },
                  { icon:"📈", label:"Conversion Rate",   val:`${conversionRate}%`,                      color:"var(--c)",  sub:"Free → Pro" },
                ].map((k,i) => (
                  <div key={k.label} className="kpi fu" style={{ animationDelay:`${i*50}ms` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:20 }}>{k.icon}</span>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:k.color, animation:"pulse 2.5s infinite" }}/>
                    </div>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:.8 }}>{k.label}</div>
                    <div style={{ fontSize:24, fontWeight:900, letterSpacing:-1, marginTop:4, color:k.color }}>{k.val}</div>
                    <div style={{ fontSize:11, color:k.color, fontWeight:600, marginTop:4, opacity:.8 }}>→ {k.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts row 1 */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:20 }}>
              {/* Cumulative user growth */}
              <div className="card fu" style={{ animationDelay:"200ms" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:14 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--vl)", display:"inline-block" }}/>
                    User Growth ({period} days)
                  </div>
                  <div style={{ display:"flex", gap:14 }}>
                    {[{l:"Total",c:"#7C3AED"},{l:"New",c:"#10B981"}].map(({l,c}) => (
                      <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:c }}/>
                        <span style={{ fontSize:11, fontWeight:600, color:"var(--t2)" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ height:240 }}>
                  <ResponsiveContainer>
                    <AreaChart data={gd} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                      <defs>
                        <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3}/><stop offset="100%" stopColor="#7C3AED" stopOpacity={0}/></linearGradient>
                        <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.2}/><stop offset="100%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="date" tick={{ fill:"var(--t3)", fontSize:9, fontFamily:"Montserrat", fontWeight:600 }} axisLine={false} tickLine={false} interval={Math.floor(gd.length/6)}/>
                      <YAxis tick={{ fill:"var(--t3)", fontSize:9, fontFamily:"Montserrat", fontWeight:600 }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CT/>}/>
                      <Area type="monotone" dataKey="cumulative" name="Total" stroke="#7C3AED" fill="url(#ag1)" strokeWidth={2}/>
                      <Area type="monotone" dataKey="new"        name="New"   stroke="#10B981" fill="url(#ag2)" strokeWidth={2}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Engagement + retention */}
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div className="card fu" style={{ animationDelay:"220ms" }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:14 }}>Engagement Funnel</div>
                  {[
                    { label:"Registered",    val:ds.totalUsers,  pct:100,                                    color:"#7C3AED" },
                    { label:"Active (30d)",   val:ds.activeUsers, pct:Math.round((ds.activeUsers/Math.max(ds.totalUsers,1))*100), color:"#06B6D4" },
                    { label:"Pro",           val:ds.proUsers||0,  pct:Math.round(((ds.proUsers||0)/Math.max(ds.totalUsers,1))*100), color:"#10B981" },
                  ].map(({ label, val, pct, color }) => (
                    <div key={label} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:"var(--t2)" }}>{label}</span>
                        <span style={{ fontSize:12, fontWeight:800, color }}>{val.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width:`${pct}%`, background:color }}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card fu" style={{ animationDelay:"240ms" }}>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:12 }}>Key Rates</div>
                  {[
                    { label:"Conversion Rate",  val:`${conversionRate}%`,  color:"var(--vl)", sub:"Free → Pro" },
                    { label:"Engagement Rate",  val:`${engagementRate}%`,  color:"var(--c)",  sub:"Active / Total" },
                    { label:"Retention Rate",   val:`${retentionRate}%`,   color:"var(--e)",  sub:"vs churn" },
                  ].map(({ label, val, color, sub }) => (
                    <div key={label} className="metric-row">
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:"var(--t2)" }}>{label}</div>
                        <div style={{ fontSize:10, color:"var(--t3)", fontWeight:500, marginTop:1 }}>{sub}</div>
                      </div>
                      <div style={{ fontSize:18, fontWeight:900, color }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts row 2 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20, marginBottom:20 }}>
              {/* Daily signups bar */}
              <div className="card fu" style={{ animationDelay:"260ms" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:13, marginBottom:14 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--c)", display:"inline-block" }}/>
                  Daily Signups (14d)
                </div>
                <div style={{ height:180 }}>
                  <ResponsiveContainer>
                    <BarChart data={dailyNew} margin={{ top:5, right:5, left:-25, bottom:0 }}>
                      <defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="date" tick={{ fill:"var(--t3)", fontSize:8, fontFamily:"Montserrat", fontWeight:600 }} axisLine={false} tickLine={false} interval={1}/>
                      <YAxis tick={{ fill:"var(--t3)", fontSize:9, fontFamily:"Montserrat", fontWeight:600 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                      <Tooltip content={<CT/>}/>
                      <Bar dataKey="new" name="New Users" fill="url(#bg1)" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Plan distribution pie */}
              <div className="card fu" style={{ animationDelay:"280ms" }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:14 }}>Plan Distribution</div>
                <div style={{ height:160 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={planChart} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={4} strokeWidth={0}>
                        {planChart.map((e,i) => <Cell key={i} fill={e.fill} style={{ filter:`drop-shadow(0 4px 8px ${e.fill}44)` }}/>)}
                      </Pie>
                      <Tooltip content={<CT/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
                  {planChart.map(d => (
                    <div key={d.name} style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:d.fill }}/>
                      <span style={{ fontSize:11, fontWeight:600, color:"var(--t2)" }}>{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly cohort bar */}
              <div className="card fu" style={{ animationDelay:"300ms" }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:14 }}>Weekly Cohorts</div>
                <div style={{ height:160 }}>
                  <ResponsiveContainer>
                    <BarChart data={weeklyData} margin={{ top:5, right:5, left:-25, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="week" tick={{ fill:"var(--t3)", fontSize:10, fontFamily:"Montserrat", fontWeight:600 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill:"var(--t3)", fontSize:9, fontFamily:"Montserrat", fontWeight:600 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                      <Tooltip content={<CT/>}/>
                      <Bar dataKey="users" name="Signups" fill="#8B5CF6" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Revenue breakdown + status dist */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div className="card fu" style={{ animationDelay:"320ms" }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Revenue Breakdown</div>
                {[
                  { label:"Monthly Recurring Revenue",    val:`KES ${mrr.toLocaleString("en-KE")}`,        color:"var(--e)"  },
                  { label:"Annual Recurring Revenue",     val:`KES ${arr.toLocaleString("en-KE")}`,        color:"var(--vl)" },
                  { label:"Revenue per User (ARPU)",      val:`KES ${ds.totalUsers > 0 ? Math.round(mrr/ds.totalUsers).toLocaleString("en-KE") : 0}`, color:"var(--c)" },
                  { label:"Revenue per Pro User",         val:"KES 2,999/mo",                              color:"var(--a)"  },
                  { label:"Growth to 1K Pro target",      val:`${Math.round(((ds.proUsers||0)/1000)*100)}% of 1,000`, color:"var(--r)" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="metric-row">
                    <span style={{ fontSize:13, color:"var(--t2)", fontWeight:500 }}>{label}</span>
                    <span style={{ fontSize:14, fontWeight:800, color }}>{val}</span>
                  </div>
                ))}
              </div>

              <div className="card fu" style={{ animationDelay:"340ms" }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>User Status Distribution</div>
                <div style={{ height:140 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={statusChart} dataKey="value" cx="50%" cy="50%" outerRadius={55} paddingAngle={4} strokeWidth={0}>
                        {statusChart.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                      </Pie>
                      <Tooltip content={<CT/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
                  {statusChart.map(d => (
                    <div key={d.name} style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:d.fill }}/>
                      <span style={{ fontSize:11, fontWeight:600, color:"var(--t2)" }}>{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16 }}>
                  {[
                    { label:"Avg Tasks / User",    val:ds.avgTasksPerUser||0,   color:"var(--vl)" },
                    { label:"Avg Transactions / User", val:ds.avgTransPerUser||0, color:"var(--e)" },
                    { label:"Churn Risk (30d inactive)", val:`${ds.churnRate||0}%`, color:"var(--a)" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="metric-row">
                      <span style={{ fontSize:12, color:"var(--t2)", fontWeight:500 }}>{label}</span>
                      <span style={{ fontSize:14, fontWeight:800, color }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}