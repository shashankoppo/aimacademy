import React, { useMemo, useState } from "react";
import { Search, Plus, Download, Edit, Trash2, Eye, Users, BookOpen, Calendar, BarChart3, X, FileText, IndianRupee, Phone, Mail, Clock } from "lucide-react";
import { useAdminData, type Student, type FeeStatus } from "@/hooks/useAdminData";
import { uploadFile, API_BASE_URL } from "@/lib/admin-api";
import { getAttendanceColor } from "@/lib/academic-logic";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type StudentForm = Omit<Student, "id" | "remindersSent" | "lastReminderAt" | "courseId">;

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const initialForm = (): StudentForm => ({
  name: "",
  email: "",
  course: "",
  batch: "Morning",
  joinDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  feeStatus: "Paid",
  attendance: "100%",
  phone: "",
  totalFee: 0,
  paidFee: 0,
  nextInstallmentLabel: "Installment 1",
  nextInstallmentAmount: 0,
  nextDueDate: new Date().toISOString().slice(0, 10),
  customFeesJson: "[]",
  photoUrl: undefined,
  applicationFormUrl: undefined,
});

const CustomFeeManager = ({ student, onChange }: { student: any; onChange: (val: string) => void }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  let fees: { title: string; amount: number; isPaid: boolean }[] = [];
  try { fees = JSON.parse(student.customFeesJson || "[]"); } catch (e) {}

  const handleAdd = () => {
    if (!title || !amount) return;
    onChange(JSON.stringify([...fees, { title, amount: Number(amount), isPaid: false }]));
    setTitle(""); setAmount("");
  };
  const handleRemove = (i: number) => { const f = [...fees]; f.splice(i, 1); onChange(JSON.stringify(f)); };
  const togglePaid = (i: number) => { const f = [...fees]; f[i].isPaid = !f[i].isPaid; onChange(JSON.stringify(f)); };

  return (
    <div className="col-span-2 border border-slate-200 rounded-xl p-4 bg-slate-50">
      <Label className="text-sm font-bold text-slate-700 mb-3 block">Custom Fees &amp; Charges</Label>
      {fees.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {fees.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-white p-2.5 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={f.isPaid} onChange={() => togglePaid(i)} className="w-4 h-4 accent-primary" />
                <span className={`text-sm font-medium ${f.isPaid ? 'line-through text-slate-400' : 'text-slate-700'}`}>{f.title}</span>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Rs. {f.amount}</span>
                {f.isPaid && <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Paid</span>}
              </div>
              <button onClick={() => handleRemove(i)} className="text-red-400 hover:bg-red-50 p-1 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input placeholder="Fee title (e.g. Late Fine)" value={title} onChange={e => setTitle(e.target.value)} className="flex-1 bg-white text-sm" />
        <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-28 bg-white text-sm" />
        <button onClick={handleAdd} type="button" className="bg-slate-900 text-white px-3 rounded-lg hover:bg-slate-700 transition-colors"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

const StudentManagement = () => {
  const { students, courses, addStudent, updateStudent, deleteStudent, loading } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [newStudent, setNewStudent] = useState<StudentForm>(initialForm());
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editFormFile, setEditFormFile] = useState<File | null>(null);

  const courseTitles = courses.map(c => c.title);

  const filteredStudents = students.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.toLowerCase().includes(q);
    const matchCourse = courseFilter === "All Courses" || s.course === courseFilter;
    const matchStatus = statusFilter === "All Status" || s.feeStatus === statusFilter;
    return matchSearch && matchCourse && matchStatus;
  });

  const studentStats = useMemo(() => {
    const avg = students.length ? Math.round(students.reduce((s, st) => s + parseInt(st.attendance, 10), 0) / students.length) : 0;
    const pass = students.length ? Math.round((students.filter(st => parseInt(st.attendance, 10) >= 75).length / students.length) * 100) : 0;
    return { activeCourses: new Set(students.map(s => s.course)).size, averageAttendance: avg, passRate: pass };
  }, [students]);

  const populateFees = (courseTitle: string, target: StudentForm | Student) => {
    const match = courses.find(c => c.title === courseTitle);
    if (!match) return { ...target, course: courseTitle };
    const totalFee = Number(match.fee.replace(/[^\d]/g, "")) || 0;
    return { ...target, course: courseTitle, totalFee, paidFee: target.paidFee > totalFee ? totalFee : target.paidFee, nextInstallmentAmount: target.nextInstallmentAmount > totalFee ? totalFee : target.nextInstallmentAmount || totalFee };
  };

  const validateStudent = (student: StudentForm | Student, currentId?: number) => {
    if (!student.name.trim() || !student.course.trim() || !student.phone.trim()) return "Please fill in all required fields";
    if (!courseTitles.includes(student.course)) return "Please select an existing course";
    if (student.email && students.find(e => e.email.toLowerCase() === student.email.toLowerCase() && e.id !== currentId)) return "A student with this email already exists";
    if (students.find(e => e.phone === student.phone && e.id !== currentId)) return "A student with this phone already exists";
    return null;
  };

  const exportCsv = () => {
    const rows = [["Name","Email","Course","Batch","Attendance","Fee Status","Phone","Total Fee","Paid Fee"], ...filteredStudents.map(s => [s.name,s.email,s.course,s.batch,s.attendance,s.feeStatus,s.phone,s.totalFee,s.paidFee])];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="students.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const handleAddStudent = async () => {
    const submitData = { ...newStudent };
    if (!submitData.email) submitData.email = `student_${submitData.phone.replace(/\D/g, '')}@aim.edu`;
    if (!submitData.attendance) submitData.attendance = "100%";
    if (!submitData.nextDueDate) submitData.nextDueDate = new Date().toISOString().slice(0, 10);

    const err = validateStudent(submitData);
    if (err) { toast.error(err); return; }
    setIsCreating(true);
    try {
      let photoUrl = submitData.photoUrl;
      let applicationFormUrl = submitData.applicationFormUrl;
      if (photoFile) { const r = await uploadFile(photoFile); photoUrl = r.url; }
      if (formFile) { const r = await uploadFile(formFile); applicationFormUrl = r.url; }
      const payload = { ...submitData, photoUrl, applicationFormUrl } as StudentForm;
      await addStudent(payload);
      setNewStudent(initialForm()); setPhotoFile(null); setFormFile(null); setAddOpen(false);
      toast.success("Student added successfully");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to add student"); }
    finally { setIsCreating(false); }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    const submitData = { ...editingStudent };
    if (!submitData.email) submitData.email = `student_${submitData.phone.replace(/\D/g, '')}@aim.edu`;
    if (!submitData.attendance) submitData.attendance = "100%";
    if (!submitData.nextDueDate) submitData.nextDueDate = new Date().toISOString().slice(0, 10);

    const err = validateStudent(submitData, submitData.id);
    if (err) { toast.error(err); return; }
    setIsUpdating(true);
    try {
      let photoUrl = submitData.photoUrl;
      let applicationFormUrl = submitData.applicationFormUrl;
      if (editPhotoFile) { const r = await uploadFile(editPhotoFile); photoUrl = r.url; }
      if (editFormFile) { const r = await uploadFile(editFormFile); applicationFormUrl = r.url; }
      const payload = { ...submitData, photoUrl, applicationFormUrl } as Student;
      await updateStudent(submitData.id, payload);
      setEditingStudent(null); setEditPhotoFile(null); setEditFormFile(null);
      toast.success("Student updated successfully");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed to update student"); }
    finally { setIsUpdating(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try { await deleteStudent(id); toast.success("Student deleted"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Failed to delete student"); }
  };

  const getPhotoUrl = (url?: string | null) => url ? `${API_BASE_URL.replace('/api', '')}${url}` : null;

  const parseCustomFees = (json?: string | null): { title: string; amount: number; isPaid: boolean }[] => {
    try { return JSON.parse(json || "[]"); } catch { return []; }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Management</h1>
          <p className="text-slate-500 font-medium">View, manage, and track all enrolled students across batches.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCsv} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Enrolled", value: students.length.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Courses", value: studentStats.activeCourses.toString(), icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Avg Attendance", value: `${studentStats.averageAttendance}%`, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Pass Rate (75%+)", value: `${studentStats.passRate}%`, icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
            <div><div className="text-2xl font-black text-slate-900">{stat.value}</div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name, email, or phone..." className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm text-slate-600 focus:outline-none font-medium" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
            <option>All Courses</option>
            {courseTitles.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm text-slate-600 focus:outline-none font-medium" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Paid</option><option>Part Paid</option><option>Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Course &amp; Batch</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Attendance</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Fee Status</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Fee Progress</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {student.photoUrl ? (
                        <img src={getPhotoUrl(student.photoUrl)!} alt={student.name} className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all" onClick={() => setLightboxImg(getPhotoUrl(student.photoUrl)!)} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center font-bold text-slate-600 text-xs shadow-sm">
                          {student.name.split(" ").map(p => p[0]).join("").slice(0,2)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                        <p className="text-xs text-slate-400 font-medium">{student.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700">{student.course}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.batch} Batch</p>
                    <p className="text-[10px] text-slate-400">Joined: {student.joinDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getAttendanceColor(parseInt(student.attendance, 10))}`} style={{ width: student.attendance }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 tracking-wider">{student.attendance}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${ student.feeStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : student.feeStatus === "Overdue" ? "bg-red-50 text-red-600 border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100" }`}>
                      {student.feeStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-xs font-black text-slate-700">{fmt(student.paidFee)}<span className="text-slate-400 font-medium"> / {fmt(student.totalFee)}</span></div>
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: student.totalFee > 0 ? `${Math.min(100,(student.paidFee/student.totalFee)*100)}%` : '0%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingStudent(student)} title="View Details" className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setEditingStudent(student)} title="Edit" className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => void handleDelete(student.id)} title="Delete" className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredStudents.length === 0 && (
            <div className="p-20 text-center"><Users className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-bold">No students found.</p></div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]" onClick={() => setLightboxImg(null)}>
          <div className="relative max-w-lg w-full mx-4">
            <button className="absolute -top-10 right-0 text-white hover:text-slate-300 transition-colors" onClick={() => setLightboxImg(null)}><X className="w-8 h-8" /></button>
            <img src={lightboxImg} alt="Preview" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* View Student Dialog */}
      <Dialog open={Boolean(viewingStudent)} onOpenChange={open => !open && setViewingStudent(null)}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Student Profile</DialogTitle></DialogHeader>
          {viewingStudent && (() => {
            const customFees = parseCustomFees(viewingStudent.customFeesJson);
            const photoSrc = getPhotoUrl(viewingStudent.photoUrl);
            const formSrc = getPhotoUrl(viewingStudent.applicationFormUrl);
            const pending = Math.max(0, viewingStudent.totalFee - viewingStudent.paidFee);
            const paidPct = viewingStudent.totalFee > 0 ? Math.min(100,(viewingStudent.paidFee/viewingStudent.totalFee)*100) : 0;
            return (
              <div className="space-y-6 pt-2">
                {/* Profile Header */}
                <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                  {photoSrc ? (
                    <img src={photoSrc} alt={viewingStudent.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg cursor-pointer" onClick={() => setLightboxImg(photoSrc)} />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-2xl font-black text-primary">
                      {viewingStudent.name.split(" ").map(p => p[0]).join("").slice(0,2)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-900">{viewingStudent.name}</h2>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5"><Mail className="w-3.5 h-3.5" /> {viewingStudent.email}</p>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {viewingStudent.phone}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${ viewingStudent.feeStatus === "Paid" ? "bg-emerald-100 text-emerald-700" : viewingStudent.feeStatus === "Overdue" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700" }`}>{viewingStudent.feeStatus}</span>
                    </div>
                  </div>
                  <button onClick={() => { setViewingStudent(null); setEditingStudent(viewingStudent); }} className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"><Edit className="w-4 h-4" /></button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Course</p>
                    <p className="font-bold text-slate-800">{viewingStudent.course}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{viewingStudent.batch} Batch</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Attendance</p>
                    <p className="font-black text-2xl text-slate-900">{viewingStudent.attendance}</p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full rounded-full ${getAttendanceColor(parseInt(viewingStudent.attendance, 10))}`} style={{ width: viewingStudent.attendance }} />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Join Date</p>
                    <p className="font-bold text-slate-800">{viewingStudent.joinDate}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Next Due Date</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />{viewingStudent.nextDueDate}</p>
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200"><p className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><IndianRupee className="w-3.5 h-3.5" /> Fee Summary</p></div>
                  <div className="p-5">
                    <div className="flex justify-between mb-3">
                      <div><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Fee</p><p className="font-black text-slate-900 text-lg">{fmt(viewingStudent.totalFee)}</p></div>
                      <div className="text-right"><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Paid</p><p className="font-black text-emerald-600 text-lg">{fmt(viewingStudent.paidFee)}</p></div>
                      <div className="text-right"><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pending</p><p className={`font-black text-lg ${pending > 0 ? 'text-red-600' : 'text-slate-400'}`}>{fmt(pending)}</p></div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${paidPct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 font-bold">{paidPct.toFixed(1)}% paid — {viewingStudent.nextInstallmentLabel}: {fmt(viewingStudent.nextInstallmentAmount)}</p>
                  </div>
                </div>

                {/* Custom Fees */}
                {customFees.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200"><p className="text-xs font-black uppercase tracking-widest text-slate-500">Custom Fees &amp; Charges</p></div>
                    <div className="p-4 space-y-2">
                      {customFees.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className={`text-sm font-medium ${f.isPaid ? 'line-through text-slate-400' : 'text-slate-700'}`}>{f.title}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-700">{fmt(f.amount)}</span>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${f.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{f.isPaid ? 'Paid' : 'Unpaid'}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Custom Total</span>
                        <span className="text-sm font-black text-slate-800">{fmt(customFees.reduce((s, f) => s + f.amount, 0))}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Form Preview */}
                {formSrc && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200"><p className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Application Form</p></div>
                    <div className="p-4">
                      <img src={formSrc} alt="Application Form" className="w-full rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity max-h-64 object-contain bg-slate-100" onClick={() => setLightboxImg(formSrc)} />
                      <a href={formSrc} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 text-primary font-bold text-sm hover:underline"><FileText className="w-4 h-4" /> Open Full Size</a>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 col-span-2"><Label>Full Name *</Label><Input value={newStudent.name} onChange={e => setNewStudent({...newStudent,name:e.target.value})} placeholder="Enter full name" /></div>
              <div className="grid gap-2 col-span-2"><Label>Phone *</Label><Input value={newStudent.phone} onChange={e => setNewStudent({...newStudent,phone:e.target.value})} placeholder="+91 XXXXX XXXXX" /></div>
              <div className="grid gap-2 col-span-2"><Label>Course *</Label><Select onValueChange={v => setNewStudent(populateFees(v,newStudent) as StudentForm)} value={newStudent.course}><SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{courseTitles.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Batch</Label><Select onValueChange={v => setNewStudent({...newStudent,batch:v})} value={newStudent.batch}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Morning">Morning</SelectItem><SelectItem value="Evening">Evening</SelectItem><SelectItem value="Weekend">Weekend</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Fee Status</Label><Select value={newStudent.feeStatus} onValueChange={(v: FeeStatus) => setNewStudent({...newStudent,feeStatus:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Part Paid">Part Paid</SelectItem><SelectItem value="Overdue">Overdue</SelectItem></SelectContent></Select></div>
              <div className="grid gap-2"><Label>Total Fee (Rs.)</Label><Input type="number" value={newStudent.totalFee} onChange={e => setNewStudent({...newStudent,totalFee:Number(e.target.value)})} /></div>
              <div className="grid gap-2"><Label>Amount Paid (Rs.)</Label><Input type="number" value={newStudent.paidFee} onChange={e => setNewStudent({...newStudent,paidFee:Number(e.target.value)})} /></div>
              <div className="grid gap-2"><Label>Student Photo</Label><Input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} /></div>
              <div className="grid gap-2"><Label>Application Form Image</Label><Input type="file" accept="image/*,application/pdf" onChange={e => setFormFile(e.target.files?.[0] || null)} /></div>
              <CustomFeeManager student={newStudent} onChange={v => setNewStudent({...newStudent,customFeesJson:v})} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => void handleAddStudent()} disabled={isCreating} className="w-full bg-primary text-white font-bold py-3 rounded-xl disabled:opacity-60 hover:opacity-90 transition-opacity">
              {isCreating ? "Saving..." : "Save Student"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={Boolean(editingStudent)} onOpenChange={open => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
          {editingStudent && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2 col-span-2"><Label>Full Name</Label><Input value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent,name:e.target.value})} /></div>
                  <div className="grid gap-2 col-span-2"><Label>Phone</Label><Input value={editingStudent.phone} onChange={e => setEditingStudent({...editingStudent,phone:e.target.value})} /></div>
                  <div className="grid gap-2 col-span-2"><Label>Course</Label><Select value={editingStudent.course} onValueChange={v => setEditingStudent(populateFees(v,editingStudent) as Student)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courseTitles.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid gap-2"><Label>Batch</Label><Select value={editingStudent.batch} onValueChange={v => setEditingStudent({...editingStudent,batch:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Morning">Morning</SelectItem><SelectItem value="Evening">Evening</SelectItem><SelectItem value="Weekend">Weekend</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label>Fee Status</Label><Select value={editingStudent.feeStatus} onValueChange={(v: FeeStatus) => setEditingStudent({...editingStudent,feeStatus:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Part Paid">Part Paid</SelectItem><SelectItem value="Overdue">Overdue</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label>Total Fee (Rs.)</Label><Input type="number" value={editingStudent.totalFee} onChange={e => setEditingStudent({...editingStudent,totalFee:Number(e.target.value)})} /></div>
                  <div className="grid gap-2"><Label>Amount Paid (Rs.)</Label><Input type="number" value={editingStudent.paidFee} onChange={e => setEditingStudent({...editingStudent,paidFee:Number(e.target.value)})} /></div>
                  <div className="grid gap-2">
                    <Label>Update Student Photo</Label>
                    <Input type="file" accept="image/*" onChange={e => setEditPhotoFile(e.target.files?.[0] || null)} />
                    {editingStudent.photoUrl && !editPhotoFile && <p className="text-xs text-emerald-600 font-bold">✓ Photo already uploaded</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label>Update Application Form</Label>
                    <Input type="file" accept="image/*,application/pdf" onChange={e => setEditFormFile(e.target.files?.[0] || null)} />
                    {editingStudent.applicationFormUrl && !editFormFile && <p className="text-xs text-emerald-600 font-bold">✓ Form already uploaded</p>}
                  </div>
                  <CustomFeeManager student={editingStudent} onChange={v => setEditingStudent({...editingStudent,customFeesJson:v})} />
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => void handleUpdateStudent()} disabled={isUpdating} className="w-full bg-primary text-white font-bold py-3 rounded-xl disabled:opacity-60 hover:opacity-90">
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagement;
