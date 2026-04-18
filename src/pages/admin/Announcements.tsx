import React, { useState } from "react";
import { ArrowLeft, Plus, Megaphone, Calendar, Users, Edit, Trash2, Send, X, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAdminData, type Announcement } from "@/hooks/useAdminData";

type AnnouncementForm = Omit<Announcement, "id" | "createdAt" | "updatedAt">;

const defaultForm: AnnouncementForm = {
  title: "",
  target: "All Users",
  content: "",
  isPinned: false,
  type: "General",
};

const Announcements = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAdminData();
  const [showForm, setShowForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<AnnouncementForm>(defaultForm);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const validate = (announcement: AnnouncementForm) => {
    if (!announcement.title.trim() || !announcement.content.trim()) return "Please fill title and message body";
    return null;
  };

  const handlePublish = async () => {
    const error = validate(newAnnouncement);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      await addAnnouncement(newAnnouncement);
      setShowForm(false);
      setNewAnnouncement(defaultForm);
      toast.success("Announcement published");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish");
    }
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement) return;
    const error = validate(editingAnnouncement);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      await updateAnnouncement(editingAnnouncement.id, editingAnnouncement);
      setEditingAnnouncement(null);
      toast.success("Announcement updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      toast.success("Announcement deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

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
          <button onClick={() => setShowForm(!showForm)} className="btn-coursera py-2.5 px-6 flex items-center gap-2 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">
            {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Announcement</>}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-10">
            <h3 className="font-bold text-slate-900 mb-6">Create New Announcement</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Title</label>
                <input type="text" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} placeholder="Announcement title..." className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Target Audience</label>
                <select value={newAnnouncement.target} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm focus:outline-none">
                  <option>All Users</option>
                  <option>Students Only</option>
                  <option>Faculty Only</option>
                  <option>Staff Only</option>
                  <option>Specific Batch</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Type</label>
                <select value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm focus:outline-none">
                  <option>General</option>
                  <option>Academic</option>
                  <option>Financial</option>
                  <option>Event</option>
                  <option>Internal</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Message Body</label>
              <textarea rows={4} value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} placeholder="Write your announcement..." className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
                <input type="checkbox" checked={newAnnouncement.isPinned} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })} className="w-4 h-4 accent-primary rounded" />
                <Pin className="w-4 h-4" /> Pin to top
              </label>
              <button onClick={() => void handlePublish()} className="btn-coursera py-3 px-8 flex items-center gap-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg">
                <Send className="w-4 h-4" /> Publish Announcement
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Announcements", value: announcements.length.toString(), color: "text-blue-600" },
            { label: "Active Pinned", value: announcements.filter((announcement) => announcement.isPinned).length.toString(), color: "text-amber-600" },
            { label: "This Month", value: announcements.filter((announcement) => new Date(announcement.createdAt).getMonth() === new Date().getMonth()).length.toString(), color: "text-emerald-600" },
            { label: "Reach", value: `${announcements.length * 155}+`, color: "text-violet-600" },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-400 font-bold tracking-wider text-[10px] uppercase mb-1">{stat.label}</p>
              <h4 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h4>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${announcement.isPinned ? "border-amber-200 border-l-4 border-l-amber-400" : "border-slate-200"}`}>
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {announcement.isPinned && <Pin className="w-4 h-4 text-amber-500" />}
                    <h3 className="font-black text-slate-900 text-lg">{announcement.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${announcement.type === "Academic" ? "bg-blue-100 text-blue-600" : announcement.type === "Financial" ? "bg-amber-100 text-amber-600" : announcement.type === "Event" ? "bg-violet-100 text-violet-600" : announcement.type === "Internal" ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-600"}`}>
                      {announcement.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingAnnouncement(announcement)} aria-label="Edit announcement" className="p-2 text-slate-300 hover:text-primary transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => void handleDelete(announcement.id)} aria-label="Delete announcement" className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{announcement.content}</p>
                <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(announcement.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {announcement.target}</span>
                  <span className="flex items-center gap-1"><Megaphone className="w-3 h-3" /> By Admin</span>
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
              <p className="text-slate-400 font-bold">No announcements available.</p>
            </div>
          )}
        </div>

        {editingAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditingAnnouncement(null)} />
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 text-xl">Edit Announcement</h3>
                <button onClick={() => setEditingAnnouncement(null)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <input value={editingAnnouncement.title} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm focus:outline-none" />
                <select value={editingAnnouncement.target} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, target: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm focus:outline-none">
                  <option>All Users</option>
                  <option>Students Only</option>
                  <option>Faculty Only</option>
                  <option>Staff Only</option>
                  <option>Specific Batch</option>
                </select>
              </div>
              <textarea rows={5} value={editingAnnouncement.content} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-lg py-3 px-4 text-sm focus:outline-none resize-none mb-6" />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <input type="checkbox" checked={editingAnnouncement.isPinned} onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, isPinned: e.target.checked })} className="w-4 h-4 accent-primary rounded" />
                  Pin to top
                </label>
                <button onClick={() => void handleUpdate()} className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
