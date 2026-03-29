import React from "react";
import { 
  ArrowLeft, Search, Plus, BookOpen, Users, 
  Calendar, Clock, Edit, Trash2, Eye, GraduationCap,
  UserPlus, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const CourseManagement = () => {
  const courses = [
    { id: 1, title: "UPSC Civil Services (CSE)", batches: 3, students: 240, faculty: "Dr. Sandeep Kumar", status: "Active", duration: "12–18 Months", fee: "₹1,20,000", completion: "65%" },
    { id: 2, title: "State PSC (MPPSC)", batches: 2, students: 180, faculty: "Prof. Meera Nair", status: "Active", duration: "6–12 Months", fee: "₹75,000", completion: "45%" },
    { id: 3, title: "SSC CGL / CHSL", batches: 4, students: 320, faculty: "Rajesh Varma", status: "Active", duration: "6 Months", fee: "₹45,000", completion: "80%" },
    { id: 4, title: "Banking / IBPS", batches: 2, students: 210, faculty: "Aditi Singh", status: "Active", duration: "4–6 Months", fee: "₹40,000", completion: "55%" },
    { id: 5, title: "Railways / Defence", batches: 1, students: 150, faculty: "Amit Dubey", status: "Upcoming", duration: "3–6 Months", fee: "₹30,000", completion: "0%" },
    { id: 6, title: "Ethics Masterclass", batches: 1, students: 85, faculty: "Dr. Sandeep Kumar", status: "Completed", duration: "3 Months", fee: "₹18,000", completion: "100%" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="space-y-4">
            <Link to="/admin" className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Admin Panel
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Course Management</h1>
            <p className="text-slate-500 font-medium">Manage course lifecycle, batches, faculty allocation, and enrollment.</p>
          </div>
          <button className="btn-coursera py-2.5 px-6 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Active Courses", value: "24", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Batches", value: "13", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Enrolled Students", value: "1,240", icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Faculty Assigned", value: "18", icon: GraduationCap, color: "text-violet-600", bg: "bg-violet-50" },
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

        {/* Course Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-surface-accent text-primary">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    c.status === "Active" ? "bg-emerald-100 text-emerald-700" :
                    c.status === "Upcoming" ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-500"
                  }`}>{c.status}</span>
                </div>

                <h3 className="font-black text-slate-900 text-lg mb-2 group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-xs text-slate-400 font-bold mb-4">Faculty: {c.faculty}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Batches</div>
                    <div className="font-black text-slate-900">{c.batches}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Students</div>
                    <div className="font-black text-slate-900">{c.students}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Duration</div>
                    <div className="font-black text-slate-900 text-xs">{c.duration}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fee</div>
                    <div className="font-black text-slate-900 text-xs">{c.fee}</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    <span>Completion</span>
                    <span className="text-primary">{c.completion}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: c.completion }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                  <button aria-label="View course" className="flex-1 p-2 text-center text-slate-400 hover:text-primary text-xs font-bold uppercase tracking-widest transition-colors"><Eye className="w-4 h-4 mx-auto" /></button>
                  <button aria-label="Edit course" className="flex-1 p-2 text-center text-slate-400 hover:text-amber-500 text-xs font-bold uppercase tracking-widest transition-colors"><Edit className="w-4 h-4 mx-auto" /></button>
                  <button aria-label="Assign students" className="flex-1 p-2 text-center text-slate-400 hover:text-emerald-500 text-xs font-bold uppercase tracking-widest transition-colors"><UserPlus className="w-4 h-4 mx-auto" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
