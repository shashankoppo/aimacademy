import React, { useState } from "react";
import { 
  Bell, Send, Clock, AlertTriangle, 
  CheckCircle2, IndianRupee, MessageSquare, Mail, Smartphone
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { toast } from "sonner";

const FeeReminders = () => {
  const { students } = useAdminData();
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());

  const overdueStudents = students.filter(s => s.feeStatus === "Overdue" || s.feeStatus === "Part Paid");

  const toggleStudent = (id: number) => {
    const next = new Set(selectedStudents);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedStudents(next);
  };

  const selectAll = () => {
    if (selectedStudents.size === overdueStudents.length && overdueStudents.length > 0) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(overdueStudents.map(s => s.id)));
    }
  };

  const handleSendReminders = () => {
    const count = selectedStudents.size;
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `Sending ${count} reminders...`,
        success: `${count} reminders sent successfully via SMS & WhatsApp!`,
        error: "Failed to send reminders.",
      }
    );
    setSelectedStudents(new Set());
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Fee Reminder Engine</h1>
          <p className="text-slate-500 font-medium">Automated fee collection reminders & installment tracking system.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSendReminders}
            disabled={selectedStudents.size === 0}
            className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="w-4 h-4" /> Send Reminders ({selectedStudents.size})
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Outstanding", value: "₹4.5L", icon: IndianRupee, color: "text-red-500", bg: "bg-red-50" },
          { label: "Overdue Students", value: overdueStudents.length.toString(), icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Reminders Sent (MTD)", value: "142", icon: Bell, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Response Rate", value: "68%", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-b-4 border-b-transparent hover:border-b-primary transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
            </div>
            <p className="text-slate-400 font-black tracking-widest text-[9px] uppercase mb-1">{stat.label}</p>
            <h4 className={`text-2xl font-black text-slate-900`}>{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Reminder Channels */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-10 shadow-sm">
        <h3 className="font-black text-slate-900 mb-6 text-sm uppercase tracking-tight flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" /> Active Notification Channels
        </h3>
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Dashboard", icon: Bell, status: "Active", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
            { label: "SMS", icon: Smartphone, status: "Active", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
            { label: "WhatsApp", icon: MessageSquare, status: "Ready", color: "bg-blue-50 text-blue-600 border-blue-100" },
            { label: "Email", icon: Mail, status: "Ready", color: "bg-blue-50 text-blue-600 border-blue-100" },
          ].map((ch, i) => (
            <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${ch.color} shadow-sm`}>
              <ch.icon className="w-4 h-4" />
              <span className="text-sm font-black tracking-tight">{ch.label}</span>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{ch.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Overdue Students List */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-tight">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Pending Collections
                </h3>
              </div>
              <button onClick={selectAll} className="text-primary text-[10px] font-black hover:underline uppercase tracking-widest">
                {selectedStudents.size === overdueStudents.length && overdueStudents.length > 0 ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {overdueStudents.map((s) => (
                <div key={s.id} className={`flex items-center gap-6 p-6 hover:bg-slate-50/50 transition-all ${selectedStudents.has(s.id) ? "bg-primary/5" : ""}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedStudents.has(s.id)}
                    onChange={() => toggleStudent(s.id)}
                    className="w-5 h-5 accent-primary rounded-lg cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{s.name}</h4>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${
                        s.feeStatus === "Overdue" ? "bg-red-50 text-red-600 border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {s.feeStatus}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="truncate max-w-[150px]">{s.course}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due Soon</span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="font-black text-slate-900 text-lg tracking-tighter">₹15,000</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Installment 2</div>
                  </div>
                  <button 
                    onClick={() => {
                      toast.success(`Reminder sent to ${s.name}`);
                      toggleStudent(s.id);
                    }}
                    className="p-3 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {overdueStudents.length === 0 && (
                <div className="p-20 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">All clear! No overdue payments found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <h3 className="font-black text-white mb-8 text-sm uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Auto-Workflow
            </h3>
            <div className="space-y-6 relative mb-4">
              {[
                "7 days before → Gentle Reminder",
                "On Due Date → Alert Triggered",
                "3 days after → Overdue Notice",
                "7 days after → Escalation alert",
                "14 days after → Admin Lock"
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 border-white/20 group-hover:scale-125 transition-all ${
                      i <= 1 ? "bg-emerald-400" : i <= 2 ? "bg-amber-400" : "bg-red-400"
                    }`} />
                    {i < 4 && <div className="w-0.5 h-6 bg-white/10 my-1" />}
                  </div>
                  <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">{step}</span>
                </div>
              ))}
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeReminders;
