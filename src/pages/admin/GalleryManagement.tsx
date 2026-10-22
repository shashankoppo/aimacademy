import React, { useMemo, useState } from "react";
import { Edit, Eye, EyeOff, ImagePlus, Plus, Settings, Star, Trash2, Upload, Video, Play, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminData, type GalleryCategory, type GalleryItem } from "@/hooks/useAdminData";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadFile } from "@/lib/admin-api";

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
  mediaType: "IMAGE",
};

const getYouTubeThumbnail = (url: string) => {
  const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
};

const isYouTubeUrl = (url: string) => {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i.test(url);
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
  } = useAdminData() as any;

  const [activeTab, setActiveTab] = useState<number | "all">("all");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
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

  const handleFileUpload = async (file: File, target: "category" | "item" | "edit-category" | "edit-item") => {
    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      if (target === "category") {
        setCategoryForm((prev) => ({ ...prev, coverUrl: res.url }));
      } else if (target === "edit-category" && editingCategory) {
        setEditingCategory((prev) => prev ? { ...prev, coverUrl: res.url } : null);
      } else if (target === "item") {
        const isVid = file.type.startsWith("video/");
        setItemForm((prev) => ({ 
          ...prev, 
          imageUrl: res.url, 
          thumbnailUrl: isVid ? "" : res.url,
          mediaType: isVid ? "VIDEO" : "IMAGE" 
        }));
      } else if (target === "edit-item" && editingItem) {
        const isVid = file.type.startsWith("video/");
        setEditingItem((prev) => prev ? { 
          ...prev, 
          imageUrl: res.url, 
          thumbnailUrl: isVid ? prev.thumbnailUrl : res.url,
          mediaType: isVid ? "VIDEO" : "IMAGE"
        } : null);
      }
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const saveCategory = async (isEdit: boolean) => {
    const data = isEdit && editingCategory ? editingCategory : categoryForm;
    if (!data.name.trim()) return toast.error("Category name is required");
    
    setIsSaving(true);
    try {
      if (isEdit && editingCategory) {
        await updateGalleryCategory(editingCategory.id, data);
        toast.success("Category updated successfully");
        setEditingCategory(null);
      } else {
        await addGalleryCategory(categoryForm);
        toast.success("Category added successfully");
        setCategoryForm(emptyCategory);
        setIsAddCategoryOpen(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const openAddItemDialog = () => {
    setItemForm({
      ...emptyItem,
      categoryId: activeTab !== "all" ? activeTab : (sortedCategories[0]?.id || 0),
    });
    setBulkUrls("");
    setIsAddItemOpen(true);
  };

  const saveItem = async (isEdit: boolean) => {
    if (isEdit && editingItem) {
      if (!editingItem.imageUrl.trim() || !editingItem.categoryId) return toast.error("Media URL and Category are required");
      setIsSaving(true);
      try {
        const isYt = isYouTubeUrl(editingItem.imageUrl);
        const mediaType = editingItem.mediaType || (isYt ? "VIDEO" : "IMAGE");
        const thumb = editingItem.thumbnailUrl || (isYt ? getYouTubeThumbnail(editingItem.imageUrl) : editingItem.imageUrl);
        await updateGalleryItem(editingItem.id, {
          ...editingItem,
          mediaType,
          thumbnailUrl: thumb,
        });
        toast.success("Gallery item updated");
        setEditingItem(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update item");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Add Mode (supports bulk)
    const urls = bulkUrls.trim() ? bulkUrls.split("\n").map(u => u.trim()).filter(Boolean) : [];
    if (!itemForm.imageUrl.trim() && urls.length === 0) return toast.error("Provide a media URL, upload a file, or paste bulk URLs");
    if (!itemForm.categoryId) return toast.error("Please select a Category");

    setIsSaving(true);
    try {
      if (urls.length > 0) {
        for (const url of urls) {
          const isYt = isYouTubeUrl(url);
          const thumb = isYt ? getYouTubeThumbnail(url) : url;
          await addGalleryItem({ 
            ...itemForm, 
            imageUrl: url, 
            thumbnailUrl: thumb,
            mediaType: isYt ? "VIDEO" : "IMAGE" 
          });
        }
        toast.success(`${urls.length} gallery items added successfully`);
      } else {
        const isYt = isYouTubeUrl(itemForm.imageUrl);
        const thumb = itemForm.thumbnailUrl || (isYt ? getYouTubeThumbnail(itemForm.imageUrl) : itemForm.imageUrl);
        await addGalleryItem({ 
          ...itemForm, 
          thumbnailUrl: thumb,
          mediaType: itemForm.mediaType || (isYt ? "VIDEO" : "IMAGE") 
        });
        toast.success("Gallery item added successfully");
      }
      setItemForm(emptyItem);
      setBulkUrls("");
      setIsAddItemOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItemVisibility = async (item: GalleryItem) => {
    try {
      await updateGalleryItem(item.id, { isVisible: !item.isVisible });
      toast.success(`Item ${item.isVisible ? "hidden" : "shown"}`);
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const toggleItemFeatured = async (item: GalleryItem) => {
    try {
      await updateGalleryItem(item.id, { isFeatured: !item.isFeatured });
      toast.success(item.isFeatured ? "Item unfeatured" : "Item featured");
    } catch (err) {
      toast.error("Failed to update featured status");
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Gallery & Media Management</h1>
          <p className="text-slate-500 font-medium">Manage photo & video categories and gallery media. Upload files directly or paste YouTube/external links.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Add Category Dialog */}
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
                  <Label>Name *</Label>
                  <Input 
                    value={categoryForm.name} 
                    placeholder="e.g. Annual Celebrations, Toppers 2026"
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: generateSlug(e.target.value) })} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Slug</Label>
                  <Input value={categoryForm.slug} disabled className="bg-slate-50" />
                </div>
                <div className="grid gap-2">
                  <Label>Description (Optional)</Label>
                  <textarea 
                    value={categoryForm.description || ""} 
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} 
                    placeholder="Short description of this album/category..."
                    className="min-h-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Cover Image (Upload file or enter URL)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={categoryForm.coverUrl || ""} 
                      onChange={(e) => setCategoryForm({ ...categoryForm, coverUrl: e.target.value })} 
                      placeholder="https://... or click Upload"
                      className="flex-1"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? "Uploading..." : "Upload"}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileUpload(file, "category");
                        }} 
                      />
                    </label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={categoryForm.displayOrder} onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })} />
                </div>
                {categoryForm.coverUrl && (
                  <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 mt-2 bg-slate-100">
                    <img src={categoryForm.coverUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <button onClick={() => void saveCategory(false)} disabled={isSaving || isUploading} className="w-full bg-primary text-white font-bold py-2.5 rounded-lg disabled:opacity-60">
                  {isSaving ? "Saving..." : "Save Category"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Item Dialog */}
          <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
            <button 
              onClick={openAddItemDialog}
              className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Photo / Video
            </button>
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Photo or Video</DialogTitle></DialogHeader>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Media Type</Label>
                    <Select value={itemForm.mediaType || "IMAGE"} onValueChange={(v) => setItemForm({ ...itemForm, mediaType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMAGE">📷 Photo / Image</SelectItem>
                        <SelectItem value="VIDEO">🎥 Video / YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Event Date (Optional)</Label>
                    <Input type="date" value={itemForm.eventDate || ""} onChange={(e) => setItemForm({ ...itemForm, eventDate: e.target.value })} />
                  </div>
                </div>

                {/* Upload or Link */}
                <div className="grid gap-2">
                  <Label>Media URL or Upload from Device</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={itemForm.imageUrl} 
                      onChange={(e) => {
                        const val = e.target.value;
                        const isYt = isYouTubeUrl(val);
                        setItemForm({ 
                          ...itemForm, 
                          imageUrl: val, 
                          thumbnailUrl: isYt ? getYouTubeThumbnail(val) : itemForm.thumbnailUrl,
                          mediaType: isYt ? "VIDEO" : itemForm.mediaType 
                        });
                      }} 
                      placeholder="https://... or YouTube video link" 
                      className="flex-1"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shrink-0">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>{isUploading ? "Uploading..." : "Upload File"}</span>
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileUpload(file, "item");
                        }} 
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">Supports direct image/video uploads or YouTube links (e.g. https://www.youtube.com/watch?v=...).</p>
                </div>
                
                <div className="grid gap-2">
                  <Label>OR Bulk Add URLs (One URL per line)</Label>
                  <textarea 
                    value={bulkUrls} 
                    onChange={(e) => setBulkUrls(e.target.value)} 
                    placeholder="Paste multiple image/video URLs here (one per line)..."
                    className="min-h-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Title / Caption (Optional)</Label>
                  <Input value={itemForm.title || ""} placeholder="e.g. Independence Day Celebration" onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} />
                </div>

                {/* Preview */}
                {itemForm.imageUrl && !bulkUrls && (
                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-200 mt-2 bg-slate-100 flex items-center justify-center relative">
                    {itemForm.mediaType === "VIDEO" && !isYouTubeUrl(itemForm.imageUrl) ? (
                      <video src={itemForm.imageUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={itemForm.thumbnailUrl || (isYouTubeUrl(itemForm.imageUrl) ? getYouTubeThumbnail(itemForm.imageUrl) : itemForm.imageUrl)} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        onError={(e) => (e.currentTarget.style.display = 'none')} 
                      />
                    )}
                    {itemForm.mediaType === "VIDEO" && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white flex items-center gap-1 shadow">
                        <Play className="w-3 h-3 fill-white" /> Video
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <button onClick={() => void saveItem(false)} disabled={isSaving || isUploading} className="w-full bg-primary text-white font-bold py-2.5 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSaving ? "Saving..." : "Save Photo / Video"}</span>
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
          All Media ({galleryItems.length})
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
                title="Edit Category"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <ImagePlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-bold mb-1">No media found in this category.</p>
          <p className="text-slate-400 text-xs">Click "+ Add Photo / Video" above to add items to your gallery.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredItems.map((item: GalleryItem) => {
            const catName = sortedCategories.find((c: GalleryCategory) => c.id === item.categoryId)?.name || "Unknown";
            const isVid = item.mediaType === "VIDEO" || isYouTubeUrl(item.imageUrl);
            const thumb = item.thumbnailUrl || (isVid ? getYouTubeThumbnail(item.imageUrl) : item.imageUrl);

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="aspect-video bg-slate-100 relative group">
                  <img src={thumb || item.imageUrl} alt={item.title || "Gallery Item"} className="w-full h-full object-cover" />
                  
                  {isVid && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-black/75 text-white flex items-center gap-1 backdrop-blur-sm">
                      <Play className="w-3 h-3 fill-red-500 text-red-500" /> Video
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => window.open(item.imageUrl, '_blank')} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm" title="Open Link">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{item.title || "Untitled Media"}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{catName}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
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
                    <button onClick={() => void deleteGalleryItem(item.id).then(() => toast.success("Item deleted")).catch(() => toast.error("Failed to delete"))} className="flex-1 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Delete"><Trash2 className="w-4 h-4 mx-auto" /></button>
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
                  <textarea value={editingCategory.description || ""} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} className="min-h-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid gap-2">
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-2">
                    <Input value={editingCategory.coverUrl || ""} onChange={(e) => setEditingCategory({ ...editingCategory, coverUrl: e.target.value })} className="flex-1" />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? "Uploading..." : "Upload"}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileUpload(file, "edit-category");
                        }} 
                      />
                    </label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={editingCategory.displayOrder} onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: Number(e.target.value) })} />
                </div>
              </div>
              <DialogFooter className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    deleteGalleryCategory(editingCategory.id).then(() => {
                      toast.success("Category deleted");
                      setEditingCategory(null);
                    }).catch(() => toast.error("Failed to delete category"));
                  }}
                  className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold text-sm"
                >
                  Delete
                </button>
                <button onClick={() => void saveCategory(true)} disabled={isSaving || isUploading} className="bg-primary text-white font-bold px-6 py-2 rounded-lg disabled:opacity-60">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Photo / Video Dialog */}
      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader><DialogTitle>Edit Gallery Item</DialogTitle></DialogHeader>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Media Type</Label>
                    <Select value={editingItem.mediaType || "IMAGE"} onValueChange={(v) => setEditingItem({ ...editingItem, mediaType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMAGE">📷 Photo / Image</SelectItem>
                        <SelectItem value="VIDEO">🎥 Video / YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Event Date</Label>
                    <Input type="date" value={editingItem.eventDate || ""} onChange={(e) => setEditingItem({ ...editingItem, eventDate: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Media URL</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={editingItem.imageUrl} 
                      onChange={(e) => {
                        const val = e.target.value;
                        const isYt = isYouTubeUrl(val);
                        setEditingItem({ 
                          ...editingItem, 
                          imageUrl: val, 
                          thumbnailUrl: isYt ? getYouTubeThumbnail(val) : editingItem.thumbnailUrl,
                          mediaType: isYt ? "VIDEO" : editingItem.mediaType 
                        });
                      }} 
                      className="flex-1"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? "Uploading..." : "Upload"}</span>
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileUpload(file, "edit-item");
                        }} 
                      />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Title / Caption</Label>
                    <Input value={editingItem.title || ""} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Display Order</Label>
                    <Input type="number" value={editingItem.displayOrder} onChange={(e) => setEditingItem({ ...editingItem, displayOrder: Number(e.target.value) })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button onClick={() => void saveItem(true)} disabled={isSaving || isUploading} className="w-full bg-primary text-white font-bold py-2.5 rounded-lg disabled:opacity-60">
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
