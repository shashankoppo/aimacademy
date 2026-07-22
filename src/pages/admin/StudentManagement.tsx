import React, { useMemo, useState } from "react";
import { Search, Plus, Download, Edit, Trash2, Eye, Users, BookOpen, Calendar, BarChart3 } from "lucide-react";
import { useAdminData, type Student, type FeeStatus } from "@/hooks/useAdminData";
import { uploadFile, API_BASE_URL } from "@/lib/admin-api";
import { getAttendanceColor } from "@/lib/academic-logic";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type StudentForm = Omit<Student, "id" | "remindersSent" | "lastReminderAt" | "courseId">;

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
});

const CustomFeeManager = ({ student, onChange }: { student: any, onChange: (val: string) => void }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  let fees: { title: string; amount: number; isPaid: boolean }[] = [];
  try { fees = JSON.parse(student.customFeesJson || "[]"); } catch (e) {}

  const handleAdd = () => {
    if (!title || !amount) return;
    const newFees = [...fees, { title, amount: Number(amount), isPaid: false }];
    onChange(JSON.stringify(newFees));
    setTitle("");
    setAmount("");
  };

  const handleRemove = (index: number) => {
    const newFees = [...fees];
    newFees.splice(index, 1);
    onChange(JSON.stringify(newFees));
  };

  const togglePaid = (index: number) => {
    const newFees = [...fees];
    newFees[index].isPaid = !newFees[index].isPaid;
    onChange(JSON.stringify(newFees));
  };

  return (
    <div className="grid gap-2 col-span-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
      <Label className="text-sm font-bold text-slate-700">Custom Fees & Charges</Label>
      {fees.length > 0 && (
        <div className="flex flex-col gap-2 mb-2">
          {fees.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-md">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={f.isPaid} onChange={() => togglePaid(i)} className="w-4 h-4 accent-primary" />
                <span className={`text-sm font-medium ${f.isPaid ? 'line-through text-slate-400' : 'text-slate-700'}`}>{f.title}</span>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Rs. {f.amount}</span>
              </div>
              <button onClick={() => handleRemove(i)} className="text-red-500 hover:bg-red-50 p-1 rounded-md"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input placeholder="Fee title (e.g. Late Fine)" value={title} onChange={e => setTitle(e.target.value)} className="flex-1 bg-white" />
        <Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-24 bg-white" />
        <button onClick={handleAdd} type="button" className="bg-slate-900 text-white px-3 rounded-lg hover:bg-slate-800"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

const StudentManagement = () => {
  const { students, courses, addStudent, updateStudent, deleteStudent, loading } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [newStudent, setNewStudent] = useState<StudentForm>(initialForm);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editFormFile, setEditFormFile] = useState<File | null>(null);

  const courseTitles = courses.map((course) => course.title);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === "All Courses" || student.course === courseFilter;
    const matchesStatus = statusFilter === "All Status" || student.feeStatus === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const studentStats = useMemo(() => {
    const averageAttendance = students.length
      ? Math.round(students.reduce((sum, student) => sum + parseInt(student.attendance, 10), 0) / students.length)
      : 0;
    const passRate = students.length
      ? Math.round((students.filter((student) => parseInt(student.attendance, 10) >= 75).length / students.length) * 100)
      : 0;

    return {
      activeCourses: new Set(students.map((student) => student.course)).size,
      averageAttendance,
      passRate,
    };
  }, [students]);

  const populateFees = (courseTitle: string, target: StudentForm | Student) => {
    const matchingCourse = courses.find((course) => course.title === courseTitle);
    if (!matchingCourse) return target;
    const totalFee = Number(matchingCourse.fee.replace(/[^\d]/g, "")) || 0;
    return {
      ...target,
      course: courseTitle,
      totalFee,
      paidFee: target.paidFee > totalFee ? totalFee : target.paidFee,
      nextInstallmentAmount: target.nextInstallmentAmount > totalFee ? totalFee : target.nextInstallmentAmount || totalFee,
    };
  };

  const validateStudent = (student: StudentForm | Student, currentId?: number) => {
    if (!student.name.trim() || !student.email.trim() || !student.course.trim() || !student.phone.trim()) {
      return "Please fill in all required fields";
    }

    if (!courseTitles.includes(student.course)) {
      return "Please select an existing course";
    }

    const duplicateEmail = students.find((entry) => entry.email.toLowerCase() === student.email.toLowerCase() && entry.id !== currentId);
    if (duplicateEmail) {
      return "A student with this email already exists";
    }

    const duplicatePhone = students.find((entry) => entry.phone === student.phone && entry.id !== currentId);
    if (duplicatePhone) {
      return "A student with this phone number already exists";
    }

    return null;
  };

  const exportCsv = () => {
    const rows = [
      ["Name", "Email", "Course", "Batch", "Attendance", "Fee Status", "Phone"],
      ...filteredStudents.map((student) => [student.name, student.email, student.course, student.batch, student.attendance, student.feeStatus, student.phone]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "students.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleAddStudent = async () => {
    const validationError = validateStudent(newStudent);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsCreating(true);
    try {
      let photoUrl = newStudent.photoUrl;
      let applicationFormUrl = newStudent.applicationFormUrl;

      if (photoFile) {
        const res = await uploadFile(photoFile);
        photoUrl = res.url;
      }
      if (formFile) {
        const res = await uploadFile(formFile);
        applicationFormUrl = res.url;
      }

      const payload = populateFees(newStudent.course, { ...newStudent, photoUrl, applicationFormUrl }) as StudentForm;
      await addStudent(payload);
      setNewStudent(initialForm());
      setPhotoFile(null);
      setFormFile(null);
      toast.success("Student added successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add student");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    const validationError = validateStudent(editingStudent, editingStudent.id);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUpdating(true);
    try {
      let photoUrl = editingStudent.photoUrl;
      let applicationFormUrl = editingStudent.applicationFormUrl;

      if (editPhotoFile) {
        const res = await uploadFile(editPhotoFile);
        photoUrl = res.url;
      }
      if (editFormFile) {
        const res = await uploadFile(editFormFile);
        applicationFormUrl = res.url;
      }

      const payload = populateFees(editingStudent.course, { ...editingStudent, photoUrl, applicationFormUrl }) as Student;
      await updateStudent(editingStudent.id, payload);
      setEditingStudent(null);
      setEditPhotoFile(null);
      setEditFormFile(null);
      toast.success("Student updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update student");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteStudent(id);
      toast.success("Student deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete student");
    }
  };

  const updateFormFeeStatus = (feeStatus: FeeStatus, totalFee: number, paidFee: number) => {
    if (feeStatus === "Paid") return totalFee;
    if (feeStatus === "Part Paid") return paidFee || Math.max(1, Math.floor(totalFee / 2));
    return Math.min(paidFee, totalFee ? totalFee - 1 : paidFee);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Management</h1>
          <p className="text-slate-500 font-medium">View, manage, and track all enrolled students across batches.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
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
                  <Input id="name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Course</Label>
                  <Select onValueChange={(value) => setNewStudent(populateFees(value, newStudent) as StudentForm)} value={newStudent.course}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseTitles.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Batch</Label>
                    <Select onValueChange={(value) => setNewStudent({ ...newStudent, batch: value })} value={newStudent.batch}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Weekend">Weekend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Student Photo</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Application Form Image</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setFormFile(e.target.files?.[0] || null)} />
                  </div>
                  <CustomFeeManager student={newStudent} onChange={(val) => setNewStudent({ ...newStudent, customFeesJson: val })} />
                </div>
              </div>
              <DialogFooter>
                <button onClick={handleAddStudent} disabled={isCreating} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
                  {isCreating ? "Saving..." : "Save Student"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Enrolled", value: students.length.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Courses", value: studentStats.activeCourses.toString(), icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Avg Attendance", value: `${studentStats.averageAttendance}%`, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Pass Rate", value: `${studentStats.passRate}%`, icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50" },
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

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm text-slate-600 focus:outline-none"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option>All Courses</option>
            {courseTitles.map((title) => (
              <option key={title}>{title}</option>
            ))}
          </select>
          <select
            className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm text-slate-600 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Paid</option>
            <option>Part Paid</option>
            <option>Overdue</option>
          </select>
        </div>
      </div>

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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm">
                        {student.name.split(" ").map((part) => part[0]).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-700">{student.course}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.batch} Batch</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getAttendanceColor(parseInt(student.attendance, 10))}`} style={{ width: student.attendance }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 tracking-wider transition-colors group-hover:text-primary">
                        {student.attendance} ATTENDANCE
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        student.feeStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : student.feeStatus === "Overdue"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      {student.feeStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingStudent(student)} className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingStudent(student)} className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => void handleDelete(student.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredStudents.length === 0 && (
            <div className="p-20 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No students found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={Boolean(viewingStudent)} onOpenChange={(open) => !open && setViewingStudent(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="grid grid-cols-2 gap-4 text-sm py-4">
              {viewingStudent.photoUrl && (
                <div className="col-span-2 flex justify-center mb-4">
                  <img src={`${API_BASE_URL.replace('/api', '')}${viewingStudent.photoUrl}`} alt="Student Photo" className="w-24 h-24 object-cover rounded-full border-4 border-slate-100 shadow-md" />
                </div>
              )}
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Name</p>
                <p className="font-bold text-slate-800">{viewingStudent.name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Phone</p>
                <p className="font-bold text-slate-800">{viewingStudent.phone}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Course</p>
                <p className="font-bold text-slate-800">{viewingStudent.course}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Batch</p>
                <p className="font-bold text-slate-800">{viewingStudent.batch}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fee Progress</p>
                <p className="font-bold text-slate-800">Rs. {viewingStudent.paidFee.toLocaleString("en-IN")} / Rs. {viewingStudent.totalFee.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Next Due Date</p>
                <p className="font-bold text-slate-800">{viewingStudent.nextDueDate}</p>
              </div>

              {viewingStudent.applicationFormUrl && (
                <div className="col-span-2 mt-2 pt-4 border-t border-slate-100">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Application Form</p>
                  <a href={`${API_BASE_URL.replace('/api', '')}${viewingStudent.applicationFormUrl}`} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">
                    View Uploaded Form
                  </a>
                </div>
              )}
              
              {viewingStudent.customFeesJson && viewingStudent.customFeesJson !== "[]" && (
                <div className="col-span-2 mt-2 pt-4 border-t border-slate-100">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Custom Fees & Charges</p>
                  <div className="flex flex-col gap-2">
                    {(() => {
                      try {
                        const fees = JSON.parse(viewingStudent.customFeesJson);
                        return fees.map((f: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                            <span className={`text-sm font-medium ${f.isPaid ? 'line-through text-slate-400' : 'text-slate-700'}`}>{f.title}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-500">Rs. {f.amount}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {f.isPaid ? 'Paid' : 'Unpaid'}
                              </span>
                            </div>
                          </div>
                        ));
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingStudent)} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Full Name</Label>
                  <Input value={editingStudent.name} onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={editingStudent.email} onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Course</Label>
                  <Select value={editingStudent.course} onValueChange={(value) => setEditingStudent(populateFees(value, editingStudent) as Student)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {courseTitles.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Batch</Label>
                    <Select value={editingStudent.batch} onValueChange={(value) => setEditingStudent({ ...editingStudent, batch: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Weekend">Weekend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Fee Status</Label>
                    <Select
                      value={editingStudent.feeStatus}
                      onValueChange={(value: FeeStatus) =>
                        setEditingStudent({
                          ...editingStudent,
                          feeStatus: value,
                          paidFee: updateFormFeeStatus(value, editingStudent.totalFee, editingStudent.paidFee),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Part Paid">Part Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Attendance</Label>
                    <Input value={editingStudent.attendance} onChange={(e) => setEditingStudent({ ...editingStudent, attendance: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={editingStudent.phone} onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Student Photo (Update)</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setEditPhotoFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Application Form (Update)</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setEditFormFile(e.target.files?.[0] || null)} />
                  </div>
                  <CustomFeeManager student={editingStudent} onChange={(val) => setEditingStudent({ ...editingStudent, customFeesJson: val })} />
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => void handleUpdateStudent()} disabled={isUpdating} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
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
