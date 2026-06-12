import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/BottomNav";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Finance from "./pages/Finance";
import Tasks from "./pages/Tasks";
import Habits from "./pages/Habits";
import Reports from "./pages/Reports";
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";
import ApiDocs from "./components/ApiDocs";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Support from "./components/Support";
import Press from "./pages/Press";
import Settings from "./components/Settings";
import MyProfile from "./components/MyProfile";
import ActivityLog from "./components/ActivtyLog";
import Notifications from "./components/Notifications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/pages/Users";
import AdminAlerts from "./pages/admin/pages/Alerts";
import AdminAnalytics from "./pages/admin/pages/Analytics";

function Layout({ children }) {
  const location = useLocation();
  const hideLayout = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}

      <div
        className={
          hideLayout
            ? ""
            : "pt-20 pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0 min-h-screen bg-gray-50"
        }
      >
        {children}
      </div>

      {!hideLayout && <Footer />}
      {!hideLayout && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/alerts" element={<AdminAlerts />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/api" element={<ApiDocs />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/press" element={<Press />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/activity" element={<ActivityLog />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}