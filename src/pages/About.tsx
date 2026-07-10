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
  { label: "Success Rate",    value: "65%",   sub: "Industry Leading" },
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
    desc: "Our curriculum is live. It evolves with the changing patterns of civil services and other competitive exams to ensure you stay ahead.",
    color: "from-amber-500/10 to-amber-500/0",
    border: "border-amber-500/20"
  },
];

// Remove hardcoded team, it will be fetched dynamically from website settings

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] } 
  }),
};

import { useEffect } from "react";
import { useAdminData } from "@/hooks/useAdminData";

const About = () => {
  const { websiteSettings } = useAdminData();
  const team = websiteSettings?.faculty || [];


  return (
    <div className="pt-[3.75rem] page-enter bg-background">
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 bg-transparent overflow-hidden border-b border-black/5">
        <div className="absolute inset-0 dot-grid-sm opacity-40" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
            className="badge-gold inline-flex items-center gap-2 mb-8"
          >
            <Zap className="w-3 h-3" /> Since 2014
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



      <section className="section-padding bg-transparent border-y border-black/5 relative overflow-hidden">
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
      <section className="section-padding relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10 px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Founder Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-[300px] mx-auto">
                {/* Decorative ring */}
                <div className="absolute -inset-3 rounded-[2rem] border-2 border-gold/20 pointer-events-none z-20" />
                {/* Photo container */}
                <div className="relative aspect-[3/4] rounded-[1.75rem] overflow-hidden border-4 border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                  <img 
                    src="/images/founder_solo.png" 
                    alt="Dr. Imran Khan - Founder & Director" 
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Bottom fade so image blends into section */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
                </div>
              </div>
            </motion.div>

            {/* Founder Message */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-6 inline-flex items-center text-slate-800 font-bold uppercase tracking-widest text-sm">
                <Star className="w-4 h-4 mr-2 text-slate-800 fill-slate-800" /> From the Director's Desk
              </div>
              <h2 className="heading-display text-4xl md:text-5xl text-slate-900 mb-6">
                Redefining Competitive Education in Jabalpur.
              </h2>
              <div className="space-y-4 text-slate-800 font-body text-lg leading-relaxed mb-8 relative">
                <Quote className="absolute -top-4 -left-6 w-12 h-12 text-slate-900/10" />
                <p>
                  "When we started AIM Academy over a decade ago, our vision was simple: to ensure that no deserving student from Central India has to leave their hometown in search of quality all government exam coaching."
                </p>
                <p>
                  "Today, with hundreds of official selections proudly serving the nation, we stand as a testament that true dedication, high-quality mentorship, and an ethical educational ecosystem can produce top-tier results right here in Jabalpur."
                </p>
                <p className="text-slate-900 font-medium text-2xl mt-6">
                  "आपकी तलाश का अंतिम पड़ाव"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-slate-900/30 flex items-center justify-center p-2">
                  <img src="/images/logo_main.png" alt="AIM Academy" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-slate-900 font-bold font-display tracking-wider">AIM ACADEMY</div>
                  <div className="text-slate-600 text-[10px] uppercase tracking-[0.2em]">Est. 2014</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════ */}
      <section className="py-20 bg-transparent">
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
      <section className="section-padding bg-transparent relative overflow-hidden">
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
      <section className="section-padding bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-sm opacity-10 mix-blend-overlay" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-5 justify-center">
              <span className="bg-gold/10 border border-gold/20 text-gold-light text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block mr-1.5 animate-pulse" />
                Leadership
              </span>
            </div>
            <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-white mb-5">
              Guided by the <span className="text-gradient-gold">Best</span>
            </h2>
            <p className="text-slate-300 font-body text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Meet the people who bridge the gap between your dreams and your name in the final merit list.
            </p>
          </div>
          
          {/* Pillars Group Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-xl border border-white/10 mx-auto max-w-6xl group bg-slate-800"
          >
            <img 
              src="/images/pillars_group.jpg" 
              alt="Pillars of AIM Academy - Faculty and Directors" 
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((item, i) => (
                <motion.div
                  key={item.name}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="group relative bg-white border border-slate-200 hover:border-gold/50 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(250,204,21,0.15)] flex flex-col h-full"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-50 flex items-center justify-center">
                    {/* Decorative Background for Image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100" />
                    <img src={item.img} alt={item.name} className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                    
                    {/* Floating Name Plate Over Image */}
                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                       <h3 className="heading-display text-2xl text-slate-900 mb-1 drop-shadow-sm">{item.name}</h3>
                       <div className="text-amber-600 font-bold font-body text-xs uppercase tracking-[0.2em]">{item.sub}</div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow relative z-10 bg-white">
                    <p className="text-slate-500 font-body text-sm leading-relaxed mb-6 flex-grow">
                      {item.bio || "A dedicated mentor committed to shaping the future of civil services aspirants through strategic and ethical guidance."}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                       <div className="flex gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                         {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />)}
                       </div>
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-amber-600 transition-colors">Faculty</span>
                    </div>
                  </div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ JABALPUR PRIDE ═════════════════════════════════════ */}
      <section className="section-padding bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="container mx-auto relative z-10">
          <div className="glass-card rounded-[2.5rem] p-10 md:p-20 border border-slate-200 bg-white shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
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
              Started in 2014 with a dream to serve Central India, we are now a trusted ecosystem of 7,000+ students. Start your success story today.
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
