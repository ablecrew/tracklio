import { useEffect, useState } from "react";
import API from "../api/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon,
  BarChart3, Plus, Edit3, Trash2, Search, DownloadCloud,
  CreditCard, DollarSign, Target, AlertTriangle,
} from "lucide-react";

/* ── Category configuration with Lucide icons ── */
const CATS = {
  food:      { label: "Food",      icon: CreditCard, color: "#FACC15", bg: "rgba(250,204,21,0.15)" },
  transport: { label: "Transport", icon: Activity,   color: "#84CC16", bg: "rgba(132,204,22,0.15)" },
  bills:     { label: "Bills",     icon: DollarSign, color: "#38BDF8", bg: "rgba(56,189,248,0.15)" },
  shopping:  { label: "Shopping",  icon: Wallet,     color: "#F472B6", bg: "rgba(244,114,182,0.15)" },
  health:    { label: "Health",    icon: Activity,   color: "#34D399", bg: "rgba(52,211,153,0.15)" },
  income:    { label: "Income",    icon: TrendingUp, color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  other:     { label: "Other",     icon: CreditCard, color: "#9090B8", bg: "rgba(144,144,184,0.15)" },
};

const fmtKES = (n) => `KES ${Number(n || 0).toLocaleString("en-KE")}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short" }) : "";

function Spinner() {
  return (
    <div className="flex items-center justify-center p-16">
      <div className="w-9 h-9 rounded-full border-[3px] border-white/7 border-t-violet-400 animate-spin" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <div
      className="bg-[var(--dark-3)] border border-white/7 rounded-2xl p-5 transition-all duration-200 hover:border-white/13 hover:-translate-y-0.5 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon size={22} color={color} />
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: color }}
        />
      </div>
      <div className="text-[10px] font-bold text-[var(--text-3)] uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-xl font-black tracking-tight" style={{ color }}>
        {value}
      </div>
      {sub && (
        <div className="text-[11px] font-medium text-[var(--text-3)] mt-1">
          {sub}
        </div>
      )}
    </div>
  );
}

function DeleteConfirm({ onConfirm, onCancel, label }) {
  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-[var(--dark-3)] border border-white/7 rounded-2xl p-7 w-96 max-w-[90vw] shadow-2xl">
        <div className="text-center mb-4">
          <AlertTriangle size={32} className="mx-auto text-amber-400" />
        </div>
        <h3 className="text-center font-extrabold text-base mb-2">
          Delete Transaction
        </h3>
        <p className="text-center text-[var(--text-2)] text-sm mb-6 leading-relaxed">
          Are you sure you want to delete{" "}
          <strong className="text-[var(--text-1)]">{label}</strong>? This
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-2.5 bg-white/4 border border-white/7 rounded-xl text-[var(--text-2)] text-sm font-semibold transition-all hover:bg-white/7 hover:text-[var(--text-1)]"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2.5 bg-rose-500 border-none rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [searchTerm, setSearchTerm] = useState("");

  const EMPTY = {
    title: "",
    amount: "",
    category: "food",
    type: "expense",
    date: "",
    note: "",
  };
  const [form, setForm] = useState(EMPTY);

  /* ── Fetch ── */
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/transactions");
      const data = res.data || [];
      setTransactions(data);
      try {
        const ai = await API.post("/ai/finance", { transactions: data });
        setSummary(ai.data.summary || "");
        setInsights(ai.data.insights || []);
      } catch {
        /* AI optional */
      }
    } catch {
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ── Create / Update ── */
  const saveTransaction = async () => {
    if (!form.title.trim() || !form.amount) return;
    setSaving(true);
    try {
      if (editTarget) {
        const res = await API.put(`/transactions/${editTarget._id}`, {
          ...form,
          amount: Number(form.amount),
        });
        setTransactions((p) =>
          p.map((t) => (t._id === editTarget._id ? res.data : t))
        );
      } else {
        const res = await API.post("/transactions", {
          ...form,
          amount: Number(form.amount),
        });
        setTransactions((p) => [...p, res.data]);
      }
      setForm(EMPTY);
      setEditTarget(null);
      setShowForm(false);
    } catch {
      setError("Failed to save transaction.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (tx) => {
    setEditTarget(tx);
    setForm({
      title: tx.title,
      amount: tx.amount,
      category: tx.category || "other",
      type: tx.type || "expense",
      date: tx.date?.split("T")[0] || "",
      note: tx.note || "",
    });
    setShowForm(true);
  };

  /* ── Delete ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/transactions/${deleteTarget._id}`);
      setTransactions((p) => p.filter((t) => t._id !== deleteTarget._id));
    } catch {
      setError("Failed to delete.");
    }
    setDeleteTarget(null);
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = [["Date", "Title", "Category", "Type", "Amount (KES)", "Note"]];
    transactions.forEach((t) =>
      rows.push([
        fmtDate(t.createdAt || t.date),
        t.title,
        t.category || "",
        t.type || "",
        t.amount,
        t.note || "",
      ])
    );
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `tracklio-finance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  /* ── Computed ── */
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;
  const budgetPct = income > 0 ? Math.round((expenses / income) * 100) : 0;

  const filtered = transactions.filter((t) => {
    const matchesTab =
      activeTab === "all" || t.type === activeTab || t.category === activeTab;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (CATS[t.category]?.label || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const catTotals = Object.keys(CATS)
    .map((cat) => ({
      name: CATS[cat].label,
      value: transactions
        .filter((t) => t.category === cat)
        .reduce((s, t) => s + t.amount, 0),
      color: CATS[cat].color,
      icon: CATS[cat].icon,
    }))
    .filter((d) => d.value > 0);

  /* Monthly bar data */
  const monthlyMap = {};
  transactions.forEach((t) => {
    const m = t.createdAt
      ? new Date(t.createdAt).toLocaleDateString("en-KE", { month: "short" })
      : "?";
    if (!monthlyMap[m]) monthlyMap[m] = { month: m, income: 0, expenses: 0 };
    if (t.type === "income") monthlyMap[m].income += t.amount;
    else monthlyMap[m].expenses += t.amount;
  });
  const monthlyData = Object.values(monthlyMap).slice(-6);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[var(--dark-3)] border border-white/7 rounded-xl p-3 font-montserrat text-xs font-bold">
        <div className="text-[var(--text-2)] mb-1">{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>
            {p.name}: {fmtKES(p.value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--dark-1)] font-sans relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed rounded-full blur-[90px] pointer-events-none z-0 w-[600px] h-[600px] bg-[var(--violet)] opacity-10 -top-48 -left-36" />
      <div className="fixed rounded-full blur-[90px] pointer-events-none z-0 w-[500px] h-[500px] bg-[var(--cyan)] opacity-[0.08] -bottom-28 -right-36" />
      <div className="fixed rounded-full blur-[90px] pointer-events-none z-0 w-[350px] h-[350px] bg-[var(--emerald)] opacity-5 bottom-1/4 left-[35%]" />

      {/* Page header */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Wallet size={18} className="text-white" />
              </div>
              <h1 className="font-black text-xl sm:text-2xl tracking-tight">
                Finance Tracker
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-3)] font-medium">
              {transactions.length} transactions ·{" "}
              {summary || "Loading AI summary…"}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap w-full sm:w-auto">
            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-white/4 border border-white/7 rounded-xl text-[var(--text-2)] text-sm font-semibold transition-all hover:bg-white/7 hover:text-[var(--text-1)]"
              onClick={exportCSV}
            >
              <DownloadCloud size={16} />
              Export CSV
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 border-none rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 hover:scale-105"
              onClick={() => {
                setEditTarget(null);
                setForm(EMPTY);
                setShowForm(true);
              }}
            >
              <Plus size={16} />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-5 text-rose-300 text-sm font-semibold animate-fade-in">
            <AlertTriangle size={16} className="inline mr-2" />
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
          <StatCard
            icon={TrendingUp}
            label="Total Income"
            value={fmtKES(income)}
            color="#10B981"
            sub={`${transactions.filter((t) => t.type === "income").length} entries`}
            delay={0}
          />
          <StatCard
            icon={TrendingDown}
            label="Total Expenses"
            value={fmtKES(expenses)}
            color="#F43F5E"
            sub={`${transactions.filter((t) => t.type === "expense").length} entries`}
            delay={60}
          />
          <StatCard
            icon={Wallet}
            label="Net Savings"
            value={fmtKES(savings)}
            color={savings >= 0 ? "#10B981" : "#F43F5E"}
            sub={savings >= 0 ? "Positive balance" : "Deficit"}
            delay={120}
          />
          <StatCard
            icon={Target}
            label="Budget Used"
            value={`${budgetPct}%`}
            color={budgetPct > 80 ? "#F43F5E" : budgetPct > 60 ? "#F59E0B" : "#06B6D4"}
            sub={budgetPct > 80 ? "Over budget!" : "Healthy"}
            delay={180}
          />
        </div>

        {/* Budget progress bar */}
        <div
          className="bg-[var(--dark-3)] border border-white/7 rounded-2xl p-5 mb-5 sm:mb-6 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm">Monthly Budget Health</span>
            <span
              className="text-xs font-bold"
              style={{ color: budgetPct > 80 ? "#F43F5E" : "#10B981" }}
            >
              {budgetPct}% used
            </span>
          </div>
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-in-out"
              style={{
                width: `${Math.min(budgetPct, 100)}%`,
                background:
                  budgetPct > 80
                    ? "linear-gradient(90deg, #F43F5E, #FB7185)"
                    : budgetPct > 60
                    ? "linear-gradient(90deg, #F59E0B, #FCD34D)"
                    : "linear-gradient(90deg, #10B981, #34D399)",
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[var(--text-3)] font-semibold">
            <span>{fmtKES(expenses)} spent</span>
            <span>{fmtKES(income)} earned</span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6">
          {/* Spending by category */}
          <div
            className="bg-[var(--dark-3)] border border-white/7 rounded-2xl p-4 sm:p-5 animate-fade-in"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-sm">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                Spending Breakdown
              </div>
              <div className="flex gap-1.5 bg-[var(--dark-4)] rounded-lg p-1">
                {["pie", "bar"].map((v) => (
                  <button
                    key={v}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      chartView === v
                        ? "bg-violet-600 text-white"
                        : "bg-transparent text-[var(--text-3)] hover:text-[var(--text-1)]"
                    }`}
                    onClick={() => setChartView(v)}
                  >
                    {v === "pie" ? (
                      <PieChartIcon size={12} className="inline mr-1" />
                    ) : (
                      <BarChart3 size={12} className="inline mr-1" />
                    )}
                    {v === "pie" ? "Pie" : "Bar"}
                  </button>
                ))}
              </div>
            </div>
            {catTotals.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-[var(--text-3)] text-sm">
                No data yet
              </div>
            ) : chartView === "pie" ? (
              <div className="h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={catTotals}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {catTotals.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart
                    data={catTotals}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: "var(--text-3)",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "var(--text-3)",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {catTotals.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Legend */}
            <div className="flex flex-wrap gap-2.5 mt-3">
              {catTotals.map((d) => {
                const LegendIcon = d.icon;
                return (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: d.color }}
                    />
                    <span className="text-[10px] font-semibold text-[var(--text-2)]">
                      <LegendIcon size={10} className="inline mr-1" />
                      {d.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly income vs expenses */}
          <div
            className="bg-[var(--dark-3)] border border-white/7 rounded-2xl p-4 sm:p-5 animate-fade-in"
            style={{ animationDelay: "280ms" }}
          >
            <div className="flex items-center gap-2 font-bold text-sm mb-4">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              Monthly Overview
            </div>
            {monthlyData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-[var(--text-3)] text-sm">
                No monthly data yet
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "var(--text-3)",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "var(--text-3)",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Transactions list */}
        <div
          className="bg-[var(--dark-3)] border border-white/7 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 animate-fade-in"
          style={{ animationDelay: "320ms" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-2 font-bold text-sm">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Transactions
              <span className="bg-violet-500/15 text-violet-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
                {filtered.length}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-auto">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
                />
                <input
                  className="w-full sm:w-48 pl-9 pr-3 py-2 bg-[var(--dark-4)] border border-white/7 rounded-xl text-[var(--text-1)] text-sm font-medium outline-none transition-all focus:border-violet-400 placeholder-[var(--text-3)]"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 bg-[var(--dark-4)] rounded-xl p-1">
                {["all", "income", "expense"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                      activeTab === tab
                        ? "bg-violet-600 text-white"
                        : "bg-transparent text-[var(--text-3)] hover:text-[var(--text-1)]"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <div className="text-center text-[var(--text-3)] text-sm py-8">
              {activeTab === "all"
                ? "No transactions yet. Add your first one!"
                : `No ${activeTab} transactions.`}
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">
              {filtered.slice().reverse().map((t, i) => {
                const cat = CATS[t.category] || CATS.other;
                const RowIcon = cat.icon;
                return (
                  <div
                    key={t._id}
                    className="flex items-center gap-3 p-3 bg-[var(--dark-4)] border border-white/7 rounded-xl transition-all hover:border-white/12 hover:bg-[var(--dark-5)] animate-slide-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: cat.bg }}
                    >
                      <RowIcon size={16} color={cat.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[var(--text-1)] truncate">
                        {t.title}
                      </div>
                      <div className="text-[10px] text-[var(--text-3)] font-semibold mt-0.5">
                        {cat.label} · {fmtDate(t.createdAt || t.date)}
                        {t.note && ` · ${t.note}`}
                      </div>
                    </div>
                    <div
                      className="font-extrabold text-sm shrink-0"
                      style={{
                        color:
                          t.type === "income" ? "#10B981" : "#F43F5E",
                      }}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {fmtKES(t.amount)}
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => startEdit(t)}
                        title="Edit"
                        className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/25 text-violet-300 cursor-pointer flex items-center justify-center transition-all hover:bg-violet-500/30"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        title="Delete"
                        className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 cursor-pointer flex items-center justify-center transition-all hover:bg-rose-500/25"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div
          className="bg-[var(--dark-3)] border border-white/7 rounded-2xl p-4 sm:p-5 mb-10 animate-fade-in"
          style={{ animationDelay: "360ms" }}
        >
          <div className="flex items-center gap-2 font-bold text-sm mb-3">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            AI Financial Insights
            <span className="bg-violet-500/15 text-violet-300 text-[11px] font-bold px-2.5 py-1 rounded-full">
              Live
            </span>
          </div>
          {insights.length === 0 ? (
            <p className="text-[var(--text-3)] text-sm">
              {loading
                ? "Analysing your finances…"
                : "Add transactions for AI insights."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {insights.map((ins, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 p-3 bg-[var(--dark-4)] border border-white/7 rounded-xl transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-1.5 animate-pulse" />
                  <p className="text-xs text-[var(--text-2)] leading-relaxed font-medium">
                    {ins}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 animate-fade-in p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-[var(--dark-3)] border border-white/7 rounded-2xl p-5 sm:p-7 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-lg mb-5">
              {editTarget ? (
                <>
                  <Edit3 size={18} className="inline mr-2" />
                  Edit Transaction
                </>
              ) : (
                <>
                  <Plus size={18} className="inline mr-2" />
                  Add Transaction
                </>
              )}
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider block mb-1.5">
                  Title *
                </label>
                <input
                  className="w-full px-3.5 py-2.5 bg-[var(--dark-4)] border border-white/7 rounded-xl text-[var(--text-1)] text-sm font-medium outline-none transition-all focus:border-violet-400 placeholder-[var(--text-3)]"
                  placeholder="e.g. Lunch at Java"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider block mb-1.5">
                    Amount (KES) *
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-[var(--dark-4)] border border-white/7 rounded-xl text-[var(--text-1)] text-sm font-medium outline-none transition-all focus:border-violet-400 placeholder-[var(--text-3)]"
                    type="number"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, amount: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider block mb-1.5">
                    Type
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-[var(--dark-4)] border border-white/7 rounded-xl text-[var(--text-1)] text-sm font-semibold outline-none cursor-pointer transition-all focus:border-violet-400 appearance-none"
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value }))
                    }
                  >
                    <option value="expense">💸 Expense</option>
                    <option value="income">💰 Income</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider block mb-1.5">
                    Category
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-[var(--dark-4)] border border-white/7 rounded-xl text-[var(--text-1)] text-sm font-semibold outline-none cursor-pointer transition-all focus:border-violet-400 appearance-none"
                    value={form.category}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, category: e.target.value }))
                    }
                  >
                    {Object.entries(CATS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider block mb-1.5">
                    Date
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 bg-[var(--dark-4)] border border-white/7 rounded-xl text-[var(--text-1)] text-sm font-medium outline-none transition-all focus:border-violet-400 placeholder-[var(--text-3)]"
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider block mb-1.5">
                  Note (optional)
                </label>
                <input
                  className="w-full px-3.5 py-2.5 bg-[var(--dark-4)] border border-white/7 rounded-xl text-[var(--text-1)] text-sm font-medium outline-none transition-all focus:border-violet-400 placeholder-[var(--text-3)]"
                  placeholder="Any extra details…"
                  value={form.note}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, note: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                className="flex-1 px-4 py-2.5 bg-white/4 border border-white/7 rounded-xl text-[var(--text-2)] text-sm font-semibold transition-all hover:bg-white/7 hover:text-[var(--text-1)]"
                onClick={() => {
                  setShowForm(false);
                  setEditTarget(null);
                  setForm(EMPTY);
                }}
              >
                Cancel
              </button>
              <button
                className="flex-[2] px-4 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 border-none rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={saveTransaction}
                disabled={saving || !form.title.trim() || !form.amount}
              >
                {saving
                  ? "Saving…"
                  : editTarget
                  ? "Update Transaction"
                  : "Add Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          label={deleteTarget.title}
        />
      )}
    </div>
  );
}