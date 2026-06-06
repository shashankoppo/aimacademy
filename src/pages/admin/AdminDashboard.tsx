import React from "react";
import { Link } from "react-router-dom";
import { Users, Wallet, Settings, LayoutDashboard, CreditCard, TrendingUp, Clock, CheckCircle2, Bell, BookOpen, Calendar, Megaphone, Shield } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const AdminDashboard = () => {
  const { students, courses, announcements, staff } = useAdminData();
  const revenue = students.reduce((sum, student) => sum + student.paidFee, 0);

  const downloadReport = () => {
    const content = [
      "AIM Academy Monthly Summary",
      `Students: ${students.length}`,
      `Courses: ${courses.length}`,
      `Revenue Collected: ${currency(revenue)}`,
      `Overdue Students: ${students.filter((student) => student.feeStatus === "Overdue").length}`,
      `Announcements: ${announcements.length}`,
      `Staff Members: ${staff.length}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "financial-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Total Students", value: students.length.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Courses", value: courses.length.toString(), icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Revenue (MTD)", value: currency(revenue), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    {
      label: "Overdue Students",
      value: students.filter((student) => student.feeStatus === "Overdue").length.toString(),
      icon: Clock,
      color: "text-red-600",
      bg: "bg-red-50",
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
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3.5 rounded-2xl bg-slate-900 text-[#FFFF00] shadow-xl border border-slate-800">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">Command Center</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mt-1">Institutional Overview & Analytics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-[1.25rem] border-2 border-slate-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500/30" />
            </div>
            <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-10">
        <div className="xl:col-span-2 space-y-8">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-wide">
            <LayoutDashboard className="w-6 h-6 text-slate-900" /> Management Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link} className="group bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm transition-all hover:border-slate-900 hover:shadow-lg flex items-start gap-5">
                <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-[#FFFF00] group-hover:text-slate-900 transition-colors">
                  <action.icon className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1 tracking-tight text-[15px]">{action.title}</h3>
                  <p className="text-[12px] text-slate-500 font-semibold leading-snug">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                <TrendingUp className="w-3 h-3 text-[#FFFF00]" /> Analytics
              </div>
              <h3 className="text-2xl font-black mb-3">Financial Reports</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">Download the latest monthly financial summary for board members.</p>
              <button onClick={downloadReport} className="w-full bg-[#FFFF00] text-slate-900 font-black py-4 rounded-xl transition-transform hover:scale-[1.02] text-sm shadow-[0_0_20px_rgba(255,255,0,0.2)] uppercase tracking-wider">
                Generate PDF Report
              </button>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFFF00]/10 blur-3xl -mr-16 -mt-16 rounded-full pointer-events-none" />
          </div>

          <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm p-8">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wide text-sm">
              <Shield className="w-5 h-5 text-slate-900" /> System Health
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Database Sync</span>
                  <span className="text-emerald-600">Healthy</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[95%] bg-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Payment Gateway</span>
                  <span className="text-blue-600">Active</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[100%] bg-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Notification Engine</span>
                  <span className="text-emerald-600">Online</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
