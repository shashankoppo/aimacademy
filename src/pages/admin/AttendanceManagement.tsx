import React, { useState } from "react";
import { 
  ArrowLeft, Search, Filter, Calendar, Users, 
  CheckCircle2, XCircle, Clock, Download, ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";

const AttendanceManagement = () => {
  const [viewMode, setViewMode] = useState<"students" | "staff">("students");

  const studentAttendance = [
    { id: 1, name: "Aarav Mehta", batch: "UPSC 2026-A", present: 22, absent: 3, percentage: "88%", status: "Regular" },
    { id: 2, name: "Deepa Nair", batch: "SSC CGL Fast Track", present: 24, absent: 1, percentage: "96%", status: "Excellent" },
    { id: 3, name: "Rahul Kumar", batch: "Banking IBPS", present: 18, absent: 7, percentage: "72%", status: "Irregular" },
    { id: 4, name: "Priya Sharma", batch: "UPSC 2026-A", present: 20, absent: 5, percentage: "80%", status: "Regular" },
    { id: 5, name: "Vikram Singh", batch: "MPPSC Evening", present: 23, absent: 2, percentage: "92%", status: "Excellent" },
    { id: 6, name: "Ananya Joshi", batch: "SSC CGL Fast Track", present: 15, absent: 10, percentage: "60%", status: "At Risk" },
  ];

  const staffAttendance = [
    { id: 1, name: "Dr. Sandeep Kumar", role: "Sr. Faculty", clockIn: "08:45 AM", clockOut: "05:30 PM", status: "Present" },
    { id: 2, name: "Meera Nair", role: "Content Head", clockIn: "09:00 AM", clockOut: "06:00 PM", status: "Present" },
    { id: 3, name: "Rajesh Varma", role: "Operations Mgr", clockIn: "-", clockOut: "-", status: "On Leave" },
    { id: 4, name: "Aditi Singh", role: "Jr. Faculty", clockIn: "09:22 AM", clockOut: "Ongoing", status: "Late" },
    { id: 5, name: "Vishal Dev", role: "Security", clockIn: "06:00 AM", clockOut: "02:00 PM", status: "Present" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="space-y-4">
            <Link to="/admin" className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Panel
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Attendance Management</h1>
            <p className="text-slate-500 font-medium">Track student and staff attendance with institutional analytics.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline-coursera py-2.5 px-6 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Report
            </button>
            <button className="btn-coursera py-2.5 px-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Mark Today
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Present Today", value: "1,102 / 1,240", color: "text-emerald-600" },
            { label: "Absent Students", value: "138", color: "text-red-600" },
            { label: "Staff Present", value: "42 / 48", color: "text-blue-600" },
            { label: "Avg Attendance Rate", value: "87.4%", color: "text-amber-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 font-bold tracking-wider text-[10px] uppercase mb-2">{stat.label}</p>
              <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
            </div>
          ))}
        </div>

        {/* Toggle */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setViewMode("students")} className={`py-2 px-6 rounded text-xs font-bold uppercase tracking-widest transition-all ${viewMode === "students" ? "bg-primary text-white" : "bg-white text-slate-400 border border-slate-200"}`}>
            <Users className="w-4 h-4 inline mr-2" /> Student Attendance
          </button>
          <button onClick={() => setViewMode("staff")} className={`py-2 px-6 rounded text-xs font-bold uppercase tracking-widest transition-all ${viewMode === "staff" ? "bg-primary text-white" : "bg-white text-slate-400 border border-slate-200"}`}>
            <Users className="w-4 h-4 inline mr-2" /> Staff Attendance
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name, batch, or role..." className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>
          <button title="Filter" className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100"><Filter className="w-4 h-4 text-slate-600" /></button>
        </div>

        {/* Tables */}
        {viewMode === "students" ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Batch</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Present</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Absent</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Rate</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {studentAttendance.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">{s.name.charAt(0)}</div>
                          <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-500">{s.batch}</td>
                      <td className="px-8 py-5 font-bold text-emerald-600">{s.present}</td>
                      <td className="px-8 py-5 font-bold text-red-500">{s.absent}</td>
                      <td className="px-8 py-5 font-black text-slate-900">{s.percentage}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          s.status === "Excellent" ? "bg-emerald-100 text-emerald-700" :
                          s.status === "Regular" ? "bg-blue-100 text-blue-700" :
                          s.status === "At Risk" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Staff</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Role</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Clock In</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Clock Out</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {staffAttendance.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-900 text-sm">{s.name}</td>
                      <td className="px-8 py-5 text-sm text-slate-500">{s.role}</td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-600">{s.clockIn}</td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-600">{s.clockOut}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          s.status === "Present" ? "bg-emerald-100 text-emerald-700" :
                          s.status === "On Leave" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;
