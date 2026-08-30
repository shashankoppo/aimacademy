import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, Wallet, Settings, LayoutDashboard, UserRound, CreditCard,
  TrendingUp, Clock, CheckCircle2, Bell, BookOpen, Calendar,
  Megaphone, GraduationCap, BarChart3, Shield, Menu, X, ArrowLeft, MessageSquare, FileText, Youtube
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProfileDropdown } from "./ProfileDropdown";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, link: "/admin" },
    { title: "Access Control", icon: UserRound, link: "/admin/users" },
    { title: "Roles & Permissions", icon: Shield, link: "/admin/roles" },
    { title: "Students", icon: Users, link: "/admin/students" },
    { title: "Teachers", icon: GraduationCap, link: "/admin/teachers" },
    { title: "Courses", icon: BookOpen, link: "/admin/courses" },
    { title: "Mock Tests", icon: FileText, link: "/admin/mock-tests" },
    { title: "Fees", icon: CreditCard, link: "/admin/fees" },
    { title: "Fee Reminders", icon: Bell, link: "/admin/fee-reminders" },
    { title: "Leads", icon: Users, link: "/admin/leads" },
    { title: "Payroll", icon: Wallet, link: "/admin/payroll" },
    { title: "Attendance", icon: Calendar, link: "/admin/attendance" },
    { title: "Announcements", icon: Megaphone, link: "/admin/announcements" },
    { title: "Notes", icon: FileText, link: "/admin/notes" },
    { title: "Videos", icon: Youtube, link: "/admin/videos" },
    { title: "WhatsApp Center", icon: MessageSquare, link: "/admin/whatsapp" },
    { title: "Website Settings", icon: Settings, link: "/admin/website-settings" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 shadow-2xl lg:shadow-none",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FFFF00] text-slate-900 shadow-[0_0_15px_rgba(255,255,0,0.3)]">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-black text-white tracking-tight uppercase text-lg">AIM COMMAND</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto admin-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.link;
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[13px] transition-all group tracking-wide",
                    isActive 
                      ? "bg-[#FFFF00] text-slate-900 shadow-md" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-slate-900" : "text-slate-500 group-hover:text-white")} />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 bg-slate-900/50">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[13px] text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-white" />
              Back to Website
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <ProfileDropdown profilePath="/admin/profile" />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
