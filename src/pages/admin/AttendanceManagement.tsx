import React, { useMemo, useState } from "react";
import { Search, Calendar, Users, Download, CheckCircle2, UserCheck, Edit2, Check, X } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { getAttendanceStatus, getAttendanceColor } from "@/lib/academic-logic";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AttendanceManagement = () => {
  const { students, staff, updateStudent, markAttendance } = useAdminData();
  const [viewMode, setViewMode] = useState<"students" | "staff">("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAttendance, setEditingAttendance] = useState<typeof students[0] | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStaff = staff.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const avg = students.length ? Math.round(students.reduce((s, st) => s + parseInt(st.attendance, 10), 0) / students.length) : 0;
    const absent = students.filter(s => parseInt(s.attendance, 10) < 75).length;
    const presentStaff = staff.filter(m => m.attendanceStatus === "Present").length;
    const excellent = students.filter(s => parseInt(s.attendance, 10) >= 90).length;
    return { avg, absent, presentStaff, excellent };
  }, [students, staff]);

  const exportAttendance = () => {
    const rows = viewMode === "students"
      ? [["Student","Course","Batch","Attendance %","Category"], ...filteredStudents.map(s => [s.name, s.course, s.batch, s.attendance, getAttendanceStatus(parseInt(s.attendance, 10))])]
      : [["Staff","Role","Status","Clock In","Clock Out"], ...filteredStaff.map(m => [m.name, m.role, m.attendanceStatus, m.clockIn, m.clockOut])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${viewMode}-attendance.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const handleMarkToday = async () => {
    try { await markAttendance(); toast.success("Today's attendance has been synced"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to mark attendance"); }
  };

  const handleMarkPresent = async (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const current = parseInt(student.attendance, 10);
    const newVal = Math.min(100, current + 4);
    try {
      await updateStudent(studentId, { attendance: `${newVal}%` });
      toast.success(`Marked present — attendance now ${newVal}%`);
    } catch (e) { toast.error("Failed to update attendance"); }
  };

  const handleMarkAbsent = async (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const current = parseInt(student.attendance, 10);
    const newVal = Math.max(0, current - 4);
    try {
      await updateStudent(studentId, { attendance: `${newVal}%` });
      toast.success(`Marked absent — attendance now ${newVal}%`);
    } catch (e) { toast.error("Failed to update attendance"); }
  };

  const openEditDialog = (student: typeof students[0]) => {
    setEditingAttendance(student);
    setEditValue(student.attendance.replace("%", ""));
  };

  const handleSaveAttendance = async () => {
    if (!editingAttendance) return;
    const val = Math.min(100, Math.max(0, Number(editValue)));
    if (isNaN(val)) { toast.error("Enter a valid percentage"); return; }
    setIsSaving(true);
    try {
      await updateStudent(editingAttendance.id, { attendance: `${val}%` });
      toast.success(`Attendance updated to ${val}%`);
      setEditingAttendance(null);
    } catch (e) { toast.error("Failed to update attendance"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Attendance Tracker</h1>
          <p className="text-slate-500 font-medium">Track and manage student &amp; staff attendance with analytics.</p>
          <p className="text-xs text-slate-400 font-bold mt-1">{today}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportAttendance} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button onClick={() => void handleMarkToday()} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <Calendar className="w-4 h-4" /> Sync Today
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Avg Attendance", value: `${stats.avg}%`, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Below 75% (At Risk)", value: stats.absent.toString(), icon: Users, color: "text-red-600", bg: "bg-red-50" },
          { label: "Staff Present", value: `${stats.presentStaff} / ${staff.length}`, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Excellent (90%+)", value: stats.excellent.toString(), icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
            <p className="text-slate-400 font-black tracking-widest text-[9px] uppercase mb-2">{stat.label}</p>
            <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Mode & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="flex p-1.5 bg-slate-100 rounded-xl w-full md:w-auto">
          <button onClick={() => setViewMode("students")} className={`flex-1 md:flex-none py-2 px-6 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${ viewMode === "students" ? "bg-white text-primary shadow-sm" : "text-slate-500" }`}>Students</button>
          <button onClick={() => setViewMode("staff")} className={`flex-1 md:flex-none py-2 px-6 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${ viewMode === "staff" ? "bg-white text-primary shadow-sm" : "text-slate-500" }`}>Staff</button>
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name, batch, course, or role..." className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {viewMode === "students" ? (
            <>
              <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Batch</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Days (P/A)</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Attendance Rate</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Category</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Mark Today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map(student => {
                  const rate = parseInt(student.attendance, 10);
                  const status = getAttendanceStatus(rate);
                  const present = Math.round((rate / 100) * 25);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs">{student.name.charAt(0)}</div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{student.name}</span>
                            <p className="text-xs text-slate-400">{student.course}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-500">{student.batch}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-4">
                          <span className="text-xs font-black text-emerald-600">{present}P</span>
                          <span className="text-xs font-black text-red-400">{25 - present}A</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${getAttendanceColor(rate)}`} style={{ width: student.attendance }} />
                          </div>
                          <span className="font-black text-slate-900 text-xs">{student.attendance}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${ status === "Excellent" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : status === "Regular" ? "bg-blue-50 text-blue-600 border border-blue-100" : status === "At Risk" ? "bg-red-50 text-red-600 border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100" }`}>{status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => void handleMarkPresent(student.id)} title="Mark Present" className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => void handleMarkAbsent(student.id)} title="Mark Absent" className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-all">
                            <X className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEditDialog(student)} title="Edit Attendance %" className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="p-20 text-center">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No students found.</p>
              </div>
            )}
            </>
          ) : (
            <>
              <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Staff Member</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Role</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Shift Log</th>
                  <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{member.name}</td>
                    <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">{member.role}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-600">IN: {member.clockIn}</span>
                        <span className="text-[10px] font-medium text-slate-400">OUT: {member.clockOut}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${ member.attendanceStatus === "Present" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : member.attendanceStatus === "On Leave" ? "bg-red-50 text-red-600 border border-red-100" : "bg-amber-50 text-amber-700 border border-amber-100" }`}>
                        {member.attendanceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStaff.length === 0 && (
              <div className="p-20 text-center">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No staff found.</p>
              </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* Edit Attendance Dialog */}
      <Dialog open={Boolean(editingAttendance)} onOpenChange={open => !open && setEditingAttendance(null)}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader><DialogTitle>Edit Attendance — {editingAttendance?.name}</DialogTitle></DialogHeader>
          {editingAttendance && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-bold mb-1">Current Attendance</p>
                <p className="text-3xl font-black text-primary">{editingAttendance.attendance}</p>
                <p className="text-xs text-slate-400 mt-1">{editingAttendance.course} | {editingAttendance.batch} Batch</p>
              </div>
              <div className="grid gap-2">
                <Label>New Attendance Percentage (0-100)</Label>
                <Input type="number" min="0" max="100" value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="e.g. 85" />
              </div>
              <button onClick={() => void handleSaveAttendance()} disabled={isSaving} className="w-full py-3 bg-primary text-white font-black rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
                {isSaving ? "Saving..." : "Update Attendance"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceManagement;
