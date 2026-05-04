import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const courseOptions = [
  "UPSC Civil Services (CSE)",
  "State PSC Examinations",
  "SSC CGL / CHSL",
  "Banking / IBPS / SBI / RBI",
  "Railways / Defence / Teaching",
  "Not sure — need counseling",
];

const contactInfo = [
  { icon: Phone, label: "Call Us",    value: "7067231189, 6232051184",     href: "tel:+917067231189",          desc: "Mon–Sat · 8:00 AM – 8:45 PM" },
  { icon: Mail,  label: "Email Us",   value: "info@aimacademy.in",          href: "mailto:info@aimacademy.in",  desc: "Reply within 24 hours" },
  { icon: MapPin,label: "Branch 1 (Ranjhi)", value: "Main Road Ranjhi, Adarsh Market", href: undefined, desc: "Beside Police Petrol Pump, Jabalpur" },
  { icon: MapPin,label: "Branch 2 (Adhartal)", value: "Main Road Adhartal, Near Spring Day School", href: undefined, desc: "Opposite to HDFC Bank, Jabalpur" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

type FormState = { name: string; email: string; phone: string; course: string; message: string };

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", course: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({ title: "🎉 Inquiry Submitted!", description: "Our team will contact you within 24 hours." });
    }, 1200);
  };

  return (
    <div className="pt-[3.75rem] page-enter bg-background">
      {/* Hero */}
      <section className="relative py-28 bg-transparent overflow-hidden">
        <div className="absolute inset-0 dot-grid-sm opacity-40" />
        <div className="absolute top-0 right-0 w-[400px] h-[350px] rounded-full bg-gold/5 blur-[130px]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="badge-gold inline-flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" /> Free Counseling Available
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="heading-display text-5xl md:text-6xl lg:text-7xl text-navy mb-5">
            Contact <span className="text-gradient-gold">Us</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-slate-500 text-lg max-w-xl mx-auto font-body leading-relaxed">
            Our counselors are here to guide you. Start your journey with a free 20-minute session.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-transparent border-t border-black/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3 glass-card rounded-3xl p-7 md:p-10 border border-slate-200 shadow-xl bg-white/80"
            >
              {submitted ? (
                <div className="flex flex-col items-center justify-center min-h-[480px] text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </motion.div>
                  <h2 className="font-display font-bold text-2xl text-navy mb-3">Inquiry Received!</h2>
                  <p className="text-slate-500 font-body mb-2 max-w-xs leading-relaxed text-sm">
                    Thank you, <span className="text-navy font-semibold">{form.name}</span>! Our counseling team will call you within 24 hours on your registered number.
                  </p>
                  <p className="text-gold-dark text-sm font-bold font-body mb-8">7067231189</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", course: "", message: "" }); }}
                    className="btn-outline-gold px-8 py-2.5 rounded-xl font-body text-sm"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display font-bold text-2xl text-navy mb-1">Send an Inquiry</h2>
                  <p className="text-slate-400 font-body text-sm mb-8">Our expert counselors will get back to you within 24 hours.</p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Name */}
                    <div>
                      <label className="text-xs font-bold text-navy/40 mb-2 block font-body uppercase tracking-wider">Full Name <span className="text-ember">*</span></label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        maxLength={100}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-body text-navy placeholder-slate-300 focus:outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all shadow-sm"
                      />
                    </div>

                    {/* Phone + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-navy/40 mb-2 block font-body uppercase tracking-wider">Phone <span className="text-ember">*</span></label>
                        <input
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          maxLength={15}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-body text-navy placeholder-slate-300 focus:outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-navy/40 mb-2 block font-body uppercase tracking-wider">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="your@email.com"
                          maxLength={255}
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-body text-navy placeholder-slate-300 focus:outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Course */}
                    <div>
                      <label className="text-xs font-bold text-navy/40 mb-2 block font-body uppercase tracking-wider">Course Interested In</label>
                      <select
                        id="course-select"
                        aria-label="Select a course"
                        value={form.course}
                        onChange={(e) => setForm({ ...form, course: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-body text-navy/70 focus:outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all cursor-pointer shadow-sm"
                      >
                        <option value="">Select a course...</option>
                        {courseOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-xs font-bold text-navy/40 mb-2 block font-body uppercase tracking-wider">Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Your questions, background, or goals..."
                        rows={4}
                        maxLength={1000}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-body text-navy placeholder-slate-300 focus:outline-none focus:border-gold/40 focus:ring-4 focus:ring-gold/5 transition-all resize-none shadow-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-gold w-full py-4 rounded-xl font-body font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <><Send className="w-4 h-4" /> Submit Inquiry — Free</>
                      )}
                    </button>

                    <p className="text-center text-xs text-slate-400 font-body">
                      <CheckCircle2 className="w-3 h-3 inline mr-1 text-gold-dark" />
                      No spam · Your data is 100% secure · Free counseling · No enrollment fee
                    </p>
                  </form>
                </>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 flex flex-col gap-4"
            >
              {contactInfo.map((info, i) => (
                <motion.div
                  key={info.label}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="glass-card rounded-2xl p-5 bg-white flex items-start gap-4 group hover:border-gold/20 transition-all border border-slate-100 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition-colors">
                    <info.icon className="w-5 h-5 text-navy/40 group-hover:text-gold-dark" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-bold font-body uppercase tracking-wider mb-0.5">{info.label}</div>
                    {info.href ? (
                      <a href={info.href} className="text-navy/70 text-sm hover:text-gold transition-colors font-body block font-medium">{info.value}</a>
                    ) : (
                      <span className="text-navy/70 text-sm font-body block font-medium">{info.value}</span>
                    )}
                    <span className="text-slate-400 text-[10px] font-body">{info.desc}</span>
                  </div>
                </motion.div>
              ))}

              {/* WhatsApp */}
              <motion.a
                href="https://wa.me/917067231189?text=Hi%2C%20I%20want%20to%20know%20more%20about%20AIM%20Academy%20courses."
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-[#25D366]/5 border border-[#25D366]/20 hover:bg-[#25D366]/10 hover:border-[#25D366]/35 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0 shadow-[0_4px_20px_#25D36640] group-hover:shadow-[0_8px_30px_#25D36660] transition-shadow">
                  <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                </div>
                <div>
                  <div className="text-[#128C7E] font-bold font-body text-sm">Chat on WhatsApp</div>
                  <div className="text-[#128C7E]/50 text-xs font-body">Usually responds in minutes</div>
                </div>
              </motion.a>

              {/* ELSxGlobal powered badge */}
              <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center shadow-lg">
                    <Zap className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="text-slate-400 text-[9px] font-body uppercase tracking-widest">Technology by</div>
                    <div className="text-navy font-bold text-sm font-syne uppercase">ELSxGlobal</div>
                    <div className="text-slate-400 text-[9px] font-body">Evolucentsphere Pvt. Ltd.</div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="glass-card rounded-2xl overflow-hidden flex-1 min-h-[200px] border border-slate-200 shadow-sm">
                <iframe
                  title="AIM Academy Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2348.653634085443!2d79.99951111623194!3d23.167098416625442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3981aea8b3555555%3A0xe5a5a5a5a5a5a5a5!2sAIM%20ACADEMY!5e0!3m2!1sen!2sin!4v1710500000000!5m2!1sen!2sin"
                  width="100%"
                  height="220"

                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
