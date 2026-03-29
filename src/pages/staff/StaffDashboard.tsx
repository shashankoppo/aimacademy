import React from "react";
import { 
  Users, Briefcase, FileText, BarChart3, 
  Calendar, CheckCircle2, ChevronRight, GraduationCap, 
  Search, Filter, Settings, Clock, Download, 
  Bell, UserCheck, UserPlus, CreditCard, PieChart
} from "lucide-react";

const StaffDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center font-black text-2xl text-white">
              RK
            </div>
            <div>
              <span className="badge-academic mb-2 bg-amber-50 text-amber-600 border-amber-100">Operations & Admin</span>
              <h1 className="heading-display text-3xl text-slate-900 leading-tight">
                Staff Command, <span className="text-amber-600">Ravi Kumar.</span>
              </h1>
              <p className="text-slate-500 font-medium">Sr. Administrator — Operations Department</p>
            </div>
          </div>
          <div className="flex gap-4">
             <button className="flex items-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded hover:bg-slate-800 transition-all">
                <Bell className="w-4 h-4" /> Broadcast Alert
             </button>
             <button className="btn-coursera py-3">Generate Monthly Report</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           
           {/* Left Column: Quick Stats */}
           <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[ 
                { label: "Staff Present", value: "42/48", icon: UserCheck, color: "text-emerald-500" },
                { label: "Today's Collection", value: "₹2.4L", icon: CreditCard, color: "text-primary" },
                { label: "New Admissions", value: "12", icon: UserPlus, color: "text-amber-500" },
                { label: "Pending Tasks", value: "08", icon: Clock, color: "text-red-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                   <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                         <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                   </div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
           </div>

           {/* Central: Attendance & Reports */}
           <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Daily Staff Attendance */}
              <div className="bg-white rounded-xl border border-slate-100 p-8">
                 <div className="flex justify-between items-center mb-8">
                    <h2 className="heading-display text-xl">Staff Attendance Log</h2>
                    <div className="flex gap-2">
                       <button className="p-2 bg-slate-50 text-slate-500 rounded text-xs font-bold uppercase tracking-widest">Filter: All Departments</button>
                    </div>
                 </div>
                 <div className="space-y-4">
                    {[ 
                      { name: "Sanjay Mishra", role: "Faculty", status: "Present", clockIn: "08:45 AM", clockOut: "Ongoing" },
                      { name: "Priya Sharma", role: "Counselor", status: "On Leave", clockIn: "-", clockOut: "-" },
                      { name: "Vishal Dev", role: "Security", status: "Present", clockIn: "08:00 AM", clockOut: "04:00 PM" },
                      { name: "Megha Sahi", role: "Librarian", status: "Late", clockIn: "09:12 AM", clockOut: "Ongoing" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">{row.name.charAt(0)}</div>
                            <div>
                               <h4 className="font-bold text-slate-900 text-sm leading-none mb-1">{row.name}</h4>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{row.role}</p>
                            </div>
                         </div>
                         <div className="hidden md:flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clock In</span>
                            <span className="text-xs font-bold text-slate-900">{row.clockIn}</span>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                           row.status === "Present" ? "bg-emerald-50 text-emerald-600" :
                           row.status === "On Leave" ? "bg-red-50 text-red-600" :
                           "bg-amber-50 text-amber-600"
                         }`}>{row.status}</div>
                         <button aria-label="Settings" className="text-slate-300 hover:text-primary transition-colors"><Settings className="w-4 h-4" /></button>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Reports Center */}
              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
                    <div className="p-3 w-fit rounded-lg bg-blue-50 text-blue-600 mb-6"><PieChart className="w-6 h-6" /></div>
                    <h3 className="heading-display text-lg mb-2">Financial Reports</h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">Download fee collection, expenditure, and pending balances reports for this quarter.</p>
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-100 transition-all">
                       <Download className="w-4 h-4" /> Download PDF
                    </button>
                 </div>
                 <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-sm">
                    <div className="p-3 w-fit rounded-lg bg-amber-50 text-amber-600 mb-6"><FileText className="w-6 h-6" /></div>
                    <h3 className="heading-display text-lg mb-2">Academic Audit</h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">Generate reports for course completion, mock test attendance, and faculty performance.</p>
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-100 transition-all">
                       <Download className="w-4 h-4" /> Download DOCX
                    </button>
                 </div>
              </div>

           </div>

           {/* Right Column: Alerts & Reminders */}
           <div className="lg:col-span-4 flex flex-col gap-8">
              
              <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden">
                 <div className="absolute right-0 bottom-0 opacity-10"><BarChart3 className="w-40 h-40" /></div>
                 <h3 className="heading-display text-white text-lg mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5" /> Important Tasks
                 </h3>
                 <div className="space-y-4 relative z-10">
                    {[ 
                      "Coordinate Prelims Batch-A Mock Test",
                      "Update Salary Slips for April cycle",
                      "Renew AWS EdStart Partnership",
                      "Finalize Q2 Facility Maintenance"
                    ].map(task => (
                      <div key={task} className="flex gap-4 p-4 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                         <div className="w-5 h-5 rounded border border-white/30 group-hover:bg-primary transition-all shrink-0" />
                         <span className="text-xs font-medium text-white/80">{task}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-8">
                 <h3 className="heading-display text-lg mb-6">Upcoming Events</h3>
                 <div className="space-y-6">
                    {[ 
                      { day: "05", mon: "APR", event: "Staff Townhall Session" },
                      { day: "12", mon: "APR", event: "Q1 Performance Review" },
                      { day: "18", mon: "APR", event: "Campus Maintenance Day" }
                    ].map((ev, i) => (
                      <div key={i} className="flex items-center gap-6">
                         <div className="flex flex-col items-center">
                            <span className="text-primary font-black text-xl leading-none">{ev.day}</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{ev.mon}</span>
                         </div>
                         <div className="h-10 w-px bg-slate-100 shrink-0" />
                         <h4 className="text-sm font-bold text-slate-700 leading-tight">{ev.event}</h4>
                      </div>
                    ))}
                 </div>
              </div>

           </div>

        </div>

      </div>
    </div>
  );
};

export default StaffDashboard;
