import React from "react";
import { Link } from "react-router-dom";
import { 
  Users, Wallet, Settings, LayoutDashboard, UserRound, CreditCard,
  TrendingUp, Clock, CheckCircle2, Bell, BookOpen, Calendar,
  Megaphone, GraduationCap, BarChart3, Shield
} from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    { label: "Total Students", value: "1,240", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Teachers", value: "48", icon: UserRound, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Revenue (MTD)", value: "₹12.4L", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Fees", value: "₹4.2L", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const quickActions = [
    { title: "Student Management", desc: "View & manage all enrolled students", icon: Users, link: "/admin/students" },
    { title: "Course Management", desc: "Create and manage course lifecycle", icon: BookOpen, link: "/admin/courses" },
    { title: "Fees Management", desc: "Track student fees & invoices", icon: CreditCard, link: "/admin/fees" },
    { title: "Fee Reminder Engine", desc: "Automated overdue fee notifications", icon: Bell, link: "/admin/fee-reminders" },
    { title: "Payroll Management", desc: "Manage staff salaries & payments", icon: Wallet, link: "/admin/payroll" },
    { title: "Attendance Tracker", desc: "Student & staff attendance analytics", icon: Calendar, link: "/admin/attendance" },
    { title: "Announcements", desc: "Campus-wide broadcasts & notices", icon: Megaphone, link: "/admin/announcements" },
    { title: "System Settings", desc: "Platform configurations & access", icon: Settings, link: "#" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-32">
      <div className="container mx-auto px-6">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary text-white">
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
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <CheckCircle2 className="w-5 h-5 text-slate-200" />
              </div>
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-xl font-bold text-slate-900">Management Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <Link 
                  key={i} 
                  to={action.link}
                  className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg flex items-start gap-5"
                >
                  <div className="p-3 rounded-lg bg-slate-50 group-hover:bg-primary/5 transition-colors">
                    <action.icon className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Recent Transactions</h3>
                  <Link to="/admin/fees" className="text-primary text-sm font-bold hover:underline">View All</Link>
               </div>
               <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { name: "Aarav Mehta", course: "UPSC Batch 2026-A", date: "Mar 28, 2026", amount: "+ ₹30,000" },
                      { name: "Deepa Nair", course: "SSC CGL Fast Track", date: "Mar 27, 2026", amount: "+ ₹15,000" },
                      { name: "Vikram Singh", course: "MPPSC Evening", date: "Mar 26, 2026", amount: "+ ₹22,500" },
                    ].map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">{t.name.split(" ").map(n => n[0]).join("")}</div>
                           <div>
                              <p className="font-bold text-slate-900 text-sm">{t.name} — {t.course}</p>
                              <p className="text-xs text-slate-400">{t.date}</p>
                           </div>
                        </div>
                        <span className="text-green-600 font-bold text-sm">{t.amount}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
             <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-xl font-black mb-4">Financial Reports</h3>
                   <p className="text-slate-400 text-sm mb-6 leading-relaxed">Download the latest monthly financial summary for the board members.</p>
                   <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg transition-transform hover:scale-[1.02]">
                      Download PDF
                   </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16" />
             </div>

             {/* Quick Links to Portals */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-6">Portal Access</h3>
                <div className="space-y-3">
                   {[
                     { label: "Student Portal Preview", link: "/student/dashboard", color: "text-blue-600" },
                     { label: "Teacher Portal Preview", link: "/teacher/dashboard", color: "text-emerald-600" },
                     { label: "Staff Portal Preview", link: "/staff/dashboard", color: "text-amber-600" },
                   ].map((p, i) => (
                     <Link key={i} to={p.link} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-primary/5 transition-all group">
                       <span className={`font-bold text-sm ${p.color}`}>{p.label}</span>
                       <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary uppercase tracking-widest">View →</span>
                     </Link>
                   ))}
                </div>
             </div>

             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-6">System Health</h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                         <span>Database Sync</span>
                         <span className="text-green-600">Healthy</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full w-[95%] bg-green-500" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                         <span>Payment Gateway</span>
                         <span className="text-blue-600">Active</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full w-[100%] bg-primary" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
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
    </div>
  );
};

export default AdminDashboard;
