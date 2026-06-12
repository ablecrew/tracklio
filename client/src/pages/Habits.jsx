import { useEffect, useState } from "react";
import API from "../api/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import {
  Target, Check, Flame, TrendingUp, Plus, Edit2, Trash2, X, AlertTriangle,
  Loader2, Eye, Sparkles, Calendar, Activity, Clock, Award, Star, Zap, Heart,
  Book, Dumbbell, Brain, Droplets, Salad, Moon, Pen, Music, Leaf,
  Sun, Smile, TrendingDown, BarChart3, List, Hash, Percent, Circle
} from "lucide-react";

const HABIT_ICONS = ["🏃","💪","📚","🧘","💧","🥗","😴","✍️","🎯","💻","🎵","🌿"];
const HABIT_COLORS = [
  { label: "Violet", val: "#7C3AED" },
  { label: "Cyan", val: "#06B6D4" },
  { label: "Emerald", val: "#10B981" },
  { label: "Amber", val: "#F59E0B" },
  { label: "Rose", val: "#F43F5E" },
  { label: "Blue", val: "#3B82F6" },
];
const DAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

/* Build last-N-days array */
function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().split("T")[0];
  });
}

function Spinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
    </div>
  );
}

/* ── Streak Grid (28-day heatmap) ── */
function StreakGrid({ logs = [], color = "#7C3AED" }) {
  const days = lastNDays(28);
  const set = new Set(logs.map(l => l.date?.split("T")[0]));
  return (
    <div className="flex flex-wrap gap-[3px] mt-2">
      {days.map((d, i) => {
        const done = set.has(d);
        const isToday = d === new Date().toISOString().split("T")[0];
        return (
          <div
            key={d}
            className="w-[22px] h-[22px] rounded-[5px] cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
            title={d}
            style={{
              background: done ? color : "rgba(255,255,255,0.05)",
              border: isToday ? `2px solid ${color}` : "2px solid transparent",
              boxShadow: done ? `0 0 6px ${color}55` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

const EMPTY_FORM = { name: "", icon: "🎯", color: "#7C3AED", frequency: "daily", target: 1, unit: "times", note: "" };

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});   // { habitId: [{date, count}] }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editH, setEditH] = useState(null);
  const [viewH, setViewH] = useState(null);
  const [delH, setDelH] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const today = new Date().toISOString().split("T")[0];

  /* ── Fetch habits ── */
  const fetchHabits = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/habits").catch(() => ({ data: [] }));
      setHabits(res.data || []);
      const logMap = {};
      await Promise.all((res.data || []).map(async h => {
        const lr = await API.get(`/habits/${h._id}/logs`).catch(() => ({ data: [] }));
        logMap[h._id] = lr.data || [];
      }));
      setLogs(logMap);
    } catch {
      setError("Failed to load habits.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchHabits(); }, []);

  /* ── Save habit ── */
  const saveHabit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editH) {
        const res = await API.put(`/habits/${editH._id}`, form);
        setHabits(p => p.map(h => h._id === editH._id ? res.data : h));
      } else {
        const res = await API.post("/habits", form);
        setHabits(p => [...p, res.data]);
        setLogs(p => ({ ...p, [res.data._id]: [] }));
      }
      setForm(EMPTY_FORM);
      setEditH(null);
      setShowForm(false);
    } catch {
      setError("Failed to save habit.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Log today's check-in ── */
  const logToday = async habit => {
    const habitLogs = logs[habit._id] || [];
    const alreadyDone = habitLogs.some(l => l.date?.split("T")[0] === today);
    try {
      if (alreadyDone) {
        await API.delete(`/habits/${habit._id}/logs/today`).catch(() => {});
        setLogs(p => ({ ...p, [habit._id]: habitLogs.filter(l => l.date?.split("T")[0] !== today) }));
      } else {
        const res = await API.post(`/habits/${habit._id}/logs`, { date: today, count: 1 });
        setLogs(p => ({ ...p, [habit._id]: [...habitLogs, res.data || { date: today, count: 1 }] }));
      }
    } catch {
      setError("Failed to log habit.");
    }
  };

  /* ── Delete habit ── */
  const deleteHabit = async () => {
    if (!delH) return;
    setHabits(p => p.filter(h => h._id !== delH._id));
    try { await API.delete(`/habits/${delH._id}`); } catch { fetchHabits(); }
    setDelH(null);
  };

  /* ── Streak calculator ── */
  const calcStreak = habitId => {
    const habitLogs = (logs[habitId] || []).map(l => l.date?.split("T")[0]).sort().reverse();
    let streak = 0;
    let check = new Date();
    for (let i = 0; i < 60; i++) {
      const d = check.toISOString().split("T")[0];
      if (habitLogs.includes(d)) { streak++; check.setDate(check.getDate() - 1); }
      else { if (i === 0) { check.setDate(check.getDate() - 1); continue; } break; }
    }
    return streak;
  };

  const completionRate = (habitId, days = 30) => {
    const d = lastNDays(days);
    const set = new Set((logs[habitId] || []).map(l => l.date?.split("T")[0]));
    return Math.round((d.filter(x => set.has(x)).length / days) * 100);
  };

  /* ── Aggregate analytics ── */
  const totalLogs = Object.values(logs).flat().length;
  const todayDone = habits.filter(h => (logs[h._id] || []).some(l => l.date?.split("T")[0] === today)).length;
  const topStreak = habits.reduce((best, h) => { const s = calcStreak(h._id); return s > best ? s : best; }, 0);
  const overallRate = habits.length ? Math.round(habits.reduce((s, h) => s + completionRate(h._id), 0) / habits.length) : 0;

  /* Weekly bar data */
  const weeklyData = lastNDays(7).map(d => ({
    day: new Date(d).toLocaleDateString("en-KE", { weekday: "short" }),
    done: Object.values(logs).flat().filter(l => l.date?.split("T")[0] === d).length,
  }));

  const radarData = habits.slice(0, 6).map(h => ({
    habit: h.icon + " " + (h.name.length > 8 ? h.name.slice(0, 8) + "…" : h.name),
    rate: completionRate(h._id),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold shadow-xl">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: "#8B5CF6" }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative overflow-hidden font-montserrat">
      {/* Background Orbs */}
      <div className="fixed w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[90px] -top-40 -left-32 pointer-events-none z-0" />
      <div className="fixed w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[90px] -bottom-28 -right-36 pointer-events-none z-0" />
      <div className="fixed w-[350px] h-[350px] bg-amber-500/6 rounded-full blur-[90px] bottom-[20%] left-[35%] pointer-events-none z-0" />

      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Habit Tracker</h1>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {habits.length} habits · {todayDone}/{habits.length} done today · {overallRate}% consistency
            </p>
          </div>
          <button className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-emerald-500 border-0 rounded-xl text-white font-bold text-xs hover:opacity-90 hover:scale-[1.02] transition-all flex items-center gap-2" onClick={() => { setEditH(null); setForm(EMPTY_FORM); setShowForm(true); }}>
            <Plus className="w-4 h-4" />
            New Habit
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-5 py-3 mb-6 text-rose-300 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Target className="w-5 h-5" />, label: "Total Habits", value: habits.length, color: "#8B5CF6", sub: "Tracked" },
            { icon: <Check className="w-5 h-5" />, label: "Done Today", value: `${todayDone}/${habits.length}`, color: "#10B981", sub: "Check-ins" },
            { icon: <Flame className="w-5 h-5" />, label: "Best Streak", value: `${topStreak}d`, color: "#F59E0B", sub: "Consecutive days" },
            { icon: <TrendingUp className="w-5 h-5" />, label: "30-Day Rate", value: `${overallRate}%`, color: "#06B6D4", sub: "Overall consistency" },
          ].map((c, i) => (
            <div key={c.label} className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:-translate-y-0.5 transition-all animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <div style={{ color: c.color }}>{c.icon}</div>
                <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: c.color }} />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{c.label}</p>
              <p className="text-2xl font-black tracking-tight mt-1" style={{ color: c.color }}>{c.value}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "260ms" }}>
            <div className="flex items-center gap-2 font-bold text-sm mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              7-Day Check-in Activity
            </div>
            <div className="h-44">
              <ResponsiveContainer>
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: "#505075", fontSize: 11, fontFamily: "Montserrat", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#505075", fontSize: 11, fontFamily: "Montserrat", fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="done" name="Check-ins" radius={[6, 6, 0, 0]} fill="url(#habGrad)" />
                  <defs>
                    <linearGradient id="habGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-2 font-bold text-sm mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Consistency Radar
            </div>
            {radarData.length < 3 ? (
              <div className="h-44 flex items-center justify-center text-sm text-gray-500">Add 3+ habits to see radar</div>
            ) : (
              <div className="h-44">
                <ResponsiveContainer>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={65}>
                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                    <PolarAngleAxis dataKey="habit" tick={{ fill: "#505075", fontSize: 9, fontFamily: "Montserrat", fontWeight: 600 }} />
                    <Radar name="Rate %" dataKey="rate" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Today's check-in grid */}
        {habits.length > 0 && (
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 mb-6 animate-fade-in" style={{ animationDelay: "320ms" }}>
            <div className="flex items-center gap-2 font-bold text-sm mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
              Today's Check-ins
              <span className="bg-emerald-600/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full ml-1">
                {todayDone}/{habits.length} done
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {habits.map(h => {
                const done = (logs[h._id] || []).some(l => l.date?.split("T")[0] === today);
                return (
                  <div
                    key={h._id}
                    onClick={() => logToday(h)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: done ? "rgba(16,185,129,0.08)" : "#1A1A28",
                      border: `1px solid ${done ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = done ? "rgba(16,185,129,0.5)" : h.color + "55"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = done ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"; }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: h.color + "22" }}>
                      {h.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: done ? "#10B981" : "#F0F0FF" }}>{h.name}</p>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{calcStreak(h._id)}d streak</p>
                    </div>
                    <div
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: done ? "#10B981" : h.color,
                        background: done ? "#10B981" : "transparent",
                      }}
                    >
                      {done && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Habit cards with 28-day heatmap */}
        {loading ? <Spinner /> : habits.length === 0 ? (
          <div className="bg-gray-900 border border-white/5 rounded-2xl text-center py-12 px-6 animate-fade-in">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <h3 className="font-extrabold text-lg mb-2">No habits yet</h3>
            <p className="text-sm text-gray-500 mb-5">Start building powerful habits that stick.</p>
            <button className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-emerald-500 border-0 rounded-xl text-white font-bold text-xs hover:opacity-90 hover:scale-[1.02] transition-all" onClick={() => { setEditH(null); setForm(EMPTY_FORM); setShowForm(true); }}>
              <Plus className="w-4 h-4 inline mr-1" />
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {habits.map((h, i) => {
              const streak = calcStreak(h._id);
              const rate = completionRate(h._id);
              const hLogs = logs[h._id] || [];
              const doneToday = hLogs.some(l => l.date?.split("T")[0] === today);
              return (
                <div
                  key={h._id}
                  className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:-translate-y-0.5 transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms`, borderTop: `3px solid ${h.color}` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: h.color + "22" }}>
                        {h.icon}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-100">{h.name}</p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">{h.frequency || "daily"} · {h.target || 1}× {h.unit || "times"}</p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setViewH(h)}
                        title="Details"
                        className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/25 transition-all flex items-center justify-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setEditH(h); setForm({ name: h.name, icon: h.icon, color: h.color, frequency: h.frequency || "daily", target: h.target || 1, unit: h.unit || "times", note: h.note || "" }); setShowForm(true); }}
                        title="Edit"
                        className="w-7 h-7 rounded-lg bg-violet-600/12 border border-violet-600/25 text-violet-300 hover:bg-violet-600/28 transition-all flex items-center justify-center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDelH(h)}
                        title="Delete"
                        className="w-7 h-7 rounded-lg bg-rose-600/10 border border-rose-600/20 text-rose-300 hover:bg-rose-600/25 transition-all flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-black flex items-center gap-1" style={{ color: h.color }}>
                        <Flame className="w-4 h-4" />
                        {streak}
                      </div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-cyan-400">{rate}%</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">30-Day</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-gray-100">{hLogs.length}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Total</p>
                    </div>
                    {/* Consistency bar */}
                    <div className="flex-1 flex flex-col justify-center gap-1">
                      <p className="text-[10px] text-gray-500 font-semibold">Consistency</p>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${rate}%`, background: h.color }} />
                      </div>
                    </div>
                  </div>

                  {/* 28-day heatmap */}
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">28-Day Activity</p>
                  <StreakGrid logs={hLogs} color={h.color} />

                  {/* Check-in button */}
                  <button
                    onClick={() => logToday(h)}
                    className="w-full mt-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: doneToday ? "rgba(16,185,129,0.12)" : `linear-gradient(135deg, ${h.color}, ${h.color}99)`,
                      border: doneToday ? "1px solid rgba(16,185,129,0.3)" : "none",
                      color: doneToday ? "#6EE7B7" : "#fff",
                    }}
                  >
                    {doneToday ? (
                      <span className="flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" />
                        Done today · Tap to undo
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" />
                        Mark done for today
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-7 w-[92%] max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-lg mb-5 flex items-center gap-2">
              {editH ? <Edit2 className="w-5 h-5 text-violet-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
              {editH ? "Edit Habit" : "New Habit"}
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Habit Name *</label>
                <input className="w-full px-3.5 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm font-medium text-gray-100 placeholder-gray-600 focus:border-violet-400/50 outline-none transition-all" placeholder="e.g. Morning Run" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_ICONS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setForm(p => ({ ...p, icon: ic }))}
                      className="w-9 h-9 rounded-lg text-lg cursor-pointer transition-all"
                      style={{
                        border: `2px solid ${form.icon === ic ? "#8B5CF6" : "rgba(255,255,255,0.07)"}`,
                        background: form.icon === ic ? "rgba(124,58,237,0.15)" : "#1A1A28",
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Colour</label>
                <div className="flex gap-2">
                  {HABIT_COLORS.map(c => (
                    <button
                      key={c.val}
                      onClick={() => setForm(p => ({ ...p, color: c.val }))}
                      className="w-7 h-7 rounded-full cursor-pointer transition-all"
                      style={{
                        background: c.val,
                        border: `3px solid ${form.color === c.val ? "#fff" : "transparent"}`,
                        boxShadow: form.color === c.val ? `0 0 10px ${c.val}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Frequency</label>
                  <select className="w-full px-3.5 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm font-semibold text-gray-100 focus:border-violet-400/50 outline-none transition-all appearance-none" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="weekdays">Weekdays</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Target</label>
                  <input className="w-full px-3.5 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm font-medium text-gray-100 text-center focus:border-violet-400/50 outline-none transition-all" type="number" min="1" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Unit</label>
                  <input className="w-full px-3.5 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm font-medium text-gray-100 placeholder-gray-600 focus:border-violet-400/50 outline-none transition-all" placeholder="times" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Note (optional)</label>
                <input className="w-full px-3.5 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm font-medium text-gray-100 placeholder-gray-600 focus:border-violet-400/50 outline-none transition-all" placeholder="Why this habit matters…" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-semibold text-xs hover:bg-white/10 hover:text-white transition-all" onClick={() => { setShowForm(false); setEditH(null); setForm(EMPTY_FORM); }}>Cancel</button>
              <button className="flex-[2] px-4 py-2.5 bg-gradient-to-r from-violet-600 to-emerald-500 border-0 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2" onClick={saveHabit} disabled={saving || !form.name.trim()}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Saving…" : editH ? "Update Habit" : "Create Habit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View detail */}
      {viewH && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in" onClick={e => e.target === e.currentTarget && setViewH(null)}>
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-7 w-[92%] max-w-md shadow-2xl">
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{viewH.icon}</span>
                <h3 className="font-extrabold text-lg">{viewH.name}</h3>
              </div>
              <button onClick={() => setViewH(null)} className="text-gray-500 hover:text-gray-300 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            {[
              ["Frequency", viewH.frequency || "daily"],
              ["Target", `${viewH.target || 1} ${viewH.unit || "times"}`],
              ["Current Streak", `🔥 ${calcStreak(viewH._id)} days`],
              ["30-Day Rate", `${completionRate(viewH._id)}%`],
              ["Total Logs", (logs[viewH._id] || []).length],
              ["Note", viewH.note || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-xs text-gray-500 font-semibold">{k}</span>
                <span className="text-xs font-bold text-gray-100">{v}</span>
              </div>
            ))}
            <div className="mt-3.5">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">28-Day Heatmap</p>
              <StreakGrid logs={logs[viewH._id] || []} color={viewH.color} />
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-semibold text-xs hover:bg-white/10 hover:text-white transition-all" onClick={() => setViewH(null)}>Close</button>
              <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-emerald-500 border-0 rounded-xl text-white font-bold text-xs hover:opacity-90 transition-all" onClick={() => { setViewH(null); setEditH(viewH); setForm({ name: viewH.name, icon: viewH.icon, color: viewH.color, frequency: viewH.frequency || "daily", target: viewH.target || 1, unit: viewH.unit || "times", note: viewH.note || "" }); setShowForm(true); }}>
                <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delH && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in" onClick={e => e.target === e.currentTarget && setDelH(null)}>
          <div className="bg-gray-900 border border-white/5 rounded-2xl p-7 w-[92%] max-w-sm shadow-2xl">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-rose-400" />
            <h3 className="text-lg font-extrabold text-center mb-2">Delete Habit</h3>
            <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
              Delete <strong className="text-white">{delH.name}</strong> and all its logs? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-semibold text-xs hover:bg-white/10 hover:text-white transition-all" onClick={() => setDelH(null)}>Cancel</button>
              <button className="flex-1 px-4 py-2.5 bg-rose-600 border-0 rounded-xl text-white font-bold text-xs hover:bg-rose-500 transition-all" onClick={deleteHabit}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}