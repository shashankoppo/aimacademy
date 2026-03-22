import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, CheckCircle2, Trophy, Users, Star, Quote, 
  Play, TrendingUp, Cpu, GraduationCap, BookOpen, Shield, Target, Flame,
  ChevronRight, BarChart3, PieChart, Zap, Clock, Globe, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Shared Components ───────────────────────────────────────
const SectionHeading = ({ label, title, description, center = true }: any) => (
  <div className={center ? "text-center mb-16 gsap-reveal" : "text-left mb-16 gsap-reveal"}>
    <div className="flex flex-col gap-3">
      <span className="badge-academic self-start mx-auto inline-block">{label}</span>
      <h2 className="heading-display text-3xl md:text-5xl lg:text-5xl text-slate-900 leading-tight">
        {title}
      </h2>
      {description && (center ? 
        <p className="max-w-2xl mx-auto text-lg text-slate-500 font-body leading-relaxed mt-4">
          {description}
        </p> : 
        <p className="max-w-xl text-lg text-slate-500 font-body leading-relaxed mt-4">
          {description}
        </p>
      )}
    </div>
  </div>
);

const StatCard = ({ stat, index }: any) => (
  <div className="flex flex-col items-center text-center p-6 border-r border-slate-100 last:border-0 gsap-reveal" style={{ transitionDelay: `${index * 0.1}s` }}>
     <div className="font-display font-black text-4xl md:text-5xl text-primary tracking-tighter flex items-baseline gap-1">
        <span>{stat.value}</span>
        <span className="text-primary text-xl font-bold">{stat.suffix}</span>
      </div>
    <div className="text-slate-900 font-bold text-sm uppercase tracking-wide mt-2">{stat.label}</div>
    <div className="text-slate-400 text-[11px] font-medium uppercase tracking-widest leading-none mt-1">{stat.sub}</div>
  </div>
);

// ─── Data ───────────────────────────────────────────────────
const courses = [
  { icon: GraduationCap, title: "UPSC Civil Services", badge: "Flagship", desc: "Top-tier UPSC CSE mentorship by ex-faculty and rank holders.", students: "4,500+", duration: "12-18 Months", level: "Officer" },
  { icon: Target,        title: "State PSC (MP/UP/Bihar)", badge: "Hot", desc: "Region-specific strategy for MPPSC, UPPSC, BPSC, and RPSC exams.", students: "3,200+", duration: "6-12 Months", level: "Group A/B" },
  { icon: Shield,        title: "SSC CGL & CHSL", badge: "Popular", desc: "Intensive drills for reasoning and quant with speed-math techniques.", students: "6,800+", duration: "6 Months", level: "Central Gov" },
  { icon: BookOpen,      title: "Banking & IBPS", badge: "Trending", desc: "Focused preparation for SBI PO, IBPS, and RBI Grade-B recruitment.", students: "2,900+", duration: "6 Months", level: "Financial" },
];

const stats = [
  { value: '500',  suffix: '+',  label: "Selections", sub: "Since 2012" },
  { value: '30',   suffix: '%',  label: "Selection Rate", sub: "UPSC CSE Interview" },
  { value: '12',   suffix: 'k+', label: "Global Students", sub: "Across all streams" },
  { value: '4.9',  suffix: '/5', label: "Student Rating", sub: "Google & Maps" },
];

const partners = [
  { name: "ELSxGlobal", role: "Tech Partner" },
  { name: "Oxford Education", role: "Library Access" },
  { name: "Pearson", role: "Publishing Partner" },
  { name: "AWS EdStart", role: "Infrastructure" },
];

const testimonials = [
  { name: "Aarav Mehta", rank: "AIR 12 — UPSC CSE 2024", quote: "The mentorship at AIM Academy was the turning point in my preparation. The evaluation of my mains answers was far more rigorous than any other institute.", initial: "AM" },
  { name: "Deepa Nair",  rank: "AIR 23 — UPSC CSE 2023", quote: "AIM's focus on conceptual clarity helped me tackle the most difficult Prelims paper in recent years with confidence.", initial: "DN" },
  { name: "Priya Sharma",rank: "AIR 45 — UPSC CSE 2024", quote: "Highly intensive, highly professional, and emotionally supportive throughout the journey.", initial: "PS" },
];

// ─── Main Page ─────────────────────────────────────────────────
const Index = () => {
  return (
    <div className="bg-white min-h-screen">
      
      {/* ══ HERO SECTION ══════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-academic overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-dot-white" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-12 xl:col-span-6 flex flex-col gap-10">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-surface-accent rounded text-primary text-xs font-bold uppercase tracking-widest border border-blue-100 gsap-reveal">
                <Globe className="w-4 h-4" /> Global Recognition — Jabalpur #1 Ranked
              </div>
              <h1 className="heading-display text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[4.8rem] text-slate-900 leading-[1] gsap-reveal">
                Empowering the Next Generation of <span className="text-primary italic">Leaders.</span>
              </h1>
              <p className="text-slate-500 text-xl font-body max-w-2xl leading-relaxed gsap-reveal [transition-delay:0.2s]">
                Acquire the skills and mentorship to crack India's toughest exams. Join a community 
                of <span className="text-primary font-bold">12,000+ Aspirants</span> and start your career in public service.
              </p>
              <div className="flex flex-wrap gap-4 items-center gsap-reveal [transition-delay:0.4s]">
                 <Link to="/courses" className="btn-coursera text-lg px-10 py-5">
                   Explore Programs
                 </Link>
                 <Link to="/contact" className="btn-outline-coursera text-lg px-10 py-5">
                   Get Counseling
                 </Link>
              </div>
              <div className="flex items-center gap-6 gsap-reveal [transition-delay:0.6s]">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                        <Users className="w-5 h-5 text-slate-300" />
                      </div>
                    ))}
                 </div>
                 <div className="text-sm font-body text-slate-400">
                   <span className="text-slate-900 font-bold">4.9/5 Rating</span> by over 500+ successful officers
                 </div>
              </div>
            </div>

            <div className="lg:col-span-12 xl:col-span-6 relative gsap-reveal [transition-delay:0.8s]">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white lg:rotate-1">
                <img 
                  src="/images/hero_banner_wide.jpg" 
                  alt="AIM Academy Group Success" 
                  className="w-full h-auto object-cover hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-6">
                   <div className="flex items-center gap-4 text-white">
                      <div className="p-3 bg-white/20 backdrop-blur rounded-full">
                         <Play className="w-5 h-5 fill-current" />
                      </div>
                      <span className="font-bold text-sm">Our 12th Year of Academic Excellence</span>
                   </div>
                </div>
              </div>
              {/* Floating Stat Case */}
              <div className="absolute -bottom-8 -left-8 academic-card bg-white p-6 border-l-4 border-l-primary animate-float-slow">
                 <div className="flex flex-col gap-1">
                    <span className="text-primary font-black text-2xl tracking-tighter">95% Success</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">In Interview Rounds</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS STRIP ═══════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-100">
         <div className="container mx-auto py-12 px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
               {stats.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
            </div>
         </div>
      </div>

      {/* ══ LEARNING EXPERIENCE ═══════════════════════════════ */}
      <section className="section-padding bg-slate-50/50">
         <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div className="gsap-reveal">
                  <span className="badge-academic mb-6">The AIM Method</span>
                  <h2 className="heading-display text-4xl mb-8">Not Just Coaching. <br /><span className="text-primary italic font-medium">True Transformation.</span></h2>
                  <p className="text-slate-500 text-lg leading-relaxed mb-10">
                     Our pedagogy is built on the pillars of Coursera's learning style—clear, modular, and mentor-driven. We provide a structured environment where strategy meets hard work.
                  </p>
                  <ul className="flex flex-col gap-6">
                     {[
                       "Personalized 1-on-1 Mentorship Plans",
                       "Daily Evaluation of Mains Answer Sheets",
                       "AI-Powered Real-time Growth Analytics",
                       "Exclusive Access to the 'Oxford Pattern' Library"
                     ].map(text => (
                       <li key={text} className="flex gap-4 items-center">
                          <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                          <span className="text-slate-900 font-bold font-body">{text}</span>
                       </li>
                     ))}
                  </ul>
                  <Link to="/about" className="btn-coursera inline-flex gap-2 mt-12">
                    Learn Our Origins <ChevronRight className="w-4 h-4" />
                  </Link>
               </div>
               <div className="relative gsap-reveal">
                  <div className="rounded-2xl overflow-hidden shadow-2xl aspect-video border-[10px] border-white">
                     <img src="/images/coursera_learning.png" alt="Learning Experience" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <button className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ══ COURSES PROWESS ═══════════════════════════════════ */}
      <section className="section-padding bg-white">
         <div className="container mx-auto px-6">
            <SectionHeading 
               label="Explore Our Ecosystem" 
               title="Specializations for the Modern Aspirant" 
               description="Every program is designed by industrial experts to ensure you cross the merit threshold."
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               {courses.map((c, i) => (
                 <div key={c.title} className="academic-card gsap-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                    <div className="w-12 h-12 rounded bg-surface-accent flex items-center justify-center mb-6 text-primary transition-colors">
                       <c.icon className="w-6 h-6" />
                    </div>
                    <div className="text-[10px] font-bold text-primary mb-3 uppercase tracking-widest">{c.badge}</div>
                    <h3 className="heading-display text-xl mb-4">{c.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">{c.desc}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> {c.duration}
                       </span>
                       <Link to="/courses" className="text-primary hover:translate-x-1 transition-transform">
                          <ArrowRight className="w-5 h-5" />
                       </Link>
                    </div>
                 </div>
               ))}
            </div>
            <div className="text-center mt-16">
               <Link to="/courses" className="btn-outline-coursera inline-flex gap-2 mx-auto">
                 View All 24+ Programs <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
         </div>
      </section>

      {/* ══ TRUST BANNER / PARTNERS ══════════════════════════ */}
      <section className="py-20 border-y border-slate-50">
         <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
               <div>
                  <h4 className="font-bold text-slate-400 text-xs uppercase tracking-[0.3em] mb-4 text-center lg:text-left">OFFICIAL INFRASTRUCTURE PARTNERS</h4>
                  <div className="flex flex-wrap gap-10 items-center justify-center lg:justify-start grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                     {partners.map(p => (
                       <div key={p.name} className="flex flex-col items-center gap-1">
                          <Zap className="w-6 h-6 text-primary" />
                          <span className="font-black tracking-tighter text-slate-900 border-b-2 border-primary">{p.name}</span>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="flex items-center gap-6 p-6 bg-surface-accent rounded-xl border border-blue-50 max-w-lg">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary shadow-lg shrink-0">
                     <Award className="w-8 h-8" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-900">Affiliated with Leading Institutions</p>
                     <p className="text-xs text-slate-500 mt-1">Our curriculum is vetted by ISO 9001:2015 certified academic boards for quality excellence.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════ */}
      <section className="section-padding bg-slate-50/50">
         <div className="container mx-auto px-6">
            <SectionHeading label="The Proof" title="Student Success Stories" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {testimonials.map((t, i) => (
                 <div key={t.name} className="academic-card border-0 shadow-lg gsap-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                    <div className="flex gap-1 mb-6">
                       {[1,2,3,4,5].map(j => (
                         <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                       ))}
                    </div>
                    <p className="text-slate-600 font-body text-lg italic leading-relaxed mb-10">"{t.quote}"</p>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-surface-accent flex items-center justify-center font-bold text-primary text-xl">
                          {t.initial}
                       </div>
                       <div>
                          <p className="font-bold text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.rank}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ══ CTA SECTION ═══════════════════════════════════════ */}
      <section className="relative py-24 bg-primary overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
         <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="heading-display text-4xl md:text-5xl text-white mb-8">Ready to Elevate Your Future?</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-12">
               Take the first step toward a prestigious career in Civil Services. Book your free counseling session with our senior mentors today.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
               <Link to="/contact" className="bg-white text-primary font-black py-5 px-14 rounded text-lg hover:shadow-2xl hover:-translate-y-1 transition-all">
                  Get Started For Free
               </Link>
               <a href="tel:+917067231189" className="border-2 border-white/30 text-white font-black py-5 px-14 rounded text-lg hover:bg-white/10 transition-all">
                  Speak to an Expert
               </a>
            </div>
         </div>
      </section>

      {/* ══ FOOTER MINIMAL ════════════════════════════════════ */}
      <footer className="py-16 bg-white border-t border-slate-100">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 border border-slate-100 overflow-hidden">
                <img src="/images/logo_main.png" alt="AIM Academy Logo" className="w-full h-full object-contain" />
             </div>
             <span className="font-display font-black text-xl text-slate-900 tracking-tighter">AIM ACADEMY</span>
          </div>
            <p className="text-slate-400 text-sm">© 2024 AIM Academy Jabalpur. All Rights Reserved.</p>
            <div className="flex gap-8">
               {["Terms", "Privacy", "Help"].map(text => (
                 <a key={text} href="#" className="text-slate-400 hover:text-primary text-xs font-bold uppercase tracking-widest">{text}</a>
               ))}
            </div>
         </div>
      </footer>

    </div>
  );
};

export default Index;
