import { useEffect, useState } from "react";
import API from "../api/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, 
  BarChart2, Trash2, Edit2, Plus, Download, AlertCircle, Utensils, 
  Car, Zap, ShoppingBag, Heart, MoreHorizontal, Calendar, FileText, X
} from "lucide-react";

/* ── Configuration ── */
const CATS = {
  food:      { label: "Food",      icon: Utensils,      color: "#FACC15", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  transport: { label: "Transport", icon: Car,           color: "#84CC16", bg: "bg-lime-500/10",  text: "text-lime-400" },
  bills:     { label: "Bills",     icon: Zap,           color: "#38BDF8", bg: "bg-sky-500/10",   text: "text-sky-400" },
  shopping:  { label: "Shopping",  icon: ShoppingBag,   color: "#F472B6", bg: "bg-pink-500/10",  text: "text-pink-400" },
  health:    { label: "Health",    icon: Heart,         color: "#34D399", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  income:    { label: "Income",    icon: TrendingUp,    color: "#10B981", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  other:     { label: "Other",     icon: MoreHorizontal, color: "#9090B8", bg: "bg-slate-500/10",  text: "text-slate-400" },
};

const fmtKES = (n) => `KES ${Number(n || 0).toLocaleString("en-KE")}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short" }) : "";

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState("");
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [chartView, setChartView] = useState("pie");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const EMPTY = { title: "", amount: "", category: "food", type: "expense", date: "", note: "" };
  const [form, setForm] = useState(EMPTY);

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get("/transactions");
      const data = res.data || [];
      setTransactions(data);
      try {
        const ai = await API.post("/ai/finance", { transactions: data });
        setSummary(ai.data.summary || "");
        setInsights(ai.data.insights || []);
      } catch {}
    } catch (e) { setError("Failed to load transactions."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const saveTransaction = async () => {
    if (!form.title.trim() || !form.amount) return;
    setSaving(true);
    try {
      if (editTarget) {
        const res = await API.put(`/transactions/${editTarget._id}`, { ...form, amount: Number(form.amount) });
        setTransactions(p => p.map(t => t._id === editTarget._id ? res.data : t));
      } else {
        const res = await API.post("/transactions", { ...form, amount: Number(form.amount) });
        setTransactions(p => [...p, res.data]);
      }
      setForm(EMPTY); setEditTarget(null); setShowForm(false);
    } catch { setError("Failed to save transaction."); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/transactions/${deleteTarget._id}`);
      setTransactions(p => p.filter(t => t._id !== deleteTarget._id));
    } catch { setError("Failed to delete."); }
    setDeleteTarget(null);
  };

  /* Computed */
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;
  const budgetPct = income > 0 ? Math.round((expenses / income) * 100) : 0;
  const filtered = activeTab === "all" ? transactions : transactions.filter(t => t.type === activeTab || t.category === activeTab);

  const catTotals = Object.keys(CATS).map(cat => ({
    name: CATS[cat].label, value: transactions.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0),
    color: CATS[cat].color, icon: CATS[cat].icon
  })).filter(d => d.value > 0);

  const monthlyData = Object.values(transactions.reduce((acc, t) => {
    const m = t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-KE", { month: "short" }) : "?";
    if (!acc[m]) acc[m] = { month: m, income: 0, expenses: 0 };
    if (t.type === "income") acc[m].income += t.amount; else acc[m].expenses += t.amount;
    return acc;
  }, {})).slice(-6);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg"><Wallet className="w-6 h-6 text-white"/></div>
            Finance Tracker
          </h1>
          <p className="text-slate-400 text-sm mt-1">{transactions.length} total transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {const csv = "Date,Title,Category,Type,Amount,Note\n" + transactions.map(t => `${fmtDate(t.createdAt)},${t.title},${t.category},${t.type},${t.amount},${t.note}`).join("\n"); const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = "export.csv"; a.click();}} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
            <Download className="w-4 h-4"/> Export
          </button>
          <button onClick={() => { setEditTarget(null); setForm(EMPTY); setShowForm(true); }} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-bold flex items-center gap-2 transition">
            <Plus className="w-4 h-4"/> Add Transaction
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[ { label: "Income", val: fmtKES(income), color: "text-emerald-400", icon: TrendingUp }, { label: "Expenses", val: fmtKES(expenses), color: "text-rose-400", icon: TrendingDown }, { label: "Net Savings", val: fmtKES(savings), color: savings >= 0 ? "text-emerald-400" : "text-rose-400", icon: Wallet }, { label: "Budget Used", val: `${budgetPct}%`, color: budgetPct > 80 ? "text-rose-400" : "text-cyan-400", icon: BarChart2 } ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl hover:border-white/10 transition">
            <div className="flex justify-between items-center mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</div>
            <div className={`text-xl font-black ${stat.color}`}>{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Chart */}
        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2"><PieChartIcon className="w-4 h-4 text-violet-400"/> Spending Breakdown</h3>
            <div className="flex bg-slate-800 rounded-lg p-1">
              {['pie', 'bar'].map(v => <button key={v} onClick={() => setChartView(v)} className={`px-3 py-1 rounded text-xs font-bold capitalize ${chartView === v ? 'bg-violet-600' : 'text-slate-400'}`}>{v}</button>)}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'pie' ? (
                <Pie data={catTotals} dataKey="value" outerRadius={80}> {catTotals.map((e, i) => (<Cell key={i} fill={e.color} />
                ))}
                </Pie>
              ) : (
                <BarChart data={catTotals}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/><XAxis dataKey="name" stroke="#64748b" fontSize={10}/><Tooltip contentStyle={{backgroundColor:'#0f172a', borderColor:'#334155'}}/><Bar dataKey="value" fill="#8b5cf6"/></BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-amber-400"/> Transactions</h3>
            <div className="flex bg-slate-800 rounded-lg p-1">
              {['all','income','expense'].map(t => <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1 rounded text-xs font-bold capitalize ${activeTab === t ? 'bg-slate-700' : 'text-slate-400'}`}>{t}</button>)}
            </div>
          </div>
          <div className="space-y-3 h-64 overflow-y-auto pr-2">
            {filtered.length === 0 ? <p className="text-center text-slate-500 mt-10">No transactions</p> : filtered.slice().reverse().map((t) => {
              const Icon = CATS[t.category]?.icon || MoreHorizontal;
              return (
                <div key={t._id} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-white/5 hover:border-white/10">
                  <div className={`p-2 rounded-lg ${CATS[t.category]?.bg || 'bg-slate-800'}`}><Icon className={`w-4 h-4 ${CATS[t.category]?.text || 'text-slate-400'}`}/></div>
                  <div className="flex-1 truncate"><div className="text-sm font-semibold">{t.title}</div><div className="text-[10px] text-slate-500">{fmtDate(t.createdAt)}</div></div>
                  <div className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.type === 'income' ? '+' : '-'}{fmtKES(t.amount)}</div>
                  <button onClick={() => setEditTarget(t) || setForm({title:t.title, amount:t.amount, category:t.category, type:t.type, date:t.date?.split('T')[0], note:t.note}) || setShowForm(true)} className="text-slate-500 hover:text-white"><Edit2 className="w-3 h-3"/></button>
                  <button onClick={() => setDeleteTarget(t)} className="text-slate-500 hover:text-rose-500"><Trash2 className="w-3 h-3"/></button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">{editTarget ? "Edit Transaction" : "New Transaction"}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
              <input className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:border-violet-500 outline-none" placeholder="Title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}/>
              <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:border-violet-500 outline-none" placeholder="Amount (KES)" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))}/>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:border-violet-500 outline-none" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                {Object.keys(CATS).map(c => <option key={c} value={c}>{CATS[c].label}</option>)}
              </select>
              <button onClick={saveTransaction} disabled={saving} className="w-full bg-violet-600 hover:bg-violet-500 p-3 rounded-lg font-bold text-sm transition">
                {saving ? "Saving..." : "Save Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-xs text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4"/>
            <h3 className="font-bold mb-2">Delete Transaction?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 p-2 bg-slate-800 rounded-lg text-sm">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 p-2 bg-rose-600 rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}