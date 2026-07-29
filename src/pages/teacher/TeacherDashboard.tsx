import React, { useEffect, useMemo, useState } from "react";
import { 
  Users, BookOpen, BarChart3, 
  Search, Filter
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest, getStoredUser } from "@/lib/admin-api";

type TeacherTab = "assign" | "performance";

type AdminCourse = { id: number; title: string };
type AdminStudent = { id: number; name: string; email: string; phone: string; batch: string; course: string; courseId?: number | null };
type LeaderboardRow = { studentId: number; name: string; avgPct: string; testsTaken: number; status: string };

type AssignMode = "batch" | "student";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState<TeacherTab>("assign");
  const user = getStoredUser();

  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  const [assignMode, setAssignMode] = useState<AssignMode>("batch");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedBatches, setSelectedBatches] = useState<Set<string>>(new Set());
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [studentSearch, setStudentSearch] = useState("");

  const initials = useMemo(() => {
    const name = (user?.name ?? "Teacher").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "T";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return `${first}${last}`.toUpperCase();
  }, [user?.name]);

  const displayName = user?.name ?? "Sanjay Mishra";

  const loadAll = async () => {
    const dash = await apiRequest<{ success: true; courses: AdminCourse[]; batches: string[] }>(
      "/teacher/dashboard",
    );
    setCourses(dash.courses);
    setBatches(dash.batches);
    if (dash.courses.length && !selectedCourseId) setSelectedCourseId(dash.courses[0]!.id);

    const studentResp = await apiRequest<{ success: true; students: AdminStudent[] }>("/teacher/students");
    setStudents(studentResp.students);

    const lbResp = await apiRequest<{ success: true; leaderboard: LeaderboardRow[] }>("/teacher/analytics");
    setLeaderboard(lbResp.leaderboard);
  };

  useEffect(() => {
    void loadAll().catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load teacher panel"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q),
    );
  }, [studentSearch, students]);

  const toggleBatch = (batch: string) => {
    const next = new Set(selectedBatches);
    if (next.has(batch)) next.delete(batch);
    else next.add(batch);
    setSelectedBatches(next);
  };

  const toggleStudent = (id: number) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const confirmAssign = async () => {
    if (!selectedCourseId) {
      toast.error("Please choose a course first.");
      return;
    }

    try {
      const body =
        assignMode === "batch"
          ? { courseId: selectedCourseId, batches: Array.from(selectedBatches) }
          : { courseId: selectedCourseId, studentIds: Array.from(selectedStudentIds) };

      const resp = await apiRequest<{ success: true; assigned: number }>("/teacher/assign", {
        method: "POST",
        body: JSON.stringify(body),
      });

      toast.success(`Assigned access to ${resp.assigned} student(s).`);
      setSelectedBatches(new Set());
      setSelectedStudentIds(new Set());

      const studentResp = await apiRequest<{ success: true; students: AdminStudent[] }>("/teacher/students");
      setStudents(studentResp.students);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign access");
    }
  };

  const tabs: { id: TeacherTab; label: string; icon: typeof BookOpen }[] = [
    { id: "assign", label: "Assign Courses", icon: BookOpen },
    { id: "performance", label: "Student Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center font-black text-2xl text-white">
              {initials}
            </div>
            <div>
              <span className="badge-academic mb-2 bg-emerald-50 text-emerald-600 border-emerald-100">Faculty Portal</span>
              <h1 className="heading-display text-3xl text-slate-900 leading-tight">
                Academic Panel, <span className="text-emerald-600">{displayName}.</span>
              </h1>
              <p className="text-slate-500 font-medium">Head of History & Ethics Department</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-10 overflow-x-auto">
           {tabs.map((tab) => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${
                 activeTab === tab.id ? "text-primary" : "text-slate-400 hover:text-slate-600"
               }`}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
               {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
             </button>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           
           {/* Main Content Area */}
           <div className="lg:col-span-12">
             
             {activeTab === "assign" && (
               <div className="bg-white rounded-xl border border-slate-100 p-8">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                       <h2 className="heading-display text-xl">Assign Programs</h2>
                       <p className="text-xs text-slate-400 mt-1">Select courses and assign them to specific students or batches.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                       <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input
                            type="text"
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                          />
                       </div>
                       <button aria-label="Filter students" className="p-2 bg-slate-50 text-slate-500 rounded-lg"><Filter className="w-5 h-5" /></button>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-12">
                    {/* Left: Course Selection */}
                    <div className="space-y-6">
                       <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Step 1: Choose Course</label>
                       <div className="space-y-3">
                          {courses.map((course) => (
                            <label key={course.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 cursor-pointer group transition-all">
                               <span className="font-bold text-slate-700 text-sm">{course.title}</span>
                               <input
                                 type="radio"
                                 name="course"
                                 checked={selectedCourseId === course.id}
                                 onChange={() => setSelectedCourseId(course.id)}
                                 className="w-4 h-4 accent-primary"
                               />
                            </label>
                          ))}
                       </div>
                    </div>

                    {/* Right: Student/Batch Selection */}
                    <div className="space-y-6">
                       <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Step 2: Assign To</label>
                       <div className="flex gap-4 mb-4">
                          <button
                            onClick={() => setAssignMode("batch")}
                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded ${assignMode === "batch" ? "bg-primary text-white" : "bg-slate-50 text-slate-400"}`}
                          >
                            Select Batch
                          </button>
                          <button
                            onClick={() => setAssignMode("student")}
                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded ${assignMode === "student" ? "bg-primary text-white" : "bg-slate-50 text-slate-400"}`}
                          >
                            Individual Students
                          </button>
                       </div>
                       <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                          {assignMode === "batch"
                            ? batches.map((batch) => (
                                <label key={batch} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 cursor-pointer group transition-all">
                                  <span className="font-bold text-slate-700 text-sm">{batch}</span>
                                  <input
                                    type="checkbox"
                                    checked={selectedBatches.has(batch)}
                                    onChange={() => toggleBatch(batch)}
                                    className="w-4 h-4 accent-primary rounded"
                                  />
                                </label>
                              ))
                            : filteredStudents.map((s) => (
                                <label key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 cursor-pointer group transition-all">
                                  <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                                  <input
                                    type="checkbox"
                                    checked={selectedStudentIds.has(s.id)}
                                    onChange={() => toggleStudent(s.id)}
                                    className="w-4 h-4 accent-primary rounded"
                                  />
                                </label>
                              ))}
                       </div>
                       <button onClick={() => void confirmAssign()} className="w-full btn-coursera py-4 mt-6">Confirm and Assign Access</button>
                    </div>
                 </div>
               </div>
             )}

             {activeTab === "performance" && (
                <div className="bg-white rounded-xl border border-slate-100 p-8">
                   <h2 className="heading-display text-xl mb-8">Performance Leaderboard</h2>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                               <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Student Name</th>
                               <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Avg %</th>
                               <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Tests Taken</th>
                               <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                               <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {leaderboard.map((row) => (
                               <tr key={row.studentId} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-4 font-bold text-slate-900 text-sm">{row.name}</td>
                                  <td className="p-4 text-sm text-slate-500 font-body">{row.avgPct}</td>
                                  <td className="p-4 text-sm text-slate-500 font-body">{row.testsTaken}</td>
                                  <td className="p-4">
                                     <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                       row.status === "Top Performer" ? "bg-emerald-50 text-emerald-600" :
                                       row.status === "Excellent" ? "bg-blue-50 text-blue-600" :
                                       "bg-slate-100 text-slate-500"
                                     }`}>{row.status}</span>
                                  </td>
                                  <td className="p-4">
                                     <button className="p-2 text-primary hover:bg-primary/5 rounded font-black text-[10px] uppercase tracking-widest">Detail View</button>
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

      </div>
    </div>
  );
};

export default TeacherDashboard;
