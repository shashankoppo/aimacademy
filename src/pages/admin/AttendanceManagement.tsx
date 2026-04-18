import React, { useMemo, useState } from "react";
import { Search, Calendar, Users, Download, CheckCircle2, UserCheck } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { getAttendanceStatus, getAttendanceColor } from "@/lib/academic-logic";
import { toast } from "sonner";

const AttendanceManagement = () => {
  const { students, staff, markAttendance } = useAdminData();
  const [viewMode, setViewMode] = useState<"students" | "staff">("students");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.batch.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = useMemo(() => {
    const avgStudentAttendance = students.length
      ? Math.round(students.reduce((sum, student) => sum + parseInt(student.attendance, 10), 0) / students.length)
      : 0;
    const absentStudents = students.filter((student) => parseInt(student.attendance, 10) < 75).length;
    const presentStaff = staff.filter((member) => member.attendanceStatus === "Present").length;
    return {
      avgStudentAttendance,
      absentStudents,
      presentStaff,
      avgMonthlyRate: avgStudentAttendance,
    };
  }, [students, staff]);

  const exportAttendance = () => {
    const rows =
      viewMode === "students"
        ? [["Student", "Batch", "Attendance", "Category"], ...filteredStudents.map((student) => [student.name, student.batch, student.attendance, getAttendanceStatus(parseInt(student.attendance, 10))])]
        : [["Staff", "Role", "Status", "Clock In", "Clock Out"], ...filteredStaff.map((member) => [member.name, member.role, member.attendanceStatus, member.clockIn, member.clockOut])];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${viewMode}-attendance.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkToday = async () => {
    try {
      await markAttendance();
      toast.success("Today's attendance has been updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark attendance");
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Attendance Tracker</h1>
          <p className="text-slate-500 font-medium">Track student and staff attendance with institutional analytics.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportAttendance} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button onClick={() => void handleMarkToday()} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <Calendar className="w-4 h-4" /> Mark Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Today's Presence", value: `${stats.avgStudentAttendance}%`, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Absent Today", value: stats.absentStudents.toString(), icon: Users, color: "text-red-600", bg: "bg-red-50" },
          { label: "Staff Status", value: `${stats.presentStaff}/${staff.length || 0}`, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg Monthly Rate", value: `${stats.avgMonthlyRate}%`, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all hover:shadow-md">
            <p className="text-slate-400 font-black tracking-widest text-[9px] uppercase mb-2">{stat.label}</p>
            <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
        <div className="flex p-1.5 bg-slate-100 rounded-xl w-full md:w-auto">
          <button onClick={() => setViewMode("students")} className={`flex-1 md:flex-none py-2 px-6 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === "students" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>
            Students
          </button>
          <button onClick={() => setViewMode("staff")} className={`flex-1 md:flex-none py-2 px-6 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === "staff" ? "bg-white text-primary shadow-sm" : "text-slate-500"}`}>
            Staff
          </button>
        </div>

        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, batch, or role..."
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {viewMode === "students" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Batch</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">History (P/A)</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Attendance Rate</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Status Categorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => {
                  const rate = parseInt(student.attendance, 10);
                  const statusLabel = getAttendanceStatus(rate);
                  const presentDays = Math.round((rate / 100) * 25);
                  const absentDays = 25 - presentDays;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">{student.name.charAt(0)}</div>
                          <span className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-500 lowercase first-letter:uppercase tracking-tight">{student.batch}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-4">
                          <span className="text-xs font-black text-emerald-600">{presentDays}P</span>
                          <span className="text-xs font-black text-red-400">{absentDays}A</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${getAttendanceColor(rate)}`} style={{ width: student.attendance }} />
                          </div>
                          <span className="font-black text-slate-900 text-xs">{student.attendance}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
                            statusLabel === "Excellent"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : statusLabel === "Regular"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : statusLabel === "At Risk"
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Staff Member</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Role</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Shift Log</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{member.name}</td>
                    <td className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">{member.role}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-600">IN: {member.clockIn}</span>
                        <span className="text-[10px] font-medium text-slate-400">OUT: {member.clockOut}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          member.attendanceStatus === "Present"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : member.attendanceStatus === "On Leave"
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {member.attendanceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
