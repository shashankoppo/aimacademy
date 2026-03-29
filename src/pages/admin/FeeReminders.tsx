import React, { useState } from "react";
import { 
  ArrowLeft, Bell, Send, Clock, AlertTriangle, 
  CheckCircle2, Users, IndianRupee, Calendar, 
  MessageSquare, Mail, Smartphone, Filter, Search
} from "lucide-react";
import { Link } from "react-router-dom";

const FeeReminders = () => {
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());

  const overdueStudents = [
    { id: 1, name: "Sneha Kapur", course: "UPSC Foundation", amount: "₹37,500", dueDate: "Feb 15, 2026", overdueDays: 41, installment: "2nd of 4", lastReminder: "5 days ago" },
    { id: 2, name: "Rahul Gupta", course: "SSC CGL 2026", amount: "₹12,000", dueDate: "Mar 01, 2026", overdueDays: 27, installment: "3rd of 3", lastReminder: "2 days ago" },
    { id: 3, name: "Ananya Joshi", course: "Banking IBPS", amount: "₹20,000", dueDate: "Mar 10, 2026", overdueDays: 18, installment: "1st of 2", lastReminder: "Never" },
    { id: 4, name: "Kunal Thakur", course: "MPPSC Evening", amount: "₹22,500", dueDate: "Mar 15, 2026", overdueDays: 13, installment: "2nd of 3", lastReminder: "1 day ago" },
    { id: 5, name: "Meghna Rao", course: "UPSC 2026-A", amount: "₹60,000", dueDate: "Mar 20, 2026", overdueDays: 8, installment: "1st of 4", lastReminder: "Never" },
  ];

  const upcomingDue = [
    { id: 6, name: "Vikram Singh", course: "MPPSC Evening", amount: "₹22,500", dueDate: "Apr 05, 2026", daysLeft: 8 },
    { id: 7, name: "Priya Sharma", course: "UPSC 2026-A", amount: "₹30,000", dueDate: "Apr 10, 2026", daysLeft: 13 },
    { id: 8, name: "Deepa Nair", course: "SSC CGL Fast Track", amount: "₹15,000", dueDate: "Apr 15, 2026", daysLeft: 18 },
  ];

  const toggleStudent = (id: number) => {
    const next = new Set(selectedStudents);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedStudents(next);
  };

  const selectAll = () => {
    if (selectedStudents.size === overdueStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(overdueStudents.map(s => s.id)));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-32">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="space-y-4">
            <Link to="/admin" className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Admin Panel
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Fee Reminder Engine</h1>
            <p className="text-slate-500 font-medium">Automated fee collection reminders & installment tracking system.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline-coursera py-2.5 px-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule Broadcast
            </button>
            <button 
              disabled={selectedStudents.size === 0}
              className="btn-coursera py-2.5 px-6 flex items-center gap-2 disabled:opacity-40"
            >
              <Send className="w-4 h-4" /> Send Reminders ({selectedStudents.size})
            </button>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Outstanding", value: "₹4,52,000", icon: IndianRupee, color: "text-red-600", bg: "bg-red-50" },
            { label: "Overdue Students", value: "38", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Reminders Sent (MTD)", value: "142", icon: Bell, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Collected After Reminder", value: "₹2,18,000", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
              </div>
              <p className="text-slate-400 font-bold tracking-wider text-[10px] uppercase mb-1">{stat.label}</p>
              <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
            </div>
          ))}
        </div>

        {/* Reminder Channels */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-10">
          <h3 className="font-bold text-slate-900 mb-4">Active Notification Channels</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Dashboard Alerts", icon: Bell, status: "Active", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
              { label: "SMS Notifications", icon: Smartphone, status: "Active", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
              { label: "WhatsApp Messages", icon: MessageSquare, status: "Ready", color: "bg-blue-50 text-blue-600 border-blue-200" },
              { label: "Email Reminders", icon: Mail, status: "Ready", color: "bg-blue-50 text-blue-600 border-blue-200" },
            ].map((ch, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${ch.color}`}>
                <ch.icon className="w-4 h-4" />
                <span className="text-sm font-bold">{ch.label}</span>
                <span className="text-[9px] font-black uppercase tracking-widest">{ch.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Overdue Students List */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> Overdue Fee Payments
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Select students to send bulk reminders</p>
                </div>
                <button onClick={selectAll} className="text-primary text-xs font-bold hover:underline uppercase tracking-widest">
                  {selectedStudents.size === overdueStudents.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {overdueStudents.map((s) => (
                  <div key={s.id} className={`flex items-center gap-6 p-6 hover:bg-slate-50/50 transition-all ${selectedStudents.has(s.id) ? "bg-primary/5" : ""}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.has(s.id)}
                      onChange={() => toggleStudent(s.id)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-full">{s.overdueDays} days overdue</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{s.course}</span>
                        <span>Installment: {s.installment}</span>
                        <span>Due: {s.dueDate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-red-600 text-lg">{s.amount}</div>
                      <div className="text-[10px] text-slate-400 font-bold">Last: {s.lastReminder}</div>
                    </div>
                    <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all" aria-label={`Send reminder to ${s.name}`}>
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Reminder Workflow */}
            <div className="bg-slate-900 rounded-xl p-8 text-white">
              <h3 className="font-bold text-white mb-6 text-lg">Auto-Reminder Workflow</h3>
              <div className="space-y-4">
                {[
                  "Admission → Schedule Created",
                  "7 days before → Gentle Reminder",
                  "On Due Date → Alert Triggered",
                  "3 days after → Overdue Notice",
                  "7 days after → Escalation Alert",
                  "14 days after → Admin Notification"
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${i <= 1 ? "bg-emerald-400" : i <= 3 ? "bg-amber-400" : "bg-red-400"}`} />
                    <span className="text-sm text-white/80">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Due */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Upcoming Due (Pre-Remind)
              </h3>
              <div className="space-y-4">
                {upcomingDue.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.course} · {s.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">{s.amount}</div>
                      <div className="text-[9px] text-amber-600 font-bold uppercase">{s.daysLeft} days left</div>
                    </div>
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

export default FeeReminders;
