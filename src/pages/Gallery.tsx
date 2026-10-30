import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight, Star, Calendar, ArrowRight, Play, Film } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/lib/admin-api";
import SEO from "@/components/SEO";

// ─── Types ───────────────────────────────────────────────────────────────────
interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  coverUrl: string | null;
  description: string | null;
  displayOrder: number;
  isVisible: boolean;
}

interface GalleryItem {
  id: number;
  title: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  categoryId: number;
  isVisible: boolean;
  isFeatured: boolean;
  displayOrder: number;
  eventDate: string | null;
  mediaType: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getYouTubeEmbedUrl = (url: string) => {
  const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
};

const isYouTubeUrl = (url: string) =>
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)/i.test(url ?? "");

// ─── Component ───────────────────────────────────────────────────────────────
const Gallery = () => {
  useEffect(() => {
    document.title = "Gallery — AIM Academy Jabalpur";
  }, []);

  // Own state — no dependency on shared context
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch directly from the public API endpoints
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/public/gallery/categories`),
        fetch(`${API_BASE_URL}/public/gallery/items`),
      ]);
      if (catsRes.ok) {
        const cats: GalleryCategory[] = await catsRes.json();
        setCategories(Array.isArray(cats) ? cats : []);
      }
      if (itemsRes.ok) {
        const its: GalleryItem[] = await itemsRes.json();
        setItems(Array.isArray(its) ? its : []);
      }
    } catch (e) {
      console.error("[Gallery] Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const visibleCategories = categories.filter((c) => c.isVisible !== false);
  const visibleItems = items.filter((item) => item.isVisible !== false);
  const featuredItems = visibleItems.filter((item) => item.isFeatured);

  const displayItems =
    activeCategory !== null
      ? visibleItems.filter((item) => Number(item.categoryId) === Number(activeCategory))
      : visibleItems;

  // ─── Lightbox navigation ──────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (lightboxIndex !== null && displayItems.length > 0)
      setLightboxIndex((lightboxIndex + 1) % displayItems.length);
  }, [lightboxIndex, displayItems.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null && displayItems.length > 0)
      setLightboxIndex((lightboxIndex - 1 + displayItems.length) % displayItems.length);
  }, [lightboxIndex, displayItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="animate-spin text-primary">
          <Camera className="w-12 h-12" />
        </div>
      </div>
    );
  }

  const currentLightboxItem = lightboxIndex !== null ? displayItems[lightboxIndex] : null;
  const isCurrentVideo =
    currentLightboxItem
      ? currentLightboxItem.mediaType === "VIDEO" || isYouTubeUrl(currentLightboxItem.imageUrl)
      : false;
  const currentEmbedUrl = currentLightboxItem
    ? getYouTubeEmbedUrl(currentLightboxItem.imageUrl)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SEO
        title="Photo & Video Gallery – Campus Life & Events"
        description="Explore the campus life, classroom sessions, toppers felicitation ceremonies, and seminars at AIM Academy Jabalpur."
        canonical="/gallery"
        keywords="AIM Academy Gallery, Classroom photos Jabalpur, AIM Academy videos, Coaching institute photos Jabalpur"
      />

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
              {featuredItems.map((item) => {
                const isVid = item.mediaType === "VIDEO" || isYouTubeUrl(item.imageUrl);
                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={item.id}
                    className="shrink-0 w-[300px] md:w-[400px] aspect-[4/3] rounded-2xl overflow-hidden relative cursor-pointer group shadow-lg snap-start border border-slate-200 bg-slate-900"
                    onClick={() => {
                      const dIdx = displayItems.findIndex((i) => i.id === item.id);
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
                    {isVid && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-2 text-amber-400 mb-2">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span className="text-xs font-black uppercase tracking-widest">Featured</span>
                      </div>
                      {item.title && <p className="text-white font-bold text-sm">{item.title}</p>}
                      {item.eventDate && (
                        <span className="flex items-center gap-1.5 text-slate-300 text-xs mt-1">
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
            {visibleCategories.map((cat) => {
              const count = visibleItems.filter((i) => Number(i.categoryId) === Number(cat.id)).length;
              const isTabActive = activeCategory !== null && Number(activeCategory) === Number(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                    isTabActive
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
            {displayItems.map((item, idx) => {
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
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='16' font-family='sans-serif'%3EAIM Academy%3C/text%3E%3C/svg%3E";
                    }}
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

                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {item.title && <p className="text-white font-bold text-sm">{item.title}</p>}
                    {item.eventDate && (
                      <span className="flex items-center gap-1.5 text-slate-300 text-xs mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.eventDate}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6 shadow-inner">
              <Camera className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-400 mb-2">No photos yet</h3>
            <p className="text-slate-400 text-sm max-w-xs">Our gallery is being updated. Check back soon!</p>
          </motion.div>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-slate-900 to-primary/80 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Want to be part of our story?</h2>
          <p className="text-slate-200 mb-8 max-w-xl mx-auto">Join thousands of students who chose AIM Academy and made their mark.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-primary text-slate-900 font-black px-8 py-4 rounded-xl hover:opacity-90 transition-all shadow-lg text-lg"
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
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev */}
            {displayItems.length > 1 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Media */}
            <div className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              {isCurrentVideo && currentEmbedUrl ? (
                <iframe
                  src={currentEmbedUrl}
                  className="w-full aspect-video rounded-xl shadow-2xl"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : isCurrentVideo ? (
                <video
                  src={currentLightboxItem.imageUrl}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[75vh] w-auto max-w-full rounded-xl shadow-2xl bg-black"
                />
              ) : (
                <img
                  src={currentLightboxItem.imageUrl}
                  alt={currentLightboxItem.title || "Gallery"}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='18' font-family='sans-serif'%3EAIM Academy Jabalpur%3C/text%3E%3C/svg%3E";
                  }}
                  className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
                />
              )}
              {(currentLightboxItem.title || currentLightboxItem.eventDate) && (
                <div className="mt-4 text-center">
                  {currentLightboxItem.title && (
                    <p className="text-white font-bold text-lg">{currentLightboxItem.title}</p>
                  )}
                  {currentLightboxItem.eventDate && (
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-1 justify-center">
                      <Calendar className="w-3.5 h-3.5" /> {currentLightboxItem.eventDate}
                    </p>
                  )}
                </div>
              )}
              <p className="text-slate-500 text-sm mt-2">{lightboxIndex + 1} / {displayItems.length}</p>
            </div>

            {/* Next */}
            {displayItems.length > 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
