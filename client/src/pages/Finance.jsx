import { useEffect, useState } from "react";
import API from "../api/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { 
  Utensils, Car, Zap, ShoppingBag, HeartPulse, DollarSign, Package, 
  ArrowDown, Pencil, Trash2, Plus, AlertTriangle, ChevronDown, Check
} from "lucide-react";

const CATS = {
  food:       { label: "Food",      icon: Utensils,     color: "#FACC15", bg: "bg-yellow-500/15" },
  transport:  { label: "Transport", icon: Car,          color: "#84CC16", bg: "bg-lime-500/15"  },
  bills:      { label: "Bills",     icon: Zap,          color: "#38BDF8", bg: "bg-sky-500/15"   },
  shopping:   { label: "Shopping",  icon: ShoppingBag,  color: "#F472B6", bg: "bg-pink-500/15"  },
  health:     { label: "Health",    icon: HeartPulse,   color: "#34D399", bg: "bg-emerald-500/15" },
  income:     { label: "Income",    icon: DollarSign,   color: "#10B981", bg: "bg-emerald-500/15" },
  other:      { label: "Other",     icon: Package,      color: "#9090B8", bg: "bg-slate-500/15"  },
};

const fmtKES = n => `KES ${Number(n || 0).toLocaleString("en-KE")}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short" }) : "";

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

  const exportCSV = () => {
    const rows = [["Date", "Title", "Category", "Type", "Amount (KES)", "Note"]];
    transactions.forEach(t => rows.push([fmtDate(t.createdAt || t.date), t.title, t.category || "", t.type || "", t.amount, t.note || ""]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `tracklio-finance-${new Date().toISOString().split("T")[0]}.csv`; a.click();
  };

  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;
  const budgetPct = income > 0 ? Math.round((expenses / income) * 100) : 0;
  const filtered = activeTab === "all" ? transactions : transactions.filter(t => t.type === activeTab || t.category === activeTab);

  const catTotals = Object.keys(CATS).map(cat => ({
    name: CATS[cat].label, value: transactions.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0), color: CATS[cat].color, icon: CATS[cat].icon,
  })).filter(d => d.value > 0);

  const monthlyMap = {};
  transactions.forEach(t => {
    const m = t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-KE", { month: "short" }) : "?";
    if (!monthlyMap[m]) monthlyMap[m] = { month: m, income: 0, expenses: 0 };
    if (t.type === "income") monthlyMap[m].income += t.amount; else monthlyMap[m].expenses += t.amount;
  });
  const monthlyData = Object.values(monthlyMap).slice(-6);

  return (
    <div className="min-h-screen bg-[#080810] text-[#F0F0FF] font-sans relative overflow-hidden">
      {/* Orbs */}
      <div className="fixed w-[600px] h-[600px] bg-[#7C3AED] -top-[200px] -left-[150px] rounded-full blur-[90px] opacity-[0.12] pointer-events-none"/>
      <div className="fixed w-[500px] h-[500px] bg-[#06B6D4] -bottom-[120px] -right-[150px] rounded-full blur-[90px] opacity-[0.10] pointer-events-none"/>
      <div className="fixed w-[350px] h-[350px] bg-[#10B981] bottom-[20%] left-[35%] rounded-full blur-[90px] opacity-[0.06] pointer-events-none"/>

      <div className="relative z-10 p-[32px_28px_0]">
        {/* Header */}
        <div className="animate-[float-up_0.4s_ease_both] flex flex-wrap items-start justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#10B981] to-[#06B6D4] flex items-center justify-center text-lg"><DollarSign size={18} /></div>
              <h1 className="font-black text-2xl tracking-[-0.8px]">Finance Tracker</h1>
            </div>
            <p className="text-[13px] text-[#505075] font-medium">{transactions.length} transactions · {summary || "Loading AI summary…"}</p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3.5 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-[10px] text-[12px] font-semibold text-[#9090B8] hover:bg-[rgba(255,255,255,0.07)] hover:text-[#F0F0FF] transition-all">
              <ArrowDown size={14} /> Export CSV
            </button>
            <button onClick={() => { setEditTarget(null); setForm(EMPTY); setShowForm(true); }} className="px-5 py-2 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-[11px] text-[13px] font-bold text-white hover:opacity-90 transition-all">
              + Add Transaction
            </button>
          </div>
        </div>

        {error && <div className="bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.3)] rounded-xl p-3 mb-5 text-[#FCA5A5] text-[13px] font-semibold">⚠ {error}</div>}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: DollarSign, label: "Total Income", val: fmtKES(income), color: "#10B981", sub: `${transactions.filter(t=>t.type==="income").length} entries` },
            { icon: DollarSign, label: "Total Expenses", val: fmtKES(expenses), color: "#F43F5E", sub: `${transactions.filter(t=>t.type==="expense").length} entries` },
            { icon: DollarSign, label: "Net Savings", val: fmtKES(savings), color: savings >= 0 ? "#10B981" : "#F43F5E", sub: savings >= 0 ? "Positive" : "Deficit" },
            { icon: DollarSign, label: "Budget Used", val: `${budgetPct}%`, color: budgetPct > 80 ? "#F43F5E" : budgetPct > 60 ? "#F59E0B" : "#06B6D4", sub: budgetPct > 80 ? "Over budget!" : "Healthy" }
          ].map((s, i) => (
            <div key={i} className="bg-[#14141F] border border-[rgba(255,255,255,0.07)] rounded-[20px] p-5 animate-[float-up_0.4s_ease_both]" style={{animationDelay: `${i*60}ms`}}>
              <div className="flex justify-between items-center mb-3"><s.icon size={22} /><div className="w-2 h-2 rounded-full animate-pulse" style={{background: s.color}} /></div>
              <div className="text-[10px] font-bold text-[#505075] uppercase tracking-wider">{s.label}</div>
              <div className="text-[22px] font-black mt-1" style={{color: s.color}}>{s.val}</div>
              <div className="text-[11px] font-medium text-[#505075] mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Transactions List */}
        <div className="bg-[#14141F] border border-[rgba(255,255,255,0.07)] rounded-[20px] p-5 mb-6 animate-[float-up_0.4s_ease_both]" style={{animationDelay: '320ms'}}>
          <div className="flex justify-between items-center mb-4">
             <div className="font-bold flex items-center gap-2">Transactions <span className="text-[11px] bg-[#222235] px-2 py-0.5 rounded-full">{filtered.length}</span></div>
             <div className="flex bg-[#1A1A28] rounded-xl p-1 gap-1">
               {["all","income","expense"].map(t => <button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-1.5 rounded-lg text-[12px] font-bold capitalize transition-all ${activeTab===t ? 'bg-[#7C3AED] text-white' : 'text-[#505075]'}`}>{t}</button>)}
             </div>
          </div>
          <div className="flex flex-col gap-2">
            {filtered.slice().reverse().map((t, i) => {
              const CatIcon = CATS[t.category]?.icon || Package;
              return (
                <div key={t._id} className="flex items-center gap-4 p-3 bg-[#1A1A28] border border-[rgba(255,255,255,0.07)] rounded-xl hover:border-[rgba(255,255,255,0.12)]">
                  <div className={`p-2 rounded-lg ${CATS[t.category]?.bg}`}><CatIcon size={16} color={CATS[t.category]?.color || "#9090B8"} /></div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-semibold text-[13px] truncate">{t.title}</div>
                    <div className="text-[10px] text-[#505075]">{CATS[t.category]?.label} • {fmtDate(t.createdAt)}</div>
                  </div>
                  <div className={`font-black text-[14px] ${t.type==='income'?'text-[#10B981]':'text-[#F43F5E]'}`}>{t.type==='income'?'+':'-'}{fmtKES(t.amount)}</div>
                  <button onClick={() => setEditTarget(t) || setForm({title:t.title, amount:t.amount, category:t.category, type:t.type, date:t.date?.split('T')[0], note:t.note}) || setShowForm(true)} className="p-2 text-[#C4B5FD] hover:bg-[#7C3AED]/20 rounded-lg"><Pencil size={14}/></button>
                  <button onClick={() => setDeleteTarget(t)} className="p-2 text-[#FCA5A5] hover:bg-[#F43F5E]/20 rounded-lg"><Trash2 size={14}/></button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="bg-[#14141F] border border-[rgba(255,255,255,0.07)] rounded-3xl p-7 w-[460px]">
            <h3 className="font-bold text-[17px] mb-5">{editTarget ? "Edit Transaction" : "Add Transaction"}</h3>
            <div className="space-y-4">
              <input className="w-full bg-[#1A1A28] border border-[rgba(255,255,255,0.07)] rounded-xl p-3 text-[13px] focus:border-[#8B5CF6] outline-none" placeholder="Title" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/>
              <div className="grid grid-cols-2 gap-4">
                <input className="w-full bg-[#1A1A28] border border-[rgba(255,255,255,0.07)] rounded-xl p-3 text-[13px] focus:border-[#8B5CF6] outline-none" type="number" placeholder="Amount" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))}/>
                <select className="w-full bg-[#1A1A28] border border-[rgba(255,255,255,0.07)] rounded-xl p-3 text-[13px] focus:border-[#8B5CF6] outline-none appearance-none" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <button onClick={saveTransaction} className="w-full py-3 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-xl font-bold text-[13px]">{saving ? "Saving..." : "Save Transaction"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
           <div className="bg-[#14141F] border border-[rgba(255,255,255,0.07)] rounded-2xl p-7 w-[360px] text-center">
              <AlertTriangle className="mx-auto mb-4 text-[#F43F5E]" size={32}/>
              <h3 className="font-bold mb-2">Delete Transaction</h3>
              <p className="text-[13px] text-[#9090B8] mb-6">Are you sure you want to delete {deleteTarget.title}? This cannot be undone.</p>
              <div className="flex gap-3">
                 <button className="flex-1 py-2 rounded-xl text-[13px] font-bold border border-[rgba(255,255,255,0.07)]" onClick={()=>setDeleteTarget(null)}>Cancel</button>
                 <button className="flex-1 py-2 rounded-xl text-[13px] font-bold bg-[#F43F5E] text-white" onClick={confirmDelete}>Delete</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}