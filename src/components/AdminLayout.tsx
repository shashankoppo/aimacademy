import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, Wallet, Settings, LayoutDashboard, UserRound, CreditCard,
  TrendingUp, Clock, CheckCircle2, Bell, BookOpen, Calendar,
  Megaphone, GraduationCap, BarChart3, Shield, Menu, X, ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, link: "/admin" },
    { title: "Students", icon: Users, link: "/admin/students" },
    { title: "Courses", icon: BookOpen, link: "/admin/courses" },
    { title: "Fees", icon: CreditCard, link: "/admin/fees" },
    { title: "Fee Reminders", icon: Bell, link: "/admin/fee-reminders" },
    { title: "Payroll", icon: Wallet, link: "/admin/payroll" },
    { title: "Attendance", icon: Calendar, link: "/admin/attendance" },
    { title: "Announcements", icon: Megaphone, link: "/admin/announcements" },
    { title: "Website Settings", icon: Settings, link: "/admin/website-settings" },
  ];

  return (
    <div className="flex min-h-screen bg-transparent">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-md border-r border-black/5 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-black text-slate-900 tracking-tight">ADMIN PANEL</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.link;
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 hover:text-primary transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-primary" />
              Back to Website
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/40 backdrop-blur-sm border-b border-black/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-50 text-slate-500"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">Administrator</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
