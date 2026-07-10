import React, { useState, useEffect } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { toast } from "sonner";
import {
  MessageSquare, Send, Users, BookOpen, Bell, CheckCircle2,
  ExternalLink, Phone, CreditCard, ChevronRight, Clipboard, Edit3, X, Save
} from "lucide-react";

const WA_NUMBER = "917067231189";

const TEMPLATE_ICONS: Record<string, any> = {
  "admission": { icon: CheckCircle2, color: "bg-emerald-50 border-emerald-200 text-emerald-700", iconColor: "text-emerald-500" },
  "fee": { icon: CreditCard, color: "bg-amber-50 border-amber-200 text-amber-700", iconColor: "text-amber-500" },
  "batch": { icon: BookOpen, color: "bg-blue-50 border-blue-200 text-blue-700", iconColor: "text-blue-500" },
  "result": { icon: CheckCircle2, color: "bg-purple-50 border-purple-200 text-purple-700", iconColor: "text-purple-500" }
};

const WhatsAppCenter = () => {
  const { students, websiteSettings, updateWebsiteSettings } = useAdminData();
  const [selectedTemplateId, setSelectedTemplateId] = useState("admission");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplates, setEditingTemplates] = useState<{id: string, label: string, message: string}[]>([]);

  const dbTemplates = websiteSettings?.whatsappTemplates || [];
  
  const templates = [
    ...dbTemplates.map(t => ({
      ...t,
      icon: TEMPLATE_ICONS[t.id]?.icon || MessageSquare,
      color: TEMPLATE_ICONS[t.id]?.color || "bg-slate-50 border-slate-200 text-slate-700",
      iconColor: TEMPLATE_ICONS[t.id]?.iconColor || "text-slate-500",
      getMessage: (name: string, course: string) => t.message.replace("{name}", name).replace("{course}", course)
    })),
    {
      id: "custom",
      label: "Custom Message",
      icon: Edit3,
      color: "bg-slate-50 border-slate-200 text-slate-700",
      iconColor: "text-slate-500",
      getMessage: (_name: string, _course: string) => "",
      message: ""
    }
  ];

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStudent = (id: number) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const getMsg = (name: string, course: string) => {
    if (selectedTemplate.id === "custom") return customMessage;
    return selectedTemplate.getMessage(name, course);
  };

  const openWhatsApp = (student: typeof students[0]) => {
    const msg = getMsg(student.name, student.course);
    if (!msg.trim()) {
      toast.error("Please write a message first.");
      return;
    }
    const phone = student.phone.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success(`WhatsApp opened for ${student.name}`);
  };

  const copyMessage = (student: typeof students[0]) => {
    const msg = getMsg(student.name, student.course);
    navigator.clipboard.writeText(msg);
    setCopied(student.id);
    toast.success("Message copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const sendToAll = () => {
    if (selectedStudentIds.size === 0) {
      toast.error("Please select at least one student.");
      return;
    }
    const selected = students.filter((s) => selectedStudentIds.has(s.id));
    openWhatsApp(selected[0]);
    toast.info(`Opening WhatsApp for ${selected.length} students. Send individually.`, { duration: 4000 });
  };

  const handleEditClick = () => {
    setEditingTemplates(dbTemplates);
    setIsEditing(true);
  };

  const saveTemplates = async () => {
    if (!websiteSettings) return;
    try {
      await updateWebsiteSettings({ ...websiteSettings, whatsappTemplates: editingTemplates });
      toast.success("Templates updated successfully!");
      setIsEditing(false);
    } catch (e) {
      toast.error("Failed to save templates.");
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">WhatsApp Center</h1>
            <p className="text-slate-500 font-medium text-sm">Send messages, updates & reminders to candidates directly via WhatsApp.</p>
          </div>
        </div>
        <button
          onClick={sendToAll}
          disabled={selectedStudentIds.size === 0}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:shadow-none text-sm"
        >
          <Send className="w-4 h-4" />
          Send to Selected ({selectedStudentIds.size})
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT: Template Chooser */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Message Templates</h2>
              <button onClick={handleEditClick} className="text-emerald-500 hover:text-emerald-700 font-bold text-xs flex items-center gap-1">
                <Edit3 className="w-3 h-3"/> Edit
              </button>
            </div>
            <div className="p-4 space-y-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    selectedTemplate.id === t.id
                      ? t.color + " ring-2 ring-offset-1 ring-emerald-400"
                      : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <t.icon className={`w-5 h-5 shrink-0 ${selectedTemplate.id === t.id ? t.iconColor : "text-slate-400"}`} />
                  <span className="font-bold text-sm">{t.label}</span>
                  {selectedTemplate.id === t.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Box */}
          {selectedTemplate.id === "custom" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Your Custom Message</label>
              <textarea
                rows={8}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your message here... Use *bold* for emphasis."
                className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 resize-none transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-2">* Use *text* for bold in WhatsApp</p>
            </div>
          )}

          {/* Preview */}
          {selectedTemplate.id !== "custom" && (
            <div className="bg-emerald-950 rounded-2xl p-5 shadow-xl">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Message Preview</p>
              <pre className="text-[11px] text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                {selectedTemplate.getMessage("[Student Name]", "[Course Name]")}
              </pre>
            </div>
          )}
        </div>

        {/* RIGHT: Student List */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Select Students</h2>
                <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">{students.length} total</span>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or course..."
                className="text-sm border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-400 transition-all w-full sm:w-64 bg-white"
              />
            </div>

            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {filtered.map((student) => {
                const isSelected = selectedStudentIds.has(student.id);
                const previewMsg = selectedTemplate.id === "custom"
                  ? customMessage
                  : selectedTemplate.getMessage(student.name, student.course);
                const waUrl = `https://wa.me/${student.phone.replace(/\D/g, "")}?text=${encodeURIComponent(previewMsg)}`;

                return (
                  <div
                    key={student.id}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-all ${isSelected ? "bg-emerald-50/50" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStudent(student.id)}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                    />
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{student.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{student.course} · <Phone className="w-2.5 h-2.5 inline" /> {student.phone}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0 hidden sm:inline ${
                      student.feeStatus === "Paid"
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                        : student.feeStatus === "Overdue"
                        ? "text-red-600 bg-red-50 border-red-100"
                        : "text-amber-600 bg-amber-50 border-amber-100"
                    }`}>{student.feeStatus}</span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => copyMessage(student)}
                        title="Copy message"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
                      >
                        {copied === student.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clipboard className="w-4 h-4" />}
                      </button>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => toast.success(`WhatsApp opened for ${student.name}`)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black rounded-xl transition-all shadow-sm shadow-emerald-500/20"
                      >
                        <ExternalLink className="w-3 h-3" /> Send
                      </a>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="p-20 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm">No students found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Edit Message Templates</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">Use {"{name}"} and {"{course}"} as placeholders.</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {editingTemplates.map((t, index) => (
                <div key={t.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="font-bold text-sm text-slate-700">{t.label}</div>
                  <textarea
                    rows={4}
                    value={t.message}
                    onChange={(e) => {
                      const next = [...editingTemplates];
                      next[index].message = e.target.value;
                      setEditingTemplates(next);
                    }}
                    className="w-full text-sm text-slate-700 bg-white border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-emerald-400 resize-none transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
              <button onClick={saveTemplates} className="flex items-center gap-2 bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20">
                <Save className="w-4 h-4" /> Save Templates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppCenter;
