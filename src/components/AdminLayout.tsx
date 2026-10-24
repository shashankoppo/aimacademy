import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, Wallet, Settings, LayoutDashboard, UserRound, CreditCard,
  Bell, BookOpen, Calendar, Megaphone, GraduationCap, Shield, Menu, X, 
  ArrowLeft, MessageSquare, FileText, Youtube, ImageIcon, ExternalLink,
  ChevronRight, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileDropdown } from "./ProfileDropdown";

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  badge?: string;
}

interface MenuGroup {
  category: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    category: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, link: "/admin" },
    ]
  },
  {
    category: "Academics & Students",
    items: [
      { title: "Students", icon: Users, link: "/admin/students" },
      { title: "Teachers", icon: GraduationCap, link: "/admin/teachers" },
      { title: "Courses", icon: BookOpen, link: "/admin/courses" },
      { title: "Mock Tests", icon: FileText, link: "/admin/mock-tests" },
      { title: "Attendance", icon: Calendar, link: "/admin/attendance" },
    ]
  },
  {
    category: "Finance & Operations",
    items: [
      { title: "Fees", icon: CreditCard, link: "/admin/fees" },
      { title: "Fee Reminders", icon: Bell, link: "/admin/fee-reminders" },
      { title: "Payroll", icon: Wallet, link: "/admin/payroll" },
      { title: "Leads", icon: Users, link: "/admin/leads" },
    ]
  },
  {
    category: "Media & Resources",
    items: [
      { title: "Gallery & Photos", icon: ImageIcon, link: "/admin/gallery" },
      { title: "Video Lectures", icon: Youtube, link: "/admin/videos" },
      { title: "Downloadable Notes", icon: FileText, link: "/admin/notes" },
      { title: "Announcements", icon: Megaphone, link: "/admin/announcements" },
    ]
  },
  {
    category: "System & Administration",
    items: [
      { title: "WhatsApp Center", icon: MessageSquare, link: "/admin/whatsapp" },
      { title: "Website Settings", icon: Settings, link: "/admin/website-settings" },
      { title: "Access Control", icon: UserRound, link: "/admin/users" },
      { title: "Roles & Permissions", icon: Shield, link: "/admin/roles" },
    ]
  }
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const currentItem = useMemo(() => {
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (location.pathname === item.link) return { ...item, category: group.category };
      }
    }
    return { title: "Command Center", icon: LayoutDashboard, link: "/admin", category: "Admin" };
  }, [location.pathname]);

  const CurrentIcon = currentItem.icon;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-100/60 font-sans antialiased text-slate-800">
      
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col h-full shrink-0 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 shrink-0 px-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#FFFF00] text-slate-950 flex items-center justify-center font-black shadow-[0_0_15px_rgba(255,255,0,0.3)] group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 fill-slate-950/20" />
            </div>
            <div>
              <div className="font-black text-white text-base tracking-tight leading-tight flex items-center gap-1.5">
                AIM COMMAND
                <span className="text-[9px] font-black uppercase bg-[#FFFF00]/15 text-[#FFFF00] px-1.5 py-0.5 rounded border border-[#FFFF00]/30">v2.0</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Academic ERP & Portal</p>
            </div>
          </Link>

          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grouped Nav Items with Smooth Scroll */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto admin-scrollbar">
          {menuGroups.map((group) => (
            <div key={group.category} className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {group.category}
              </div>
              
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.link;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.link}
                      to={item.link}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 group relative",
                        isActive 
                          ? "bg-[#FFFF00] text-slate-950 shadow-[0_2px_12px_rgba(255,255,0,0.25)]" 
                          : "text-slate-300 hover:bg-slate-900 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={cn(
                          "w-4 h-4 shrink-0 transition-transform group-hover:scale-110", 
                          isActive ? "text-slate-950" : "text-slate-400 group-hover:text-white"
                        )} />
                        <span className="truncate">{item.title}</span>
                      </div>
                      
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-950 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/70 shrink-0">
          <Link 
            to="/" 
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Public Website</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shadow-xs">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-900 border border-slate-200/80 hidden sm:flex items-center justify-center">
                <CurrentIcon className="w-4 h-4 text-slate-700" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <span>{currentItem.category}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">{currentItem.title}</h1>
              </div>
            </div>
          </div>
          
          {/* Header Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* System Status Pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Live</span>
            </div>

            {/* Live Website Link */}
            <Link 
              to="/" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* Profile Dropdown */}
            <ProfileDropdown profilePath="/admin/profile" />
          </div>
        </header>

        {/* Dedicated Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto min-w-0 h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 admin-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
