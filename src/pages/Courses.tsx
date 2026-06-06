import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Shield, Target, Trophy, Clock, Calendar, CheckCircle2, ArrowRight, ChevronDown, ChevronUp, ChevronRight, Users, Zap } from "lucide-react";
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

const categories = ["All Exams", "Core Programs", "State Exams", "Uniform Services", "Life Skills"];

const CourseCard = ({ course, index }: { course: typeof courses[0]; index: number }) => {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      className={`relative group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 hover:border-slate-200 transition-all duration-500 flex flex-col h-full`}
    >
      {/* KGS Style Top Image / Gradient Header */}
      <div className={`relative h-40 w-full bg-gradient-to-br ${course.color.replace('from-', 'from-').replace('/6', '/20')} flex items-center justify-center overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${course.accent.replace('border-', 'from-').replace('/20', '/80')} to-slate-900/40 opacity-20 group-hover:opacity-40 transition-opacity`} />
        <div className={`w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-500`}>
          <course.icon className={`w-8 h-8 ${course.iconColor.split(' ')[0]}`} />
        </div>
        <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-md">
          {course.tag}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h2 className="font-syne font-bold text-xl text-navy group-hover:text-gold-dark transition-colors mb-2 line-clamp-2">{course.title}</h2>
        <p className="text-slate-500 font-body text-xs leading-relaxed mb-4 line-clamp-3 flex-1">{course.overview}</p>

        <div className="flex flex-col gap-2 mb-6 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 font-medium font-body">{course.duration} • {course.batches}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 font-medium font-body">{course.enrolled}</span>
          </div>
        </div>

        {/* Action Button - Replaced Pricing with Consultation */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            to="/contact"
            className="w-full btn-outline border-navy text-navy hover:bg-navy hover:text-white hover:border-navy flex items-center justify-center gap-2 py-3 rounded-xl font-body font-bold text-[13px] transition-all"
          >
            Book Free 15-Min Consultation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const Courses = () => {
  const [activeCategory, setActiveCategory] = useState("All Exams");

  const filteredCourses = courses.filter(c => {
    if (activeCategory === "All Exams") return true;
    if (activeCategory === "Core Programs") return c.tag === "Core Program" || c.tag === "Top Choice";
    if (activeCategory === "State Exams") return c.tag === "State Priority" || c.tag === "Mass Hiring";
    if (activeCategory === "Uniform Services") return c.tag === "Uniform Services";
    if (activeCategory === "Life Skills") return c.tag === "Life Skill";
    return true;
  });

  return (
    <div className="pt-[3.75rem] page-enter bg-background min-h-screen">
      {/* Header */}
      <section className="relative py-16 bg-white border-b border-black/5 shadow-sm">
        <div className="absolute inset-0 dot-grid-sm opacity-30" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <h1 className="heading-display text-3xl md:text-5xl text-navy mb-4">
            Explore All <span className="text-gradient-gold">Exams</span>
          </h1>
          <p className="text-slate-500 font-body max-w-2xl text-sm md:text-base">
            Select your target exam and discover India's most comprehensive foundation and target programs. Let our experts guide you to selection.
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <section className="py-12 bg-transparent">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Categories (KGS Style) */}
            <div className="w-full lg:w-1/4 shrink-0">
              <div className="sticky top-24 bg-white rounded-[2rem] p-4 shadow-lg border border-slate-100">
                <h3 className="font-bold text-navy mb-4 px-4 font-display">Categories</h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full text-left px-4 py-3 rounded-xl font-body text-sm font-semibold transition-colors flex items-center justify-between group ${
                          activeCategory === cat 
                            ? "bg-navy text-white shadow-md" 
                            : "bg-transparent text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                        <ChevronRight className={`w-4 h-4 ${activeCategory === cat ? "text-white" : "text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"}`} />
                      </button>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 p-6 bg-gold/10 rounded-2xl border border-gold/20 text-center">
                  <div className="w-12 h-12 bg-gold text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-navy text-sm mb-2">Need Guidance?</h4>
                  <p className="text-xs text-slate-500 mb-4 font-body">Our counselors will help you choose the right path.</p>
                  <Link to="/contact" className="btn-gold w-full py-2.5 rounded-lg text-xs font-bold shadow-md block">
                    Talk to us
                  </Link>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="w-full lg:w-3/4">
              <div className="flex justify-between items-end mb-6 border-b border-black/5 pb-4">
                <h2 className="text-2xl font-black text-slate-900">{activeCategory}</h2>
                <span className="text-sm font-bold text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm">
                  {filteredCourses.length} Programs
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course, i) => (
                  <CourseCard key={course.title} course={course} index={i} />
                ))}
              </div>
              
              {filteredCourses.length === 0 && (
                <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                  <p className="text-slate-500 font-medium">No courses found in this category.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
