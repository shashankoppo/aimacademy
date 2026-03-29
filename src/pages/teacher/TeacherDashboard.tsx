import React, { useState } from "react";
import { 
  Users, BookOpen, Plus, FileText, BarChart3, 
  Calendar, CheckCircle2, ChevronRight, GraduationCap, 
  Search, Filter, Trash2, Edit, Save, ArrowRight, Clock
} from "lucide-react";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState<"assign" | "tests" | "performance">("assign");

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center font-black text-2xl text-white">
              SM
            </div>
            <div>
              <span className="badge-academic mb-2 bg-emerald-50 text-emerald-600 border-emerald-100">Faculty Portal</span>
              <h1 className="heading-display text-3xl text-slate-900 leading-tight">
                Academic Panel, <span className="text-emerald-600">Sanjay Mishra.</span>
              </h1>
              <p className="text-slate-500 font-medium">Head of History & Ethics Department</p>
            </div>
          </div>
          <div className="flex gap-4">
             <button className="flex items-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded hover:bg-slate-800 transition-all">
                <Plus className="w-4 h-4" /> Create Resource
             </button>
             <button className="btn-coursera py-3">Publish Results</button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-10 overflow-x-auto">
           {[ 
             { id: "assign", label: "Assign Courses", icon: BookOpen },
             { id: "tests", label: "Mock Test Manager", icon: FileText },
             { id: "performance", label: "Student Analytics", icon: BarChart3 },
           ].map((tab) => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${
                 activeTab === tab.id ? "text-primary" : "text-slate-400 hover:text-slate-600"
               }`}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
               {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
             </button>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           
           {/* Main Content Area */}
           <div className="lg:col-span-12">
             
             {activeTab === "assign" && (
               <div className="bg-white rounded-xl border border-slate-100 p-8">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                       <h2 className="heading-display text-xl">Assign Programs</h2>
                       <p className="text-xs text-slate-400 mt-1">Select courses and assign them to specific students or batches.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                       <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary/20 outline-none" />
                       </div>
                       <button aria-label="Filter students" className="p-2 bg-slate-50 text-slate-500 rounded-lg"><Filter className="w-5 h-5" /></button>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-12">
                    {/* Left: Course Selection */}
                    <div className="space-y-6">
                       <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Step 1: Choose Course</label>
                       <div className="space-y-3">
                          {[ 
                            "UPSC Prelims Crash Course 2024",
                            "Mains Answer Writing Strategy",
                            "Ethics Masterclass (Case Studies)",
                            "Indian Polity & Governance"
                          ].map(course => (
                            <label key={course} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 cursor-pointer group transition-all">
                               <span className="font-bold text-slate-700 text-sm">{course}</span>
                               <input type="radio" name="course" className="w-4 h-4 accent-primary" />
                            </label>
                          ))}
                       </div>
                    </div>

                    {/* Right: Student/Batch Selection */}
                    <div className="space-y-6">
                       <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Step 2: Assign To</label>
                       <div className="flex gap-4 mb-4">
                          <button className="flex-1 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded">Select Batch</button>
                          <button className="flex-1 py-2 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded">Individual Students</button>
                       </div>
                       <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                          {[ 
                            "Batch 2026-A (Morning)",
                            "Batch 2026-B (Evening)",
                            "Weekend Officers Batch",
                            "Prelims Test Series Intensive",
                          ].map(batch => (
                            <label key={batch} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 cursor-pointer group transition-all">
                               <span className="font-bold text-slate-700 text-sm">{batch}</span>
                               <input type="checkbox" className="w-4 h-4 accent-primary rounded" />
                            </label>
                          ))}
                       </div>
                       <button className="w-full btn-coursera py-4 mt-6">Confirm and Assign Access</button>
                    </div>
                 </div>
               </div>
             )}

             {activeTab === "tests" && (
               <div className="bg-white rounded-xl border border-slate-100 p-8">
                  <div className="flex justify-between items-center mb-8">
                     <h2 className="heading-display text-xl">Manage Mock Tests</h2>
                     <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest">
                        <Plus className="w-4 h-4" /> Create New Test
                     </button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[ 
                       { title: "Weekly Ethics Quiz #04", questions: 30, duration: "45m", date: "April 02" },
                       { title: "Modern History Full Mock", questions: 100, duration: "120m", date: "April 05" },
                       { title: "CSAT Sectional Test", questions: 50, duration: "60m", date: "April 09" },
                     ].map((test, i) => (
                       <div key={i} className="p-6 rounded-xl border border-slate-100 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-4">
                             <div className="p-2 rounded bg-surface-accent text-primary">
                                <FileText className="w-5 h-5" />
                             </div>
                             <div className="flex gap-2">
                                <button aria-label="Edit test" className="p-1.5 hover:bg-slate-50 text-slate-400 rounded"><Edit className="w-4 h-4" /></button>
                                <button aria-label="Delete test" className="p-1.5 hover:bg-red-50 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </div>
                          <h4 className="font-bold text-slate-900 mb-4">{test.title}</h4>
                          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {test.questions} Qs</span>
                             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration}</span>
                             <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {test.date}</span>
                          </div>
                          <button className="mt-6 w-full py-2 bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded hover:bg-primary hover:text-white transition-all">Live Evaluation</button>
                       </div>
                     ))}
                  </div>
               </div>
             )}

             {activeTab === "performance" && (
                <div className="bg-white rounded-xl border border-slate-100 p-8">
                   <h2 className="heading-display text-xl mb-8">Performance Leaderboard</h2>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                               <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Student Name</th>
                               <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Avg %</th>
                               <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Tests Taken</th>
                               <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                               <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {[ 
                              { name: "John Doe", avg: "85%", taken: 12, status: "Excellent" },
                              { name: "Sarah Smith", avg: "92%", taken: 15, status: "Top Performer" },
                              { name: "Robert Wilson", avg: "64%", taken: 10, status: "Improving" },
                              { name: "Emily Brown", avg: "78%", taken: 11, status: "Good" },
                            ].map((row, i) => (
                               <tr key={i} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-4 font-bold text-slate-900 text-sm">{row.name}</td>
                                  <td className="p-4 text-sm text-slate-500 font-body">{row.avg}</td>
                                  <td className="p-4 text-sm text-slate-500 font-body">{row.taken}</td>
                                  <td className="p-4">
                                     <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                       row.status === "Top Performer" ? "bg-emerald-50 text-emerald-600" :
                                       row.status === "Excellent" ? "bg-blue-50 text-blue-600" :
                                       "bg-slate-100 text-slate-500"
                                     }`}>{row.status}</span>
                                  </td>
                                  <td className="p-4">
                                     <button className="p-2 text-primary hover:bg-primary/5 rounded font-black text-[10px] uppercase tracking-widest">Detail View</button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             )}

           </div>

        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;
