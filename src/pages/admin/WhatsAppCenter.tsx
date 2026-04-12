import React, { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { toast } from "sonner";
import {
  MessageSquare, Send, Users, BookOpen, Bell, CheckCircle2,
  ExternalLink, Phone, CreditCard, ChevronRight, Clipboard, Edit3
} from "lucide-react";

const WA_NUMBER = "917067231189"; // Institute WhatsApp number (no + or dashes)

const TEMPLATES = [
  {
    id: "admission",
    label: "Admission Confirmation",
    icon: CheckCircle2,
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    iconColor: "text-emerald-500",
    getMessage: (name: string, course: string) =>
      `Dear ${name},\n\nYour admission to *AIM Academy* has been confirmed for the course: *${course}*.\n\nWelcome to the family! We wish you the very best on your journey to success. 🎓\n\nFor any queries, call us: +91 70672 31189\n\n– *AIM Academy, Jabalpur*\n_Synonym of Success_`,
  },
  {
    id: "fee",
    label: "Fee Payment Reminder",
    icon: CreditCard,
    color: "bg-amber-50 border-amber-200 text-amber-700",
    iconColor: "text-amber-500",
    getMessage: (name: string, course: string) =>
      `Dear ${name},\n\nThis is a gentle reminder that your fee installment for *${course}* at *AIM Academy* is due.\n\nKindly clear the dues at the earliest to continue your studies uninterrupted. 📋\n\nContact: +91 70672 31189\n\n– *AIM Academy, Jabalpur*`,
  },
  {
    id: "batch",
    label: "Batch Start Notification",
    icon: BookOpen,
    color: "bg-blue-50 border-blue-200 text-blue-700",
    iconColor: "text-blue-500",
    getMessage: (name: string, course: string) =>
      `Dear ${name},\n\nYour new batch for *${course}* at *AIM Academy* is starting soon! 🚀\n\nPlease report to the institute on time and bring your study materials.\n\nFor schedule details: +91 70672 31189\n\n– *AIM Academy, Jabalpur*`,
  },
  {
    id: "result",
    label: "Result / Selection Update",
    icon: CheckCircle2,
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconColor: "text-purple-500",
    getMessage: (name: string, _course: string) =>
      `🎉 Heartiest Congratulations, *${name}*!\n\nYou have successfully cleared your exam and brought glory to *AIM Academy*, Jabalpur.\n\nYour hard work and dedication have paid off. The entire AIM family is proud of you! 🏆\n\n– *AIM Academy, Jabalpur*\n_Synonym of Success_`,
  },
  {
    id: "custom",
    label: "Custom Message",
    icon: Edit3,
    color: "bg-slate-50 border-slate-200 text-slate-700",
    iconColor: "text-slate-500",
    getMessage: (_name: string, _course: string) => "",
  },
];

const WhatsAppCenter = () => {
  const { students } = useAdminData();
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

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
    // Open first student's WhatsApp; rest are queued for individual action
    openWhatsApp(selected[0]);
    toast.info(`Opening WhatsApp for ${selected.length} students. Send individually.`, { duration: 4000 });
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
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Message Templates</h2>
            </div>
            <div className="p-4 space-y-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
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

            <div className="divide-y divide-slate-50">
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
    </div>
  );
};

export default WhatsAppCenter;
