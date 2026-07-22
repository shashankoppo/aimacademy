import React, { useMemo, useState } from "react";
import { Search, IndianRupee, Download, Edit2, CheckCircle2, Clock, Users, Banknote } from "lucide-react";
import { useAdminData, type StaffMember, type PayrollStatus } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const PayrollManagement = () => {
  const { staff, updateStaff, processPayroll } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editSalary, setEditSalary] = useState("");
  const [editPayStatus, setEditPayStatus] = useState<PayrollStatus>("Pending");
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);

  const filtered = staff.filter(m => {
    const q = searchTerm.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || m.payrollStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const insights = useMemo(() => {
    const totalBill = staff.reduce((sum, m) => sum + m.salary, 0);
    const paid = staff.filter(m => m.payrollStatus === "Paid").reduce((sum, m) => sum + m.salary, 0);
    const pending = staff.filter(m => m.payrollStatus !== "Paid").reduce((sum, m) => sum + m.salary, 0);
    const paidCount = staff.filter(m => m.payrollStatus === "Paid").length;
    return { totalBill, paid, pending, paidCount };
  }, [staff]);

  const openEditDialog = (member: StaffMember) => {
    setEditingStaff(member);
    setEditSalary(member.salary.toString());
    setEditPayStatus(member.payrollStatus);
  };

  const handleSaveStaff = async () => {
    if (!editingStaff) return;
    const salary = Number(editSalary);
    if (!salary || salary <= 0) { toast.error("Enter a valid salary amount"); return; }
    setIsSaving(true);
    try {
      await updateStaff(editingStaff.id, { salary, payrollStatus: editPayStatus });
      toast.success(`${editingStaff.name}'s details updated`);
      setEditingStaff(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update staff");
    } finally { setIsSaving(false); }
  };

  const handlePayIndividual = async (member: StaffMember) => {
    setPayingId(member.id);
    try {
      await updateStaff(member.id, { payrollStatus: "Paid" });
      toast.success(`${member.name} — ${fmt(member.salary)} marked as paid`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to mark payment");
    } finally { setPayingId(null); }
  };

  const handleProcessAll = async () => {
    if (!confirm(`Process salary for all ${staff.filter(m => m.payrollStatus !== "Paid").length} pending staff? Total: ${fmt(insights.pending)}`)) return;
    setIsProcessing(true);
    try {
      await processPayroll();
      toast.success("Payroll processed — all salaries marked as Paid");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to process payroll");
    } finally { setIsProcessing(false); }
  };

  const exportPayroll = () => {
    const rows = [["Name","Role","Salary","Status","Pay Date"],
      ...filtered.map(m => [m.name, m.role, m.salary, m.payrollStatus, m.payrollDate])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" }); 
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "payroll.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Payroll Management</h1>
          <p className="text-slate-500 font-medium">Manage salary, process payments, and track payroll for all staff members.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportPayroll} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Export Payroll
          </button>
          <button onClick={() => void handleProcessAll()} disabled={isProcessing || insights.pending === 0} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-60">
            <Banknote className="w-4 h-4" /> {isProcessing ? "Processing..." : "Process All Pending"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Monthly Payroll", value: fmt(insights.totalBill), icon: IndianRupee, color: "text-slate-700", bg: "bg-slate-100", border: "border-b-slate-400" },
          { label: "Paid This Month", value: fmt(insights.paid), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-b-emerald-400" },
          { label: "Pending Salaries", value: fmt(insights.pending), icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-b-amber-400" },
          { label: "Staff Paid", value: `${insights.paidCount} / ${staff.length}`, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-b-blue-400" },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-b-4 ${stat.border} hover:shadow-md transition-all`}>
            <div className={`p-2.5 rounded-xl ${stat.bg} w-fit mb-3`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-xl font-black text-slate-900">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input type="text" placeholder="Search staff by name or role..." className="w-full pl-12 bg-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["All", "Paid", "Pending", "Processing"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === s ? "bg-primary text-white shadow" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Staff Member</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Role</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Monthly Salary</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Payroll Status</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Attendance</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Last Paid</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-600 text-xs">
                        {member.name.split(" ").map(p => p[0]).join("").slice(0,2)}
                      </div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{member.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">{member.role}</td>
                  <td className="px-6 py-5">
                    <p className="font-black text-slate-900 text-base">{fmt(member.salary)}</p>
                    <p className="text-[10px] text-slate-400 font-bold">per month</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${ member.payrollStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : member.payrollStatus === "Processing" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-amber-50 text-amber-600 border border-amber-100" }`}>
                      {member.payrollStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${ member.attendanceStatus === "Present" ? "bg-emerald-50 text-emerald-600" : member.attendanceStatus === "On Leave" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600" }`}>
                      {member.attendanceStatus}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{member.clockIn} – {member.clockOut}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-600">{member.payrollDate || "—"}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {member.payrollStatus !== "Paid" && (
                        <button onClick={() => void handlePayIndividual(member)} disabled={payingId === member.id} title="Mark as Paid" className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-40">
                          {payingId === member.id ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      )}
                      <button onClick={() => openEditDialog(member)} title="Edit Salary" className="p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-20 text-center"><IndianRupee className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-bold">No staff records found.</p></div>
          )}
        </div>
      </div>

      {/* Edit Staff Dialog */}
      <Dialog open={Boolean(editingStaff)} onOpenChange={open => !open && setEditingStaff(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader><DialogTitle>Edit Payroll — {editingStaff?.name}</DialogTitle></DialogHeader>
          {editingStaff && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-bold">{editingStaff.role}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{fmt(editingStaff.salary)}<span className="text-xs font-medium text-slate-400"> / month</span></p>
                <p className="text-xs text-slate-400 mt-1">Status: <span className="font-bold">{editingStaff.payrollStatus}</span> | Last paid: {editingStaff.payrollDate || "N/A"}</p>
              </div>
              <div className="grid gap-2">
                <Label>Monthly Salary (Rs.)</Label>
                <Input type="number" value={editSalary} onChange={e => setEditSalary(e.target.value)} placeholder="e.g. 35000" />
              </div>
              <div className="grid gap-2">
                <Label>Payroll Status</Label>
                <Select value={editPayStatus} onValueChange={v => setEditPayStatus(v as PayrollStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button onClick={() => void handleSaveStaff()} disabled={isSaving} className="w-full py-3 bg-primary text-white font-black rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollManagement;
