import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form,     setForm]     = useState({ name:"", email:"", password:"" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [show,     setShow]     = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) { setError("Please accept the Terms of Service and Privacy Policy"); return; }
    setError(""); setLoading(true);
    try {
      await axios.post("http://localhost:5050/api/auth/register", form);
      /* Auto-login after register */
      const res = await axios.post("http://localhost:5050/api/auth/login", {
        email: form.email.trim(), password: form.password.trim(),
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  /* Password strength */
  const strength = (() => {
    const p = form.password;
    if (!p) return { score:0, label:"", color:"" };
    let s = 0;
    if (p.length >= 8)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const map = {1:{label:"Weak",color:"#F43F5E"},2:{label:"Fair",color:"#F59E0B"},3:{label:"Good",color:"#06B6D4"},4:{label:"Strong",color:"#10B981"}};
    return { score:s, ...map[s] };
  })();

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col lg:flex-row relative overflow-hidden" style={{ fontFamily:"'Montserrat',sans-serif" }}>
      {/* Orbs */}
      <div className="absolute w-[700px] h-[700px] rounded-full blur-[130px] opacity-10 bg-violet-600 -top-64 -left-48 pointer-events-none"/>
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-8 bg-emerald-500 -bottom-32 -right-32 pointer-events-none"/>

      {/* Left panel — value prop */}
      <div className="hidden lg:flex flex-col justify-center px-16 py-12 flex-1 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(124,58,237,.5)] flex items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-500">
              <img src="/trcklo logo.png" alt="" className="w-full h-full object-contain" onError={e=>e.currentTarget.style.display="none"}/>
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Tracklio</span>
          </div>

          <h2 className="text-4xl font-black text-white tracking-tight leading-tight mb-4">
            Take back control<br/>of your <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">life & money</span>
          </h2>
          <p className="text-slate-400 text-base font-medium leading-relaxed mb-10">
            Tracklio unifies your tasks, finances, and habits into one AI-powered dashboard. Built for how East Africa actually works.
          </p>

          <div className="space-y-4">
            {[
              { icon:"✅", color:"rgba(124,58,237,.15)", tc:"#C4B5FD", title:"Smart Task Manager",  desc:"AI-prioritised tasks with analytics" },
              { icon:"💰", color:"rgba(16,185,129,.15)", tc:"#6EE7B7", title:"Finance Tracker",      desc:"Income & expenses in KES with insights" },
              { icon:"🎯", color:"rgba(245,158,11,.15)", tc:"#FCD34D", title:"Habit Builder",        desc:"28-day streaks and radar charts" },
              { icon:"🤖", color:"rgba(6,182,212,.15)",  tc:"#67E8F9", title:"AI Intelligence",      desc:"Personalised productivity score daily" },
            ].map(({icon,color,tc,title,desc})=>(
              <div key={title} className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06]" style={{ background:color }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background:"rgba(0,0,0,.2)" }}>{icon}</div>
                <div>
                  <div className="font-bold text-sm" style={{ color:tc }}>{title}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-10 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <div className="flex -space-x-2">
              {["#7C3AED","#06B6D4","#10B981","#F59E0B"].map((c,i)=>(
                <div key={c} style={{ width:30,height:30,borderRadius:"50%",background:c,border:"2px solid #080810",zIndex:4-i,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
                  {["👩","👨","👩","👨"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-bold text-white">⭐⭐⭐⭐⭐ <span className="text-slate-500 font-medium">4.9 rating</span></div>
              <div className="text-xs text-slate-500 font-medium">12,400+ users in East Africa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — register form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 flex-1 relative z-10">
        {/* Mobile brand */}
        <div className="lg:hidden mb-8 text-center">
          <span className="text-2xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Tracklio</span>
        </div>

        <div className="w-full max-w-md bg-[#14141F] border border-white/[0.07] rounded-2xl shadow-2xl p-8 relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-500"/>

          <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Create your account</h1>
          <p className="text-sm text-slate-500 font-medium mb-6">Free forever · No credit card needed</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-5 text-sm font-semibold text-red-400 flex items-center gap-2">
              <span>⚠</span>{error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text" required placeholder="Alex Kariuki"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#1A1A28] border border-white/[0.07] rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm font-medium outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                style={{ fontFamily:"'Montserrat',sans-serif" }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email" required placeholder="alex@example.com"
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
                  placeholder="Min 8 characters"
                  minLength={6}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-[#1A1A28] border border-white/[0.07] rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-600 text-sm font-medium outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  style={{ fontFamily:"'Montserrat',sans-serif" }}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {show ? "🙈" : "👁"}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(n => (
                      <div key={n} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: n <= strength.score ? strength.color : "rgba(255,255,255,.08)" }}/>
                    ))}
                  </div>
                  <span className="text-xs font-semibold" style={{ color:strength.color }}>{strength.label} password</span>
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-violet-600 cursor-pointer"/>
              <span className="text-xs text-slate-500 font-medium leading-relaxed">
                I agree to Tracklio's{" "}
                <a href="/terms"   className="text-violet-400 hover:text-violet-300 transition-colors font-semibold">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" className="text-violet-400 hover:text-violet-300 transition-colors font-semibold">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={loading || !agreed}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all hover:opacity-90 hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30"
              style={{ fontFamily:"'Montserrat',sans-serif" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Creating account…
                </span>
              ) : "Create Free Account →"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.06]"/>
            <span className="text-xs font-semibold text-slate-600">100% free to start</span>
            <div className="flex-1 h-px bg-white/[0.06]"/>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[{icon:"🔒",label:"End-to-end encrypted"},{icon:"🇰🇪",label:"Kenya DPA compliant"},{icon:"🚫",label:"No ads ever"}].map(({icon,label})=>(
              <div key={label} className="flex flex-col items-center gap-1 p-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                <span className="text-base">{icon}</span>
                <span className="text-[9px] font-700 text-slate-500 text-center leading-tight font-semibold">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-center text-slate-500 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-violet-400 hover:text-violet-300 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
        <p className="mt-5 text-xs text-slate-600 font-medium text-center">
          Built in Nairobi 🇰🇪 · Trusted by 12,400+ in East Africa
        </p>
      </div>
    </div>
  );
}