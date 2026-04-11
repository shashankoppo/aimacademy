import React from "react";
import { Link } from "react-router-dom";
import { 
  Users, Wallet, Settings, LayoutDashboard, UserRound, CreditCard,
  TrendingUp, Clock, CheckCircle2, Bell, BookOpen, Calendar,
  Megaphone, Shield
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";

const AdminDashboard = () => {
  const { students, courses } = useAdminData();

  const stats = [
    { label: "Total Students", value: students.length.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Courses", value: courses.length.toString(), icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Revenue (MTD)", value: "₹12.4L", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { 
      label: "Overdue Students", 
      value: students.filter(s => s.feeStatus === "Overdue").length.toString(), 
      icon: Clock, color: "text-red-600", bg: "bg-red-50" 
    },
  ];

  const quickActions = [
    { title: "Student Management", desc: "View & manage all enrolled students", icon: Users, link: "/admin/students" },
    { title: "Course Management", desc: "Create and manage course lifecycle", icon: BookOpen, link: "/admin/courses" },
    { title: "Fees Management", desc: "Track student fees & invoices", icon: CreditCard, link: "/admin/fees" },
    { title: "Fee Reminder Engine", desc: "Automated overdue fee notifications", icon: Bell, link: "/admin/fee-reminders" },
    { title: "Payroll Management", desc: "Manage staff salaries & payments", icon: Wallet, link: "/admin/payroll" },
    { title: "Attendance Tracker", desc: "Student & staff attendance analytics", icon: Calendar, link: "/admin/attendance" },
    { title: "Announcements", desc: "Campus-wide broadcasts & notices", icon: Megaphone, link: "/admin/announcements" },
    { title: "Website Settings", desc: "Manage Hero banners & public content", icon: Settings, link: "/admin/website-settings" },
  ];

  return (
    <div className="p-8">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Command Center</h1>
            <p className="text-slate-500 font-medium">Welcome back, Administrator. Here's your institutional overview.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <CheckCircle2 className="w-5 h-5 text-slate-100" />
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" /> Management Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <Link 
                key={i} 
                to={action.link}
                className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg flex items-start gap-5 border-b-4 border-b-transparent hover:border-b-primary"
              >
                <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-primary/5 transition-colors">
                  <action.icon className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1 group-hover:text-primary transition-colors tracking-tight">{action.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                 <h3 className="text-xl font-black mb-4">Financial Reports</h3>
                 <p className="text-slate-400 text-sm mb-6 leading-relaxed">Download the latest monthly financial summary for the board members.</p>
                 <button className="w-full bg-white text-slate-900 font-black py-3 rounded-xl transition-transform hover:scale-[1.02] text-sm">
                    Generate PDF Report
                 </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16" />
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> System Health
              </h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span>Database Sync</span>
                       <span className="text-emerald-600">Healthy</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full w-[95%] bg-emerald-500" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span>Payment Gateway</span>
                       <span className="text-blue-600">Active</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full w-[100%] bg-primary" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span>Notification Engine</span>
                       <span className="text-emerald-600">Online</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full w-[88%] bg-emerald-500" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
