import React, { useMemo, useState } from "react";
import { Search, Plus, FileSpreadsheet, IndianRupee, Download } from "lucide-react";
import { toast } from "sonner";
import { useAdminData } from "@/hooks/useAdminData";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const PayrollManagement = () => {
  const { staff, processPayroll } = useAdminData();
  const [search, setSearch] = useState("");

  const filteredStaff = staff.filter(
    (member) =>
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.role.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = useMemo(() => {
    const totalPayroll = staff.reduce((sum, member) => sum + member.salary, 0);
    const pending = staff.filter((member) => member.payrollStatus !== "Paid").reduce((sum, member) => sum + member.salary, 0);
    const processed = staff.filter((member) => member.payrollStatus === "Paid").length;
    return { totalPayroll, pending, processed };
  }, [staff]);

  const handleProcessBatch = async () => {
    try {
      await processPayroll();
      toast.success("Payroll processed successfully for all staff!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process payroll");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Name", "Role", "Salary", "Status", "Pay Date"],
      ...filteredStaff.map((member) => [member.name, member.role, member.salary, member.payrollStatus, member.payrollDate]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "payroll.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadPayslip = (staffId: number) => {
    const member = staff.find((entry) => entry.id === staffId);
    if (!member) return;
    const blob = new Blob(
      [[
        "AIM Academy Payslip",
        `Staff: ${member.name}`,
        `Role: ${member.role}`,
        `Salary: ${formatCurrency(member.salary)}`,
        `Status: ${member.payrollStatus}`,
        `Pay Date: ${member.payrollDate}`,
      ].join("\n")],
      { type: "text/plain;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${member.name.replace(/\s+/g, "-").toLowerCase()}-payslip.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Payroll Management</h1>
          <p className="text-slate-500 font-medium">Manage teacher salaries, staff payments and financial records.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCsv} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => void handleProcessBatch()} className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Process Batch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
          <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-2 relative z-10">Total Payroll MTD</p>
          <h4 className="flex items-center text-3xl font-black tracking-tight relative z-10">
            <IndianRupee className="w-5 h-5 mr-1 text-primary" />
            {stats.totalPayroll.toLocaleString("en-IN")}
          </h4>
          <p className="text-xs text-emerald-400 mt-2 font-bold relative z-10">Current month payroll base</p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16" />
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-2">Pending Disbursement</p>
          <h4 className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.pending)}</h4>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-2">Processed Count</p>
          <h4 className="text-3xl font-black text-slate-900 tracking-tight">{stats.processed} / {staff.length}</h4>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-slate-100 group">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary" />
            <input type="text" placeholder="Search staff members..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Staff Member</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Designation</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Base Salary</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStaff.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs">
                        {person.name.split(" ").map((part) => part[0]).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{person.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">EMP-00{person.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-600">{person.role}</span>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 tracking-tight">{formatCurrency(person.salary)}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${person.payrollStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : person.payrollStatus === "Pending" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                      {person.payrollStatus}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => downloadPayslip(person.id)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Download Payslip">
                      <Download className="w-4 h-4" />
                    </button>
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

export default PayrollManagement;
