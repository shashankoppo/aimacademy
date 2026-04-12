import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Shield, Target, Trophy, Clock, Calendar, CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Users, Zap } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const courses = [
  {
    icon: GraduationCap,
    title: "UPSC (Fundamental)",
    tag: "Core Program",
    tagColor: "text-blue-600 bg-blue-50 border-blue-100",
    overview: "Comprehensive foundation for Civil Services. We build your conceptual clarity from NCERTs to Advanced Reference books.",
    duration: "12-18 Months",
    batches: "Morning (8-11 AM) · Evening (5-8 PM)",
    fee: "Flexible Installments",
    enrolled: "500+ Active Students",
    syllabus: ["NCERT Foundation", "General Studies (I-IV)", "CSAT Aptitude", "Essay Writing", "Current Affairs", "Interview Prep"],
    highlights: ["Detailed NCERT Coverage", "Weekly Pre+Mains Tests", "Personalized Mentorship", "Expert Strategy Sessions"],
    color: "from-blue-500/6 to-transparent",
    iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    accent: "border-blue-500/20",
  },
  {
    icon: BookOpen,
    title: "MP PSC (Pre & Mains)",
    tag: "State Priority",
    tagColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    overview: "Dedicated coaching for Madhya Pradesh Public Service Commission. In-depth cover of State GS & Administrative subjects.",
    duration: "10-12 Months",
    batches: "Morning & Afternoon",
    fee: "Scholarships Available",
    enrolled: "800+ Active Students",
    syllabus: ["MP General Knowledge", "Pre-Specific MCQs", "Mains Answer Writing", "Ethics & Hindi", "Mock Interviews"],
    highlights: ["Focus on MP History/Geo", "Answer Writing Drills", "Previous Year Analysis", "Monthly Magazine Access"],
    color: "from-emerald-500/6 to-transparent",
    iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    accent: "border-emerald-500/20",
  },
  {
    icon: Shield,
    title: "SUB INSPECTOR (Pre & Physical)",
    tag: "Uniform Services",
    tagColor: "text-red-600 bg-red-50 border-red-100",
    overview: "Comprehensive prep for SI exams including academic coaching and physical training guidance for the selection trials.",
    duration: "6-8 Months",
    batches: "Early Morning (Physical) · Noon (Theory)",
    fee: "Best in Class",
    enrolled: "450+ Warriors",
    syllabus: ["General Studies", "Hindi & English", "Mathematics/Reasoning", "Physical Stamina Guide", "Sectional Mock Tests"],
    highlights: ["Physical Training Tips", "Strong Hindi Focus", "Daily Speed Tests", "Retired Officer Guidance"],
    color: "from-red-500/6 to-transparent",
    iconColor: "text-red-600 bg-red-50 border-red-100",
    accent: "border-red-500/20",
  },
  {
    icon: Trophy,
    title: "SSC & CGL Special",
    tag: "Top Choice",
    tagColor: "text-amber-600 bg-amber-50 border-amber-100",
    overview: "Advanced coaching for Staff Selection Commission exams (CGL, CHSL, MTS). Special emphasis on Math & English shortcut tricks.",
    duration: "6 Months",
    batches: "Morning · Afternoon · Evening",
    fee: "Combo Discounts",
    enrolled: "1200+ Aspirants",
    syllabus: ["Quantitative Aptitude", "Logical Reasoning", "General English", "General Awareness", "Tier-II Specialization"],
    highlights: ["Math Shortcuts", "Vocabulary Booster", "100+ Full-Length Mocks", "Doubt Clearing Classes"],
    color: "from-amber-500/6 to-transparent",
    iconColor: "text-amber-600 bg-amber-50 border-amber-100",
    accent: "border-amber-500/20",
  },
  {
    icon: Target,
    title: "RAILWAY / VYAPAM / CONSTABLE",
    tag: "Mass Hiring",
    tagColor: "text-violet-600 bg-violet-50 border-violet-100",
    overview: "Fast-track programs for Railway (NTPC/Group D), Constable, Patwari, and all other MP Vyapam competitive exams.",
    duration: "4-6 Months",
    batches: "Flexible Batches",
    fee: "Budget Friendly",
    enrolled: "2000+ Success Stories",
    syllabus: ["Basic Math & Science", "State GK", "General Intelligence", "Exam Specific Practice", "Current Events"],
    highlights: ["Mass Result History", "Topic-wise PDFs", "Quick Revision Notes", "Bilingual Coaching"],
    color: "from-violet-500/6 to-transparent",
    iconColor: "text-violet-600 bg-violet-50 border-violet-100",
    accent: "border-violet-500/20",
  },
  {
    icon: Zap,
    title: "Personality Development",
    tag: "Life Skill",
    tagColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
    overview: "Empowering yourself with communication, soft skills, and body language to excel in interviews and corporate life.",
    duration: "3 Months",
    batches: "Weekend Only",
    fee: "Value Added Program",
    enrolled: "300+ Professionals",
    syllabus: ["Spoken English", "Public Speaking", "Corporate Etiquette", "Mock Interviews", "Confiding Building"],
    highlights: ["Stage Presence", "Group Discussions", "Resume Building", "Video Analysis"],
    color: "from-indigo-500/6 to-transparent",
    iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
    accent: "border-indigo-500/20",
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
  <div className="pt-[3.75rem] page-enter bg-background">
    {/* Hero */}
    <section className="relative py-22 md:py-28 bg-transparent overflow-hidden border-b border-black/5">
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
    <section className="section-padding bg-transparent border-y border-black/5">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          {courses.map((course, i) => <CourseCard key={course.title} course={course} index={i} />)}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section-padding bg-transparent border-t border-black/5 relative overflow-hidden">
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
