import React, { useMemo, useState } from "react";
import { Edit, Eye, EyeOff, ImagePlus, Plus, Settings, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminData, type GalleryCategory, type GalleryItem } from "@/hooks/useAdminData";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CategoryForm = Omit<GalleryCategory, "id" | "createdAt" | "updatedAt">;
type ItemForm = Omit<GalleryItem, "id" | "createdAt" | "updatedAt">;

const emptyCategory: CategoryForm = {
  name: "",
  slug: "",
  coverUrl: "",
  description: "",
  displayOrder: 0,
  isVisible: true,
};

const emptyItem: ItemForm = {
  title: "",
  imageUrl: "",
  thumbnailUrl: "",
  categoryId: 0,
  isVisible: true,
  isFeatured: false,
  displayOrder: 0,
  eventDate: "",
};

const GalleryManagement = () => {
  const { 
    galleryCategories = [], 
    galleryItems = [], 
    addGalleryCategory, 
    updateGalleryCategory, 
    deleteGalleryCategory, 
    addGalleryItem, 
    updateGalleryItem, 
    deleteGalleryItem 
  } = useAdminData() as any; // Using 'any' cast as the hook typings are added separately

  console.log("GalleryManagement render:", { galleryCategories, galleryItems });

  const [activeTab, setActiveTab] = useState<number | "all">("all");
  const [isSaving, setIsSaving] = useState(false);
  
  // Dialog visibility states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategory);
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);
  
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItem);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [bulkUrls, setBulkUrls] = useState("");

  const sortedCategories = useMemo(() => [...galleryCategories].sort((a, b) => a.displayOrder - b.displayOrder), [galleryCategories]);
  
  const filteredItems = useMemo(() => {
    let items = activeTab === "all" ? galleryItems : galleryItems.filter((i: GalleryItem) => i.categoryId === activeTab);
    return [...items].sort((a: GalleryItem, b: GalleryItem) => a.displayOrder - b.displayOrder);
  }, [galleryItems, activeTab]);

  const generateSlug = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return slug || `cat-${Date.now()}`;
  };

  const saveCategory = async (isEdit: boolean) => {
    const data = isEdit && editingCategory ? editingCategory : categoryForm;
    if (!data.name.trim()) return toast.error("Category name is required");
    
    setIsSaving(true);
    try {
      if (isEdit && editingCategory) {
        await updateGalleryCategory(editingCategory.id, data);
        toast.success("Category updated");
        setEditingCategory(null);
      } else {
        await addGalleryCategory(categoryForm);
        toast.success("Category added");
        setCategoryForm(emptyCategory);
        setIsAddCategoryOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const saveItem = async (isEdit: boolean) => {
    if (isEdit && editingItem) {
      if (!editingItem.imageUrl.trim() || !editingItem.categoryId) return toast.error("Image URL and Category are required");
      setIsSaving(true);
      try {
        await updateGalleryItem(editingItem.id, editingItem);
        toast.success("Photo updated");
        setEditingItem(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update photo");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Add Mode (supports bulk)
    const urls = bulkUrls.trim() ? bulkUrls.split("\n").map(u => u.trim()).filter(Boolean) : [];
    if (!itemForm.imageUrl.trim() && urls.length === 0) return toast.error("Provide an image URL or bulk URLs");
    if (!itemForm.categoryId) return toast.error("Category is required");

    setIsSaving(true);
    try {
      if (urls.length > 0) {
        for (const url of urls) {
          await addGalleryItem({ ...itemForm, imageUrl: url, thumbnailUrl: url });
        }
        toast.success(`${urls.length} photos added successfully`);
      } else {
        await addGalleryItem({ ...itemForm, thumbnailUrl: itemForm.thumbnailUrl || itemForm.imageUrl });
        toast.success("Photo added successfully");
      }
      setItemForm(emptyItem);
      setBulkUrls("");
      setIsAddItemOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save photo");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItemVisibility = async (item: GalleryItem) => {
    try {
      await updateGalleryItem(item.id, { isVisible: !item.isVisible });
      toast.success(`Photo ${item.isVisible ? "hidden" : "shown"}`);
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const toggleItemFeatured = async (item: GalleryItem) => {
    try {
      await updateGalleryItem(item.id, { isFeatured: !item.isFeatured });
      toast.success(item.isFeatured ? "Photo unfeatured" : "Photo featured");
    } catch (err) {
      toast.error("Failed to update featured status");
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Gallery Management</h1>
          <p className="text-slate-500 font-medium">Manage photo categories and gallery images. Paste external image URLs to save server storage.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all">
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader><DialogTitle>Add New Category</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input 
                    value={categoryForm.name} 
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: generateSlug(e.target.value) })} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Slug</Label>
                  <Input value={categoryForm.slug} disabled className="bg-slate-50" />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <textarea 
                    value={categoryForm.description || ""} 
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} 
                    className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Cover Image URL</Label>
                    <Input value={categoryForm.coverUrl || ""} onChange={(e) => setCategoryForm({ ...categoryForm, coverUrl: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Display Order</Label>
                    <Input type="number" value={categoryForm.displayOrder} onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })} />
                  </div>
                </div>
                {categoryForm.coverUrl && (
                  <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 mt-2">
                    <img src={categoryForm.coverUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <button onClick={() => void saveCategory(false)} disabled={isSaving} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
                  {isSaving ? "Saving..." : "Save Category"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Add Photo
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Photo(s)</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Category *</Label>
                  <Select value={itemForm.categoryId ? itemForm.categoryId.toString() : ""} onValueChange={(v) => setItemForm({ ...itemForm, categoryId: Number(v) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedCategories.map((cat: GalleryCategory) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Single Image URL</Label>
                  <Input value={itemForm.imageUrl} onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })} placeholder="https://..." />
                </div>
                
                <div className="grid gap-2">
                  <Label>OR Bulk Add (One URL per line)</Label>
                  <textarea 
                    value={bulkUrls} 
                    onChange={(e) => setBulkUrls(e.target.value)} 
                    placeholder="Paste multiple URLs here..."
                    className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Title / Caption</Label>
                    <Input value={itemForm.title || ""} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Event Date</Label>
                    <Input type="date" value={itemForm.eventDate || ""} onChange={(e) => setItemForm({ ...itemForm, eventDate: e.target.value })} />
                  </div>
                </div>

                {itemForm.imageUrl && !bulkUrls && (
                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-200 mt-2 bg-slate-100 flex items-center justify-center">
                    <img src={itemForm.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
              <DialogFooter>
                <button onClick={() => void saveItem(false)} disabled={isSaving} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
                  {isSaving ? "Saving..." : "Save Photo(s)"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === "all" ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
        >
          All Photos ({galleryItems.length})
        </button>
        {sortedCategories.map((cat: GalleryCategory) => {
          const count = galleryItems.filter((i: GalleryItem) => i.categoryId === cat.id).length;
          return (
            <div key={cat.id} className="flex items-center group relative">
              <button
                onClick={() => setActiveTab(cat.id)}
                className={`pr-10 pl-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === cat.id ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
              >
                {cat.name} ({count})
              </button>
              <button 
                onClick={() => setEditingCategory(cat)} 
                className={`absolute right-2 p-1.5 rounded-full transition-all ${activeTab === cat.id ? "text-white/80 hover:bg-white/20 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Photo Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <ImagePlus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">No photos found in this category.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredItems.map((item: GalleryItem) => {
            const catName = sortedCategories.find((c: GalleryCategory) => c.id === item.categoryId)?.name || "Unknown";
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="aspect-video bg-slate-100 relative group">
                  <img src={item.thumbnailUrl || item.imageUrl} alt={item.title || "Gallery Item"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => window.open(item.imageUrl, '_blank')} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm"><Eye className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{item.title || "Untitled Photo"}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{catName}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {item.isFeatured && <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">Featured</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.isVisible ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                        {item.isVisible ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-1 pt-2 border-t border-slate-100">
                    <button onClick={() => setEditingItem(item)} className="flex-1 p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all" title="Edit"><Edit className="w-4 h-4 mx-auto" /></button>
                    <button onClick={() => void toggleItemVisibility(item)} className="flex-1 p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" title="Toggle Visibility">{item.isVisible ? <EyeOff className="w-4 h-4 mx-auto" /> : <Eye className="w-4 h-4 mx-auto" />}</button>
                    <button onClick={() => void toggleItemFeatured(item)} className="flex-1 p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all" title="Toggle Featured"><Star className={`w-4 h-4 mx-auto ${item.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} /></button>
                    <button onClick={() => void deleteGalleryItem(item.id).then(() => toast.success("Photo deleted")).catch(() => toast.error("Failed to delete"))} className="flex-1 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Delete"><Trash2 className="w-4 h-4 mx-auto" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Category Dialog */}
      <Dialog open={Boolean(editingCategory)} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          {editingCategory && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value, slug: generateSlug(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label>Slug</Label>
                  <Input value={editingCategory.slug} disabled className="bg-slate-50" />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <textarea value={editingCategory.description || ""} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Cover Image URL</Label>
                    <Input value={editingCategory.coverUrl || ""} onChange={(e) => setEditingCategory({ ...editingCategory, coverUrl: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Display Order</Label>
                    <Input type="number" value={editingCategory.displayOrder} onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: Number(e.target.value) })} />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    deleteGalleryCategory(editingCategory.id).then(() => {
                      toast.success("Category deleted");
                      setEditingCategory(null);
                    }).catch(() => toast.error("Failed to delete"));
                  }}
                  className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold text-sm"
                >
                  Delete
                </button>
                <button onClick={() => void saveCategory(true)} disabled={isSaving} className="bg-primary text-white font-bold px-6 py-2 rounded-lg disabled:opacity-60">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Photo Dialog */}
      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader><DialogTitle>Edit Photo</DialogTitle></DialogHeader>
          {editingItem && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Category *</Label>
                  <Select value={editingItem.categoryId.toString()} onValueChange={(v) => setEditingItem({ ...editingItem, categoryId: Number(v) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedCategories.map((cat: GalleryCategory) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Image URL</Label>
                  <Input value={editingItem.imageUrl} onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value, thumbnailUrl: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Title / Caption</Label>
                    <Input value={editingItem.title || ""} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Event Date</Label>
                    <Input type="date" value={editingItem.eventDate || ""} onChange={(e) => setEditingItem({ ...editingItem, eventDate: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={editingItem.displayOrder} onChange={(e) => setEditingItem({ ...editingItem, displayOrder: Number(e.target.value) })} />
                </div>
                {editingItem.imageUrl && (
                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-200 mt-2 bg-slate-100 flex items-center justify-center">
                    <img src={editingItem.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
              <DialogFooter>
                <button onClick={() => void saveItem(true)} disabled={isSaving} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
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

export default GalleryManagement;
