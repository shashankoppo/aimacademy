import React, { useState } from "react";
import { 
  Search, Calendar, Users, 
  Download, Filter, CheckCircle2, UserCheck
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { getAttendanceStatus, getAttendanceColor } from "@/lib/academic-logic";

const AttendanceManagement = () => {
  const { students } = useAdminData();
  const [viewMode, setViewMode] = useState<"students" | "staff">("students");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staffAttendance = [
    { id: 1, name: "Dr. Sandeep Kumar", role: "Sr. Faculty", clockIn: "08:45 AM", clockOut: "05:30 PM", status: "Present" },
    { id: 2, name: "Meera Nair", role: "Content Head", clockIn: "09:00 AM", clockOut: "06:00 PM", status: "Present" },
    { id: 3, name: "Rajesh Varma", role: "Operations Mgr", clockIn: "-", clockOut: "-", status: "On Leave" },
    { id: 4, name: "Aditi Singh", role: "Jr. Faculty", clockIn: "09:22 AM", clockOut: "Ongoing", status: "Late" },
    { id: 5, name: "Vishal Dev", role: "Security", clockIn: "06:00 AM", clockOut: "02:00 PM", status: "Present" },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Attendance Tracker</h1>
          <p className="text-slate-500 font-medium">Track student and staff attendance with institutional analytics.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <Calendar className="w-4 h-4" /> Mark Today
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Today's Presence", value: "92%", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Absent Today", value: "24", icon: Users, color: "text-red-600", bg: "bg-red-50" },
          { label: "Staff Status", value: "45/48", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg Monthly Rate", value: "88%", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
            <p className="text-slate-400 font-black tracking-widest text-[9px] uppercase mb-2">{stat.label}</p>
            <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Toggle & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
        <div className="flex p-1.5 bg-slate-100 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setViewMode("students")} 
            className={`flex-1 md:flex-none py-2 px-6 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === "students" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}
          >
            Students
          </button>
          <button 
            onClick={() => setViewMode("staff")} 
            className={`flex-1 md:flex-none py-2 px-6 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === "staff" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}
          >
            Staff
          </button>
        </div>

        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, batch, or role..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tables */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {viewMode === "students" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Batch</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">History (P/A)</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Attendance Rate</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Status Categorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((s) => {
                  const rate = parseInt(s.attendance);
                  const statusLabel = getAttendanceStatus(rate);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">{s.name.charAt(0)}</div>
                          <span className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-500 lowercase first-letter:uppercase tracking-tight">{s.batch}</td>
                      <td className="px-8 py-5">
                         <div className="flex items-center justify-center gap-4">
                            <span className="text-xs font-black text-emerald-600">22P</span>
                            <span className="text-xs font-black text-red-400">3A</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${getAttendanceColor(rate)}`} style={{ width: s.attendance }} />
                           </div>
                           <span className="font-black text-slate-900 text-xs">{s.attendance}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
                          statusLabel === "Excellent" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          statusLabel === "Regular" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                          statusLabel === "At Risk" ? "bg-red-50 text-red-600 border border-red-100" :
                          "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>{statusLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Staff Member</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Role</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Shift Log</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffAttendance.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{s.name}</td>
                    <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">{s.role}</td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-600">IN: {s.clockIn}</span>
                          <span className="text-[10px] font-medium text-slate-400">OUT: {s.clockOut}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        s.status === "Present" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        s.status === "On Leave" ? "bg-red-50 text-red-600 border border-red-100" :
                        "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
