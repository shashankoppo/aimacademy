import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowRight, BookOpen, Download, ExternalLink, Search, Bell, Tag, Clock } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const blogPosts = [
  { title: "UPSC Prelims 2026: Complete Strategy & Key Topics", date: "March 5, 2026", category: "Strategy", readTime: "8 min", summary: "A comprehensive strategy for the remaining months before Prelims 2026 — what to focus on, what to skip, and how to maximize your score." },
  { title: "Daily Current Affairs Compilation — March 2026", date: "March 10, 2026", category: "Current Affairs", readTime: "5 min", summary: "All key national and international events from the first week of March 2026, analysed through the UPSC lens." },
  { title: "How to Write High-Scoring Answers in UPSC Mains", date: "March 1, 2026", category: "Tips", readTime: "10 min", summary: "Structure, keywords, Introduction-Body-Conclusion, diagrams — everything that separates a 7-marker from a 10-marker answer." },
  { title: "Union Budget 2026 — Complete UPSC Analysis", date: "Feb 28, 2026", category: "Current Affairs", readTime: "12 min", summary: "Budget 2026 key allocations, economic implications, and must-know facts for Prelims and Mains GS Paper III." },
  { title: "State PSC vs UPSC — Which to Target First?", date: "Feb 20, 2026", category: "Guide", readTime: "7 min", summary: "A detailed comparison — eligibility, preparation overlap, difficulty, timelines, and how to choose the right path." },
  { title: "Ethics Paper GS IV — AIR 12's Framework & Strategy", date: "Feb 15, 2026", category: "Tips", readTime: "9 min", summary: "Learn how Aarav Mehta (AIR 12) approached the ethics paper to score above 140/250 — with specific case study techniques." },
];

const studyMaterials = [
  { title: "Indian Polity Notes (Laxmikanth Summary)", pages: "120 pages", size: "4.2 MB", category: "Polity" },
  { title: "Modern Indian History — Complete Notes",   pages: "85 pages",  size: "3.1 MB", category: "History" },
  { title: "Geography NCERT Compilation",             pages: "95 pages",  size: "5.6 MB", category: "Geography" },
  { title: "Economy for UPSC — Quick Revision",       pages: "60 pages",  size: "2.4 MB", category: "Economy" },
  { title: "Environment & Ecology — Complete Notes",  pages: "72 pages",  size: "3.8 MB", category: "Environment" },
  { title: "Science & Technology for Prelims",        pages: "50 pages",  size: "2.0 MB", category: "Science" },
];

const examUpdates = [
  { title: "UPSC CSE 2026 Notification Expected in February 2026", date: "Jan 15, 2026", status: "Upcoming" },
  { title: "SSC CGL 2026 Registration Open — Apply Now",           date: "March 1, 2026",  status: "Active" },
  { title: "IBPS PO 2026 Prelims Date Announced",                  date: "Feb 25, 2026", status: "Upcoming" },
  { title: "State PSC Annual Calendar 2026 Released",              date: "Jan 5, 2026",  status: "Active" },
  { title: "RBI Grade B 2026 Phase I Result Declared",             date: "March 8, 2026",  status: "Active" },
  { title: "Railway RRB NTPC 2026 Notification Out",               date: "March 12, 2026", status: "Active" },
];

const blogCategories = ["All", "Strategy", "Current Affairs", "Tips", "Guide"];

const catColors: Record<string, string> = {
  Strategy:       "text-blue-600 bg-blue-50 border-blue-100",
  "Current Affairs": "text-emerald-600 bg-emerald-50 border-emerald-100",
  Tips:           "text-violet-600 bg-violet-50 border-violet-100",
  Guide:          "text-amber-600 bg-amber-50 border-amber-100",
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } }),
};

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = blogPosts.filter((p) => {
    const matchCat  = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="pt-[3.75rem] page-enter bg-white">
      {/* Hero */}
    <section className="relative py-28 bg-hero overflow-hidden">
      <div className="absolute inset-0 dot-grid-sm opacity-40" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-gold/5 blur-[100px]" />
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="badge-gold inline-flex items-center gap-2 mb-6 shadow-sm">
          <BookOpen className="w-3 h-3" /> Free Study Resources
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="heading-display text-5xl md:text-6xl lg:text-7xl text-navy mb-5">
          Study <span className="text-gradient-gold">Resources</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-slate-500 text-lg max-w-xl mx-auto font-body leading-relaxed">
          Blog articles, free PDF downloads, and live exam notifications — curated by our expert faculty.
        </motion.p>
      </div>
    </section>

    {/* Blog */}
    <section className="section-padding bg-[#f8fbff] border-y border-slate-100">
        <div className="container mx-auto">
          <SectionHeading label="Blog" title="Articles & Current Affairs" />

          {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-body text-navy placeholder-slate-400 focus:outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold font-body transition-all duration-200 ${
                  activeCategory === cat
                    ? "btn-gold py-2 shadow-lg"
                    : "bg-navy/5 border border-navy/10 text-navy/40 hover:border-gold/30 hover:text-navy/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + search}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
            {filtered.length > 0 ? filtered.map((post, i) => (
              <motion.article
                key={post.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card rounded-2xl p-6 cursor-pointer group flex flex-col bg-white border border-slate-200 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border font-body ${catColors[post.category] || "text-navy/40 bg-navy/5 border-navy/10"}`}>
                    <Tag className="w-2.5 h-2.5 inline mr-1" />{post.category}
                  </span>
                  <span className="text-slate-400 text-[10px] font-body flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />{post.readTime}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-navy mb-2.5 group-hover:text-gold-dark transition-colors leading-snug flex-1">
                  {post.title}
                </h3>
                <p className="text-slate-500 font-body text-xs leading-relaxed mb-4">{post.summary}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                  <span className="text-slate-400 text-xs font-body">{post.date}</span>
                  <span className="text-gold-dark text-xs font-bold font-body inline-flex items-center gap-1 group-hover:text-gold transition-colors">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.article>
            )) : (
              <div className="col-span-3 text-center py-16 text-slate-400 font-body">
                No articles found for "{search}". Try a different search.
              </div>
            )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

    {/* Study Materials */}
    <section className="section-padding bg-white relative">
      <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="container mx-auto">
          <SectionHeading label="Downloads" title="Free Study Materials" description="Expertly compiled PDF notes — free for all registered students." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {studyMaterials.map((mat, i) => (
              <motion.div
                key={mat.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card rounded-2xl p-5 flex items-start gap-4 group bg-white border border-slate-200 shadow-xl transition-transform hover:scale-[1.03]"
              >
                <div className="w-12 h-12 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition-colors">
                  <FileText className="w-6 h-6 text-navy/40 group-hover:text-gold-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gold-dark bg-gold/5 border border-gold/15 px-2 py-0.5 rounded-full">{mat.category}</span>
                  <h3 className="font-body font-semibold text-navy text-sm mt-2 mb-1.5 leading-snug">{mat.title}</h3>
                  <div className="flex gap-2 text-[10px] text-slate-400 font-body mb-3">
                    <span>{mat.pages}</span> <span>·</span> <span>{mat.size}</span>
                  </div>
                  <button className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-dark hover:text-navy transition-colors font-body underline underline-offset-4">
                    <Download className="w-3.5 h-3.5" /> Download Free
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    {/* Exam Notifications */}
    <section className="section-padding bg-[#f8fbff] border-t border-slate-100 relative">
      <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="container mx-auto max-w-3xl">
          <SectionHeading label="Stay Updated" title="Exam Notifications" description="Latest official notifications to keep you ahead." />
          <div className="flex flex-col gap-4">
            {examUpdates.map((u, i) => (
              <motion.div
                key={u.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card rounded-xl p-5 flex items-center gap-4 group border border-slate-200 bg-white shadow-xl hover:border-gold/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition-colors">
                  <Bell className="w-4.5 h-4.5 text-navy/40 group-hover:text-gold-dark" />
                </div>
                <div className="flex-1">
                  <h3 className="text-navy font-body font-semibold text-sm">{u.title}</h3>
                  <span className="text-slate-400 text-xs font-body">{u.date}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-green-500 animate-pulse" : "bg-gold"}`} />
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-body ${
                    u.status === "Active"
                      ? "text-green-600 bg-green-50 border border-green-100"
                      : "text-gold-dark bg-gold/5 border border-gold/15"
                  }`}>
                    {u.status}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-gold transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;
