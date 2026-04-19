import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api/chat";

/* ─────────────────────────────────────────────
   STYLES  (scoped to this component)
───────────────────────────────────────────── */
const CHAT_STYLES = `
  @keyframes chatFadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes chatTyping   { 0%,80%,100%{transform:translateY(0);opacity:.35} 40%{transform:translateY(-5px);opacity:1} }
  @keyframes chatPulse    { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.6} }
  @keyframes chatScan     { 0%{transform:translateY(-100%)} 100%{transform:translateY(500%)} }
  @keyframes chatGlow     { 0%,100%{box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(124,58,237,0.08)} 50%{box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(124,58,237,0.22)} }

  .chat-msg-appear { animation: chatFadeUp .35s ease both; }

  .chat-typing-dot-1 { animation: chatTyping 1s infinite 0s; }
  .chat-typing-dot-2 { animation: chatTyping 1s infinite .15s; }
  .chat-typing-dot-3 { animation: chatTyping 1s infinite .30s; }

  .chat-send-btn { transition: all .2s; }
  .chat-send-btn:hover:not(:disabled) { transform: scale(1.06); }
  .chat-send-btn:disabled { cursor: not-allowed; }

  .chat-prompt-chip {
    padding: 6px 13px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #9090B8;
    cursor: pointer;
    white-space: nowrap;
    transition: all .2s;
    flex-shrink: 0;
  }
  .chat-prompt-chip:hover:not(:disabled) {
    background: rgba(124,58,237,0.15);
    border-color: #8B5CF6;
    color: #C4B5FD;
    transform: translateY(-1px);
  }
  .chat-prompt-chip:disabled { opacity: 0.4; cursor: not-allowed; }

  .chat-textarea:focus {
    border-color: #8B5CF6 !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important;
    outline: none;
  }

  .chat-scan-wrap { position: relative; overflow: hidden; }
  .chat-scan-line {
    position: absolute; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(6,182,212,.55), transparent);
    animation: chatScan 2.8s linear infinite;
    pointer-events: none;
  }

  .chat-card { animation: chatGlow 4s ease-in-out infinite; }
`;

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const SUGGESTED_PROMPTS = [
  "How is my productivity?",
  "Am I over budget?",
  "Which tasks are overdue?",
  "Give me a savings tip",
  "Summarize my week",
];

const WELCOME = {
  role: "ai",
  text: "Hey Alex 👋 I'm your Tracklio AI. I have full context of your tasks, finances, and habits — ask me anything!",
};

/* ─────────────────────────────────────────────
   CHATBOT COMPONENT
   — Drop this anywhere in Dashboard.jsx:
       import ChatBot from "../components/ChatBot";
       <ChatBot context={aiContext} />
───────────────────────────────────────────── */
export default function ChatBot({ context }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const endRef                  = useRef(null);
  const textareaRef             = useRef(null);

  /* Inject scoped keyframe styles once */
  useEffect(() => {
    const id = "tracklio-chatbot-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = CHAT_STYLES;
      document.head.appendChild(s);
    }
  }, []);

  /* Auto-scroll to latest message */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Auto-resize textarea height */
  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  /* Send — accepts a direct string (prompt chip) or reads input state */
  const handleSend = async (directText) => {
    const text = typeof directText === "string" ? directText : input;
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const reply = await sendMessage(text, context);
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !loading;

  /* ── RENDER ── */
  return (
    <section style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* Section heading row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#8B5CF6", display: "inline-block",
            animation: "chatPulse 2s infinite",
          }} />
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 15, fontWeight: 800,
            letterSpacing: -0.3, color: "#F0F0FF", margin: 0,
          }}>
            Ask Tracklio AI
          </h2>
        </div>

        {/* Online badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "4px 12px",
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: 20,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#10B981", display: "inline-block",
            animation: "chatPulse 2.5s infinite",
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981" }}>Online</span>
        </div>
      </div>

      {/* ── CHAT CARD ── */}
      <div
        className="chat-card"
        style={{
          background: "#0D0D1A",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: 480,
        }}
      >

        {/* Header */}
        <div style={{
          padding: "14px 18px",
          background: "#131320",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* AI avatar with scan-line effect */}
            <div
              className="chat-scan-wrap"
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 19, flexShrink: 0,
                boxShadow: "0 0 18px rgba(124,58,237,0.4)",
              }}
            >
              🤖
              <div className="chat-scan-line" />
            </div>

            <div>
              <div style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800, fontSize: 14,
                color: "#F0F0FF", letterSpacing: -0.2,
              }}>
                Tracklio AI
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#10B981", display: "inline-block",
                  animation: "chatPulse 2.5s infinite",
                }} />
                <span style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 11, fontWeight: 600, color: "#10B981",
                }}>
                  Context-aware · Always ready
                </span>
              </div>
            </div>
          </div>

          {/* Live context chips */}
          {context && (
            <div style={{ display: "flex", gap: 6 }}>
              {[
                {
                  label: `${context.tasks?.length ?? 0} tasks`,
                  color: "#C4B5FD",
                  bg: "rgba(124,58,237,0.12)",
                  border: "rgba(124,58,237,0.28)",
                },
                {
                  label: `${context.productivityScore ?? 0}% prod`,
                  color: "#67E8F9",
                  bg: "rgba(6,182,212,0.1)",
                  border: "rgba(6,182,212,0.25)",
                },
              ].map(({ label, color, bg, border }) => (
                <div key={label} style={{
                  padding: "3px 10px", borderRadius: 12,
                  background: bg, border: `1px solid ${border}`,
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 10, fontWeight: 700, color,
                }}>
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "18px 18px 10px",
          display: "flex", flexDirection: "column", gap: 14,
          scrollbarWidth: "thin", scrollbarColor: "#202035 transparent",
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className="chat-msg-appear"
              style={{
                display: "flex", flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                animationDelay: `${Math.min(i * 40, 200)}ms`,
              }}
            >
              {/* Label */}
              <span style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 10, fontWeight: 700,
                color: msg.role === "user"
                  ? "rgba(196,181,253,0.55)"
                  : "rgba(144,144,184,0.45)",
                marginBottom: 4,
                textTransform: "uppercase", letterSpacing: 0.8,
                paddingInline: 2,
              }}>
                {msg.role === "user" ? "You" : "Tracklio AI"}
              </span>

              {/* Bubble */}
              <div style={{
                maxWidth: "76%",
                padding: "11px 15px",
                borderRadius: msg.role === "user"
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #7C3AED, #5B21B6)"
                  : "#1A1A28",
                border: msg.role === "user"
                  ? "none"
                  : "1px solid rgba(255,255,255,0.07)",
                color: msg.role === "user" ? "#fff" : "#9090B8",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 13, fontWeight: 500, lineHeight: 1.65,
                boxShadow: msg.role === "user"
                  ? "0 4px 16px rgba(124,58,237,0.3)"
                  : "none",
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="chat-msg-appear" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 10, fontWeight: 700,
                color: "rgba(144,144,184,0.45)",
                marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8, paddingInline: 2,
              }}>
                Tracklio AI
              </span>
              <div style={{
                padding: "13px 18px",
                background: "#1A1A28",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "18px 18px 18px 4px",
                display: "flex", gap: 6, alignItems: "center",
              }}>
                {[1, 2, 3].map(n => (
                  <span key={n} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#8B5CF6", display: "inline-block",
                  }} className={`chat-typing-dot-${n}`} />
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Suggested prompts */}
        <div style={{
          padding: "8px 18px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex", gap: 7, overflowX: "auto",
          flexShrink: 0, scrollbarWidth: "none",
        }}>
          {SUGGESTED_PROMPTS.map(p => (
            <button
              key={p}
              className="chat-prompt-chip"
              onClick={() => handleSend(p)}
              disabled={loading}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "#131320",
          display: "flex", alignItems: "flex-end", gap: 10,
          flexShrink: 0,
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); resizeTextarea(); }}
            onKeyDown={handleKey}
            placeholder="Ask me about your tasks, finances, habits…"
            rows={1}
            className="chat-textarea"
            style={{
              flex: 1,
              padding: "10px 14px",
              background: "#1A1A28",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 13,
              color: "#F0F0FF",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 13, fontWeight: 500, lineHeight: 1.55,
              resize: "none", maxHeight: 120, overflowY: "auto",
              transition: "border-color .2s, box-shadow .2s",
            }}
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="chat-send-btn"
            style={{
              width: 42, height: 42, flexShrink: 0,
              borderRadius: 12, border: "none",
              background: canSend
                ? "linear-gradient(135deg, #7C3AED, #06B6D4)"
                : "#1E1E35",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: canSend ? "0 4px 16px rgba(124,58,237,0.4)" : "none",
            }}
          >
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke={canSend ? "#fff" : "#505075"}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <p style={{
        marginTop: 10, textAlign: "center",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 11, color: "#505075", fontWeight: 500,
      }}>
        Press{" "}
        <kbd style={{ background: "#1A1A28", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontFamily: "Montserrat, sans-serif", color: "#9090B8" }}>
          Enter
        </kbd>{" "}
        to send &nbsp;·&nbsp;{" "}
        <kbd style={{ background: "#1A1A28", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontFamily: "Montserrat, sans-serif", color: "#9090B8" }}>
          Shift + Enter
        </kbd>{" "}
        for new line
      </p>
    </section>
  );
}