import React, { useState } from "react";
import { 
  Plus, BookOpen, Users, 
  Calendar, Edit, Trash2, Eye, GraduationCap,
  UserPlus
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CourseManagement = () => {
  const { courses, addCourse, updateCourse } = useAdminData();
  
  const [newCourse, setNewCourse] = useState({
    title: "",
    students: 0,
    faculty: "",
    status: "Active" as const,
    duration: "",
    fee: ""
  });

  const handleAddCourse = () => {
    if (!newCourse.title || !newCourse.faculty) {
      toast.error("Please fill in required fields");
      return;
    }
    addCourse(newCourse);
    toast.success("Course created successfully");
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Course Management</h1>
          <p className="text-slate-500 font-medium">Manage course lifecycle, batches, faculty allocation, and enrollment.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Create Course
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="faculty">Lead Faculty</Label>
                <Input id="faculty" value={newCourse.faculty} onChange={e => setNewCourse({...newCourse, faculty: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" placeholder="e.g. 12 Months" value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fee">Fee Amount</Label>
                <Input id="fee" placeholder="₹1,20,000" value={newCourse.fee} onChange={e => setNewCourse({...newCourse, fee: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <button 
                onClick={handleAddCourse}
                className="w-full bg-primary text-white font-bold py-2 rounded-lg"
              >
                Create Course
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Active Courses", value: courses.length.toString(), icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
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
          <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group border-b-4 border-b-primary/10">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                  c.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  c.status === "Upcoming" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                  "bg-slate-50 text-slate-400 border border-slate-200"
                }`}>
                  {c.status}
                </span>
              </div>

              <h3 className="font-black text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors">{c.title}</h3>
              <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-tighter">Faculty: {c.faculty}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Students</div>
                  <div className="font-black text-slate-900">{c.students}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Duration</div>
                  <div className="font-black text-slate-900 text-[11px] truncate">{c.duration}</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl mb-6">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Enrollment Fee</span>
                <span className="font-black text-slate-900">{c.fee}</span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button aria-label="View course" className="flex-1 p-2 flex justify-center items-center text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                <button aria-label="Edit course" className="flex-1 p-2 flex justify-center items-center text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                <button aria-label="Assign students" className="flex-1 p-2 flex justify-center items-center text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"><UserPlus className="w-4 h-4" /></button>
                <button aria-label="Archive" className="flex-1 p-2 flex justify-center items-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseManagement;
