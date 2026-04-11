import React, { useState } from "react";
import { 
  Search, Plus, FileSpreadsheet, 
  UserCircle, Calendar, IndianRupee, Download, CheckCircle2
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FeesManagement = () => {
  const { students, updateStudent } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRecordPayment = (studentId: number, status: "Paid" | "Part Paid") => {
    updateStudent(studentId, { feeStatus: status });
    toast.success(`Payment recorded as ${status}`);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Fees Management</h1>
          <p className="text-slate-500 font-medium">Record fee payments, track invoices, and manage student receipts.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <FileSpreadsheet className="w-4 h-4" /> Export Reports
          </button>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-b-4 border-b-emerald-500/20">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
             <p className="text-slate-400 font-black tracking-widest text-[10px] uppercase">Collected (MTD)</p>
          </div>
          <h4 className="text-2xl font-black text-slate-900">₹8,45,000</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-b-4 border-b-red-500/20">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 rounded-lg bg-red-50 text-red-600"><IndianRupee className="w-5 h-5" /></div>
             <p className="text-slate-400 font-black tracking-widest text-[10px] uppercase">Overdue Total</p>
          </div>
          <h4 className="text-2xl font-black text-red-600">₹42,000</h4>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="relative group mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search students or courses..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
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
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs">
                        {s.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: STU-{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-600">{s.course}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      s.feeStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      s.feeStatus === "Overdue" ? "bg-red-50 text-red-600 border border-red-100" :
                      "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>
                      {s.feeStatus}
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
                                <DialogTitle>Record Payment for {s.name}</DialogTitle>
                             </DialogHeader>
                             <div className="grid gap-4 py-4">
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                   Verify the payment amount and update the status for <strong>{s.course}</strong>.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                   <button 
                                      onClick={() => handleRecordPayment(s.id, "Paid")}
                                      className="py-3 bg-emerald-50 text-emerald-700 font-black rounded-xl border border-emerald-100 hover:bg-emerald-100"
                                   >
                                      Full Payment
                                   </button>
                                   <button 
                                      onClick={() => handleRecordPayment(s.id, "Part Paid")}
                                      className="py-3 bg-amber-50 text-amber-700 font-black rounded-xl border border-amber-100 hover:bg-amber-100"
                                   >
                                      Part Payment
                                   </button>
                                </div>
                             </div>
                          </DialogContent>
                       </Dialog>
                       <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Download Receipt">
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
