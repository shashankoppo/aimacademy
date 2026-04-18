import React, { useMemo, useState } from "react";
import { Search, FileSpreadsheet, IndianRupee, Download, CheckCircle2 } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const FeesManagement = () => {
  const { students, updateStudent } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const insights = useMemo(() => {
    const collected = students.reduce((sum, student) => sum + student.paidFee, 0);
    const overdue = students
      .filter((student) => student.feeStatus !== "Paid")
      .reduce((sum, student) => sum + Math.max(0, student.totalFee - student.paidFee), 0);
    return { collected, overdue };
  }, [students]);

  const handleRecordPayment = async (studentId: number, mode: "Paid" | "Part Paid") => {
    const student = students.find((entry) => entry.id === studentId);
    if (!student) return;

    const paidFee = mode === "Paid" ? student.totalFee : Math.min(student.totalFee, Math.max(student.paidFee + student.nextInstallmentAmount, Math.floor(student.totalFee / 2)));
    const nextInstallmentAmount = Math.max(0, student.totalFee - paidFee);

    try {
      await updateStudent(studentId, {
        paidFee,
        feeStatus: mode,
        nextInstallmentAmount,
        nextInstallmentLabel: nextInstallmentAmount === 0 ? "Completed" : "Next Installment",
      });
      toast.success(`Payment recorded as ${mode}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record payment");
    }
  };

  const exportReports = () => {
    const rows = [
      ["Student", "Course", "Total Fee", "Paid Fee", "Pending", "Status"],
      ...filteredStudents.map((student) => [
        student.name,
        student.course,
        student.totalFee,
        student.paidFee,
        student.totalFee - student.paidFee,
        student.feeStatus,
      ]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fee-reports.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadReceipt = (studentId: number) => {
    const student = students.find((entry) => entry.id === studentId);
    if (!student) return;
    const content = [
      "AIM Academy Payment Receipt",
      `Student: ${student.name}`,
      `Course: ${student.course}`,
      `Paid Amount: ${formatCurrency(student.paidFee)}`,
      `Pending Amount: ${formatCurrency(Math.max(0, student.totalFee - student.paidFee))}`,
      `Status: ${student.feeStatus}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `receipt-${student.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Fees Management</h1>
          <p className="text-slate-500 font-medium">Record fee payments, track invoices, and manage student receipts.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportReports} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <FileSpreadsheet className="w-4 h-4" /> Export Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-b-4 border-b-emerald-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
            <p className="text-slate-400 font-black tracking-widest text-[10px] uppercase">Collected (MTD)</p>
          </div>
          <h4 className="text-2xl font-black text-slate-900">{formatCurrency(insights.collected)}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-b-4 border-b-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-50 text-red-600"><IndianRupee className="w-5 h-5" /></div>
            <p className="text-slate-400 font-black tracking-widest text-[10px] uppercase">Overdue Total</p>
          </div>
          <h4 className="text-2xl font-black text-red-600">{formatCurrency(insights.overdue)}</h4>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="relative group mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search students or courses..."
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Student Name</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Course</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs">
                        {student.name.split(" ").map((part) => part[0]).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: STU-{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-600">{student.course}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
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
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Record Payment">
                            <IndianRupee className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Payment for {student.name}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                              Collected: <strong>{formatCurrency(student.paidFee)}</strong> of <strong>{formatCurrency(student.totalFee)}</strong>.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => void handleRecordPayment(student.id, "Paid")} className="py-3 bg-emerald-50 text-emerald-700 font-black rounded-xl border border-emerald-100 hover:bg-emerald-100">
                                Full Payment
                              </button>
                              <button onClick={() => void handleRecordPayment(student.id, "Part Paid")} className="py-3 bg-amber-50 text-amber-700 font-black rounded-xl border border-amber-100 hover:bg-amber-100">
                                Part Payment
                              </button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <button onClick={() => downloadReceipt(student.id)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Download Receipt">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeesManagement;
