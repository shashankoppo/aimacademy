import React, { useEffect, useMemo, useState } from "react";
import { 
  Users, Briefcase, FileText, BarChart3, 
  Calendar, CheckCircle2, ChevronRight, GraduationCap, 
  Search, Filter, Settings, Clock, Download, 
  Bell, UserCheck, UserPlus, CreditCard, PieChart
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest, blobRequest, getStoredUser } from "@/lib/admin-api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StaffDashboard = () => {
  const user = getStoredUser();
  const [stats, setStats] = useState<{ staffPresent: string; todaysCollection: number; newAdmissions: number; pendingTasks: number }>({
    staffPresent: "0/0",
    todaysCollection: 0,
    newAdmissions: 0,
    pendingTasks: 0,
  });
  const [staffRows, setStaffRows] = useState<Array<{ id: number; name: string; role: string; attendanceStatus: string; clockIn: string; clockOut: string }>>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [events, setEvents] = useState<Array<{ day: string; mon: string; event: string }>>([]);

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);

  const [editingStaff, setEditingStaff] = useState<{ id: number; name: string; attendanceStatus: string; clockIn: string; clockOut: string } | null>(null);

  const initials = useMemo(() => {
    const name = (user?.name ?? "Ravi Kumar").trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "S";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return `${first}${last}`.toUpperCase();
  }, [user?.name]);

  const displayName = user?.name ?? "Ravi Kumar";

  const formatCollection = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 }).format(amount);

  useEffect(() => {
    void apiRequest<{ success: true; stats: typeof stats; staff: typeof staffRows; tasks: string[]; events: typeof events }>("/staff/dashboard")
      .then((data) => {
        setStats(data.stats);
        setStaffRows(data.staff);
        setTasks(data.tasks);
        setEvents(data.events);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load staff panel"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadReport = async (path: string, filename: string) => {
    try {
      const blob = await blobRequest(path);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to download report");
    }
  };

  const sendBroadcast = async () => {
    try {
      if (!broadcastTitle.trim() || !broadcastContent.trim()) {
        toast.error("Please enter a title and message.");
        return;
      }
      setBroadcastSending(true);
      await apiRequest("/staff/broadcast", {
        method: "POST",
        body: JSON.stringify({ title: broadcastTitle, content: broadcastContent, target: "All Users", type: "Operational" }),
      });
      setBroadcastOpen(false);
      setBroadcastTitle("");
      setBroadcastContent("");
      toast.success("Broadcast sent successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send broadcast");
    } finally {
      setBroadcastSending(false);
    }
  };

  const saveAttendance = async () => {
    if (!editingStaff) return;
    try {
      const updated = await apiRequest<{ success: true; staff: { id: number; attendanceStatus: string; clockIn: string; clockOut: string } }>("/staff/attendance/update", {
        method: "POST",
        body: JSON.stringify({
          staffId: editingStaff.id,
          attendanceStatus: editingStaff.attendanceStatus,
          clockIn: editingStaff.clockIn,
          clockOut: editingStaff.clockOut,
        }),
      });
      setStaffRows((prev) => prev.map((s) => (s.id === updated.staff.id ? { ...s, ...updated.staff } : s)));
      setEditingStaff(null);
      toast.success("Attendance updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update attendance");
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center font-black text-2xl text-white">
              {initials}
            </div>
            <div>
              <span className="badge-academic mb-2 bg-amber-50 text-amber-600 border-amber-100">Operations & Admin</span>
              <h1 className="heading-display text-3xl text-slate-900 leading-tight">
                Staff Command, <span className="text-amber-600">{displayName}.</span>
              </h1>
              <p className="text-slate-500 font-medium">Administrator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ProfileDropdown profilePath="/staff/profile" />
          </div>
          <div className="flex gap-4">
            <button onClick={() => setBroadcastOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded hover:bg-slate-800 transition-all">
              <Bell className="w-4 h-4" /> Broadcast Alert
            </button>
            <button onClick={() => void downloadReport("/staff/reports/financial", "monthly-report.pdf")} className="btn-coursera py-3">Generate Monthly Report</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           
           {/* Left Column: Quick Stats */}
           <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[ 
                { label: "Staff Present", value: stats.staffPresent, icon: UserCheck, color: "text-emerald-500" },
                { label: "Today's Collection", value: formatCollection(stats.todaysCollection), icon: CreditCard, color: "text-primary" },
                { label: "New Admissions", value: stats.newAdmissions.toString(), icon: UserPlus, color: "text-amber-500" },
                { label: "Pending Tasks", value: stats.pendingTasks.toString().padStart(2, "0"), icon: Clock, color: "text-red-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-sm p-6 rounded-xl border border-black/5 shadow-sm hover:shadow-lg transition-all">
                   <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                         <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                   </div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
           </div>

           {/* Central: Attendance & Reports */}
           <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Daily Staff Attendance */}
              <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-black/5 p-8">
                 <div className="flex justify-between items-center mb-8">
                    <h2 className="heading-display text-xl">Staff Attendance Log</h2>
                    <div className="flex gap-2">
                       <button className="p-2 bg-slate-50 text-slate-500 rounded text-xs font-bold uppercase tracking-widest">Filter: All Departments</button>
                    </div>
                 </div>
                 <div className="space-y-4">
                    {staffRows.map((row) => (
                      <div key={row.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">{row.name.charAt(0)}</div>
                            <div>
                               <h4 className="font-bold text-slate-900 text-sm leading-none mb-1">{row.name}</h4>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{row.role}</p>
                            </div>
                         </div>
                         <div className="hidden md:flex flex-col items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clock In</span>
                            <span className="text-xs font-bold text-slate-900">{row.clockIn}</span>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                           row.attendanceStatus === "Present" ? "bg-emerald-50 text-emerald-600" :
                           row.attendanceStatus === "On Leave" ? "bg-red-50 text-red-600" :
                           "bg-amber-50 text-amber-600"
                         }`}>{row.attendanceStatus}</div>
                         <button onClick={() => setEditingStaff({ id: row.id, name: row.name, attendanceStatus: row.attendanceStatus, clockIn: row.clockIn, clockOut: row.clockOut })} aria-label="Settings" className="text-slate-300 hover:text-primary transition-colors"><Settings className="w-4 h-4" /></button>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Reports Center */}
              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-black/5 p-8 shadow-sm">
                    <div className="p-3 w-fit rounded-lg bg-blue-50 text-blue-600 mb-6"><PieChart className="w-6 h-6" /></div>
                    <h3 className="heading-display text-lg mb-2">Financial Reports</h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">Download fee collection, expenditure, and pending balances reports for this quarter.</p>
                    <button onClick={() => void downloadReport("/staff/reports/financial", "financial-report.pdf")} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-100 transition-all">
                       <Download className="w-4 h-4" /> Download PDF
                    </button>
                 </div>
                 <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-black/5 p-8 shadow-sm">
                    <div className="p-3 w-fit rounded-lg bg-amber-50 text-amber-600 mb-6"><FileText className="w-6 h-6" /></div>
                    <h3 className="heading-display text-lg mb-2">Academic Audit</h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">Generate reports for course completion, mock test attendance, and faculty performance.</p>
                    <button onClick={() => void downloadReport("/staff/reports/audit", "academic-audit.pdf")} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-100 transition-all">
                       <Download className="w-4 h-4" /> Download DOCX
                    </button>
                 </div>
              </div>

           </div>

           {/* Right Column: Alerts & Reminders */}
           <div className="lg:col-span-4 flex flex-col gap-8">
              
              <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden">
                 <div className="absolute right-0 bottom-0 opacity-10"><BarChart3 className="w-40 h-40" /></div>
                 <h3 className="heading-display text-white text-lg mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5" /> Important Tasks
                 </h3>
                 <div className="space-y-4 relative z-10">
                    {tasks.map(task => (
                      <div key={task} className="flex gap-4 p-4 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                         <div className="w-5 h-5 rounded border border-white/30 group-hover:bg-primary transition-all shrink-0" />
                         <span className="text-xs font-medium text-white/80">{task}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-black/5 p-8">
                 <h3 className="heading-display text-lg mb-6">Upcoming Events</h3>
                 <div className="space-y-6">
                    {events.map((ev, i) => (
                      <div key={i} className="flex items-center gap-6">
                         <div className="flex flex-col items-center">
                            <span className="text-primary font-black text-xl leading-none">{ev.day}</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{ev.mon}</span>
                         </div>
                         <div className="h-10 w-px bg-slate-100 shrink-0" />
                         <h4 className="text-sm font-bold text-slate-700 leading-tight">{ev.event}</h4>
                      </div>
                    ))}
                 </div>
              </div>

           </div>

        </div>

        <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Broadcast Alert</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Message</Label>
                <Input value={broadcastContent} onChange={(e) => setBroadcastContent(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => void sendBroadcast()} disabled={broadcastSending} className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg disabled:opacity-60">
                {broadcastSending ? "Sending..." : "Send Broadcast"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(editingStaff)} onOpenChange={(open) => !open && setEditingStaff(null)}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Update Attendance</DialogTitle>
            </DialogHeader>
            {editingStaff && (
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Staff Member</Label>
                  <Input value={editingStaff.name} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={editingStaff.attendanceStatus} onValueChange={(v) => setEditingStaff((p) => (p ? { ...p, attendanceStatus: v } : p))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Late">Late</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Clock In</Label>
                    <Input value={editingStaff.clockIn} onChange={(e) => setEditingStaff((p) => (p ? { ...p, clockIn: e.target.value } : p))} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Clock Out</Label>
                  <Input value={editingStaff.clockOut} onChange={(e) => setEditingStaff((p) => (p ? { ...p, clockOut: e.target.value } : p))} />
                </div>
                <button onClick={() => void saveAttendance()} className="w-full bg-primary text-white font-bold py-2 rounded-lg">Save Changes</button>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default StaffDashboard;
