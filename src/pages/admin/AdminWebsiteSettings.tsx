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

  const [bannerText, setBannerText] = useState("New Batch Admissions Open for MP PSC & UPSC Foundation 2026-27 | AIM Academy: Synonym of Success | Call: +91 70672 31189");

  const [faculty, setFaculty] = useState<{name: string, sub: string, img: string}[]>([
    { name: "Rahul Sir", sub: "History Strategy Expert", img: "/images/faculty_1.png" },
    { name: "Priya Ma'am", sub: "Science Specialist", img: "/images/faculty_2.png" },
    { name: "Amit Sir", sub: "Maths Wizard", img: "/images/faculty_3.png" },
    { name: "Vikas Sir", sub: "Geography Mentor", img: "/images/faculty_4.png" },
    { name: "Neha Ma'am", sub: "Current Affairs Analysis", img: "/images/faculty_5.png" },
  ]);

  useEffect(() => {
    const savedBanner = localStorage.getItem("aim_top_banner");
    if (savedBanner) setBannerText(savedBanner);

    const savedSlides = localStorage.getItem("aim_hero_slides");
    if (savedSlides) {
      try { 
        setSlides(JSON.parse(savedSlides)); 
      } catch (e) {
        console.error("Failed to parse saved slides");
      }
    }

    const savedFaculty = localStorage.getItem("aim_faculty_data");
    if (savedFaculty) {
      try {
        setFaculty(JSON.parse(savedFaculty));
      } catch (e) {
        console.error("Failed to parse saved faculty");
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("aim_top_banner", bannerText);
    localStorage.setItem("aim_hero_slides", JSON.stringify(slides));
    localStorage.setItem("aim_faculty_data", JSON.stringify(faculty));
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
        toast.error("File is too large! Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateSlide(index, base64String);
        toast.success("Image uploaded temporarily.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Faculty Handlers
  const addFaculty = () => {
    setFaculty([...faculty, { name: "New Teacher", sub: "Subject Expert", img: "/images/faculty_placeholder.png" }]);
  };

  const removeFaculty = (index: number) => {
    setFaculty(faculty.filter((_, i) => i !== index));
  };

  const updateFaculty = (index: number, field: 'name' | 'sub' | 'img', value: string) => {
    const newFaculty = [...faculty];
    newFaculty[index] = { ...newFaculty[index], [field]: value };
    setFaculty(newFaculty);
  };

  const handleFacultyUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error("File too large! Max 1MB for faculty photos.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFaculty(index, 'img', reader.result as string);
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
               <div className="p-3 rounded-xl bg-primary text-slate-900 border border-slate-200">
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

        {/* Top Banner Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
               <h2 className="text-xl font-bold text-slate-900">Announcement Banner</h2>
               <p className="text-sm text-slate-500 font-medium mt-1">Update the scrolling text at the very top of the website.</p>
            </div>
            <div className="p-6">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Banner Text</label>
               <input 
                  type="text" 
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="w-full font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-primary transition-all text-sm"
                  placeholder="Enter the banner text..."
               />
            </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
               <div>
                  <h2 className="text-xl font-bold text-slate-900">Hero Section Banners</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Upload images for the homepage slider.</p>
               </div>
               <button onClick={addSlide} className="flex items-center gap-2 bg-primary text-slate-900 font-bold py-2 px-4 rounded-lg shadow hover:brightness-105 transition-all text-sm shrink-0">
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
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                           <span className="text-white text-[10px] font-bold uppercase tracking-wider">Upload</span>
                           <input type="file" accept="image/*" onChange={(e) => handleFileUpload(index, e)} className="hidden" />
                        </label>
                     </div>

                     <div className="flex-1 w-full text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Image Path or URL</label>
                        <input 
                           type="text" 
                           value={slide}
                           onChange={(e) => updateSlide(index, e.target.value)}
                           className="w-full font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-primary transition-all text-sm"
                        />
                     </div>

                     <button onClick={() => removeSlide(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
               ))}
            </div>
        </div>

        {/* Teachers Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
               <div>
                  <h2 className="text-xl font-bold text-slate-900">Manage Teachers</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Update faculty names, subjects, and photos.</p>
               </div>
               <button onClick={addFaculty} className="flex items-center gap-2 bg-primary text-slate-900 font-bold py-2 px-4 rounded-lg shadow hover:brightness-105 transition-all text-sm shrink-0">
                  <Plus className="w-4 h-4" /> Add Teacher
               </button>
            </div>
            <div className="p-6 space-y-4">
               {faculty.map((member, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
                     {/* Image Box */}
                     <div className="w-full sm:w-20 h-20 bg-slate-200 rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-slate-300 relative group/img">
                        {member.img ? (
                            <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 cursor-pointer transition-opacity">
                           <span className="text-white text-[8px] font-bold uppercase tracking-wider">Change</span>
                           <input type="file" accept="image/*" onChange={(e) => handleFacultyUpload(index, e)} className="hidden" />
                        </label>
                     </div>

                     <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block text-left">Teacher Name</label>
                           <input 
                              type="text" 
                              value={member.name}
                              onChange={(e) => updateFaculty(index, 'name', e.target.value)}
                              className="w-full font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-primary transition-all text-sm"
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block text-left">Specialization / Subject</label>
                           <input 
                              type="text" 
                              value={member.sub}
                              onChange={(e) => updateFaculty(index, 'sub', e.target.value)}
                              className="w-full font-medium text-slate-700 bg-white border border-slate-300 rounded-lg px-4 py-2 outline-none focus:border-primary transition-all text-sm"
                           />
                        </div>
                     </div>

                     <button onClick={() => removeFaculty(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
               ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminWebsiteSettings;

