import React, { useMemo, useState } from "react";
import { Download, Edit, Eye, EyeOff, FileText, Link2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminData, type NoteItem } from "@/hooks/useAdminData";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NoteForm = Omit<NoteItem, "id">;

const emptyNote: NoteForm = {
  title: "",
  description: "",
  category: "",
  thumbnailUrl: "",
  fileUrl: "",
  viewUrl: "",
  isVisible: true,
  displayOrder: 0,
};

const NotesManagement = () => {
  const { notes, addNote, updateNote, deleteNote } = useAdminData();
  const [form, setForm] = useState<NoteForm>(emptyNote);
  const [editing, setEditing] = useState<NoteItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sortedNotes = useMemo(() => [...notes].sort((a, b) => a.displayOrder - b.displayOrder), [notes]);

  const onFileLoad = (field: "thumbnailUrl" | "fileUrl", file?: File | null, isEdit = false) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (isEdit && editing) {
        setEditing({ ...editing, [field]: result });
      } else {
        setForm({ ...form, [field]: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = (note: NoteForm | NoteItem) => {
    if (!note.title.trim() || !note.description.trim() || !note.category.trim()) return "Please fill title, description, and category";
    if (!note.fileUrl && !note.viewUrl) return "Please upload a file or add a link";
    return null;
  };

  const saveNew = async () => {
    const error = validate(form);
    if (error) return toast.error(error);
    setIsSaving(true);
    try {
      await addNote(form);
      setForm(emptyNote);
      toast.success("Note added successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setIsSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const error = validate(editing);
    if (error) return toast.error(error);
    setIsSaving(true);
    try {
      await updateNote(editing.id, editing);
      setEditing(null);
      toast.success("Note updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update note");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisible = async (note: NoteItem) => {
    try {
      await updateNote(note.id, { isVisible: !note.isVisible });
      toast.success(`Note ${note.isVisible ? "hidden" : "shown"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update note");
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Notes Management</h1>
          <p className="text-slate-500 font-medium">Manage downloadable notes shown in the Resources section.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Thumbnail URL</Label>
                <Input value={form.thumbnailUrl ?? ""} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Download / File Link</Label>
                <Input value={form.fileUrl ?? ""} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
                <input type="file" accept=".pdf,.doc,.docx,application/pdf,.doc,.docx" onChange={(e) => onFileLoad("fileUrl", e.target.files?.[0])} className="text-xs text-slate-500" />
              </div>
              <div className="grid gap-2">
                <Label>View Link</Label>
                <Input value={form.viewUrl ?? ""} onChange={(e) => setForm({ ...form, viewUrl: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Thumbnail Upload</Label>
                <input type="file" accept="image/*" onChange={(e) => onFileLoad("thumbnailUrl", e.target.files?.[0])} className="text-xs text-slate-500" />
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => void saveNew()} disabled={isSaving} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
                {isSaving ? "Saving..." : "Save Note"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sortedNotes.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">No notes found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-50 text-slate-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{note.title}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{note.category}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${note.isVisible ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                {note.isVisible ? "Visible" : "Hidden"}
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed min-h-16">{note.description}</p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span>Order: {note.displayOrder}</span>
              <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> {note.fileUrl || note.viewUrl ? "Linked" : "Missing"}</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setEditing(note)} className="flex-1 p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all"><Edit className="w-4 h-4 mx-auto" /></button>
              <button onClick={() => void toggleVisible(note)} className="flex-1 p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">{note.isVisible ? <EyeOff className="w-4 h-4 mx-auto" /> : <Eye className="w-4 h-4 mx-auto" />}</button>
              <button onClick={() => note.fileUrl && window.open(note.fileUrl, "_blank")} className="flex-1 p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"><Download className="w-4 h-4 mx-auto" /></button>
              <button onClick={() => void deleteNote(note.id).then(() => toast.success("Note deleted")).catch((err) => toast.error(err instanceof Error ? err.message : "Failed to delete note"))} className="flex-1 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4 mx-auto" /></button>
            </div>
          </div>
        ))}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {editing && (
            <>
              <div className="grid gap-4 py-4">
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                <div className="grid grid-cols-2 gap-4">
                  <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                  <Input type="number" value={editing.displayOrder} onChange={(e) => setEditing({ ...editing, displayOrder: Number(e.target.value) })} />
                </div>
                <Input value={editing.thumbnailUrl ?? ""} onChange={(e) => setEditing({ ...editing, thumbnailUrl: e.target.value })} />
                <Input value={editing.fileUrl ?? ""} onChange={(e) => setEditing({ ...editing, fileUrl: e.target.value })} />
                <Input value={editing.viewUrl ?? ""} onChange={(e) => setEditing({ ...editing, viewUrl: e.target.value })} />
                <input type="file" accept=".pdf,.doc,.docx,application/pdf,.doc,.docx" onChange={(e) => onFileLoad("fileUrl", e.target.files?.[0], true)} className="text-xs text-slate-500" />
                <input type="file" accept="image/*" onChange={(e) => onFileLoad("thumbnailUrl", e.target.files?.[0], true)} className="text-xs text-slate-500" />
              </div>
              <DialogFooter>
                <button onClick={() => void saveEdit()} disabled={isSaving} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesManagement;
