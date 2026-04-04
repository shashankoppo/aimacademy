import { motion } from "framer-motion";
import { 
  Users, Target, Trophy, Award, BookOpen, Shield, Heart, Zap, 
  MapPin, Globe, CheckCircle2, Star, Flame, GraduationCap, Quote, Medal
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const stats = [
  { label: "Elite Selections", value: "500+", sub: "UPSC & State PSC" },
  { label: "Expert Mentors",   value: "15+",   sub: "Ex-Officers & SMEs" },
  { label: "Legacy of Trust",  value: "14+",   sub: "Years of Excellence" },
  { label: "Success Rate",    value: "95%",   sub: "Industry Leading" },
];

const values = [
  { 
    icon: Target, 
    title: "Precision Mentorship", 
    desc: "We don't believe in one-size-fits-all. Every aspirant gets a tailored strategy based on their unique strengths and weaknesses.",
    color: "from-blue-500/10 to-blue-500/0",
    border: "border-blue-500/20"
  },
  { 
    icon: Shield, 
    title: "Uncompromising Integrity", 
    desc: "Honesty is at the core of our teaching. We provide realistic feedback and demand absolute dedication from our students.",
    color: "from-emerald-500/10 to-emerald-500/0",
    border: "border-emerald-500/20"
  },
  { 
    icon: Trophy, 
    title: "Outcome Driven", 
    desc: "Our curriculum is live. It evolves with the changing patterns of UPSC and other competitive exams to ensure you stay ahead.",
    color: "from-amber-500/10 to-amber-500/0",
    border: "border-amber-500/20"
  },
];

const team = [
  { name: "Mr. Irshad Mansuri", role: "Maths Faculty", bio: "Expert in competitive mathematics with proven success strategies.", image: "/images/faculty_1.png", color: "bg-[#e2e8f0]" },
  { name: "Mr. Abhishek Sengar", role: "English Faculty", bio: "Specialist in English grammar and vocabulary for SSC/Banking.", image: "/images/faculty_2.png", color: "bg-[#f1f5f9]" },
  { name: "Mr. Shubham Patel", role: "MP/Current Affairs", bio: "Deep insights into MP current affairs and polity.", image: "/images/faculty_3.png", color: "bg-[#e2e8f0]" },
  { name: "Mr. Atul Rajpoot", role: "MP/English Faculty", bio: "Renowned mentor for English and State specific subjects.", image: "/images/faculty_4.png", color: "bg-[#f1f5f9]" },
  { name: "Mr. Sandeep Yadav", role: "Maths Faculty", bio: "Simplifies complex quantitative aptitude topics easily.", image: "/images/faculty_5.png", color: "bg-[#e2e8f0]" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] } 
  }),
};

const About = () => {
  return (
    <div className="pt-[3.75rem] page-enter bg-white">
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 bg-hero overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 dot-grid-sm opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gold/5 blur-[120px]" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
            className="badge-gold inline-flex items-center gap-2 mb-8"
          >
            <Zap className="w-3 h-3" /> Since 2010
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.8 }}
            className="heading-display text-[3.5rem] md:text-7xl lg:text-[8.5rem] text-navy mb-8 leading-[1.05]"
          >
            The <span className="heading-editorial text-gradient-gold italic">Visionaries</span> <br />
            Behind <span className="font-normal">AI</span>M.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }}
            className="text-slate-500 text-lg md:text-xl max-w-3xl mx-auto font-body leading-relaxed"
          >
            Based in Jabalpur, AIM Academy is more than an institute. It's a mission to empower 
            the best minds of India to serve the nation with competency and character.
          </motion.p>
        </div>
      </section>



      {/* ══ MISSION & VISION ═══════════════════════════════════ */}
      <section className="section-padding bg-[#f8fbff] border-y border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-sm opacity-40" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="bento-item p-10 md:p-14 bg-white/70 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-navy/5 border border-navy/10 flex items-center justify-center mb-8 shadow-sm">
                <Target className="w-8 h-8 text-gold-dark" />
              </div>
              <h2 className="heading-display text-4xl text-navy mb-5">Our Mission</h2>
              <p className="text-slate-500 font-body text-balance leading-relaxed text-lg">
                To provide accessible, high-quality, and ethical education to aspirants in Jabalpur and surrounding areas, 
                breaking the barrier of expensive hub-city coaching while delivering superior results through 
                personal mentorship and AI-driven tech.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="bento-item p-10 md:p-14 bg-white/70 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-navy/5 border border-navy/10 flex items-center justify-center mb-8 shadow-sm">
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="heading-display text-4xl text-navy mb-5">Our Vision</h2>
              <p className="text-slate-500 font-body text-balance leading-relaxed text-lg">
                To be the most trusted educational ecosystem in India where merit meets opportunity, 
                creating 1000+ top-tier administrators by 2030 who are equipped to handle the 
                complex challenges of 21st-century India.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ FOUNDER DESK ═══════════════════════════════════════ */}
      <section className="section-padding bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy to-navy-light opacity-90" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative z-10 px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Founder Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden border-4 border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                <img 
                  src="/images/founder_solo.png" 
                  alt="Dr. Imran Khan - Founder & Director" 
                  className="h-full w-full object-cover object-[center_8%] scale-[1.03]"
                />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 right-0 md:-right-10 bg-white p-4 rounded-xl shadow-2xl border border-slate-100 max-w-[200px] animate-float">
                <div className="text-gold-dark font-extrabold text-sm uppercase tracking-wider mb-0.5">Dr. Imran Khan</div>
                <div className="text-slate-500 text-[10px] font-body">Founder, Director & GS Faculty</div>
              </div>
            </motion.div>

            {/* Founder Message */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="badge-gold mb-6 inline-flex border-none bg-gold/10 text-gold-light">
                <Star className="w-3 h-3 fill-gold-light text-gold-light mr-2" /> From the Director's Desk
              </div>
              <h2 className="heading-display text-4xl md:text-5xl text-white mb-6">
                Redefining Competitive Education in <span className="text-gradient-gold">Jabalpur.</span>
              </h2>
              <div className="space-y-4 text-slate-300 font-body text-lg leading-relaxed mb-8 relative">
                <Quote className="absolute -top-4 -left-6 w-12 h-12 text-white/5" />
                <p>
                  "When we started AIM Academy over a decade ago, our vision was simple: to ensure that no deserving student from Central India has to leave their hometown in search of quality UPSC or PSC coaching."
                </p>
                <p>
                  "Today, with hundreds of officers proudly serving the nation, we stand as a testament that true dedication, high-quality mentorship, and an ethical educational ecosystem can produce top-tier results right here in Jabalpur."
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center p-2">
                  <img src="/images/logo_main.png" alt="AIM Academy" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <div>
                  <div className="text-white font-bold font-display tracking-wider">AIM ACADEMY</div>
                  <div className="text-gold-light text-[10px] uppercase tracking-[0.2em]">Est. 2012</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════ */}
      <section className="py-20 bg-hero">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((s, i) => (
              <motion.div 
                key={s.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="stat-number text-4xl md:text-5xl lg:text-6xl mb-2">{s.value}</div>
                <div className="text-navy font-display font-semibold text-lg">{s.label}</div>
                <div className="text-slate-400 text-xs font-body uppercase tracking-wider mt-1">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CORE VALUES ═══════════════════════════════════════ */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="container mx-auto relative z-10">
          <SectionHeading 
            label="The AIM Philosophy" 
            title="The Core Values That Drive Us" 
            description="We are not a factory. We are a mentor-ship ecosystem where ethics and performance go hand in hand."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`bento-item p-10 group bg-white shadow-xl transition-all duration-300 overflow-hidden relative`}
              >
                <div className="w-16 h-16 rounded-2xl bg-navy/5 border border-navy/10 flex items-center justify-center mb-8 group-hover:bg-white group-hover:shadow-2xl transition-all duration-500">
                  <v.icon className="w-8 h-8 text-navy/40" />
                </div>
                <h3 className="heading-display text-2xl text-navy mb-4">{v.title}</h3>
                <p className="text-slate-500 font-body text-base leading-relaxed">{v.desc}</p>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${v.color} opacity-20 blur-[60px] translate-x-1/2 -translate-y-1/2`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LEADERSHIP ════════════════════════════════════════ */}
      <section className="section-padding bg-[#f8fbff] border-y border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-sm opacity-30" />
        <div className="container mx-auto relative z-10">
          <SectionHeading label="Leadership" title="Guided by the Best" description="Meet the people who bridge the gap between your dreams and your name in the final merit list." />
          
          {/* Pillars Group Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-50 mx-auto max-w-5xl"
          >
            <img 
              src="/images/pillars_group.jpg" 
              alt="Pillars of AIM Academy - Faculty and Directors" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent pointer-events-none" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              ...team,
              { name: "Prof. Rajesh Gupta", role: "Head of GS Department", bio: "Renowned academician and researcher with a focus on Indian Polity and History.", initial: "G", color: "bg-emerald-600", icon: BookOpen },
              { name: "Ms. Sneha Kapoor", role: "Lead CSAT Specialist", bio: "Logic and Analytics expert who has trained over 5,000 students for competitive exams.", initial: "K", color: "bg-rose-600", icon: Target },
              { name: "Mr. Vivek Saxena", role: "Current Affairs Lead", bio: "Daily analysis expert with a unique methodology for linking static & dynamic syllabus.", initial: "S", color: "bg-sky-600", icon: Zap }
            ].map((item, i) => {
              const m = item as typeof team[0] & { initial?: string; icon?: React.ElementType };
              return (
                <motion.div
                  key={m.name}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bento-item p-8 bg-white shadow-xl group border-l-4 border-l-transparent hover:border-l-gold transition-all"
                >
                  <div className={`w-20 h-20 rounded-2xl ${m.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl border-2 border-white/20 overflow-hidden`}>
                    {m.image ? (
                      <img src={m.image} alt={m.name} className="w-full h-full object-cover object-top" />
                    ) : m.icon ? (
                      <m.icon className="w-8 h-8 text-white/90" />
                    ) : (
                      <span className="text-white font-display font-bold text-2xl">{m.initial}</span>
                    )}
                  </div>
                  <h3 className="heading-display text-xl text-navy mb-1 group-hover:text-gold-dark transition-colors">{m.name}</h3>
                  <div className="text-gold-dark text-[10px] font-extrabold font-body mb-4 uppercase tracking-[0.2em]">{m.role}</div>
                  <p className="text-slate-500 font-body text-sm leading-relaxed mb-6">{m.bio}</p>
                  <div className="flex gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                     {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 text-gold fill-gold" />)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ JABALPUR PRIDE ═════════════════════════════════════ */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="container mx-auto relative z-10">
          <div className="glass-card rounded-[2.5rem] p-10 md:p-20 border border-slate-200 bg-white shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gold/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="badge-gold mb-8 shadow-sm">Jabalpur's Academic Landmark</div>
            <h2 className="heading-display text-4xl md:text-6xl text-navy mb-6">
              Empowering the Heart of <br />
              <span className="text-gradient-gold">Madhya Pradesh</span>
            </h2>
            <p className="text-slate-500 font-body text-lg max-w-2xl leading-relaxed mb-10">
              AIM Academy is proud to be the premier coaching destination in Jabalpur. We are located in the heart of Adarsh Market, 
              bringing world-class UPSC standards to your doorstep. No more migrating to Delhi or Indore — the best is already here.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
              {[
                { icon: MapPin, label: "Centrally Located", sub: "Adarsh Market, Ranjhi" },
                { icon: Users, label: "Local Community", sub: "Serving All Jabalpur Districts" },
                { icon: GraduationCap, label: "UPSC Hub", sub: "#1 Selection Hub in MP" },
              ].map((item) => (
                <div key={item.label} className="p-6 rounded-2xl bg-navy/5 border border-navy/10 hover:border-gold/30 transition-all shadow-sm">
                  <item.icon className="w-6 h-6 text-navy/40 mx-auto mb-3" />
                  <div className="text-navy font-bold text-sm mb-1">{item.label}</div>
                  <div className="text-slate-400 text-xs font-body">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="heading-display text-4xl md:text-6xl text-navy mb-8">
              Join the Legacy of <span className="text-gradient-gold">Achievement.</span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto mb-10 font-body leading-relaxed">
              Started in 2010 with just 5 students, we are now an ecosystem of 10,000+ alumni. Start your success story today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/contact" className="btn-gold px-10 py-5 rounded-2xl font-body font-bold text-lg">Work With a Mentor</a>
              <a href="/courses" className="btn-outline-gold px-10 py-5 rounded-2xl font-body font-semibold text-lg">Explore Programs</a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default About;
