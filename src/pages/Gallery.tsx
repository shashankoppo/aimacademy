import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight, Star, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
// Note: Assuming these are added to useAdminData by the user as per the prompt instructions.
import { useAdminData, type GalleryCategory, type GalleryItem } from "@/hooks/useAdminData";

const Gallery = () => {
  useEffect(() => {
    document.title = "Gallery — AIM Academy Jabalpur";
  }, []);

  // @ts-ignore - The user prompt indicates these are provided
  const { galleryCategories = [], galleryItems = [], loading } = useAdminData();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter out items/categories where isVisible === false
  const visibleCategories = galleryCategories.filter((c: GalleryCategory) => c.isVisible !== false);
  const visibleItems = galleryItems.filter((item: GalleryItem) => item.isVisible !== false);

  const featuredItems = visibleItems.filter((item: GalleryItem) => item.isFeatured);
  
  const displayItems = activeCategory
    ? visibleItems.filter((item: GalleryItem) => item.categoryId === activeCategory)
    : visibleItems;

  const handleNext = () => {
    if (lightboxIndex !== null && displayItems.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % displayItems.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null && displayItems.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + displayItems.length) % displayItems.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin text-[hsl(var(--primary))]">
             <Camera className="w-12 h-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-slate-900 via-slate-800 to-[hsl(var(--primary))] overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-[url('/images/pattern-bg.png')] opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-md"
          >
            Our Gallery
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow"
          >
            Capturing moments of excellence, hard work, and celebration at AIM Academy
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-12 md:py-16">
        
        {/* Featured Section */}
        {featuredItems.length > 0 && !activeCategory && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8 border-l-4 border-[hsl(var(--primary))] pl-4 py-1">
              <Star className="w-8 h-8 text-[hsl(var(--primary))] fill-[hsl(var(--primary))]" />
              <h2 className="text-3xl font-black text-slate-900 leading-none">Featured Moments</h2>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar">
              {featuredItems.map((item: GalleryItem, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.id} 
                  className="shrink-0 w-[300px] md:w-[400px] aspect-[4/3] rounded-2xl overflow-hidden relative cursor-pointer group shadow-lg snap-start border border-slate-200"
                  onClick={() => {
                    const dIdx = displayItems.findIndex((i: GalleryItem) => i.id === item.id);
                    if (dIdx !== -1) setLightboxIndex(dIdx);
                  }}
                >
                  <img 
                    src={item.thumbnailUrl || item.imageUrl} 
                    alt={item.title} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-4 left-4 bg-[hsl(var(--primary))] text-slate-900 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 fill-slate-900" /> Featured
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-white font-extrabold text-lg leading-tight mb-2 drop-shadow-md">{item.title}</h3>
                    {item.eventDate && (
                      <span className="inline-flex items-center gap-1.5 text-slate-300 text-xs font-semibold bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.eventDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filters */}
        {visibleCategories.length > 0 && (
          <div className="flex overflow-x-auto gap-3 pb-4 mb-10 hide-scrollbar scroll-smooth">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                activeCategory === null 
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md scale-105" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] hover:bg-yellow-50"
              }`}
            >
              All Photos <span className="ml-2 text-xs opacity-70 bg-black/10 px-2 py-0.5 rounded-full">{visibleItems.length}</span>
            </button>
            {visibleCategories.map((cat: GalleryCategory) => {
              const count = visibleItems.filter((i: GalleryItem) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                    activeCategory === cat.id 
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md scale-105" 
                      : "bg-white text-slate-600 border border-slate-200 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] hover:bg-yellow-50"
                  }`}
                >
                  {cat.name} <span className="ml-2 text-xs opacity-70 bg-black/10 px-2 py-0.5 rounded-full">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Masonry Grid */}
        {displayItems.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {displayItems.map((item: GalleryItem, idx: number) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                key={item.id}
                className="break-inside-avoid relative rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all border border-slate-200 bg-slate-100"
                onClick={() => setLightboxIndex(idx)}
              >
                <img 
                  src={item.thumbnailUrl || item.imageUrl} 
                  alt={item.title} 
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-white font-extrabold text-sm md:text-base leading-tight mb-1.5 drop-shadow-md">{item.title}</h3>
                  {item.eventDate && (
                    <span className="inline-flex items-center gap-1.5 text-slate-300 text-[10px] md:text-xs font-semibold bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.eventDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">No Photos Found</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              Our gallery is being updated. Check back soon for new moments of excellence!
            </p>
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16 lg:py-20 relative overflow-hidden border-t-4 border-[hsl(var(--primary))]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[hsl(var(--primary))] rounded-full blur-[120px] opacity-10 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">Want to be part of our story?</h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of successful students who have transformed their dreams into reality at AIM Academy.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-black text-lg px-8 py-4 rounded-full shadow-[0_0_25px_rgba(251,225,34,0.4)] hover:scale-105 transition-transform uppercase tracking-wider"
          >
            Join AIM Academy <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-sm"
            onClick={() => setLightboxIndex(null)}
          >
            <button 
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-[210]"
            >
              <X className="w-6 h-6" />
            </button>

            {displayItems.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-[210]"
                >
                  <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-[210]"
                >
                  <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                </button>
              </>
            )}

            <div 
              className="relative max-w-6xl w-full max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img 
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={displayItems[lightboxIndex].imageUrl} 
                alt={displayItems[lightboxIndex].title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
              
              <motion.div 
                key={`text-${lightboxIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 text-center"
              >
                <h3 className="text-white font-black text-2xl mb-2 drop-shadow-md">
                  {displayItems[lightboxIndex].title}
                </h3>
                {displayItems[lightboxIndex].eventDate && (
                  <p className="text-slate-300 font-medium flex items-center justify-center gap-2 mt-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(displayItems[lightboxIndex].eventDate!).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </motion.div>
            </div>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 font-semibold text-sm">
              {lightboxIndex + 1} / {displayItems.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Gallery;
