import React from "react";
import { 
  ArrowLeft, Search, Filter, Plus, FileSpreadsheet, 
  UserCircle, Calendar, IndianRupee, Download 
} from "lucide-react";
import { Link } from "react-router-dom";

const FeesManagement = () => {
  const students = [
    { id: 1, name: "Arpit Sharma", course: "SSC CGL 2024", fee: "₹24,000", status: "Paid", date: "22-03-24" },
    { id: 2, name: "Sneha Kapur", course: "UPSC Foundation", fee: "₹75,000", status: "Overdue", date: "15-02-24" },
    { id: 3, name: "Vikas Dubey", course: "Banking Pro", fee: "₹18,000", status: "Paid", date: "10-03-24" },
    { id: 4, name: "Pooja Hegde", course: "MPPSC Prelims", fee: "₹45,000", status: "Part Paid", date: "20-03-24" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="space-y-4">
             <Link to="/admin" className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:underline">
               <ArrowLeft className="w-4 h-4" />
               Back to Admin Panel
             </Link>
             <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Fees Management</h1>
             <p className="text-slate-500 font-medium">Record fee payments, track invoices, and manage student receipts.</p>
          </div>
          <div className="flex gap-3">
             <button className="btn-outline-coursera py-2.5 px-6 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Export Repots
             </button>
             <button className="btn-coursera py-2.5 px-6 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Record Payment
             </button>
          </div>
        </div>

        {/* Filters/Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search students by name or course..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
           </div>
           <div className="flex gap-4">
              <button title="Filter" className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-colors">
                 <Filter className="w-4 h-4 text-slate-600" />
              </button>
              <button title="Select Date" className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-colors">
                 <Calendar className="w-4 h-4 text-slate-600" />
              </button>
           </div>
        </div>

        {/* Fees Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Student Name</th>
                       <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Course</th>
                       <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Total Fee</th>
                       <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                       <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {students.map((student) => (
                       <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                   <UserCircle className="w-6 h-6" />
                                </div>
                                <div>
                                   <p className="font-bold text-slate-900">{student.name}</p>
                                   <p className="text-xs text-slate-400">STU-00{student.id}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-sm font-medium text-slate-600">{student.course}</span>
                          </td>
                          <td className="px-8 py-5 font-black text-slate-900">
                             {student.fee}
                          </td>
                          <td className="px-8 py-5">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                student.status === "Paid" ? "bg-green-100 text-green-700" :
                                student.status === "Overdue" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                             }`}>
                                {student.status}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button title="Download Receipt" className="p-2 text-slate-400 hover:text-primary transition-colors">
                                <Download className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
               <p className="text-slate-400 font-bold tracking-wider text-[10px] uppercase mb-1">Fee Collection (MTD)</p>
               <h4 className="text-2xl font-black text-slate-900">₹8,45,000</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
               <p className="text-slate-400 font-bold tracking-wider text-[10px] uppercase mb-1">Overdue Outstanding</p>
               <h4 className="text-2xl font-black text-red-600">₹42,000</h4>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeesManagement;
