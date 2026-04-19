import { useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";

export function Login() {
  const [form,    setForm]    = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [show,    setShow]    = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      // Use API instance (baseURL already configured) instead of full URL
      const res = await API.post("/auth/login", {
        email:    form.email.trim(),
        password: form.password.trim(),
      });
      const { user, token } = res.data;

      // Store token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "admin") navigate("/admin");
      else navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ fontFamily:"'Montserrat',sans-serif" }}>
      {/* Orbs */}
      <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 bg-violet-600 -top-48 -left-32 pointer-events-none"/>
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-8 bg-cyan-500 -bottom-32 -right-32 pointer-events-none"/>

      {/* Brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(124,58,237,0.5)] flex items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-500">
            <img src="/trcklo logo.png" alt="Tracklio" className="w-full h-full object-contain"
              onError={e=>{e.currentTarget.style.display="none";}}/>
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Tracklio</span>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Smart Life OS</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#14141F] border border-white/[0.07] rounded-2xl shadow-2xl p-8 relative">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-400"/>

        <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Welcome back 👋</h1>
        <p className="text-sm text-slate-500 font-medium mb-7">Sign in to your Tracklio dashboard</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-5 text-sm font-semibold text-red-400 flex items-center gap-2">
            <span>⚠</span>{error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email" required
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full bg-[#1A1A28] border border-white/[0.07] rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm font-medium outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              style={{ fontFamily:"'Montserrat',sans-serif" }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"} required
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-[#1A1A28] border border-white/[0.07] rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-600 text-sm font-medium outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                style={{ fontFamily:"'Montserrat',sans-serif" }}
              />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-sm">
                {show ? "🙈" : "👁"}
              </button>
            </div>
            <div className="text-right mt-2">
              <a href="/forgot-password" className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</a>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all hover:opacity-90 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30 mt-2"
            style={{ fontFamily:"'Montserrat',sans-serif" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Signing in…
              </span>
            ) : "Sign In →"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/[0.06]"/>
          <span className="text-xs font-semibold text-slate-600">or</span>
          <div className="flex-1 h-px bg-white/[0.06]"/>
        </div>

        {/* Feature pills */}
        <div className="flex gap-2 justify-center flex-wrap mb-6">
          {["✅ Tasks","💰 Finance","🎯 Habits","🤖 AI"].map(f=>(
            <span key={f} className="text-xs font-semibold text-slate-500 bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1">{f}</span>
          ))}
        </div>

        <p className="text-sm text-center text-slate-500 font-medium">
          No account?{" "}
          <Link to="/register" className="font-bold text-violet-400 hover:text-violet-300 transition-colors">
            Create one free →
          </Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-slate-600 font-medium text-center">
        Built in Nairobi 🇰🇪 · Trusted by 12,400+ in East Africa
      </p>
    </div>
  );
}

export default Login;