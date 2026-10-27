import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Edit, Eye, EyeOff, ImagePlus, Plus, Settings, Star, Trash2, Upload, Video, Play, Image as ImageIcon, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAdminData, type GalleryCategory, type GalleryItem } from "@/hooks/useAdminData";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadFile, apiRequest } from "@/lib/admin-api";
import { usePagination } from "@/hooks/usePagination";
import PaginationBar from "@/components/ui/PaginationBar";

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
    deleteGalleryItem,
    refreshData,
    loading = false
  } = useAdminData() as any;

  const [localCategories, setLocalCategories] = useState<GalleryCategory[]>([]);
  const [localItems, setLocalItems] = useState<GalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<number | "all">("all");
  const localMutated = React.useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync external galleryCategories when available
  useEffect(() => {
    if (Array.isArray(galleryCategories) && galleryCategories.length > 0) {
      setLocalCategories(galleryCategories);
    }
  }, [galleryCategories]);

  // Sync external galleryItems when available — but ONLY before any local mutation
  // After a save, localMutated.current = true prevents overwrite until next loadData()
  useEffect(() => {
    if (Array.isArray(galleryItems) && !localMutated.current) {
      setLocalItems(galleryItems);
    }
  }, [galleryItems]);

  // Direct fetch categories and items on mount for guaranteed fresh data
  const loadData = useCallback(async () => {
    try {
      const cats = await apiRequest<GalleryCategory[]>("/admin/gallery/categories");
      if (Array.isArray(cats) && cats.length > 0) {
        setLocalCategories(cats);
      }
    } catch {}
    try {
      const pubCats = await apiRequest<GalleryCategory[]>("/public/gallery/categories");
      if (Array.isArray(pubCats) && pubCats.length > 0) {
        setLocalCategories((prev) => (prev.length > 0 ? prev : pubCats));
      }
    } catch {}
    try {
      const items = await apiRequest<GalleryItem[]>("/admin/gallery/items");
      if (Array.isArray(items)) {
        localMutated.current = false;   // reset — server data is now the truth
        setLocalItems(items);
      }
    } catch {}
    try {
      const pubItems = await apiRequest<GalleryItem[]>("/public/gallery/items");
      if (Array.isArray(pubItems)) {
        setLocalItems((prev) => (prev.length > 0 ? prev : pubItems));
      }
    } catch {}
  }, []);

  useEffect(() => {
    void loadData();
    if (refreshData) {
      void refreshData();
    }
  }, [loadData, refreshData]);
  
  // Dialog visibility states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategory);
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);
  
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItem);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [bulkUrls, setBulkUrls] = useState("");
  const [quickCatName, setQuickCatName] = useState("");
  const [isCreatingQuickCat, setIsCreatingQuickCat] = useState(false);
  const [showQuickCat, setShowQuickCat] = useState(false);

  const sortedCategories = useMemo(() => {
    const list = localCategories.length > 0 ? localCategories : (galleryCategories || []);
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [localCategories, galleryCategories]);
  
  const allItems = useMemo(() => {
    return localItems.length > 0 ? localItems : (galleryItems || []);
  }, [localItems, galleryItems]);

  const filteredItems = useMemo(() => {
    let items = activeTab === "all" 
      ? allItems 
      : allItems.filter((i: GalleryItem) => Number(i.categoryId) === Number(activeTab));
    return [...items].sort((a: GalleryItem, b: GalleryItem) => a.displayOrder - b.displayOrder);
  }, [allItems, activeTab]);

  const galleryPagination = usePagination(filteredItems, 12);
  const pagedItems = galleryPagination.paginatedData;

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
        const updated = await updateGalleryCategory(editingCategory.id, data);
        setLocalCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success("Category updated successfully");
        setEditingCategory(null);
      } else {
        const created = await addGalleryCategory(categoryForm);
        setLocalCategories((prev) => {
          const filtered = prev.filter((c) => c.id !== created.id && c.name.toLowerCase() !== created.name.toLowerCase());
          return [...filtered, created].sort((a, b) => a.displayOrder - b.displayOrder);
        });
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

  const handleQuickAddCategory = async () => {
    if (!quickCatName.trim()) return toast.error("Category name is required");
    setIsCreatingQuickCat(true);
    try {
      const newCat = await addGalleryCategory({
        name: quickCatName.trim(),
        slug: generateSlug(quickCatName.trim()),
        coverUrl: "",
        description: "",
        displayOrder: sortedCategories.length + 1,
        isVisible: true,
      });
      setLocalCategories((prev) => {
        const filtered = prev.filter((c) => c.id !== newCat.id && c.name.toLowerCase() !== newCat.name.toLowerCase());
        return [...filtered, newCat].sort((a, b) => a.displayOrder - b.displayOrder);
      });
      setItemForm((prev) => ({ ...prev, categoryId: newCat.id }));
      setQuickCatName("");
      setShowQuickCat(false);
      toast.success(`Category "${newCat.name}" created and selected!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsCreatingQuickCat(false);
    }
  };

  useEffect(() => {
    if (sortedCategories.length > 0 && (!itemForm.categoryId || itemForm.categoryId === 0)) {
      setItemForm((prev) => ({
        ...prev,
        categoryId: activeTab !== "all" ? Number(activeTab) : sortedCategories[0].id,
      }));
    }
  }, [sortedCategories, activeTab]);

  const openAddItemDialog = () => {
    const defaultCatId = activeTab !== "all" ? Number(activeTab) : (sortedCategories[0]?.id || 1);
    setItemForm({
      ...emptyItem,
      categoryId: defaultCatId,
    });
    setBulkUrls("");
    setShowQuickCat(false);
    setIsAddItemOpen(true);
  };

  const saveItem = async (isEdit: boolean) => {
    if (isEdit && editingItem) {
      const finalCategoryId = Number(editingItem.categoryId) || sortedCategories[0]?.id || 1;
      if (!editingItem.imageUrl.trim()) return toast.error("Media URL is required");
      setIsSaving(true);
      try {
        const isYt = isYouTubeUrl(editingItem.imageUrl);
        const mediaType = editingItem.mediaType || (isYt ? "VIDEO" : "IMAGE");
        const thumb = editingItem.thumbnailUrl || (isYt ? getYouTubeThumbnail(editingItem.imageUrl) : editingItem.imageUrl);
        const updated = await updateGalleryItem(editingItem.id, {
          ...editingItem,
          categoryId: finalCategoryId,
          mediaType,
          thumbnailUrl: thumb,
        });
        localMutated.current = true;
        setLocalItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
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

    const finalCategoryId = Number(itemForm.categoryId) || sortedCategories[0]?.id || 1;

    setIsSaving(true);
    try {
      if (urls.length > 0) {
        const addedItems: GalleryItem[] = [];
        for (const url of urls) {
          const isYt = isYouTubeUrl(url);
          const thumb = isYt ? getYouTubeThumbnail(url) : url;
          const created = await addGalleryItem({ 
            ...itemForm, 
            categoryId: finalCategoryId,
            imageUrl: url, 
            thumbnailUrl: thumb, 
            mediaType: isYt ? "VIDEO" : "IMAGE" 
          });
          if (created) addedItems.push(created);
        }
        if (addedItems.length > 0) {
          localMutated.current = true;
          setLocalItems((prev) => [...addedItems, ...prev.filter(i => !addedItems.some(a => a.id === i.id))]);
        }
        toast.success(`${urls.length} gallery items added successfully`);
      } else {
        const isYt = isYouTubeUrl(itemForm.imageUrl);
        const thumb = itemForm.thumbnailUrl || (isYt ? getYouTubeThumbnail(itemForm.imageUrl) : itemForm.imageUrl);
        const created = await addGalleryItem({ 
          ...itemForm, 
          categoryId: finalCategoryId,
          thumbnailUrl: thumb, 
          mediaType: itemForm.mediaType || (isYt ? "VIDEO" : "IMAGE") 
        });
        if (created) {
          localMutated.current = true;
          setLocalItems((prev) => [created, ...prev.filter(i => i.id !== created.id)]);
        }
        toast.success("Gallery item added successfully");
      }
      setActiveTab("all");
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
      const nextVisible = !item.isVisible;
      await updateGalleryItem(item.id, { isVisible: nextVisible });
      setLocalItems((prev) => prev.map(i => i.id === item.id ? { ...i, isVisible: nextVisible } : i));
      toast.success(`Item ${item.isVisible ? "hidden" : "shown"}`);
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  const toggleItemFeatured = async (item: GalleryItem) => {
    try {
      const nextFeatured = !item.isFeatured;
      await updateGalleryItem(item.id, { isFeatured: nextFeatured });
      setLocalItems((prev) => prev.map(i => i.id === item.id ? { ...i, isFeatured: nextFeatured } : i));
      toast.success(item.isFeatured ? "Item unfeatured" : "Item featured");
    } catch (err) {
      toast.error("Failed to update featured status");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Gallery & Media Management</h1>
          <p className="text-slate-500 font-medium">Manage photo & video categories and gallery media. Upload files directly or paste YouTube/external links.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              if (refreshData) {
                setIsRefreshing(true);
                await refreshData();
                setIsRefreshing(false);
                toast.success("Gallery refreshed");
              }
            }}
            disabled={isRefreshing || loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
            title="Refresh Gallery Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing || loading ? "animate-spin text-primary" : ""}`} />
          </button>

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
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-800 text-sm">Category *</Label>
                    <button
                      type="button"
                      onClick={() => setShowQuickCat(!showQuickCat)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> {showQuickCat ? "Cancel" : "New Category"}
                    </button>
                  </div>

                  {showQuickCat && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <Label className="text-xs font-bold text-slate-600">Quickly Create New Category</Label>
                      <div className="flex gap-2">
                        <Input
                          value={quickCatName}
                          onChange={(e) => setQuickCatName(e.target.value)}
                          placeholder="e.g. Annual Sports, Farewell 2026..."
                          className="bg-white"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void handleQuickAddCategory();
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={!quickCatName.trim() || isCreatingQuickCat}
                          onClick={() => void handleQuickAddCategory()}
                          className="px-4 py-2 bg-primary text-white font-bold rounded-lg text-xs shrink-0 hover:opacity-90 disabled:opacity-50"
                        >
                          {isCreatingQuickCat ? "Adding..." : "Add & Select"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <select
                      value={itemForm.categoryId ? String(itemForm.categoryId) : (sortedCategories[0]?.id ? String(sortedCategories[0].id) : "")}
                      onChange={(e) => setItemForm({ ...itemForm, categoryId: Number(e.target.value) })}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer appearance-none"
                    >
                      {sortedCategories.length === 0 ? (
                        <option value="">Default (Campus & Facilities)</option>
                      ) : (
                        sortedCategories.map((cat: GalleryCategory) => (
                          <option key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
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
          All Media ({allItems.length})
        </button>
        {sortedCategories.map((cat: GalleryCategory) => {
          const count = allItems.filter((i: GalleryItem) => Number(i.categoryId) === Number(cat.id)).length;
          const isTabActive = activeTab !== "all" && Number(activeTab) === Number(cat.id);
          return (
            <div key={cat.id} className="flex items-center group relative">
              <button
                onClick={() => setActiveTab(cat.id)}
                className={`pr-10 pl-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${isTabActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
              >
                {cat.name} ({count})
              </button>
              <button 
                onClick={() => setEditingCategory(cat)} 
                className={`absolute right-2 p-1.5 rounded-full transition-all ${isTabActive ? "text-white/80 hover:bg-white/20 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
            {pagedItems.map((item: GalleryItem) => {
            const catName = sortedCategories.find((c: GalleryCategory) => Number(c.id) === Number(item.categoryId))?.name || "Unknown";
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
                    <button 
                      onClick={() => {
                        void deleteGalleryItem(item.id)
                          .then(() => {
                            setLocalItems((prev) => prev.filter(i => i.id !== item.id));
                            toast.success("Item deleted");
                          })
                          .catch(() => toast.error("Failed to delete"));
                      }} 
                      className="flex-1 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          <PaginationBar {...galleryPagination} itemLabel="media items" />
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
                  <Label className="font-bold text-slate-800 text-sm">Category *</Label>
                  <div className="relative">
                    <select
                      value={editingItem.categoryId ? String(editingItem.categoryId) : (sortedCategories[0]?.id ? String(sortedCategories[0].id) : "")}
                      onChange={(e) => setEditingItem({ ...editingItem, categoryId: Number(e.target.value) })}
                      className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer appearance-none"
                    >
                      {sortedCategories.length === 0 ? (
                        <option value="">Default (Campus & Facilities)</option>
                      ) : (
                        sortedCategories.map((cat: GalleryCategory) => (
                          <option key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
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
