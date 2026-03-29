import React, { useState } from "react";
import { 
  ArrowLeft, Search, Filter, Plus, UserCircle, 
  GraduationCap, Calendar, Download, Edit, Trash2, 
  Eye, ChevronDown, Users, BookOpen, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const StudentManagement = () => {
  const students = [
    { id: 1, name: "Aarav Mehta", email: "aarav@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Paid", attendance: "88%", phone: "+91 98765 43210" },
    { id: 2, name: "Deepa Nair", email: "deepa@aim.edu", course: "SSC CGL Fast Track", batch: "Evening", joinDate: "Mar 2025", feeStatus: "Paid", attendance: "96%", phone: "+91 87654 32109" },
    { id: 3, name: "Rahul Kumar", email: "rahul@aim.edu", course: "Banking IBPS", batch: "Morning", joinDate: "Jun 2025", feeStatus: "Overdue", attendance: "72%", phone: "+91 76543 21098" },
    { id: 4, name: "Priya Sharma", email: "priya@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Part Paid", attendance: "80%", phone: "+91 65432 10987" },
    { id: 5, name: "Vikram Singh", email: "vikram@aim.edu", course: "MPPSC Evening", batch: "Evening", joinDate: "Sep 2025", feeStatus: "Paid", attendance: "92%", phone: "+91 54321 09876" },
    { id: 6, name: "Ananya Joshi", email: "ananya@aim.edu", course: "SSC CGL Fast Track", batch: "Morning", joinDate: "Feb 2025", feeStatus: "Overdue", attendance: "60%", phone: "+91 43210 98765" },
    { id: 7, name: "Kunal Thakur", email: "kunal@aim.edu", course: "MPPSC Evening", batch: "Weekend", joinDate: "Nov 2025", feeStatus: "Paid", attendance: "85%", phone: "+91 32109 87654" },
    { id: 8, name: "Meghna Rao", email: "meghna@aim.edu", course: "UPSC 2026-A", batch: "Morning", joinDate: "Jan 2025", feeStatus: "Part Paid", attendance: "78%", phone: "+91 21098 76543" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="space-y-4">
            <Link to="/admin" className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Admin Panel
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Management</h1>
            <p className="text-slate-500 font-medium">View, manage, and track all enrolled students across batches.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline-coursera py-2.5 px-6 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button className="btn-coursera py-2.5 px-6 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Enrolled", value: "1,240", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Courses", value: "24", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Avg Attendance", value: "83%", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Pass Rate", value: "91%", icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
              <div>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search students by name, email, or course..." className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex gap-2">
            <select className="bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm text-slate-600 focus:outline-none">
              <option>All Courses</option>
              <option>UPSC 2026-A</option>
              <option>SSC CGL Fast Track</option>
              <option>Banking IBPS</option>
              <option>MPPSC Evening</option>
            </select>
            <select className="bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm text-slate-600 focus:outline-none">
              <option>All Status</option>
              <option>Paid</option>
              <option>Part Paid</option>
              <option>Overdue</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Course & Batch</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Joined</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Attendance</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Fee Status</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">{s.name.split(" ").map(n => n[0]).join("")}</div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-600">{s.course}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.batch} Batch</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">{s.joinDate}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${parseInt(s.attendance) > 80 ? "bg-emerald-500" : parseInt(s.attendance) > 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: s.attendance }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{s.attendance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        s.feeStatus === "Paid" ? "bg-emerald-100 text-emerald-700" :
                        s.feeStatus === "Overdue" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{s.feeStatus}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button aria-label="View student" className="p-2 text-slate-300 hover:text-primary transition-colors"><Eye className="w-4 h-4" /></button>
                        <button aria-label="Edit student" className="p-2 text-slate-300 hover:text-amber-500 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button aria-label="Delete student" className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">Showing 8 of 1,240 students</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded text-xs font-bold">Previous</button>
              <button className="px-4 py-2 bg-primary text-white rounded text-xs font-bold">1</button>
              <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded text-xs font-bold">2</button>
              <button className="px-4 py-2 bg-slate-50 text-slate-400 rounded text-xs font-bold">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentManagement;
