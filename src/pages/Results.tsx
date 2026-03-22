import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Medal, Award, Zap } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const allToppers = [
  { name: "Aarav Mehta",   rank: "AIR 12",  exam: "UPSC CSE 2024", year: "2024", badge: "🥇", quote: "The mock interviews at AIM were indistinguishable from the real board experience.", color: "from-amber-400/20 to-amber-400/3",  border: "border-amber-400/30" },
  { name: "Priya Sharma",  rank: "AIR 45",  exam: "UPSC CSE 2024", year: "2024", badge: "🥇", quote: "AIM's answer writing sessions were the single biggest factor in my mains score.", color: "from-amber-400/15 to-amber-400/3",  border: "border-amber-400/25" },
  { name: "Karan Singh",   rank: "AIR 78",  exam: "UPSC CSE 2024", year: "2024", badge: "🥈", quote: "The test series feedback system helped me identify weak areas systematically.", color: "from-slate-400/12 to-slate-400/3",   border: "border-slate-400/25" },
  { name: "Rahul Verma",   rank: "AIR 112", exam: "UPSC CSE 2024", year: "2024", badge: "🥉", quote: "Daily targets and weekly tests by AIM kept me disciplined throughout the year.", color: "from-orange-400/10 to-orange-400/3", border: "border-orange-400/20" },

  { name: "Deepa Nair",    rank: "AIR 23",  exam: "UPSC CSE 2023", year: "2023", badge: "🥇", quote: "Faculty goes beyond teaching — they mentor, motivate and guide you personally.", color: "from-amber-400/20 to-amber-400/3",  border: "border-amber-400/30" },
  { name: "Vikram Joshi",  rank: "AIR 56",  exam: "UPSC CSE 2023", year: "2023", badge: "🥈", quote: "Current affairs analysis sessions were extremely concise and exam-relevant.", color: "from-slate-400/12 to-slate-400/3",   border: "border-slate-400/25" },
  { name: "Meera Reddy",   rank: "AIR 89",  exam: "UPSC CSE 2023", year: "2023", badge: "🥉", quote: "The essay workshops and ethics sessions at AIM gave me an unbeatable edge.", color: "from-orange-400/10 to-orange-400/3", border: "border-orange-400/20" },

  { name: "Arjun Pillai",  rank: "AIR 34",  exam: "UPSC CSE 2022", year: "2022", badge: "🥇", quote: "The optional subject coaching and GS strategy at AIM is truly world-class.", color: "from-amber-400/18 to-amber-400/3",  border: "border-amber-400/28" },
];

const selectionStats = [
  { exam: "UPSC CSE",      count: "250+", label: "Civil Services officers produced since 2010", icon: Trophy, color: "from-amber-500/12 to-amber-500/3", border: "border-amber-500/20", iconColor: "text-amber-400" },
  { exam: "State PSC",     count: "150+", label: "State civil services selections across India",  icon: Award, color: "from-blue-500/10 to-blue-500/3",   border: "border-blue-500/15",  iconColor: "text-blue-400" },
  { exam: "SSC / Banking", count: "500+", label: "SSC CGL, Banking & Insurance selections",       icon: Medal, color: "from-violet-500/10 to-violet-500/3", border: "border-violet-500/15", iconColor: "text-violet-400" },
  { exam: "Other Govt.",   count: "200+", label: "Railway, Defence, Teaching & other govt. jobs", icon: Star,  color: "from-emerald-500/10 to-emerald-500/3", border: "border-emerald-500/15", iconColor: "text-emerald-400" },
];

const testimonials = [
  { name: "Aarav Mehta", rank: "AIR 12, UPSC CSE 2024", quote: "AIM Academy's comprehensive approach to UPSC — especially answer writing and the mock interviews — was the definitive factor in my success.", initial: "A", color: "bg-amber-500" },
  { name: "Deepa Nair",  rank: "AIR 23, UPSC CSE 2023", quote: "The faculty doesn't just teach — they mentor you through every stage of this challenging, multi-year journey. You feel personally invested in.", initial: "D", color: "bg-blue-500" },
  { name: "Karan Singh", rank: "AIR 78, UPSC CSE 2024", quote: "1000+ mock tests, detailed answer feedback, and daily current affairs — no other institute offered this depth and breadth of preparation.", initial: "K", color: "bg-violet-500" },
  { name: "Neha Gupta",  rank: "SBI PO 2024 Selected",  quote: "AIM Academy's banking program is exceptional. Speed tests and sectional analysis made me consistently crack the cutoff with margin.", initial: "N", color: "bg-emerald-500" },
];

const years = ["All", "2024", "2023", "2022"];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.55 } }),
};

const Results = () => {
  const [activeYear, setActiveYear] = useState("All");

  const filtered = activeYear === "All"
    ? allToppers
    : allToppers.filter((t) => t.year === activeYear);

  return (
    <div className="pt-[3.75rem] page-enter bg-white">
      {/* Hero */}
      <section className="relative py-22 md:py-28 bg-hero overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 dot-grid-sm opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gold/5 blur-[150px]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="badge-gold inline-flex items-center gap-2 mb-6">
            <Trophy className="w-3 h-3" /> 500+ Selections & Counting
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15 }}
            className="heading-display text-[3.5rem] md:text-7xl lg:text-[8.5rem] text-navy mb-8 leading-[1.05]"
          >
            The <span className="heading-editorial text-gradient-gold italic">Elite</span> <br />
            Rank <span className="font-normal">Holders</span>.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-slate-500 text-lg max-w-xl mx-auto font-body leading-relaxed">
            A legacy of excellence — our students' achievements define who we are.
          </motion.p>
        </div>
      </section>

      {/* Hall of Fame Banner */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 md:border-8 border-slate-50"
          >
            <img 
              src="/images/results_banner.jpg" 
              alt="Recent Results of AIM Academy" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-[#f8fbff] border-y border-slate-100">
        <div className="container mx-auto">
          <SectionHeading label="Impact" title="Selection Overview" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {selectionStats.map((s, i) => (
              <motion.div
                key={s.exam}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`glass-card rounded-2xl p-7 text-center bg-white border border-slate-200 shadow-xl transition-transform hover:scale-[1.03]`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-navy/5 border border-navy/10 flex items-center justify-center mx-auto mb-4`}>
                  <s.icon className={`w-7 h-7 ${s.iconColor}`} />
                </div>
                <div className="stat-number text-5xl mb-2">{s.count}</div>
                <div className="font-display font-semibold text-navy mb-1">{s.exam}</div>
                <p className="text-slate-400 text-xs font-body leading-relaxed">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Toppers with year filter */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="container mx-auto relative z-10">
          <SectionHeading label="Hall of Fame" title="Our Rank Holders" />

          {/* Year tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setActiveYear(y)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold font-body transition-all duration-200 ${
                  activeYear === y
                    ? "btn-gold shadow-lg"
                    : "bg-navy/5 border border-navy/10 text-navy/40 hover:border-gold/30 hover:text-navy/70"
                }`}
              >
                {y === "All" ? "All Years" : `UPSC ${y}`}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeYear}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {filtered.map((t, i) => (
                <motion.div
                  key={t.name + t.year}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className={`glass-card rounded-2xl p-5 bg-white border border-slate-200 shadow-lg hover:scale-[1.05] transition-transform duration-300 relative group`}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-xl">{t.badge}</span>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="font-syne font-extrabold text-2xl text-gradient-gold mb-1">{t.rank}</div>
                    <div className="font-display font-bold text-navy text-sm mb-1">{t.name}</div>
                    <div className="text-slate-400 text-[10px] font-body uppercase tracking-wider mb-4">{t.exam}</div>
                    <p className="text-slate-500 text-[11px] font-body leading-relaxed italic border-t border-slate-50 pt-4 px-2">
                      "{t.quote}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-[#f8fbff] border-t border-slate-100">
        <div className="container mx-auto">
          <SectionHeading label="Testimonials" title="What Our Toppers Say" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card rounded-2xl p-7 bg-white shadow-xl border border-slate-200"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-gold fill-gold" />)}
                </div>
                <p className="text-slate-500 italic font-body leading-relaxed mb-6 text-sm leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center shrink-0 shadow-lg`}>
                    <span className="text-white font-display font-bold">{t.initial}</span>
                  </div>
                  <div>
                    <div className="text-navy font-display font-semibold text-sm">{t.name}</div>
                    <div className="text-gold-dark text-xs font-bold font-body">{t.rank}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Results;
