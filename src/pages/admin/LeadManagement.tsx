import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, Clock, Filter, Trash2, Edit2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/admin-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  course: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  "NEW": "bg-blue-100 text-blue-700",
  "CONTACTED": "bg-amber-100 text-amber-700",
  "CONVERTED": "bg-emerald-100 text-emerald-700",
  "DISCARDED": "bg-slate-100 text-slate-600"
};

const LeadManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadLeads = async () => {
    try {
      const data = await apiRequest<{ success: true; leads: Lead[] }>("/admin/leads");
      setLeads(data.leads);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const openEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedLead) return;
    setIsUpdating(true);
    try {
      await apiRequest(`/admin/leads/${selectedLead.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: editStatus }),
      });
      toast.success("Lead status updated");
      setIsModalOpen(false);
      loadLeads();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update lead");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await apiRequest(`/admin/leads/${id}`, { method: "DELETE" });
      toast.success("Lead deleted");
      loadLeads();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete lead");
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(search.toLowerCase()) || 
      l.phone.includes(search) ||
      (l.email && l.email.toLowerCase().includes(search.toLowerCase())) ||
      (l.course && l.course.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading leads...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Lead Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage student inquiries.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONVERTED">Converted</option>
              <option value="DISCARDED">Discarded</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Lead Info</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Course Int.</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5" />
                        {lead.phone}
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                          <Mail className="w-3.5 h-3.5" />
                          {lead.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {lead.course || <span className="text-slate-400">Not specified</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[lead.status] || STATUS_COLORS["NEW"]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(lead)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Lead Status</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="py-4 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900 mb-1">{selectedLead.name}</div>
                <div className="text-sm text-slate-600 mb-3">{selectedLead.phone}</div>
                {selectedLead.message && (
                  <div className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Message:</div>
                    {selectedLead.message}
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CONVERTED">Converted</option>
                  <option value="DISCARDED">Discarded</option>
                </select>
              </div>
            </div>
          )}
            <DialogFooter>
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleUpdateStatus} disabled={isUpdating} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60">
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadManagement;
