import React, { useMemo, useState } from "react";
import { Plus, BookOpen, Users, Calendar, Edit, Trash2, Eye, GraduationCap, UserPlus } from "lucide-react";
import { useAdminData, type Course } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CourseForm = Omit<Course, "id">;

const emptyCourse: CourseForm = {
  title: "",
  students: 0,
  faculty: "",
  status: "Active",
  duration: "",
  fee: "",
};

const CourseManagement = () => {
  const { courses, students, addCourse, updateCourse, deleteCourse } = useAdminData();
  const [newCourse, setNewCourse] = useState<CourseForm>(emptyCourse);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [assigningCourse, setAssigningCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const stats = useMemo(() => {
    const active = courses.filter((course) => course.status === "Active").length;
    const batches = new Set(students.map((student) => `${student.course}-${student.batch}`)).size;
    const faculty = new Set(courses.map((course) => course.faculty)).size;
    return { active, batches, faculty };
  }, [courses, students]);

  const validateCourse = (course: CourseForm | Course, currentId?: number) => {
    if (!course.title.trim() || !course.faculty.trim() || !course.duration.trim() || !course.fee.trim()) {
      return "Please fill in all required fields";
    }

    const duplicate = courses.find((entry) => entry.title.toLowerCase() === course.title.toLowerCase() && entry.id !== currentId);
    if (duplicate) {
      return "A course with this title already exists";
    }

    return null;
  };

  const exportSummary = () => {
    const rows = [
      ["Course", "Students", "Faculty", "Status", "Duration", "Fee"],
      ...courses.map((course) => [course.title, course.students, course.faculty, course.status, course.duration, course.fee]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "courses.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCourse = async () => {
    const error = validateCourse(newCourse);
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    try {
      await addCourse(newCourse);
      setNewCourse(emptyCourse);
      toast.success("Course created successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    const error = validateCourse(editingCourse, editingCourse.id);
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    try {
      await updateCourse(editingCourse.id, editingCourse);
      setEditingCourse(null);
      toast.success("Course updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update course");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!confirm("Archive this course? Students linked to it must already be reassigned.")) return;
    try {
      await deleteCourse(course.id);
      toast.success("Course archived successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to archive course");
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Course Management</h1>
          <p className="text-slate-500 font-medium">Manage course lifecycle, batches, faculty allocation, and enrollment.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={exportSummary} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <BookOpen className="w-4 h-4" /> Export CSV
          </button>

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
                  <Label>Course Title</Label>
                  <Input value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Lead Faculty</Label>
                  <Input value={newCourse.faculty} onChange={(e) => setNewCourse({ ...newCourse, faculty: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={newCourse.status} onValueChange={(value: Course["status"]) => setNewCourse({ ...newCourse, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Duration</Label>
                  <Input placeholder="e.g. 12 Months" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Fee Amount</Label>
                  <Input placeholder="Rs. 120000" value={newCourse.fee} onChange={(e) => setNewCourse({ ...newCourse, fee: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <button onClick={handleAddCourse} disabled={isSaving} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
                  {isSaving ? "Saving..." : "Create Course"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Active Courses", value: stats.active.toString(), icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Batches", value: stats.batches.toString(), icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Enrolled Students", value: students.length.toString(), icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Faculty Assigned", value: stats.faculty.toString(), icon: GraduationCap, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No courses found</h3>
          <p>Click "Create Course" to add your first course.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const linkedStudents = students.filter((student) => student.course === course.title);
            return (
            <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group border-b-4 border-b-primary/10">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      course.status === "Active"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : course.status === "Upcoming"
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "bg-slate-50 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-tighter">Faculty: {course.faculty}</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Students</div>
                    <div className="font-black text-slate-900">{course.students}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Duration</div>
                    <div className="font-black text-slate-900 text-[11px] truncate">{course.duration}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl mb-6">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Enrollment Fee</span>
                  <span className="font-black text-slate-900">{course.fee}</span>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button aria-label="View course" onClick={() => setViewingCourse(course)} className="flex-1 p-2 flex justify-center items-center text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button aria-label="Edit course" onClick={() => setEditingCourse(course)} className="flex-1 p-2 flex justify-center items-center text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button aria-label="Assign students" onClick={() => setAssigningCourse(course)} className="flex-1 p-2 flex justify-center items-center text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button aria-label="Archive" onClick={() => void handleDeleteCourse(course)} className="flex-1 p-2 flex justify-center items-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="hidden">{linkedStudents.length}</div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={Boolean(viewingCourse)} onOpenChange={(open) => !open && setViewingCourse(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Course Overview</DialogTitle>
          </DialogHeader>
          {viewingCourse && (
            <div className="space-y-4 py-4 text-sm">
              <div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Course</p>
                <p className="font-bold text-slate-800">{viewingCourse.title}</p>
              </div>
              <div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Assigned Students</p>
                <p className="font-bold text-slate-800">{students.filter((student) => student.course === viewingCourse.title).map((student) => student.name).join(", ") || "No students assigned"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(assigningCourse)} onOpenChange={(open) => !open && setAssigningCourse(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Assigned Students</DialogTitle>
          </DialogHeader>
          {assigningCourse && (
            <div className="space-y-3 py-4">
              {students.filter((student) => student.course === assigningCourse.title).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{student.batch} Batch</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{student.feeStatus}</span>
                </div>
              ))}
              {students.filter((student) => student.course === assigningCourse.title).length === 0 && (
                <p className="text-sm font-bold text-slate-400">No students are currently linked to this course.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingCourse)} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Course Title</Label>
                  <Input value={editingCourse.title} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Lead Faculty</Label>
                  <Input value={editingCourse.faculty} onChange={(e) => setEditingCourse({ ...editingCourse, faculty: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={editingCourse.status} onValueChange={(value: Course["status"]) => setEditingCourse({ ...editingCourse, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Duration</Label>
                  <Input value={editingCourse.duration} onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Fee Amount</Label>
                  <Input value={editingCourse.fee} onChange={(e) => setEditingCourse({ ...editingCourse, fee: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => void handleUpdateCourse()} disabled={isSaving} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
