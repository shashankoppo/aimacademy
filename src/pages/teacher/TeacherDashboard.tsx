import React, { useEffect, useMemo, useState } from "react";
import { 
  Users, BookOpen, Plus, FileText, BarChart3, 
  Calendar, CheckCircle2, ChevronRight, GraduationCap, 
  Search, Filter, Trash2, Edit, Save, ArrowRight, Clock
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest, getStoredUser } from "@/lib/admin-api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TeacherTab = "assign" | "tests" | "performance";

type AdminCourse = { id: number; title: string };
type AdminStudent = { id: number; name: string; email: string; phone: string; batch: string; course: string; courseId?: number | null };
type TeacherMockTest = {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  questionCount: number;
  isPublished: boolean;
  courseId: number | null;
  courseTitle: string | null;
  batch: string | null;
};
type LeaderboardRow = { studentId: number; name: string; avgPct: string; testsTaken: number; status: string };
type TeacherResource = { id: string; title: string; description: string; url: string; courseId: number | null; batch: string | null; isPublished: boolean };

type AssignMode = "batch" | "student";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState<TeacherTab>("assign");
  const user = getStoredUser();

  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [tests, setTests] = useState<TeacherMockTest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  const [assignMode, setAssignMode] = useState<AssignMode>("batch");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedBatches, setSelectedBatches] = useState<Set<string>>(new Set());
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [studentSearch, setStudentSearch] = useState("");

  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TeacherMockTest | null>(null);
  const [savingTest, setSavingTest] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [testForm, setTestForm] = useState({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    durationMinutes: 60,
    questionCount: 50,
    courseId: null as number | null,
    batch: "",
  });

  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    url: "",
    courseId: null as number | null,
    batch: "",
    isPublished: true,
  });

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

    const testResp = await apiRequest<{ success: true; tests: TeacherMockTest[] }>("/teacher/mock-tests");
    setTests(testResp.tests);

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

  const openCreateTest = () => {
    setEditingTest(null);
    setTestForm({
      title: "",
      date: new Date().toISOString().slice(0, 10),
      durationMinutes: 60,
      questionCount: 50,
      courseId: selectedCourseId,
      batch: "",
    });
    setTestDialogOpen(true);
  };

  const openEditTest = (t: TeacherMockTest) => {
    setEditingTest(t);
    const date = new Date(t.scheduledAt).toISOString().slice(0, 10);
    setTestForm({
      title: t.title,
      date,
      durationMinutes: t.durationMinutes,
      questionCount: t.questionCount,
      courseId: t.courseId,
      batch: t.batch ?? "",
    });
    setTestDialogOpen(true);
  };

  const saveTest = async () => {
    try {
      if (!testForm.title.trim()) {
        toast.error("Please enter a test title.");
        return;
      }

      setSavingTest(true);
      const scheduledAt = new Date(`${testForm.date}T09:00:00.000Z`).toISOString();
      const payload = {
        title: testForm.title,
        scheduledAt,
        durationMinutes: testForm.durationMinutes,
        questionCount: testForm.questionCount,
        courseId: testForm.courseId,
        batch: testForm.batch.trim() || null,
      };

      if (editingTest) {
        await apiRequest<{ success: true }>(`/teacher/mock-tests/${editingTest.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest<{ success: true }>("/teacher/mock-tests", { method: "POST", body: JSON.stringify(payload) });
      }

      const testResp = await apiRequest<{ success: true; tests: TeacherMockTest[] }>("/teacher/mock-tests");
      setTests(testResp.tests);
      setTestDialogOpen(false);
      toast.success(editingTest ? "Mock test updated." : "Mock test created.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save mock test");
    } finally {
      setSavingTest(false);
    }
  };

  const deleteTest = async (t: TeacherMockTest) => {
    try {
      await apiRequest<{ success: true }>(`/teacher/mock-tests/${t.id}`, { method: "DELETE" });
      setTests((prev) => prev.filter((x) => x.id !== t.id));
      toast.success("Mock test deleted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete mock test");
    }
  };

  const publishAllResults = async () => {
    try {
      setPublishing(true);
      const resp = await apiRequest<{ success: true; publishedTests: number; publishedAttempts: number }>("/teacher/publish-results", {
        method: "POST",
      });
      toast.success(`Published ${resp.publishedAttempts} result(s) across ${resp.publishedTests} test(s).`);
      const lbResp = await apiRequest<{ success: true; leaderboard: LeaderboardRow[] }>("/teacher/analytics");
      setLeaderboard(lbResp.leaderboard);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to publish results");
    } finally {
      setPublishing(false);
    }
  };

  const openCreateResource = () => {
    setResourceForm({ title: "", description: "", url: "", courseId: selectedCourseId, batch: "", isPublished: true });
    setResourceDialogOpen(true);
  };

  const saveResource = async () => {
    try {
      if (!resourceForm.title.trim() || !resourceForm.description.trim() || !resourceForm.url.trim()) {
        toast.error("Please fill all resource fields.");
        return;
      }
      await apiRequest<{ success: true; resource: TeacherResource }>("/teacher/resources", {
        method: "POST",
        body: JSON.stringify({
          title: resourceForm.title,
          description: resourceForm.description,
          url: resourceForm.url,
          courseId: resourceForm.courseId,
          batch: resourceForm.batch.trim() || null,
          isPublished: resourceForm.isPublished,
        }),
      });
      setResourceDialogOpen(false);
      toast.success("Resource created and published to students.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create resource");
    }
  };

  const tabs: { id: TeacherTab; label: string; icon: typeof BookOpen }[] = [
    { id: "assign", label: "Assign Courses", icon: BookOpen },
    { id: "tests", label: "Mock Test Manager", icon: FileText },
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
          <div className="flex gap-4">
             <button onClick={openCreateResource} className="flex items-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded hover:bg-slate-800 transition-all">
                <Plus className="w-4 h-4" /> Create Resource
             </button>
             <button onClick={() => void publishAllResults()} disabled={publishing} className="btn-coursera py-3 disabled:opacity-60">
               {publishing ? "Publishing..." : "Publish Results"}
             </button>
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

             {activeTab === "tests" && (
               <div className="bg-white rounded-xl border border-slate-100 p-8">
                  <div className="flex justify-between items-center mb-8">
                     <h2 className="heading-display text-xl">Manage Mock Tests</h2>
                     <button onClick={openCreateTest} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest">
                        <Plus className="w-4 h-4" /> Create New Test
                     </button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {tests.map((test) => (
                       <div key={test.id} className="p-6 rounded-xl border border-slate-100 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-4">
                             <div className="p-2 rounded bg-surface-accent text-primary">
                                <FileText className="w-5 h-5" />
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => openEditTest(test)} aria-label="Edit test" className="p-1.5 hover:bg-slate-50 text-slate-400 rounded"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => void deleteTest(test)} aria-label="Delete test" className="p-1.5 hover:bg-red-50 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </div>
                          <h4 className="font-bold text-slate-900 mb-4">{test.title}</h4>
                          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {test.questionCount} Qs</span>
                             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.durationMinutes}m</span>
                             <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(test.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}</span>
                          </div>
                          <button className="mt-6 w-full py-2 bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded hover:bg-primary hover:text-white transition-all">Live Evaluation</button>
                       </div>
                     ))}
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

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTest ? "Edit Mock Test" : "Create New Mock Test"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Test Title</Label>
              <Input value={testForm.title} onChange={(e) => setTestForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={testForm.date} onChange={(e) => setTestForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Duration (Minutes)</Label>
                <Input
                  type="number"
                  value={testForm.durationMinutes}
                  onChange={(e) => setTestForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Questions</Label>
                <Input
                  type="number"
                  value={testForm.questionCount}
                  onChange={(e) => setTestForm((p) => ({ ...p, questionCount: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Batch (Optional)</Label>
                <Input value={testForm.batch} onChange={(e) => setTestForm((p) => ({ ...p, batch: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => void saveTest()} disabled={savingTest} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
              {savingTest ? "Saving..." : editingTest ? "Save Changes" : "Create Test"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Resource</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={resourceForm.title} onChange={(e) => setResourceForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={resourceForm.description}
                onChange={(e) => setResourceForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>URL / File Path</Label>
              <Input value={resourceForm.url} onChange={(e) => setResourceForm((p) => ({ ...p, url: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => void saveResource()} className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg">
              Publish Resource
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
