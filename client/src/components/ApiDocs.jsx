import { useEffect, useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --violet:#7C3AED;--violet-light:#8B5CF6;--cyan:#06B6D4;--cyan-light:#22D3EE;
    --emerald:#10B981;--rose:#F43F5E;--amber:#F59E0B;
    --dark-1:#080810;--dark-2:#0E0E18;--dark-3:#14141F;--dark-4:#1A1A28;--dark-5:#222235;
    --glass:rgba(255,255,255,0.04);--glass-b:rgba(255,255,255,0.07);
    --text-1:#F0F0FF;--text-2:#9090B8;--text-3:#505075;
  }
  html,body{font-family:'Montserrat',sans-serif;background:var(--dark-1);color:var(--text-1)}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-thumb{background:var(--dark-5);border-radius:99px}
  .orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0}
  .orb-1{width:600px;height:600px;background:var(--cyan);top:-200px;right:-150px;opacity:.09}
  .orb-2{width:450px;height:450px;background:var(--violet);bottom:-100px;left:-100px;opacity:.10}
  @keyframes float-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes accent-flow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:float-up .4s ease both}
  .nav-accent{height:2px;background:linear-gradient(90deg,#7C3AED,#22D3EE,#8B5CF6,#06B6D4);background-size:300% 100%;animation:accent-flow 5s linear infinite}
  .api-card{background:var(--dark-3);border:1px solid var(--glass-b);border-radius:18px;padding:24px 28px;margin-bottom:16px;transition:border-color .25s}
  .api-card:hover{border-color:rgba(255,255,255,0.11)}
  .api-h2{font-size:16px;font-weight:800;color:var(--text-1);margin-bottom:14px;display:flex;align-items:center;gap:10px}
  .api-p{font-size:13px;color:var(--text-2);line-height:1.85;font-weight:500;margin-bottom:10px}
  .api-p:last-child{margin-bottom:0}
  .api-ul{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
  .api-ul li{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--text-2);line-height:1.7;font-weight:500}
  .api-ul li::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--cyan);flex-shrink:0;margin-top:6px}
  code{font-family:'JetBrains Mono',monospace;font-size:12px;background:var(--dark-4);border:1px solid var(--glass-b);padding:2px 7px;border-radius:5px;color:#67E8F9}
  pre{font-family:'JetBrains Mono',monospace;font-size:12px;background:var(--dark-2);border:1px solid var(--glass-b);border-radius:12px;padding:18px 20px;overflow-x:auto;line-height:1.75;color:#C4B5FD;margin:10px 0}
  .method{display:inline-flex;align-items:center;padding:3px 10px;border-radius:7px;font-size:10px;font-weight:800;font-family:'JetBrains Mono',monospace;flex-shrink:0}
  .method-get{background:rgba(16,185,129,.15);color:#6EE7B7}
  .method-post{background:rgba(124,58,237,.15);color:#C4B5FD}
  .method-put{background:rgba(245,158,11,.15);color:#FCD34D}
  .method-delete{background:rgba(244,63,94,.15);color:#FCA5A5}
  .endpoint-row{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;background:var(--dark-4);border:1px solid var(--glass-b);border-radius:12px;margin-bottom:8px;transition:border-color .2s}
  .endpoint-row:hover{border-color:rgba(255,255,255,0.12)}
  .endpoint-path{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:var(--text-1)}
  .endpoint-desc{font-size:12px;color:var(--text-3);margin-top:3px;font-weight:500}
  .param-table{width:100%;border-collapse:collapse;font-size:12px;margin:10px 0}
  .param-table th{padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:0.8px;border-bottom:1px solid rgba(255,255,255,0.07)}
  .param-table td{padding:9px 12px;border-bottom:1px solid rgba(255,255,255,0.04);vertical-align:top}
  .param-name{color:#67E8F9;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600}
  .param-type{color:var(--amber);font-size:11px;font-family:'JetBrains Mono',monospace}
  .param-req{font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px}
  .req-yes{background:rgba(244,63,94,.12);color:#FCA5A5}
  .req-no{background:var(--glass);color:var(--text-3)}
  .status-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700}
  .toc-item{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:600;color:var(--text-2);transition:all .2s;border:none;background:none;text-align:left;width:100%}
  .toc-item:hover,.toc-item.active{background:rgba(6,182,212,.1);color:#67E8F9}
  .copy-btn{padding:5px 12px;background:var(--glass);border:1px solid var(--glass-b);border-radius:7px;color:var(--text-3);font-family:'Montserrat',sans-serif;font-size:10px;font-weight:700;cursor:pointer;transition:all .2s}
  .copy-btn:hover{background:rgba(6,182,212,.1);color:var(--cyan-light);border-color:var(--cyan)}
  .hlbox{padding:14px 18px;border-radius:12px;font-size:12px;font-weight:600;line-height:1.7;margin:10px 0}
`;

const SECTIONS = [
  { id:"intro",       title:"Introduction",          icon:"📖" },
  { id:"auth",        title:"Authentication",        icon:"🔐" },
  { id:"base",        title:"Base URL & Headers",    icon:"🌐" },
  { id:"tasks",       title:"Tasks API",             icon:"✓"  },
  { id:"transactions",title:"Transactions API",      icon:"💰" },
  { id:"ai",          title:"AI API",                icon:"🤖" },
  { id:"chat",        title:"Chat API",              icon:"💬" },
  { id:"habits",      title:"Habits API",            icon:"🎯" },
  { id:"auth-routes", title:"Auth API",              icon:"👤" },
  { id:"errors",      title:"Error Codes",           icon:"⚠️" },
  { id:"ratelimits",  title:"Rate Limits",           icon:"⏱"  },
  { id:"sdks",        title:"SDKs & Examples",       icon:"🛠️" },
  { id:"changelog",   title:"Changelog",             icon:"📋" },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };
  return <button className="copy-btn" onClick={copy}>{copied ? "✓ Copied" : "Copy"}</button>;
}

function Endpoint({ method, path, desc, auth = true, params = [], body = null, response = null }) {
  const [open, setOpen] = useState(false);
  const mClass = `method method-${method.toLowerCase()}`;
  return (
    <div className="endpoint-row" style={{ flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", width: "100%" }} onClick={() => setOpen(o => !o)}>
        <span className={mClass}>{method}</span>
        <div style={{ flex: 1 }}>
          <div className="endpoint-path">{path}</div>
          <div className="endpoint-desc">{desc}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {auth && <span className="status-badge" style={{ background: "rgba(16,185,129,.1)", color: "#6EE7B7" }}>🔒 Auth</span>}
          <span style={{ color: "var(--text-3)", fontSize: 16 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
          {params.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Parameters</div>
              <table className="param-table">
                <thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                <tbody>
                  {params.map(p => (
                    <tr key={p.name}>
                      <td><span className="param-name">{p.name}</span></td>
                      <td><span className="param-type">{p.type}</span></td>
                      <td><span className={`param-req ${p.required ? "req-yes" : "req-no"}`}>{p.required ? "Required" : "Optional"}</span></td>
                      <td style={{ color: "var(--text-2)", fontSize: 12 }}>{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {body && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, margin: "12px 0 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Request Body</span><CopyButton text={body}/>
              </div>
              <pre>{body}</pre>
            </>
          )}
          {response && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1, margin: "12px 0 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Response Example</span><CopyButton text={response}/>
              </div>
              <pre>{response}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiDocs() {
  const [active, setActive] = useState("intro");

  useEffect(() => {
    const id = "tracklio-api-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = S;
      document.head.prepend(s);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setActive(id); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark-1)", fontFamily: "Montserrat, sans-serif", position: "relative" }}>
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="nav-accent" style={{ position: "sticky", top: 0, zIndex: 100 }} />

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 28px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", background: "rgba(6,182,212,.1)", border: "1px solid rgba(6,182,212,.25)", borderRadius: 20, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#67E8F9", textTransform: "uppercase", letterSpacing: 1.2 }}>Developer Docs</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 36, letterSpacing: -1, marginBottom: 12 }}>
            Tracklio{" "}
            <span style={{ background: "linear-gradient(90deg,#06B6D4,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>API</span>
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)", fontWeight: 500, marginBottom: 16 }}>
            REST API · v1.0 · Base URL: <code>http://localhost:5050/api</code>
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "REST",    color: "#06B6D4", bg: "rgba(6,182,212,.1)"   },
              { label: "JSON",    color: "#8B5CF6", bg: "rgba(124,58,237,.1)"  },
              { label: "JWT Auth",color: "#10B981", bg: "rgba(16,185,129,.1)"  },
              { label: "OpenAI",  color: "#F59E0B", bg: "rgba(245,158,11,.1)"  },
              { label: "MongoDB", color: "#6EE7B7", bg: "rgba(52,211,153,.1)"  },
            ].map(b => (
              <span key={b.label} style={{ padding: "4px 12px", borderRadius: 20, background: b.bg, color: b.color, fontSize: 11, fontWeight: 700, border: `1px solid ${b.color}33` }}>{b.label}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 28, alignItems: "start" }}>

          {/* TOC */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ background: "var(--dark-3)", border: "1px solid var(--glass-b)", borderRadius: 16, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1.2, padding: "4px 14px 8px" }}>Endpoints</div>
              {SECTIONS.map(s => (
                <button key={s.id} className={`toc-item ${active === s.id ? "active" : ""}`} onClick={() => scrollTo(s.id)}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>{s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>

            {/* Introduction */}
            <section id="intro" className="api-card fade-up">
              <div className="api-h2">📖 Introduction</div>
              <p className="api-p">The Tracklio API is a RESTful API that powers the Tracklio platform. It accepts JSON request bodies, returns JSON responses, and uses JWT Bearer tokens for authentication.</p>
              <p className="api-p">All responses include standard HTTP status codes. Successful responses return <code>2xx</code> status. Error responses include a <code>message</code> field.</p>
              <div className="hlbox" style={{ background: "rgba(6,182,212,.07)", border: "1px solid rgba(6,182,212,.2)", color: "#67E8F9" }}>
                🔒 Most endpoints require a valid JWT. Include it as: <code>Authorization: {"<token>"}</code> in the request header.
              </div>
            </section>

            {/* Authentication */}
            <section id="auth" className="api-card fade-up">
              <div className="api-h2">🔐 Authentication</div>
              <p className="api-p">Tracklio uses JWT (JSON Web Tokens). After login, store the token and include it in every authenticated request header.</p>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8 }}>Header format</span>
                <CopyButton text="Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
              </div>
              <pre>{`Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</pre>
              <p className="api-p" style={{ marginTop: 8 }}>Tokens expire after <strong style={{ color: "var(--text-1)" }}>7 days</strong>. Your frontend stores the token in <code>localStorage("token")</code> and attaches it automatically via the Axios interceptor in <code>api.js</code>.</p>
              <Endpoint method="POST" path="/auth/register" auth={false} desc="Register a new user account"
                body={`{\n  "name": "Alex Kariuki",\n  "email": "alex@example.com",\n  "password": "securePassword123"\n}`}
                response={`{\n  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "user": { "_id": "...", "name": "Alex Kariuki", "email": "alex@example.com" }\n}`}
              />
              <Endpoint method="POST" path="/auth/login" auth={false} desc="Login and receive a JWT token"
                body={`{\n  "email": "alex@example.com",\n  "password": "securePassword123"\n}`}
                response={`{\n  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "user": { "_id": "...", "name": "Alex Kariuki", "email": "alex@example.com" }\n}`}
              />
              <Endpoint method="GET" path="/auth/me" desc="Get the current logged-in user's profile"
                response={`{\n  "_id": "64a1b2c3d4e5f6...",\n  "name": "Alex Kariuki",\n  "email": "alex@example.com",\n  "createdAt": "2026-01-15T08:30:00.000Z"\n}`}
              />
            </section>

            {/* Base URL */}
            <section id="base" className="api-card fade-up">
              <div className="api-h2">🌐 Base URL & Headers</div>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8 }}>Development</span>
                <CopyButton text="http://localhost:5050/api" />
              </div>
              <pre>{`Base URL:  http://localhost:5050/api\nProduction: https://api.tracklio.app/api`}</pre>
              <div style={{ marginTop: 12, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8 }}>Required Headers</span>
                <CopyButton text={'Content-Type: application/json\nAuthorization: <your_jwt_token>'} />
              </div>
              <pre>{`Content-Type: application/json\nAuthorization: <your_jwt_token>`}</pre>
            </section>

            {/* Tasks */}
            <section id="tasks" className="api-card fade-up">
              <div className="api-h2">✓ Tasks API</div>
              <p className="api-p">Manage user tasks. All endpoints require authentication. Tasks are scoped to the authenticated user — you can only access your own tasks.</p>
              <Endpoint method="GET" path="/tasks" desc="Retrieve all tasks for the logged-in user"
                response={`[\n  {\n    "_id": "64a1b2...",\n    "userId": "64a0b1...",\n    "title": "Finish Q2 report",\n    "status": "pending",\n    "priority": "high",\n    "category": "work",\n    "dueDate": "2026-04-15T00:00:00.000Z",\n    "note": "Include charts",\n    "createdAt": "2026-04-09T08:00:00.000Z"\n  }\n]`}
              />
              <Endpoint method="POST" path="/tasks" desc="Create a new task"
                params={[
                  { name:"title",    type:"string",  required:true,  desc:"Task title (max 200 chars)" },
                  { name:"status",   type:"string",  required:false, desc:'pending | done | overdue. Default: "pending"' },
                  { name:"priority", type:"string",  required:false, desc:'high | medium | low. Default: "medium"' },
                  { name:"category", type:"string",  required:false, desc:'general | work | personal | health | learning | shopping' },
                  { name:"dueDate",  type:"ISO date",required:false, desc:"Due date in ISO 8601 format" },
                  { name:"note",     type:"string",  required:false, desc:"Optional extra details" },
                ]}
                body={`{\n  "title": "Complete API documentation",\n  "priority": "high",\n  "category": "work",\n  "dueDate": "2026-04-15T00:00:00.000Z",\n  "note": "Include all endpoints"\n}`}
                response={`{\n  "_id": "64a1b2c3...",\n  "userId": "64a0b1...",\n  "title": "Complete API documentation",\n  "status": "pending",\n  "priority": "high",\n  "category": "work",\n  "createdAt": "2026-04-09T10:00:00.000Z"\n}`}
              />
              <Endpoint method="PUT" path="/tasks/:id" desc="Update an existing task (partial update supported)"
                params={[{ name:"id", type:"string", required:true, desc:"MongoDB ObjectId of the task" }]}
                body={`{\n  "status": "done",\n  "completedAt": "2026-04-09T14:30:00.000Z"\n}`}
                response={`{\n  "_id": "64a1b2c3...",\n  "status": "done",\n  "completedAt": "2026-04-09T14:30:00.000Z",\n  ...\n}`}
              />
              <Endpoint method="DELETE" path="/tasks/:id" desc="Permanently delete a task"
                params={[{ name:"id", type:"string", required:true, desc:"MongoDB ObjectId of the task" }]}
                response={`"Deleted"`}
              />
            </section>

            {/* Transactions */}
            <section id="transactions" className="api-card fade-up">
              <div className="api-h2">💰 Transactions API</div>
              <p className="api-p">Log and retrieve financial transactions. Scoped to the authenticated user.</p>
              <Endpoint method="GET" path="/transactions" desc="Get all transactions for the logged-in user"
                response={`[\n  {\n    "_id": "64b2c3...",\n    "userId": "64a0b1...",\n    "title": "Lunch at Java",\n    "amount": 1200,\n    "type": "expense",\n    "category": "food",\n    "date": "2026-04-09",\n    "note": "Team lunch",\n    "createdAt": "2026-04-09T13:00:00.000Z"\n  }\n]`}
              />
              <Endpoint method="POST" path="/transactions" desc="Create a new transaction"
                params={[
                  { name:"title",    type:"string", required:true,  desc:"Description of the transaction" },
                  { name:"amount",   type:"number", required:true,  desc:"Amount in KES (positive number)" },
                  { name:"type",     type:"string", required:true,  desc:"income | expense" },
                  { name:"category", type:"string", required:false, desc:"food | transport | bills | shopping | health | other | income" },
                  { name:"date",     type:"string", required:false, desc:"Date string YYYY-MM-DD" },
                  { name:"note",     type:"string", required:false, desc:"Optional notes" },
                ]}
                body={`{\n  "title": "Salary - April 2026",\n  "amount": 85000,\n  "type": "income",\n  "category": "income",\n  "date": "2026-04-01"\n}`}
                response={`{\n  "_id": "64b2c3d4...",\n  "userId": "64a0b1...",\n  "title": "Salary - April 2026",\n  "amount": 85000,\n  "type": "income",\n  "category": "income",\n  "createdAt": "2026-04-09T08:00:00.000Z"\n}`}
              />
            </section>

            {/* AI */}
            <section id="ai" className="api-card fade-up">
              <div className="api-h2">🤖 AI API</div>
              <p className="api-p">AI-powered analysis endpoints. These call OpenAI under the hood. No authentication required on the route itself, but ensure requests come only from authenticated contexts.</p>
              <Endpoint method="POST" path="/ai/analyze" auth={false} desc="Analyse tasks and transactions, return productivity score and insights"
                params={[
                  { name:"tasks",        type:"array", required:true, desc:"Array of task objects from /tasks" },
                  { name:"transactions", type:"array", required:true, desc:"Array of transaction objects from /transactions" },
                ]}
                body={`{\n  "tasks": [ { "title": "...", "status": "done", ... } ],\n  "transactions": [ { "title": "...", "amount": 1200, "type": "expense", ... } ]\n}`}
                response={`{\n  "productivityScore": 76,\n  "insights": [\n    "Peak focus window detected: 10am-12pm.",\n    "Food spending is 23% above target.",\n    "3 tasks overdue — consider reprioritising."\n  ]\n}`}
              />
              <Endpoint method="POST" path="/ai/finance" auth={false} desc="Generate AI financial summary and insights"
                body={`{\n  "transactions": [ { "title": "...", "amount": 1200, "type": "expense", "category": "food" } ]\n}`}
                response={`{\n  "summary": "You spent KES 12,400 this week, 18% above last week.",\n  "insights": [\n    "Food is your largest expense category at 34%.",\n    "Consider setting a weekly food budget of KES 4,000."\n  ]\n}`}
              />
            </section>

            {/* Chat */}
            <section id="chat" className="api-card fade-up">
              <div className="api-h2">💬 Chat API</div>
              <p className="api-p">Conversational AI endpoint that powers the Tracklio AI chatbot. Accepts a user message and a context object, returns an AI-generated reply.</p>
              <Endpoint method="POST" path="/chat" auth={false} desc="Send a message to the AI assistant with optional context"
                params={[
                  { name:"message", type:"string", required:true,  desc:"The user's message to the AI" },
                  { name:"context", type:"object", required:false, desc:"Dashboard context: { tasks, transactions, income, expenses, productivityScore }" },
                ]}
                body={`{\n  "message": "Am I over budget this month?",\n  "context": {\n    "tasks": [...],\n    "transactions": [...],\n    "income": 85000,\n    "expenses": 52300,\n    "productivityScore": 76\n  }\n}`}
                response={`{\n  "reply": "Based on your data, your expenses are KES 52,300 out of KES 85,000 income (61.5%). You're within budget — your 80% threshold is KES 68,000. You have KES 15,700 of headroom remaining this month."\n}`}
              />
            </section>

            {/* Habits */}
            <section id="habits" className="api-card fade-up">
              <div className="api-h2">🎯 Habits API</div>
              <p className="api-p">Manage habits and daily check-in logs. All endpoints require authentication.</p>
              <Endpoint method="GET"    path="/habits"                 desc="Get all habits for the user" response={`[\n  { "_id": "...", "name": "Morning Run", "icon": "🏃", "color": "#7C3AED", "frequency": "daily", "target": 1, "unit": "times" }\n]`}/>
              <Endpoint method="POST"   path="/habits"                 desc="Create a new habit"
                body={`{\n  "name": "Morning Run",\n  "icon": "🏃",\n  "color": "#7C3AED",\n  "frequency": "daily",\n  "target": 1,\n  "unit": "times",\n  "note": "Before breakfast"\n}`}
                response={`{ "_id": "...", "name": "Morning Run", "icon": "🏃", "color": "#7C3AED", "userId": "...", "createdAt": "..." }`}
              />
              <Endpoint method="PUT"    path="/habits/:id"             desc="Update a habit" params={[{name:"id",type:"string",required:true,desc:"Habit ObjectId"}]}/>
              <Endpoint method="DELETE" path="/habits/:id"             desc="Delete a habit and all its logs" params={[{name:"id",type:"string",required:true,desc:"Habit ObjectId"}]}/>
              <Endpoint method="GET"    path="/habits/:id/logs"        desc="Get all check-in logs for a habit" response={`[\n  { "_id": "...", "habitId": "...", "date": "2026-04-09T00:00:00.000Z", "count": 1 }\n]`}/>
              <Endpoint method="POST"   path="/habits/:id/logs"        desc="Log today's check-in for a habit"
                body={`{ "date": "2026-04-09", "count": 1 }`}
                response={`{ "_id": "...", "habitId": "...", "date": "2026-04-09T00:00:00.000Z", "count": 1 }`}
              />
              <Endpoint method="DELETE" path="/habits/:id/logs/today"  desc="Un-log today's check-in (undo)" response={`{ "message": "Log removed" }`}/>
            </section>

            {/* Auth routes summary */}
            <section id="auth-routes" className="api-card fade-up">
              <div className="api-h2">👤 Auth API Summary</div>
              <div className="endpoint-row"><span className="method method-post">POST</span><div><div className="endpoint-path">/auth/register</div><div className="endpoint-desc">Register a new user</div></div></div>
              <div className="endpoint-row"><span className="method method-post">POST</span><div><div className="endpoint-path">/auth/login</div><div className="endpoint-desc">Login and receive JWT</div></div></div>
              <div className="endpoint-row"><span className="method method-get">GET</span><div><div className="endpoint-path">/auth/me</div><div className="endpoint-desc">Get current user profile (requires JWT)</div></div></div>
            </section>

            {/* Errors */}
            <section id="errors" className="api-card fade-up">
              <div className="api-h2">⚠️ Error Codes</div>
              <table className="param-table">
                <thead><tr><th>Status</th><th>Code</th><th>Meaning</th></tr></thead>
                <tbody>
                  {[
                    ["200","OK",                    "Request succeeded"],
                    ["201","Created",               "Resource created successfully"],
                    ["400","Bad Request",            "Invalid input or missing required fields"],
                    ["401","Unauthorized",           "Missing or invalid JWT token"],
                    ["403","Forbidden",              "Valid token but insufficient permissions"],
                    ["404","Not Found",              "Resource does not exist or belongs to another user"],
                    ["409","Conflict",               "Resource already exists (e.g. duplicate email)"],
                    ["429","Too Many Requests",      "Rate limit exceeded — back off and retry"],
                    ["500","Internal Server Error",  "Unexpected server error. Contact support."],
                  ].map(([code, name, desc]) => (
                    <tr key={code}>
                      <td><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: Number(code) < 300 ? "var(--emerald)" : Number(code) < 500 ? "var(--amber)" : "var(--rose)" }}>{code}</span></td>
                      <td><code>{name}</code></td>
                      <td style={{ color: "var(--text-2)", fontSize: 12 }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 12, marginBottom: 6, fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8 }}>Error Response Format</div>
              <pre>{`{\n  "message": "Task not found or access denied"\n}`}</pre>
            </section>

            {/* Rate Limits */}
            <section id="ratelimits" className="api-card fade-up">
              <div className="api-h2">⏱ Rate Limits</div>
              <table className="param-table">
                <thead><tr><th>Endpoint Group</th><th>Limit</th><th>Window</th></tr></thead>
                <tbody>
                  {[
                    ["POST /auth/login, /auth/register", "10 requests",  "15 minutes (per IP)"],
                    ["GET /tasks, /transactions",        "120 requests", "1 minute"],
                    ["POST /tasks, /transactions",       "60 requests",  "1 minute"],
                    ["POST /ai/analyze, /ai/finance",    "20 requests",  "1 minute"],
                    ["POST /chat",                       "30 requests",  "1 minute"],
                    ["All other endpoints",              "200 requests", "1 minute"],
                  ].map(([ep, limit, window]) => (
                    <tr key={ep}>
                      <td><code>{ep}</code></td>
                      <td style={{ color: "var(--emerald)", fontWeight: 700, fontSize: 12 }}>{limit}</td>
                      <td style={{ color: "var(--text-2)", fontSize: 12 }}>{window}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="api-p" style={{ marginTop: 10 }}>When rate limited, you'll receive a <code>429</code> response. Check the <code>Retry-After</code> response header for how many seconds to wait.</p>
            </section>

            {/* SDKs */}
            <section id="sdks" className="api-card fade-up">
              <div className="api-h2">🛠️ SDKs & Examples</div>
              <p className="api-p">Your <code>src/api/api.js</code> is already a complete Axios-based client with automatic JWT injection. Below are quick-start examples for common use cases.</p>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginTop: 14, display: "flex", justifyContent: "space-between" }}>
                <span>Create a task</span><CopyButton text={`import API from './api/api';\nconst task = await API.post('/tasks', { title: 'My task', priority: 'high' });`}/>
              </div>
              <pre>{`import API from './api/api';\n\n// Create a task\nconst res = await API.post('/tasks', {\n  title: 'My task',\n  priority: 'high',\n  category: 'work',\n});\nconsole.log(res.data._id); // MongoDB ObjectId`}</pre>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginTop: 14, display: "flex", justifyContent: "space-between" }}>
                <span>Fetch all transactions</span><CopyButton text={`const res = await API.get('/transactions');\nconst income = res.data.filter(t => t.type === 'income');`}/>
              </div>
              <pre>{`const res = await API.get('/transactions');\nconst income = res.data\n  .filter(t => t.type === 'income')\n  .reduce((sum, t) => sum + t.amount, 0);\nconsole.log('Total income:', income);`}</pre>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginTop: 14, display: "flex", justifyContent: "space-between" }}>
                <span>Get AI insights</span><CopyButton text={`const ai = await API.post('/ai/analyze', { tasks, transactions });`}/>
              </div>
              <pre>{`const tasks = (await API.get('/tasks')).data;\nconst transactions = (await API.get('/transactions')).data;\n\nconst ai = await API.post('/ai/analyze', { tasks, transactions });\nconsole.log('Score:', ai.data.productivityScore);\nconsole.log('Insights:', ai.data.insights);`}</pre>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginTop: 14, display: "flex", justifyContent: "space-between" }}>
                <span>cURL — Login</span><CopyButton text={`curl -X POST http://localhost:5050/api/auth/login -H "Content-Type: application/json" -d '{"email":"alex@example.com","password":"password123"}'`}/>
              </div>
              <pre>{`curl -X POST http://localhost:5050/api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"alex@example.com","password":"password123"}'`}</pre>
            </section>

            {/* Changelog */}
            <section id="changelog" className="api-card fade-up">
              <div className="api-h2">📋 Changelog</div>
              {[
                { version:"v1.0.0", date:"April 9, 2026", color:"var(--emerald)", items:["Initial public API release","Tasks, Transactions, Auth, AI, Chat endpoints","JWT authentication","Rate limiting implemented"] },
                { version:"v0.9.0", date:"March 15, 2026", color:"var(--cyan)",    items:["Beta: Habits API added","/ai/finance endpoint added","Improved error messages with consistent format"] },
                { version:"v0.8.0", date:"February 1, 2026", color:"var(--text-3)", items:["Internal alpha: core CRUD endpoints","Basic JWT auth","OpenAI integration"] },
              ].map(v => (
                <div key={v.version} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ flexShrink: 0, width: 90 }}>
                    <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: v.color }}>{v.version}</div>
                    <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3 }}>{v.date}</div>
                  </div>
                  <ul className="api-ul" style={{ margin: 0 }}>
                    {v.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
              <p className="api-p" style={{ marginTop: 14 }}>Questions or found a bug? Open an issue at <strong style={{ color: "var(--text-1)" }}>github.com/tracklio/api</strong> or email <strong style={{ color: "var(--text-1)" }}>api@tracklio.app</strong></p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}