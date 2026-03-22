import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Shield, Target, Trophy, Clock, Calendar, CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Users, Zap } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const courses = [
  {
    icon: GraduationCap,
    title: "UPSC Civil Services (CSE)",
    tag: "Most Popular",
    tagColor: "text-blue-400 bg-blue-400/10 border-blue-400/25",
    overview: "India's most prestigious examination — we prepare you for Prelims, Mains and the Personality Test with battle-tested strategies.",
    duration: "12–18 Months",
    batches: "Morning (7–10 AM) · Evening (5–8 PM) · Weekend Batch",
    fee: "₹1,20,000/year",
    enrolled: "2,400+ students",
    syllabus: ["General Studies (GS I–IV)", "CSAT", "Optional Subjects", "Essay Writing", "Ethics & Integrity", "Interview Preparation", "Current Affairs Daily"],
    highlights: ["500+ UPSC selections", "AIR 12, 23, 45 produced", "Mock interview by ex-IAS", "Daily answer writing", "Monthly test series", "Lifetime material access"],
    color: "from-blue-500/6 to-transparent",
    iconColor: "text-blue-400 bg-blue-400/10 border-blue-400/15",
    accent: "border-blue-500/20",
  },
  {
    icon: BookOpen,
    title: "State PSC Examinations",
    tag: "High Demand",
    tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
    overview: "Specialized coaching for UPPSC, BPSC, MPPSC, RPSC and all state-level civil services with dedicated state-specific curriculum.",
    duration: "6–12 Months",
    batches: "Morning (8–11 AM) · Weekend Batch",
    fee: "₹75,000/year",
    enrolled: "1,800+ students",
    syllabus: ["State-specific GS", "State History & Geography", "Current Affairs", "Language Papers", "Essay & Interview Prep"],
    highlights: ["150+ state selections", "State-specific notes", "Expert mentors", "Local current affairs", "Flexible schedule"],
    color: "from-emerald-500/6 to-transparent",
    iconColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/15",
    accent: "border-emerald-500/20",
  },
  {
    icon: Shield,
    title: "SSC CGL / CHSL",
    tag: "Fast Track",
    tagColor: "text-violet-400 bg-violet-400/10 border-violet-400/25",
    overview: "Intensive preparation for CGL, CHSL, MTS and all SSC exams with speed drills, sectional practice and full-length mocks.",
    duration: "6 Months",
    batches: "Morning (9 AM–12 PM) · Evening (4–7 PM)",
    fee: "₹45,000",
    enrolled: "3,200+ students",
    syllabus: ["Quantitative Aptitude", "English Language", "General Awareness", "Reasoning Ability", "Descriptive Paper (Tier 2)"],
    highlights: ["500+ SSC selections", "Speed-focused drills", "1000+ mock tests", "Tier I & II prep", "Previous year papers"],
    color: "from-violet-500/6 to-transparent",
    iconColor: "text-violet-400 bg-violet-400/10 border-violet-400/15",
    accent: "border-violet-500/20",
  },
  {
    icon: Target,
    title: "Banking / IBPS / RBI",
    tag: "New Batch",
    tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/25",
    overview: "Comprehensive banking exam preparation for IBPS PO/Clerk, SBI PO, RBI Grade B, NABARD and other banking & insurance exams.",
    duration: "4–6 Months",
    batches: "Morning (8–11 AM) · Live Online",
    fee: "₹40,000",
    enrolled: "2,100+ students",
    syllabus: ["Quantitative Aptitude", "Reasoning Ability", "English", "General/Financial Awareness", "Computer Knowledge"],
    highlights: ["Live online option", "IBPS & SBI focus", "Banking GK notes", "Mock interview", "Weekly speed tests"],
    color: "from-amber-500/6 to-transparent",
    iconColor: "text-amber-400 bg-amber-400/10 border-amber-400/15",
    accent: "border-amber-500/20",
  },
  {
    icon: Trophy,
    title: "Railways / Defence / Teaching",
    tag: "Flexible",
    tagColor: "text-rose-400 bg-rose-400/10 border-rose-400/25",
    overview: "Preparation for RRB NTPC, Group D, CDS, NDA, CTET, DSSSB, and all central/state government recruitment examinations.",
    duration: "3–6 Months",
    batches: "Flexible scheduling · Online available",
    fee: "₹30,000",
    enrolled: "1,500+ students",
    syllabus: ["General Knowledge", "Mathematics", "English / Hindi", "Exam-specific subjects", "Physical / Medical test guidance"],
    highlights: ["Multiple exam coverage", "Online + offline", "Doubt clearing sessions", "Quick revision notes"],
    color: "from-rose-500/6 to-transparent",
    iconColor: "text-rose-400 bg-rose-400/10 border-rose-400/15",
    accent: "border-rose-500/20",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } }),
};

const CourseCard = ({ course, index }: { course: typeof courses[0]; index: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      className={`bento-item group overflow-hidden border-l-8 ${course.accent} bg-white shadow-2xl transition-all duration-700`}
    >
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-5">
          <div className={`w-14 h-14 rounded-2xl ${course.iconColor} border flex items-center justify-center shrink-0 shadow-sm`}>
            <course.icon className="w-7 h-7" />
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h2 className="heading-display text-3xl md:text-4xl text-navy group-hover:text-gold-dark transition-colors">{course.title}</h2>
              <span className={`text-[11px] font-extrabold px-3 py-1 rounded-lg border font-body uppercase tracking-wider ${course.tagColor}`}>{course.tag}</span>
            </div>
            <p className="text-slate-500 font-body text-sm leading-relaxed mb-5">{course.overview}</p>

            <div className="flex flex-wrap gap-4 mb-5">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-3.5 h-3.5 text-gold-dark/60" />
                <span className="text-slate-400 font-body text-xs">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-3.5 h-3.5 text-gold-dark/60" />
                <span className="text-slate-400 font-body text-xs">{course.batches}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-3.5 h-3.5 text-gold-dark/60" />
                <span className="text-slate-400 font-body text-xs">{course.enrolled}</span>
              </div>
              <span className="text-xs text-gold-dark font-bold bg-gold/5 border border-gold/15 px-3 py-1 rounded-full font-body">
                {course.fee}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {course.highlights.map((h) => (
                <span key={h} className="text-[10px] bg-navy/5 border border-navy/10 text-slate-500 px-3 py-1 rounded-full font-body hover:border-gold/30 hover:bg-gold/5 transition-colors">
                  ✓ {h}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-body font-bold"
              >
                Enroll Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-semibold text-slate-400 hover:text-navy transition-colors inline-flex items-center gap-1.5 font-body"
              >
                {expanded ? "Hide Syllabus" : "View Syllabus"}
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <Link to="/contact" className="text-xs font-semibold text-navy/40 hover:text-navy/60 transition-colors font-body ml-2">
                Free Counseling →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus accordion */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 py-6 border-t border-slate-100 bg-slate-50/50">
              <p className="text-slate-400 text-[10px] font-body uppercase tracking-[0.2em] mb-4">Syllabus Coverage</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {course.syllabus.map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm font-body">
                    <CheckCircle2 className="w-4 h-4 text-gold-dark/60 shrink-0" />
                    <span className="text-slate-500">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Courses = () => (
  <div className="pt-[3.75rem] page-enter bg-white">
    {/* Hero */}
    <section className="relative py-22 md:py-28 bg-hero overflow-hidden border-b border-slate-100">
      <div className="absolute inset-0 dot-grid-sm opacity-50" />
      <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full bg-gold/5 blur-[150px]" />
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="badge-gold inline-flex items-center gap-2 mb-6">
          <Zap className="w-3 h-3" /> 5 Comprehensive Programs
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.15 }}
          className="heading-display text-[3.5rem] md:text-7xl lg:text-[8.5rem] text-navy mb-8 leading-[1.05]"
        >
          Our <span className="heading-editorial text-gradient-gold italic">Elite</span> <br />
          Study <span className="font-normal">Programs</span>.
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-body leading-relaxed font-light"
        >
          Curated pathways to India's most prestigious services. 
          <span className="text-navy font-semibold italic"> Powered by ELSxGlobal Tech.</span>
        </motion.p>
      </div>
    </section>

    {/* Courses */}
    <section className="section-padding bg-[#f8fbff] border-y border-slate-100">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          {courses.map((course, i) => <CourseCard key={course.title} course={course} index={i} />)}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section-padding bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="container mx-auto max-w-2xl text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="badge-gold inline-flex items-center gap-2 mb-6">
            <Zap className="w-3 h-3" /> Not Sure Which Course?
          </div>
          <h2 className="heading-display text-3xl md:text-4xl text-navy mb-4">
            Book a Free <span className="text-gradient-gold">Counseling Session</span>
          </h2>
          <p className="text-slate-500 font-body mb-8 leading-relaxed">
            Our expert mentors will assess your profile, background and goals — then suggest the exact right program, batch and study plan.
          </p>
          <Link to="/contact" className="btn-gold inline-flex items-center gap-2 px-10 py-4 rounded-xl font-body font-bold text-base shadow-lg hover:shadow-gold/20">
            Book Free Counseling <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  </div>
);

export default Courses;
