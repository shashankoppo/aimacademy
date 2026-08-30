import React, { useMemo, useState } from "react";
import { Edit, Eye, EyeOff, PlayCircle, Plus, Star, Trash2, Youtube, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAdminData, type VideoItem } from "@/hooks/useAdminData";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VideoForm = Omit<VideoItem, "id" | "thumbnailUrl"> & { thumbnailUrl?: string };

const emptyVideo: VideoForm = {
  title: "",
  description: "",
  youtubeUrl: "",
  thumbnailUrl: "",
  isVisible: true,
  isFeatured: false,
  displayOrder: 0,
};

const VideoManagement = () => {
  const { videos, addVideo, updateVideo, deleteVideo } = useAdminData();
  const [form, setForm] = useState<VideoForm>(emptyVideo);
  const [editing, setEditing] = useState<VideoItem | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sortedVideos = useMemo(() => [...videos].sort((a, b) => a.displayOrder - b.displayOrder), [videos]);

  const validate = (video: VideoForm | VideoItem) => {
    if (!video.title.trim() || !video.description.trim() || !video.youtubeUrl.trim()) return "Please fill title, description, and YouTube link";
    return null;
  };

  const saveNew = async () => {
    const error = validate(form);
    if (error) return toast.error(error);
    setIsSaving(true);
    try {
      await addVideo(form);
      setForm(emptyVideo);
      toast.success("Video added successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add video");
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
      await updateVideo(editing.id, editing);
      setEditing(null);
      toast.success("Video updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update video");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisible = async (video: VideoItem) => {
    try {
      await updateVideo(video.id, { isVisible: !video.isVisible });
      toast.success(`Video ${video.isVisible ? "hidden" : "shown"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update video");
    }
  };

  const toggleFeatured = async (video: VideoItem) => {
    try {
      await updateVideo(video.id, { isFeatured: !video.isFeatured });
      toast.success(video.isFeatured ? "Video unfeatured" : "Video featured");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update video");
    }
  };

  const fetchYoutubeMetadata = async (url: string, isEditing: boolean = false) => {
    if (!url.trim()) return toast.error("Please enter a YouTube link first");
    setIsFetchingInfo(true);
    try {
      const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.title) {
        if (isEditing && editing) {
          setEditing({ ...editing, title: data.title, thumbnailUrl: data.thumbnail_url || editing.thumbnailUrl });
        } else {
          setForm({ ...form, title: data.title, thumbnailUrl: data.thumbnail_url || form.thumbnailUrl });
        }
        toast.success("YouTube info fetched successfully!");
      } else {
        toast.error("Could not fetch YouTube info. Check the URL.");
      }
    } catch (err) {
      toast.error("Failed to fetch YouTube info.");
    } finally {
      setIsFetchingInfo(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Video Management</h1>
          <p className="text-slate-500 font-medium">Manage homepage video cards without changing the current visual style.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Video
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
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
              <div className="grid gap-2">
                <Label>YouTube Link</Label>
                <div className="flex gap-2">
                  <Input value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                  <button onClick={() => fetchYoutubeMetadata(form.youtubeUrl)} disabled={isFetchingInfo} type="button" className="flex items-center gap-2 px-4 py-2 font-bold text-sm bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 ${isFetchingInfo ? "animate-spin" : ""}`} /> Fetch Info
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label>Custom Thumbnail</Label>
                  <Input value={form.thumbnailUrl ?? ""} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => void saveNew()} disabled={isSaving} className="w-full bg-primary text-white font-bold py-2 rounded-lg disabled:opacity-60">
                {isSaving ? "Saving..." : "Save Video"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sortedVideos.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <Youtube className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">No videos found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="aspect-video bg-slate-900 relative">
              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{video.title}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Order {video.displayOrder}</p>
                </div>
                <div className="flex gap-2">
                  {video.isFeatured && <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">Featured</span>}
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${video.isVisible ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>{video.isVisible ? "Visible" : "Hidden"}</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed min-h-16">{video.description}</p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => setEditing(video)} className="flex-1 p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all"><Edit className="w-4 h-4 mx-auto" /></button>
                <button onClick={() => void toggleVisible(video)} className="flex-1 p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">{video.isVisible ? <EyeOff className="w-4 h-4 mx-auto" /> : <Eye className="w-4 h-4 mx-auto" />}</button>
                <button onClick={() => void toggleFeatured(video)} className="flex-1 p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all"><Star className="w-4 h-4 mx-auto" /></button>
                <button onClick={() => window.open(video.youtubeUrl, "_blank")} className="flex-1 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Youtube className="w-4 h-4 mx-auto" /></button>
                <button onClick={() => void deleteVideo(video.id).then(() => toast.success("Video deleted")).catch((err) => toast.error(err instanceof Error ? err.message : "Failed to delete video"))} className="flex-1 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4 mx-auto" /></button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          {editing && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid gap-2">
                  <Label>YouTube Link</Label>
                  <div className="flex gap-2">
                    <Input value={editing.youtubeUrl} onChange={(e) => setEditing({ ...editing, youtubeUrl: e.target.value })} />
                    <button onClick={() => fetchYoutubeMetadata(editing.youtubeUrl, true)} disabled={isFetchingInfo} type="button" className="flex items-center gap-2 px-4 py-2 font-bold text-sm bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all disabled:opacity-50">
                      <RefreshCw className={`w-4 h-4 ${isFetchingInfo ? "animate-spin" : ""}`} /> Fetch Info
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Display Order</Label>
                    <Input type="number" value={editing.displayOrder} onChange={(e) => setEditing({ ...editing, displayOrder: Number(e.target.value) })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Thumbnail URL</Label>
                    <Input value={editing.thumbnailUrl} onChange={(e) => setEditing({ ...editing, thumbnailUrl: e.target.value })} />
                  </div>
                </div>
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

export default VideoManagement;
