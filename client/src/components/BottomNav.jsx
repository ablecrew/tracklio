import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  CheckSquare,
  Wallet,
  Target,
  Sparkles,
  Shield,
  Users,
  BarChart3,
  Bell,
} from "lucide-react";

function decodeToken(t) {
  try {
    const b = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b));
  } catch {
    return null;
  }
}

function getRole() {
  const t = localStorage.getItem("token");
  if (!t) return "user";
  const p = decodeToken(t);
  return p?.role || "user";
}

const USER_TABS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Habits", href: "/habits", icon: Target },
  { label: "AI", href: "/ai", icon: Sparkles },
];

const ADMIN_TABS = [
  { label: "Admin", href: "/admin", icon: Shield },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Stats", href: "/admin/analytics", icon: BarChart3 },
  { label: "Alerts", href: "/admin/alerts", icon: Bell },
  { label: "User", href: "/dashboard", icon: Home },
];

export default function BottomNav() {
  const location = useLocation();
  const [role, setRole] = useState(getRole);

  useEffect(() => {
    setRole(getRole());
  }, [location]);

  // Hide on auth pages
  const hidden = ["/", "/login", "/register"].includes(location.pathname);
  if (hidden) return null;

  const isAdmin = role === "admin";
  const TABS = isAdmin ? ADMIN_TABS : USER_TABS;
  const accent = isAdmin ? "text-rose-500" : "text-violet-500";
  const accentDot = isAdmin ? "bg-rose-500" : "bg-violet-500";
  const borderColor = isAdmin
    ? "border-rose-500/20"
    : "border-white/10";

  const isActive = (href) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  return (
    <nav
      className={`md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#080810]/90 backdrop-blur-xl backdrop-saturate-150 border-t ${borderColor} pb-[env(safe-area-inset-bottom)] animate-[slideUp_0.35s_cubic-bezier(0.22,1,0.36,1)]`}
    >
      <div className="flex items-stretch justify-around max-w-xl mx-auto">
        {TABS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              to={href}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 min-h-[56px] active:scale-90 transition-transform duration-150 tap-transparent"
            >
              {active && (
                <span
                  className={`absolute top-1 w-1 h-1 rounded-full ${accentDot} animate-[pop_0.4s_ease_both]`}
                />
              )}
              <Icon
                size={22}
                className={`transition-all duration-200 ${
                  active
                    ? `${accent} drop-shadow-[0_0_6px_currentColor]`
                    : "text-zinc-500"
                }`}
              />
              <span
                className={`text-[10px] font-bold tracking-wide font-montserrat transition-colors ${
                  active ? accent : "text-zinc-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}