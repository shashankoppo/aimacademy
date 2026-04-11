import React, { useState } from "react";
import { 
  Search, Plus, Download, Edit, Trash2, 
  Eye, Users, BookOpen, Calendar, BarChart3
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { getAttendanceColor } from "@/lib/academic-logic";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StudentManagement = () => {
  const { students, addStudent, deleteStudent } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  // New Student State
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    course: "",
    batch: "Morning",
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    feeStatus: "Paid" as const,
    attendance: "100%",
    phone: ""
  });

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === "All Courses" || s.course === courseFilter;
    const matchesStatus = statusFilter === "All Status" || s.feeStatus === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email) {
      toast.error("Please fill in required fields");
      return;
    }
    addStudent(newStudent);
    toast.success("Student added successfully");
    // Reset form
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      deleteStudent(id);
      toast.success("Student deleted");
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Management</h1>
          <p className="text-slate-500 font-medium">View, manage, and track all enrolled students across batches.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Add Student
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Course</Label>
                  <Select onValueChange={v => setNewStudent({...newStudent, course: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPSC 2026-A">UPSC 2026-A</SelectItem>
                      <SelectItem value="SSC CGL Fast Track">SSC CGL Fast Track</SelectItem>
                      <SelectItem value="Banking IBPS">Banking IBPS</SelectItem>
                      <SelectItem value="MPPSC Evening">MPPSC Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <button 
                  onClick={handleAddStudent}
                  className="w-full bg-primary text-white font-bold py-2 rounded-lg"
                >
                  Save Student
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Enrolled", value: students.length.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
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
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm text-slate-600 focus:outline-none"
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
          >
            <option>All Courses</option>
            <option>UPSC 2026-A</option>
            <option>SSC CGL Fast Track</option>
            <option>Banking IBPS</option>
            <option>MPPSC Evening</option>
          </select>
          <select 
            className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm text-slate-600 focus:outline-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
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
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Attendance</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Fee Status</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm">
                        {s.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-700">{s.course}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.batch} Batch</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getAttendanceColor(parseInt(s.attendance))}`} 
                          style={{ width: s.attendance }} 
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 tracking-wider transition-colors group-hover:text-primary">
                        {s.attendance} ATTENDANCE
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      s.feeStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      s.feeStatus === "Overdue" ? "bg-red-50 text-red-600 border border-red-100" :
                      "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>
                      {s.feeStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="p-20 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No students found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
