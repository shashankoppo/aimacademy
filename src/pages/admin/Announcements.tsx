import React, { useState } from "react";
import { 
  ArrowLeft, Plus, Bell, Megaphone, Calendar, 
  Users, Eye, Edit, Trash2, Send, X, Pin
} from "lucide-react";
import { Link } from "react-router-dom";

const Announcements = () => {
  const [showForm, setShowForm] = useState(false);

  const announcements = [
    { 
      id: 1, title: "UPSC Prelims Mock Test Series Begins April 5", 
      body: "All UPSC batch students are required to register for the mandatory Monthly Mock Test Series starting April 5, 2026. Visit your dashboard to confirm participation.",
      date: "Mar 28, 2026", author: "Admin Office", target: "All Students", pinned: true, type: "Academic"
    },
    { 
      id: 2, title: "Fee Payment Deadline Extension — March Batch", 
      body: "Due to popular request, the fee payment deadline for March 2026 enrollments has been extended to April 10, 2026. Late fees will apply after this date.",
      date: "Mar 26, 2026", author: "Accounts Dept", target: "March 2026 Batch", pinned: true, type: "Financial"
    },
    { 
      id: 3, title: "Guest Lecture: Ethics in Governance by Ex-IAS Officer", 
      body: "A special guest lecture on 'Ethics & Integrity in Public Administration' will be held on April 2, 2026 at 7 PM in the Main Auditorium. Open to all batches.",
      date: "Mar 25, 2026", author: "Academic Wing", target: "All", pinned: false, type: "Event"
    },
    { 
      id: 4, title: "Library Hours Extended During Exam Period", 
      body: "The AIM Academy Library will now remain open from 6 AM to 11 PM during the UPSC examination preparation period (April–June 2026).",
      date: "Mar 24, 2026", author: "Operations", target: "All Students & Staff", pinned: false, type: "General"
    },
    { 
      id: 5, title: "Staff Meeting — Q1 Performance Review", 
      body: "All faculty and administrative staff are required to attend the Q1 performance review meeting on April 5, 2026 at 10 AM in Conference Room A.",
      date: "Mar 22, 2026", author: "HR Department", target: "Staff Only", pinned: false, type: "Internal"
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="space-y-4">
            <Link to="/admin" className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-tight hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Admin Panel
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Announcements & Notices</h1>
            <p className="text-slate-500 font-medium">Manage campus-wide broadcasts, notices, and bulletins.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-coursera py-2.5 px-6 flex items-center gap-2">
            {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Announcement</>}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-10">
            <h3 className="font-bold text-slate-900 mb-6">Create New Announcement</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Title</label>
                <input type="text" placeholder="Announcement title..." className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Target Audience</label>
                <select className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm focus:outline-none">
                  <option>All Users</option>
                  <option>Students Only</option>
                  <option>Faculty Only</option>
                  <option>Staff Only</option>
                  <option>Specific Batch</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Message Body</label>
              <textarea rows={4} placeholder="Write your announcement..." className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary rounded" />
                <Pin className="w-4 h-4" /> Pin to top
              </label>
              <button className="btn-coursera py-3 px-8 flex items-center gap-2">
                <Send className="w-4 h-4" /> Publish Announcement
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Announcements", value: "156", color: "text-blue-600" },
            { label: "Active Pinned", value: "2", color: "text-amber-600" },
            { label: "This Month", value: "8", color: "text-emerald-600" },
            { label: "Reach", value: "1,240+", color: "text-violet-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 font-bold tracking-wider text-[10px] uppercase mb-1">{stat.label}</p>
              <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
            </div>
          ))}
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${a.pinned ? "border-amber-200 border-l-4 border-l-amber-400" : "border-slate-200"}`}>
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {a.pinned && <Pin className="w-4 h-4 text-amber-500" />}
                    <h3 className="font-black text-slate-900 text-lg">{a.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      a.type === "Academic" ? "bg-blue-100 text-blue-600" :
                      a.type === "Financial" ? "bg-amber-100 text-amber-600" :
                      a.type === "Event" ? "bg-violet-100 text-violet-600" :
                      a.type === "Internal" ? "bg-slate-100 text-slate-600" :
                      "bg-emerald-100 text-emerald-600"
                    }`}>{a.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button aria-label="Edit announcement" className="p-2 text-slate-300 hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                    <button aria-label="Delete announcement" className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{a.body}</p>
                <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {a.date}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {a.target}</span>
                  <span className="flex items-center gap-1"><Megaphone className="w-3 h-3" /> By {a.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Announcements;
