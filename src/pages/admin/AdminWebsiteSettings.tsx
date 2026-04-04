import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Layout } from "lucide-react";
import { toast } from "sonner";

const AdminWebsiteSettings = () => {
  const [slides, setSlides] = useState<string[]>([
    "/images/HEROMAIN 007.jpeg",     
    "/images/STUDENT BANNER 01.jpeg",      
    "/images/STUDENT_BANNER.jpeg"
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("aim_hero_slides");
    if (saved) {
      try { 
        setSlides(JSON.parse(saved)); 
      } catch (e) {
        console.error("Failed to parse saved slides");
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("aim_hero_slides", JSON.stringify(slides));
    toast.success("Website settings updated successfully! View the homepage to see changes.");
  };

  const addSlide = () => {
    setSlides([...slides, "/images/your_new_image.png"]);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const updateSlide = (index: number, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = value;
    setSlides(newSlides);
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large! Please select an image under 2MB to save reliably in the browser.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateSlide(index, base64String);
        toast.success("Image uploaded temporarily. Click 'Save Changes' to apply.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link to="/admin" className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="p-3 rounded-xl bg-primary text-white">
                  <Layout className="w-6 h-6" />
               </div>
               <div>
                  <h1 className="text-3xl font-black text-slate-900 leading-tight">Website Settings</h1>
                  <p className="text-sm font-medium text-slate-500">Manage your public website content and presentation.</p>
               </div>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-slate-800 transition-colors">
               <Save className="w-5 h-5" /> Save Changes
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
               <div>
                  <h2 className="text-xl font-bold text-slate-900">Hero Section Banners</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Upload images or paste direct links to display on the homepage.</p>
               </div>
               <button onClick={addSlide} className="flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold py-2 px-4 rounded-lg shadow hover:brightness-105 transition-all text-sm shrink-0">
                  <Plus className="w-4 h-4" /> Add Slide
               </button>
            </div>
            <div className="p-6 space-y-4">
               {slides.map((slide, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
                     {/* Preview Box */}
                     <div className="w-full sm:w-24 h-24 bg-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-slate-300 relative">
                        {slide ? (
                            <img src={slide} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                        {/* Hidden Upload Input Overlaid on Image */}
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                           <span className="text-white text-[10px] font-bold uppercase tracking-wider">Upload</span>
                           <input 
                             type="file" 
                             accept="image/*" 
                             onChange={(e) => handleFileUpload(index, e)} 
                             className="hidden" 
                           />
                        </label>
                     </div>

                     <div className="flex-1 w-full">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Image Path or URL Link</label>
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              value={slide}
                              onChange={(e) => updateSlide(index, e.target.value)}
                              placeholder="/images/example.jpg OR https://imgur.com/image.jpg"
                              className="w-full font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                           />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-2">
                           Hover over the left image box to upload from your PC, or paste an external URL. 
                        </p>
                     </div>

                     <button onClick={() => removeSlide(index)} aria-label="Remove slide" className="absolute top-2 right-2 sm:static p-2 sm:p-3 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200 bg-white sm:bg-transparent">
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                     </button>
                  </div>
               ))}
               
               {slides.length === 0 && (
                  <div className="text-center py-10 text-slate-400 font-medium">
                     No slides available. Click "Add Slide" to select an image.
                  </div>
               )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWebsiteSettings;
