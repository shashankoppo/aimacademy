import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight, Star, Calendar, ArrowRight, Play, Film } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminData, type GalleryCategory, type GalleryItem } from "@/hooks/useAdminData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const getYouTubeEmbedUrl = (url: string) => {
  const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
};

const isYouTubeUrl = (url: string) => {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i.test(url);
};

const Gallery = () => {
  useEffect(() => {
    document.title = "Gallery — AIM Academy Jabalpur";
  }, []);

  const { galleryCategories = [], galleryItems = [], loading } = useAdminData() as any;

  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter out items/categories where isVisible === false
  const visibleCategories = galleryCategories.filter((c: GalleryCategory) => c.isVisible !== false);
  const visibleItems = galleryItems.filter((item: GalleryItem) => item.isVisible !== false);

  const featuredItems = visibleItems.filter((item: GalleryItem) => item.isFeatured);
  
  const displayItems = activeCategory !== null
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
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin text-primary">
             <Camera className="w-12 h-12" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentLightboxItem = lightboxIndex !== null ? displayItems[lightboxIndex] : null;
  const isCurrentVideo = currentLightboxItem ? (currentLightboxItem.mediaType === "VIDEO" || isYouTubeUrl(currentLightboxItem.imageUrl)) : false;
  const currentEmbedUrl = currentLightboxItem ? getYouTubeEmbedUrl(currentLightboxItem.imageUrl) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-slate-950 via-slate-900 to-primary/30 overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-black/40"></div>
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
            Capturing moments of excellence, hard work, celebrations, and achievements at AIM Academy
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-12 md:py-16">
        
        {/* Featured Section */}
        {featuredItems.length > 0 && activeCategory === null && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8 border-l-4 border-primary pl-4 py-1">
              <Star className="w-8 h-8 text-primary fill-primary" />
              <h2 className="text-3xl font-black text-slate-900 leading-none">Featured Moments</h2>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar">
              {featuredItems.map((item: GalleryItem) => {
                const isVid = item.mediaType === "VIDEO" || isYouTubeUrl(item.imageUrl);
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={item.id} 
                    className="shrink-0 w-[300px] md:w-[400px] aspect-[4/3] rounded-2xl overflow-hidden relative cursor-pointer group shadow-lg snap-start border border-slate-200 bg-slate-900"
                    onClick={() => {
                      const dIdx = displayItems.findIndex((i: GalleryItem) => i.id === item.id);
                      if (dIdx !== -1) setLightboxIndex(dIdx);
                    }}
                  >
                    <img 
                      src={item.thumbnailUrl || item.imageUrl} 
                      alt={item.title || "Featured Item"} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="bg-primary text-slate-900 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md uppercase tracking-wider">
                        <Star className="w-3.5 h-3.5 fill-slate-900" /> Featured
                      </span>
                      {isVid && (
                        <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                          <Play className="w-3 h-3 fill-white" /> Video
                        </span>
                      )}
                    </div>

                    {isVid && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform">
                      <h3 className="text-white font-extrabold text-lg leading-tight mb-2 drop-shadow-md">{item.title || "AIM Academy Moment"}</h3>
                      {item.eventDate && (
                        <span className="inline-flex items-center gap-1.5 text-slate-300 text-xs font-semibold bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.eventDate}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
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
                  ? "bg-primary text-slate-900 shadow-md scale-105 font-black" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              All Media <span className="ml-2 text-xs opacity-75 bg-black/10 px-2 py-0.5 rounded-full">{visibleItems.length}</span>
            </button>
            {visibleCategories.map((cat: GalleryCategory) => {
              const count = visibleItems.filter((i: GalleryItem) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                    activeCategory === cat.id 
                      ? "bg-primary text-slate-900 shadow-md scale-105 font-black" 
                      : "bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {cat.name} <span className="ml-2 text-xs opacity-75 bg-black/10 px-2 py-0.5 rounded-full">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Media Masonry Grid */}
        {displayItems.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {displayItems.map((item: GalleryItem, idx: number) => {
              const isVid = item.mediaType === "VIDEO" || isYouTubeUrl(item.imageUrl);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(idx * 0.04, 0.4) }}
                  key={item.id}
                  className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all border border-slate-200 bg-slate-900"
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img 
                    src={item.thumbnailUrl || item.imageUrl} 
                    alt={item.title || "Gallery"} 
                    loading="lazy"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {isVid && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white flex items-center gap-1 shadow">
                      <Play className="w-3 h-3 fill-white" /> Video
                    </div>
                  )}

                  {isVid && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="text-white font-extrabold text-sm md:text-base leading-tight mb-1.5 drop-shadow-md">{item.title || "AIM Academy"}</h3>
                    {item.eventDate && (
                      <span className="inline-flex items-center gap-1.5 text-slate-300 text-[10px] md:text-xs font-semibold bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        <Calendar className="w-3 h-3" />
                        {item.eventDate}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">No Media Found</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              Our gallery is being updated with photos and videos. Check back soon for new moments of excellence!
            </p>
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16 lg:py-20 relative overflow-hidden border-t-4 border-primary">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">Want to be part of our story?</h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of successful students who have transformed their dreams into reality at AIM Academy.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-3 bg-primary text-slate-900 font-black text-lg px-8 py-4 rounded-full shadow-[0_0_25px_rgba(251,225,34,0.4)] hover:scale-105 transition-transform uppercase tracking-wider"
          >
            Join AIM Academy <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && currentLightboxItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            <button 
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-[210]"
              title="Close (Esc)"
            >
              <X className="w-6 h-6" />
            </button>

            {displayItems.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-[210]"
                  title="Previous"
                >
                  <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-[210]"
                  title="Next"
                >
                  <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                </button>
              </>
            )}

            <div 
              className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isCurrentVideo ? (
                currentEmbedUrl ? (
                  <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
                    <iframe 
                      src={currentEmbedUrl} 
                      title={currentLightboxItem.title || "Video"} 
                      className="w-full h-full border-0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <video 
                    controls 
                    autoPlay 
                    src={currentLightboxItem.imageUrl} 
                    className="max-w-full max-h-[70vh] rounded-xl shadow-2xl bg-black"
                  />
                )
              ) : (
                <motion.img 
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={currentLightboxItem.imageUrl} 
                  alt={currentLightboxItem.title || "Gallery"} 
                  className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-2xl"
                />
              )}
              
              <motion.div 
                key={`text-${lightboxIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 text-center"
              >
                <h3 className="text-white font-black text-2xl mb-1 drop-shadow-md">
                  {currentLightboxItem.title || "AIM Academy"}
                </h3>
                {currentLightboxItem.eventDate && (
                  <p className="text-slate-300 font-medium flex items-center justify-center gap-2 mt-2">
                    <Calendar className="w-4 h-4" />
                    {currentLightboxItem.eventDate}
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

      <Footer />
    </div>
  );
};

export default Gallery;
