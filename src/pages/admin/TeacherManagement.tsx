import React, { useMemo, useState } from "react";
import { Plus, Search, ShieldCheck, KeyRound, Edit, UserX, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/admin-api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RoleKey = "ADMIN" | "TEACHER" | "STUDENT" | "STAFF";

type IamUser = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: RoleKey;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
};

const TeacherManagement = () => {
  const [users, setUsers] = useState<IamUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<IamUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [resetting, setResetting] = useState<string | null>(null);

  const [form, setForm] = useState<{ name: string; email: string; phone: string; role: RoleKey; password: string; isActive: boolean }>({
    name: "",
    email: "",
    phone: "",
    role: "TEACHER",
    password: "",
    isActive: true,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<{ success: true; users: IamUser[] }>("/admin/iam/users");
      setUsers(data.users);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQ =
        !q ||
        u.name.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q);
      const matchesRole = u.role === "TEACHER";
      return matchesQ && matchesRole;
    });
  }, [users, search]);

  const openCreate = () => {
    setForm({ name: "", email: "", phone: "", role: "TEACHER", password: "", isActive: true });
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    try {
      setCreating(true);
      const payload = {
        name: form.name,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        role: form.role,
        password: form.password || undefined,
        isActive: form.isActive,
      };
      const data = await apiRequest<{ success: true; user: IamUser; tempPassword: string }>("/admin/iam/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setUsers((prev) => [data.user, ...prev]);
      setCreateOpen(false);
      await navigator.clipboard.writeText(data.tempPassword);
      toast.success("User created. Temporary password copied to clipboard.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (u: IamUser) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email ?? "", phone: u.phone ?? "", role: u.role, password: "", isActive: u.isActive });
  };

  const submitEdit = async () => {
    if (!editUser) return;
    try {
      setUpdating(true);
      const payload = {
        name: form.name,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        role: form.role,
        isActive: form.isActive,
        password: form.password || undefined,
      };
      const data = await apiRequest<{ success: true; user: IamUser }>(`/admin/iam/users/${editUser.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, ...data.user } : u)));
      setEditUser(null);
      toast.success("User updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const resetPassword = async (userId: string) => {
    try {
      setResetting(userId);
      const data = await apiRequest<{ success: true; tempPassword: string }>(`/admin/iam/users/${userId}/reset-password`, {
        method: "POST",
      });
      await navigator.clipboard.writeText(data.tempPassword);
      toast.success("Password reset. Temporary password copied to clipboard.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reset password");
    } finally {
      setResetting(null);
    }
  };

  const deactivate = async (u: IamUser) => {
    try {
      const data = await apiRequest<{ success: true; user: IamUser }>(`/admin/iam/users/${u.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: false }),
      });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...data.user } : x)));
      toast.success("User deactivated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to deactivate user");
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Teacher Management</h1>
            <p className="text-slate-500 font-medium">Manage teacher accounts, reset passwords, and update details.</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-slate-800 transition-colors">
          <Plus className="w-5 h-5" /> Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
          <button onClick={() => void loadUsers()} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary">
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Name</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Email</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Phone</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="p-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 text-sm">{u.name}</td>
                  <td className="p-4 text-sm text-slate-500 font-body">{u.email ?? "-"}</td>
                  <td className="p-4 text-sm text-slate-500 font-body">{u.phone ?? "-"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${u.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100" aria-label="Edit user">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => void resetPassword(u.id)} className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100" aria-label="Reset password">
                        {resetting === u.id ? <span className="text-[10px] font-black">…</span> : <KeyRound className="w-4 h-4" />}
                      </button>
                      <button onClick={() => void deactivate(u)} disabled={!u.isActive} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40" aria-label="Deactivate user">
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No teachers found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Teacher</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email (Optional)</Label>
                <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Phone (Optional)</Label>
                <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Password (Optional)</Label>
                <Input value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Auto-generated if blank" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => void submitCreate()} disabled={creating} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
              {creating ? "Adding..." : "Add Teacher"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editUser)} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>
          {editUser && (
            <>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Full Name</Label>
                  <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={form.isActive ? "ACTIVE" : "DISABLED"} onValueChange={(v) => setForm((p) => ({ ...p, isActive: v === "ACTIVE" }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DISABLED">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>New Password (Optional)</Label>
                    <Input value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Leave blank to keep unchanged" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => void submitEdit()} disabled={updating} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherManagement;
