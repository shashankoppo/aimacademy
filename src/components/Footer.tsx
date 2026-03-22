import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, GraduationCap, Youtube, Instagram, Facebook, Twitter, Zap, Shield, Star, Globe } from "lucide-react";

const socialLinks = [
  { icon: Youtube,   href: "https://youtube.com",   label: "YouTube",   color: "hover:text-red-400 hover:bg-red-400/10" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-400 hover:bg-pink-400/10" },
  { icon: Facebook,  href: "https://facebook.com",  label: "Facebook",  color: "hover:text-blue-400 hover:bg-blue-400/10" },
  { icon: Twitter,   href: "https://twitter.com",   label: "Twitter/X", color: "hover:text-sky-400  hover:bg-sky-400/10"  },
];

const footerLinks = [
  { heading: "Institute", links: [
    { label: "About AIM Academy", to: "/about" },
    { label: "Our Faculty", to: "/about" },
    { label: "Results & Toppers", to: "/results" },
    { label: "Testimonials", to: "/results" },
    { label: "Contact Us", to: "/contact" },
  ]},
  { heading: "Programs", links: [
    { label: "UPSC Civil Services",   to: "/courses" },
    { label: "State PSC",            to: "/courses" },
    { label: "SSC CGL / CHSL",       to: "/courses" },
    { label: "Banking / IBPS / SBI", to: "/courses" },
    { label: "Railways & Defence",   to: "/courses" },
  ]},
  { heading: "Resources", links: [
    { label: "Current Affairs Blog",  to: "/resources" },
    { label: "Free Study Material",   to: "/resources" },
    { label: "Exam Notifications",    to: "/resources" },
    { label: "Mock Tests",            to: "/resources" },
    { label: "UPSC Syllabus PDF",     to: "/resources" },
  ]},
];

const partners = [
  { name: "ELSxGlobal", role: "Technology" },
  { name: "Evolucentsphere Pvt. Ltd.", role: "Development" },
  { name: "AIM EdTech Foundation", role: "Academic" },
  { name: "National Learning Alliance", role: "Strategic" },
  { name: "Digital India Initiative", role: "Government" },
  { name: "Aspire Education Fund", role: "Scholarship" },
];

const certifications = [
  { icon: Shield, label: "ISO 9001:2015 Certified" },
  { icon: Star,   label: "India EdTech Excellence Award 2024" },
  { icon: Globe,  label: "Ministry of Education Affiliated" },
];

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">

      {/* Top announcement bar */}
      <div className="border-b border-slate-200 bg-[#f8fbff]">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs font-body">
            📢 <span className="text-gold-dark font-semibold uppercase tracking-tight">New UPSC 2026 Batch</span> starting March 15 —
            <Link to="/contact" className="text-navy/60 underline underline-offset-2 ml-1 hover:text-navy transition-colors">Register Now</Link>
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className={`w-8 h-8 rounded-lg bg-navy/5 border border-navy/10 flex items-center justify-center text-navy/40 transition-all duration-200 ${s.color}`}>
                <s.icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand col (wider) */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-4 mb-6 group">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-200 group-hover:border-gold/40 transition-all duration-500 shadow-xl relative overflow-hidden p-1.5">
                <img src="/images/logo_main.png" alt="AIM Academy Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-display font-extrabold text-navy text-2xl group-hover:text-gold-dark transition-colors duration-300">AIM Academy</div>
                <div className="text-[10px] text-navy/30 tracking-[0.3em] uppercase font-body mt-1">Jabalpur's #1 Civil Services</div>
              </div>
            </Link>
            <p className="text-slate-500 text-sm font-body leading-relaxed mb-5">
              Shaping the future of India through quality civil services education, mentorship and proven results since 2010. Trusted by 10,000+ aspirants across India.
            </p>
            {/* Social */}
            <div className="flex items-center gap-2.5 mb-6">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className={`w-9 h-9 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center text-navy/40 transition-all duration-200 ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {/* Certifications */}
            <div className="flex flex-col gap-2">
              {certifications.map((cert) => (
                <div key={cert.label} className="flex items-center gap-2">
                  <cert.icon className="w-3.5 h-3.5 text-gold-dark/60 shrink-0" />
                  <span className="text-slate-400 text-[11px] font-body">{cert.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
            <h4 className="font-display font-bold text-navy text-[13px] mb-6 uppercase tracking-[0.2em]">{col.heading}</h4>
              <div className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <Link key={link.label} to={link.to}
                    className="text-slate-500 hover:text-gold-dark transition-colors text-sm font-body flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-slate-200 group-hover:bg-gold transition-colors" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-navy text-[13px] mb-6 uppercase tracking-[0.2em]">Contact</h4>
            <div className="flex flex-col gap-4">
              <a href="tel:+917067231189" className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-gold-dark" />
                </div>
                <div>
                  <div className="text-navy/70 text-sm font-body group-hover:text-gold transition-colors font-bold">7067231189, 6232051184</div>
                  <div className="text-slate-400 text-[10px] font-body">Mon–Sat, 8:00 AM – 8:45 PM</div>
                </div>
              </a>
              <a href="mailto:info@aimacademy.in" className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-gold-dark" />
                </div>
                <div>
                  <div className="text-navy/70 text-sm font-body group-hover:text-gold transition-colors">info@aimacademy.in</div>
                  <div className="text-slate-400 text-[10px] font-body">Reply within 24 hrs</div>
                </div>
              </a>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                  </div>
                  <div className="text-slate-500 text-xs font-body leading-relaxed">
                    <span className="font-bold text-navy block mb-1">Branch 1 (Ranjhi):</span>
                    Main Road Ranjhi, Adarsh Market, Beside Police Petrol Pump, Jabalpur
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                  </div>
                  <div className="text-slate-500 text-xs font-body leading-relaxed">
                    <span className="font-bold text-navy block mb-1">Branch 2 (Adhartal):</span>
                    Main Road Adhartal, Near Spring Day School, Opposite HDFC Bank, Jabalpur
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner ecosystem */}
        <div className="mt-14 pt-10 border-t border-slate-200">
          <div className="text-center mb-8">
            <div className="text-slate-400 text-[10px] font-body uppercase tracking-[0.3em] mb-2">Our Ecosystem & Partners</div>
            <div className="gold-separator max-w-xs mx-auto opacity-30" />
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {partners.map((p) => (
              <div key={p.name} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy/5 border border-navy/10 hover:border-gold/30 hover:bg-gold/5 transition-all">
                <Zap className="w-3 h-3 text-gold-dark" />
                <div>
                  <span className="text-navy/70 text-xs font-bold font-body">{p.name}</span>
                  <span className="text-slate-400 text-[10px] font-body ml-1.5">· {p.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ELSxGlobal Technology Partner spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 md:p-8 border border-slate-200 bg-white mb-10 shadow-sm"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-gold" />
              </div>
              <div>
                <div className="text-slate-400 font-bold font-body text-xs uppercase tracking-wider">Official Technology Partner</div>
                <div className="text-navy font-extrabold text-2xl font-syne uppercase">ELSxGlobal</div>
                <div className="text-slate-400 text-xs font-body">Evolucentsphere Private Limited</div>
              </div>
            </div>
            <div className="text-slate-500 text-sm font-body text-center md:text-right max-w-md leading-relaxed">
              The entire AIM Academy digital ecosystem — LMS, AI analytics, live classes, student portal and mobile app —
              is built and powered by <span className="text-navy font-bold">ELSxGlobal | Evolucentsphere Pvt. Ltd.</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-[10px] text-slate-300 font-body uppercase tracking-widest">Certified Partner</div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-gold fill-gold" />)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-body border-t border-slate-100 pt-8">
          <span>© {new Date().getFullYear()} AIM Academy. All rights reserved. Powered by ELSxGlobal | Evolucentsphere Private Limited.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-navy cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-slate-200">|</span>
            <span className="hover:text-navy cursor-pointer transition-colors">Terms of Use</span>
            <span className="text-slate-200">|</span>
            <span className="hover:text-navy cursor-pointer transition-colors">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
