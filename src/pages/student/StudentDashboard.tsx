import React from "react";
import { 
  BookOpen, Play, Clock, Award, BarChart3, 
  Calendar, CheckCircle2, ChevronRight, GraduationCap, 
  FileText, ArrowRight, User
} from "lucide-react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const courses = [
    { title: "UPSC CSE 2024 Foundations", progress: 65, nextLesson: "Ethics & Integrity", icon: GraduationCap },
    { title: "Advanced Ethics (Mains)", progress: 40, nextLesson: "Corporate Governance", icon: BookOpen },
    { title: "CSAT Strategy & Practice", progress: 85, nextLesson: "Data Interpretation Quizzes", icon: BarChart3 },
  ];

  const mockTests = [
    { id: 1, title: "Prelims GS Full Mock #12", date: "April 02, 2026", duration: "120 Min", status: "Upcoming" },
    { id: 2, title: "Mains Answer Writing Drill", date: "April 05, 2026", duration: "180 Min", status: "Open" },
    { id: 3, title: "Weekly Geography Quiz", date: "Ready to start", duration: "30 Min", status: "Start" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center font-black text-2xl text-white">
              JD
            </div>
            <div>
              <span className="badge-academic mb-2">Student Portal</span>
              <h1 className="heading-display text-3xl text-slate-900 leading-tight">
                Welcome Back, <span className="text-primary">John Doe.</span>
              </h1>
              <p className="text-slate-500 font-medium">Batch 2026-A — Civil Services Morning Session</p>
            </div>
          </div>
          <div className="flex gap-4">
             <button className="btn-outline-coursera py-3">View Report Card</button>
             <button className="btn-coursera py-3">Resume Learning</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {[ 
             { label: "Active Courses", value: "05", icon: BookOpen },
             { label: "Tests Completed", value: "24", icon: CheckCircle2 },
             { label: "Study Hours", value: "156", icon: Clock },
             { label: "Global Rank", value: "#142", icon: Award },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all cursor-default">
               <div className="p-3 rounded-lg bg-surface-accent text-primary">
                 <stat.icon className="w-6 h-6" />
               </div>
               <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
               </div>
             </div>
           ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* My Courses */}
            <div className="bg-white rounded-xl border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="heading-display text-xl">My Assigned Programs</h2>
                <Link to="/courses" className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline">View All</Link>
              </div>
              <div className="space-y-6">
                {courses.map((course, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className="w-12 h-12 rounded bg-surface-accent text-primary flex items-center justify-center shrink-0">
                      <course.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1">{course.title}</h3>
                      <p className="text-xs text-slate-400 font-medium">Next: {course.nextLesson}</p>
                    </div>
                    <div className="w-full sm:w-48">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                         <span className="text-[10px] font-bold text-primary">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                    <button aria-label={`Resume ${course.title}`} className="p-3 rounded-full hover:bg-primary/10 text-primary transition-all">
                       <Play className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Test Center */}
            <div className="bg-white rounded-xl border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="heading-display text-xl">Mock Test Center</h2>
                   <p className="text-xs text-slate-400 mt-1">Practice and evaluate your performance in real-time.</p>
                </div>
                <button className="badge-academic px-4 py-2 hover:bg-primary hover:text-white transition-all">Previous Results</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                 {mockTests.map((test, i) => (
                   <div key={i} className="p-6 rounded-xl border border-slate-100 hover:border-primary/20 transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                           test.status === "Upcoming" ? "bg-slate-100 text-slate-500" : "bg-primary text-white"
                         }`}>
                           {test.status}
                         </span>
                      </div>
                      <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors pr-20">{test.title}</h4>
                      <div className="mt-4 flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {test.date}</span>
                         <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration}</span>
                      </div>
                      <Link to="/student/mock-test" className="mt-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-primary group-hover:translate-x-1 transition-transform">
                         {test.status === "Upcoming" ? "View Details" : "Start Test Now"} <ArrowRight className="w-4 h-4" />
                      </Link>
                   </div>
                 ))}
              </div>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Quick Actions */}
            <div className="bg-primary p-8 rounded-xl text-white relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 opacity-10">
                  <GraduationCap className="w-48 h-48" />
               </div>
               <div className="relative z-10">
                  <h3 className="heading-display text-white text-xl mb-6">Success Blueprint</h3>
                  <div className="space-y-4">
                     {[ 
                       { label: "Download Study Plan", icon: FileText },
                       { label: "Book Mentor Slot", icon: User },
                       { label: "Submit Mains sheet", icon: GraduationCap },
                     ].map((item, i) => (
                       <button key={i} className="w-full flex items-center justify-between p-4 rounded bg-white/10 hover:bg-white/20 transition-all text-sm font-bold border border-white/10">
                          <span className="flex items-center gap-3">
                             <item.icon className="w-4 h-4" /> {item.label}
                          </span>
                          <ChevronRight className="w-4 h-4 opacity-50" />
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Academic Notification Panel */}
            <div className="bg-white rounded-xl border border-slate-100 p-8">
               <h3 className="heading-display text-slate-900 text-lg mb-6">Academy Alerts</h3>
               <div className="space-y-6">
                 {[ 
                   { title: "Special Lecture by Ex-IAS Officer", time: "Tonight at 8 PM", type: "Live" },
                   { title: "Prelims 2024 Strategy Session PDF", time: "Available now", type: "Material" },
                   { title: "Fee Receipt Generated for Mar'24", time: "Yesterday", type: "Billing" },
                 ].map((alert, i) => (
                   <div key={i} className="flex gap-4 border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                         <h4 className="text-sm font-bold text-slate-900 leading-tight">{alert.title}</h4>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400">{alert.time}</span>
                            <span className="text-[8px] bg-slate-50 text-slate-400 px-1.5 rounded uppercase font-bold tracking-widest">{alert.type}</span>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
