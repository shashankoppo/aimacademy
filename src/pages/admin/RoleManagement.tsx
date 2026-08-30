import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/admin-api";
import { Shield, Plus, Edit, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type Permission = { id: string; key: string; description?: string };
type Role = { id: string; key: string; name: string; isSystem: boolean; permissions: string[] };

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [createForm, setCreateForm] = useState({ name: "", key: "", permissions: [] as string[] });
  const [editForm, setEditForm] = useState({ name: "", permissions: [] as string[] });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await apiRequest<{ success: boolean; permissions: Permission[] }>("/admin/iam/permissions");
      const rRes = await apiRequest<{ success: boolean; roles: Role[] }>("/admin/iam/roles");
      if (pRes.success) setPermissions(pRes.permissions);
      if (rRes.success) setRoles(rRes.roles);
    } catch (e: any) {
      toast.error(e.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.key) return toast.error("Name and Key are required");
    setUpdating(true);
    try {
      const data = await apiRequest<{ success: boolean; role: Role }>("/admin/iam/roles", {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      if (data.success) {
        toast.success("Role created");
        setIsCreateOpen(false);
        setCreateForm({ name: "", key: "", permissions: [] });
        fetchData();
      } else {
        toast.error((data as any).message || "Failed to create role");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create role");
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedRole) return;
    setUpdating(true);
    try {
      const data = await apiRequest<{ success: boolean }>(`/admin/iam/roles/${selectedRole.id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      if (data.success) {
        toast.success("Role updated");
        setIsEditOpen(false);
        fetchData();
      } else {
        toast.error((data as any).message || "Failed to update role");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update role");
    } finally {
      setUpdating(false);
    }
  };

  const toggleCreatePermission = (key: string, checked: boolean) => {
    setCreateForm((p) => ({
      ...p,
      permissions: checked ? [...p.permissions, key] : p.permissions.filter((k) => k !== key),
    }));
  };

  const toggleEditPermission = (key: string, checked: boolean) => {
    setEditForm((p) => ({
      ...p,
      permissions: checked ? [...p.permissions, key] : p.permissions.filter((k) => k !== key),
    }));
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-gray-800">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 p-3 rounded-xl">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IAM & PAM Settings</h1>
            <p className="text-gray-500">Manage industry-grade role-based access control (RBAC)</p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition">
              <Plus className="h-5 w-5" />
              <span>Create Role</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="e.g. Content Manager" />
                </div>
                <div className="space-y-2">
                  <Label>Role Key</Label>
                  <Input value={createForm.key} onChange={(e) => setCreateForm({ ...createForm, key: e.target.value.toUpperCase().replace(/\s+/g, "_") })} placeholder="e.g. CONTENT_MANAGER" />
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <Label className="text-lg">Assign Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 border rounded-xl p-4 bg-gray-50">
                  {permissions.map((p) => (
                    <div key={p.key} className="flex items-start space-x-3 bg-white p-3 rounded-lg border shadow-sm">
                      <Checkbox
                        id={`c-perm-${p.key}`}
                        checked={createForm.permissions.includes(p.key)}
                        onCheckedChange={(checked) => toggleCreatePermission(p.key, checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor={`c-perm-${p.key}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {p.key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <button onClick={handleCreate} disabled={updating} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg disabled:opacity-60">
                {updating ? "Saving..." : "Create Role"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading roles...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600">Role</th>
                  <th className="p-4 font-semibold text-gray-600">Key</th>
                  <th className="p-4 font-semibold text-gray-600">Permissions</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-500">
                      <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="font-bold">No roles found.</p>
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{role.name}</div>
                        {role.isSystem && (
                          <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            System Default
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <code className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{role.key}</code>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.length === 0 ? (
                            <span className="text-sm text-gray-400 italic">No permissions</span>
                          ) : role.permissions.length > 5 ? (
                            <>
                              {role.permissions.slice(0, 5).map((perm) => (
                                <span key={perm} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100">
                                  {perm}
                                </span>
                              ))}
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">+{role.permissions.length - 5} more</span>
                            </>
                          ) : (
                            role.permissions.map((perm) => (
                              <span key={perm} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100">
                                {perm}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRole(role);
                            setEditForm({ name: role.name, permissions: role.permissions });
                            setIsEditOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          {selectedRole?.isSystem && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg flex items-start space-x-2 text-sm border border-red-100">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p>This is a core system role. Be careful when modifying permissions for this role, as it may affect core system functionality.</p>
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2 pt-4">
              <Label className="text-lg">Assigned Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 border rounded-xl p-4 bg-gray-50">
                {permissions.map((p) => (
                  <div key={p.key} className="flex items-start space-x-3 bg-white p-3 rounded-lg border shadow-sm hover:border-indigo-200 transition">
                    <Checkbox
                      id={`e-perm-${p.key}`}
                      checked={editForm.permissions.includes(p.key)}
                      onCheckedChange={(checked) => toggleEditPermission(p.key, checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label htmlFor={`e-perm-${p.key}`} className="text-sm font-medium leading-none cursor-pointer">
                        {p.key}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={handleEdit} disabled={updating} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg disabled:opacity-60">
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
