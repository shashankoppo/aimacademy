import React, { useMemo, useState } from "react";
import { Search, FileSpreadsheet, IndianRupee, Download, CheckCircle2, Eye, TrendingUp, Clock } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const FeesManagement = () => {
  const { students, updateStudent } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [payingStudent, setPayingStudent] = useState<typeof students[0] | null>(null);
  const [viewingFees, setViewingFees] = useState<typeof students[0] | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = useState(false);

  const filtered = students.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.course.toLowerCase().includes(q) || (s.phone || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || s.feeStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const insights = useMemo(() => {
    const collected = students.reduce((sum, s) => sum + s.paidFee, 0);
    const total = students.reduce((sum, s) => sum + s.totalFee, 0);
    const overdue = students.filter(s => s.feeStatus !== "Paid").reduce((sum, s) => sum + Math.max(0, s.totalFee - s.paidFee), 0);
    const paidCount = students.filter(s => s.feeStatus === "Paid").length;
    return { collected, total, overdue, paidCount };
  }, [students]);

  const openPayDialog = (student: typeof students[0]) => {
    const remaining = Math.max(0, student.totalFee - student.paidFee);
    setPayAmount(remaining.toString());
    setPayMode("Cash");
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayingStudent(student);
  };

  const handleRecordPayment = async () => {
    if (!payingStudent) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) { toast.error("Please enter a valid amount"); return; }
    const newPaid = Math.min(payingStudent.totalFee, payingStudent.paidFee + amount);
    const newStatus = newPaid >= payingStudent.totalFee ? "Paid" : newPaid > 0 ? "Part Paid" : "Overdue";
    const remaining = Math.max(0, payingStudent.totalFee - newPaid);
    setIsSaving(true);
    try {
      await updateStudent(payingStudent.id, {
        paidFee: newPaid,
        feeStatus: newStatus as any,
        nextInstallmentAmount: remaining,
        nextInstallmentLabel: remaining === 0 ? "Fully Paid" : "Next Installment",
        nextDueDate: remaining > 0 ? payDate : payingStudent.nextDueDate,
      });
      toast.success(`Payment of ${fmt(amount)} recorded via ${payMode}`);
      setPayingStudent(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to record payment");
    } finally { setIsSaving(false); }
  };

  const downloadReceipt = (student: typeof students[0]) => {
    const customFees: { title: string; amount: number; isPaid: boolean }[] = (() => { try { return JSON.parse(student.customFeesJson || "[]"); } catch { return []; } })();
    const lines = [
      "====================================",
      "       AIM ACADEMY",
      "       FEE PAYMENT RECEIPT",
      "====================================",
      "",
      `Receipt Date   : ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
      `Student ID     : STU-${String(student.id).padStart(4, "0")}`,
      `Student Name   : ${student.name}`,
      `Contact        : ${student.phone}`,
      `Email          : ${student.email}`,
      "",
      "------------------------------------",
      `Course         : ${student.course}`,
      `Batch          : ${student.batch}`,
      `Join Date      : ${student.joinDate}`,
      "",
      "---- FEE BREAKDOWN -----------------",
      `Course Fee     : ${fmt(student.totalFee)}`,
      `Amount Paid    : ${fmt(student.paidFee)}`,
      `Balance Due    : ${fmt(Math.max(0, student.totalFee - student.paidFee))}`,
      `Fee Status     : ${student.feeStatus}`,
      `Next Due Date  : ${student.nextDueDate}`,
      ...(customFees.length > 0 ? ["", "---- CUSTOM FEES -------------------", ...customFees.map(f => `${f.title.padEnd(15)} : ${fmt(f.amount)} [${f.isPaid ? "PAID" : "UNPAID"}]`)] : []),
      "",
      "====================================",
      "Thank you for your payment!",
      "AIM Academy | Contact: +91 70672 31189",
      "====================================",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `receipt-${student.name.replace(/\s+/g, "-").toLowerCase()}.txt`; a.click(); URL.revokeObjectURL(url);
    toast.success("Receipt downloaded");
  };

  const exportReports = () => {
    const rows = [["Student","Phone","Course","Total Fee","Paid Fee","Pending","Status","Next Due"],
      ...filtered.map(s => [s.name, s.phone, s.course, s.totalFee, s.paidFee, Math.max(0, s.totalFee - s.paidFee), s.feeStatus, s.nextDueDate])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "fee-reports.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const parseCustomFees = (json?: string | null) => { try { return JSON.parse(json || "[]") as { title: string; amount: number; isPaid: boolean }[]; } catch { return []; } };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Fees Management</h1>
          <p className="text-slate-500 font-medium">Record fee payments, track invoices, and generate student receipts.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportReports} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <FileSpreadsheet className="w-4 h-4" /> Export Reports
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Collected", value: fmt(insights.collected), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-b-emerald-400" },
          { label: "Total Pending", value: fmt(insights.overdue), icon: Clock, color: "text-red-600", bg: "bg-red-50", border: "border-b-red-400" },
          { label: "Total Fee Base", value: fmt(insights.total), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", border: "border-b-blue-400" },
          { label: "Fully Paid", value: `${insights.paidCount} / ${students.length}`, icon: IndianRupee, color: "text-violet-600", bg: "bg-violet-50", border: "border-b-violet-400" },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-b-4 ${stat.border} hover:shadow-md transition-all`}>
            <div className={`p-2.5 rounded-xl ${stat.bg} w-fit mb-3`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-xl font-black text-slate-900">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input type="text" placeholder="Search students or courses..." className="w-full pl-12 bg-slate-50" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Paid", "Part Paid", "Overdue"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${ statusFilter === s ? "bg-primary text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100" }`}>
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
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Student</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Course</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Fee Breakdown</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Status</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Next Due</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(student => {
                const pending = Math.max(0, student.totalFee - student.paidFee);
                const pct = student.totalFee > 0 ? Math.min(100, (student.paidFee / student.totalFee) * 100) : 0;
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500 text-xs">
                          {student.name.split(" ").map(p => p[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">STU-{String(student.id).padStart(4,"0")} | {student.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">{student.course}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{student.batch} Batch</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-600 font-bold">{fmt(student.paidFee)} paid</span>
                          <span className={`font-bold ${pending > 0 ? 'text-red-500' : 'text-slate-400'}`}>{fmt(pending)} due</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">Total: {fmt(student.totalFee)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${ student.feeStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : student.feeStatus === "Overdue" ? "bg-red-50 text-red-600 border border-red-100" : "bg-amber-50 text-amber-600 border border-amber-100" }`}>
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-xs font-bold text-slate-600">{student.nextDueDate}</p>
                      <p className="text-[10px] text-slate-400">{student.nextInstallmentLabel}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewingFees(student)} title="View Fee Details" className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openPayDialog(student)} title="Record Payment" className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><IndianRupee className="w-4 h-4" /></button>
                        <button onClick={() => downloadReceipt(student)} title="Download Receipt" className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"><Download className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-20 text-center"><IndianRupee className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-bold">No students found.</p></div>
          )}
        </div>
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={Boolean(payingStudent)} onOpenChange={open => !open && setPayingStudent(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Record Payment — {payingStudent?.name}</DialogTitle></DialogHeader>
          {payingStudent && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">Total Fee</span>
                  <span className="font-black text-slate-900">{fmt(payingStudent.totalFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-bold">Already Paid</span>
                  <span className="font-black text-emerald-600">{fmt(payingStudent.paidFee)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-bold">Balance Due</span>
                  <span className="font-black text-red-600">{fmt(Math.max(0, payingStudent.totalFee - payingStudent.paidFee))}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Amount Receiving (Rs.) *</Label>
                <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Enter amount received" className="text-lg font-bold" />
              </div>
              <div className="grid gap-2">
                <Label>Payment Mode</Label>
                <Select value={payMode} onValueChange={setPayMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI / GPay / PhonePe</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer (NEFT/RTGS)</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="DD">Demand Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Payment Date</Label>
                <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPayAmount(String(Math.max(0, payingStudent.totalFee - payingStudent.paidFee)))} className="py-2.5 bg-slate-100 text-slate-700 font-black rounded-xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">
                  Full Balance
                </button>
                <button onClick={() => setPayAmount(String(payingStudent.nextInstallmentAmount || Math.ceil(Math.max(0, payingStudent.totalFee - payingStudent.paidFee) / 2)))} className="py-2.5 bg-amber-50 text-amber-700 font-black rounded-xl hover:bg-amber-100 transition-all text-xs uppercase tracking-widest border border-amber-100">
                  Next Installment
                </button>
              </div>
              <button onClick={() => void handleRecordPayment()} disabled={isSaving} className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60">
                {isSaving ? "Recording..." : "Record Payment"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Fee Details Dialog */}
      <Dialog open={Boolean(viewingFees)} onOpenChange={open => !open && setViewingFees(null)}>
        <DialogContent className="sm:max-w-[480px] max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Fee Details — {viewingFees?.name}</DialogTitle></DialogHeader>
          {viewingFees && (() => {
            const customFees = parseCustomFees(viewingFees.customFeesJson);
            const pending = Math.max(0, viewingFees.totalFee - viewingFees.paidFee);
            const pct = viewingFees.totalFee > 0 ? Math.min(100, (viewingFees.paidFee / viewingFees.totalFee) * 100) : 0;
            return (
              <div className="space-y-5 py-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-600">
                    {viewingFees.name.split(" ").map(p => p[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{viewingFees.name}</p>
                    <p className="text-xs text-slate-500">{viewingFees.course} | {viewingFees.batch} Batch</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${ viewingFees.feeStatus === "Paid" ? "bg-emerald-100 text-emerald-700" : viewingFees.feeStatus === "Overdue" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700" }`}>{viewingFees.feeStatus}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200"><p className="text-xs font-black uppercase tracking-widest text-slate-500">Standard Fee</p></div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between"><span className="text-sm text-slate-600 font-bold">Course Fee</span><span className="font-black text-slate-900">{fmt(viewingFees.totalFee)}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-emerald-600 font-bold">Paid</span><span className="font-black text-emerald-600">{fmt(viewingFees.paidFee)}</span></div>
                    <div className="flex justify-between border-t border-slate-100 pt-3"><span className="text-sm text-red-500 font-bold">Balance</span><span className={`font-black ${pending > 0 ? 'text-red-500' : 'text-slate-400'}`}>{fmt(pending)}</span></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400">{pct.toFixed(1)}% completed</p>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{viewingFees.nextInstallmentLabel}</span>
                      <span className="font-bold">{fmt(viewingFees.nextInstallmentAmount)} due {viewingFees.nextDueDate}</span>
                    </div>
                  </div>
                </div>

                {customFees.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200"><p className="text-xs font-black uppercase tracking-widest text-slate-500">Custom Charges</p></div>
                    <div className="p-4 space-y-2">
                      {customFees.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className={`text-sm font-medium ${f.isPaid ? 'line-through text-slate-400' : 'text-slate-700'}`}>{f.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{fmt(f.amount)}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${f.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{f.isPaid ? 'Paid' : 'Unpaid'}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-black text-slate-500">Custom Total</span>
                        <span className="text-sm font-black">{fmt(customFees.reduce((s, f) => s + f.amount, 0))}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => { setViewingFees(null); openPayDialog(viewingFees); }} className="flex-1 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all">
                    Record Payment
                  </button>
                  <button onClick={() => downloadReceipt(viewingFees)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-black rounded-xl hover:bg-slate-200 transition-all">
                    Download Receipt
                  </button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeesManagement;
