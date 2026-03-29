import React from "react";
import { 
  ArrowLeft, Search, Filter, Plus, FileSpreadsheet, 
  UserCircle, Calendar, IndianRupee, Download 
} from "lucide-react";
import { Link } from "react-router-dom";

const PayrollManagement = () => {
  const staff = [
    { id: 1, name: "Dr. Sandeep Kumar", role: "UPSC Senior Mentor", salary: "₹1,20,000", status: "Paid", date: "22-03-24" },
    { id: 2, name: "Meera Nair", role: "Content Head", salary: "₹85,000", status: "Pending", date: "24-03-24" },
    { id: 3, name: "Rajesh Varma", role: "Operations Manager", salary: "₹65,000", status: "Paid", date: "15-03-24" },
    { id: 4, name: "Aditi Singh", role: "Junior Faculty", salary: "₹45,000", status: "Processing", date: "25-03-24" },
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
             <h1 className="text-3xl font-black tracking-tight text-slate-900">Payroll Management</h1>
             <p className="text-slate-500 font-medium">Manage teacher salaries, staff payments and financial records.</p>
          </div>
          <div className="flex gap-3">
             <button className="btn-outline-coursera py-2.5 px-6 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Export
             </button>
             <button className="btn-coursera py-2.5 px-6 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Process Batch
             </button>
          </div>
        </div>

        {/* Filters/Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search staff by name or role..." 
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

        {/* Payroll Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Staff Member</th>
                       <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Designation</th>
                       <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Base Salary</th>
                       <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400">Payment Status</th>
                       <th className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {staff.map((person) => (
                       <tr key={person.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                   <UserCircle className="w-6 h-6" />
                                </div>
                                <div>
                                   <p className="font-bold text-slate-900">{person.name}</p>
                                   <p className="text-xs text-slate-400">EMP-00{person.id}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-sm font-medium text-slate-600">{person.role}</span>
                          </td>
                          <td className="px-8 py-5 font-black text-slate-900">
                             {person.salary}
                          </td>
                          <td className="px-8 py-5">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                person.status === "Paid" ? "bg-green-100 text-green-700" :
                                person.status === "Pending" ? "bg-amber-100 text-amber-700" :
                                "bg-blue-100 text-blue-700"
                             }`}>
                                {person.status}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button title="Download Payslip" className="p-2 text-slate-400 hover:text-primary transition-colors">
                                <Download className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-slate-900 p-8 rounded-2xl text-white">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Total Payroll MTD</p>
               <h4 className="flex items-center text-3xl font-black tracking-tight">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  3,45,000
               </h4>
               <p className="text-xs text-green-400 mt-2">↑ 12% from last month</p>
            </div>
            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
               <p className="text-slate-500 text-sm font-medium mb-4">Need to bulk import staff records?</p>
               <button className="text-primary font-bold hover:underline">Download CSV Template</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;
