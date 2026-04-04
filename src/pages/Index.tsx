import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Clock, Youtube, ShieldCheck, GraduationCap, Video, ArrowRight, ChevronRight, ChevronLeft, PhoneCall, Handshake, Users, Award, X, Play, Download, CheckCircle2 } from "lucide-react";

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [heroSlides, setHeroSlides] = useState([
    "/images/HEROMAIN 007.jpeg",     
    "/images/STUDENT BANNER 01.jpeg",      
    "/images/STUDENT_BANNER.jpeg"
  ]);

  useEffect(() => {
    // Lead Magnet Popup after 5 seconds
    const popupTimer = setTimeout(() => setShowPopup(true), 5000);

    // Check if admin has set custom slider images
    const saved = localStorage.getItem("aim_hero_slides");
    if (saved) {
      try {
        const parsedSlides = JSON.parse(saved);
        if (parsedSlides && parsedSlides.length > 0) {
          setHeroSlides(parsedSlides);
        }
      } catch(e) {}
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000); // Slides every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      
      {/* ── KGS-STYLE HERO (FULL WIDTH SLIDER) ── */}
      <section className="w-full relative group bg-slate-100 border-b border-slate-200">
        
        {/* Main Slider Area */}
        <div className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] bg-slate-100 overflow-hidden relative cursor-pointer block">
           
           {heroSlides.map((slide, index) => (
             <div 
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 flex items-center justify-center ${index === currentSlide ? "opacity-100 z-0" : "opacity-0 -z-10"}`}
             >
                <img src={slide} alt={`AIM Academy Latest Banner ${index + 1}`} className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 hover:duration-[5000ms]" />
             </div>
           ))}
           
           {/* Soft overlay gradient as done in KGS */}
           <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none z-10"></div>

           {/* Floating "Admissions Open" or "Free Consultation" overlay on banner to avoid pricing */}
           <div className="absolute bottom-8 left-8 hidden md:block z-20">
              <Link to="/contact" className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-black text-sm px-6 py-3 rounded-md uppercase tracking-wider shadow-lg hover:brightness-105 transition-all">
                 <Handshake className="w-4 h-4" /> Book Free Counseling To Secure Seat
              </Link>
           </div>
        </div>

        {/* KGS Style Heavy Navigation Arrows */}
        <button onClick={prevSlide} aria-label="Previous Slide" className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 lg:w-16 lg:h-16 bg-white/95 text-slate-800 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.15)] hover:bg-white hover:scale-105 transition-all opacity-0 md:group-hover:opacity-100 z-20">
           <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
        </button>
        <button onClick={nextSlide} aria-label="Next Slide" className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 lg:w-16 lg:h-16 bg-white/95 text-slate-800 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.15)] hover:bg-white hover:scale-105 transition-all opacity-0 md:group-hover:opacity-100 z-20">
           <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
        </button>

        {/* Pagination Dots exactly identical to KGS */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
           {heroSlides.map((_, index) => (
             <div 
               key={index} 
               onClick={() => setCurrentSlide(index)}
               className={`h-2 rounded-full cursor-pointer transition-all ${index === currentSlide ? "w-6 bg-blue-600" : "w-2 bg-white/70 hover:bg-white shadow-sm"}`}
             ></div>
           ))}
        </div>
      </section>

      {/* ── STATS & CONSULTATION STRIP (BELOW HERO) ── */}
      <section className="bg-white border-b border-slate-200 shadow-sm relative z-20">
         <div className="container mx-auto px-4 lg:px-8">
            <div className="py-6 lg:py-8 flex flex-wrap justify-between items-center gap-6">
                
                <div className="flex-1 min-w-[200px] flex items-center gap-4 sm:border-r border-slate-100 pr-4">
                   <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-2xl font-black text-slate-900 leading-none">12,000+</p>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">Students Mentored</p>
                   </div>
                </div>
                
                <div className="flex-1 min-w-[200px] flex items-center gap-4 lg:border-r border-slate-100 pr-4 hidden sm:flex">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-2xl font-black text-slate-900 leading-none">50+</p>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">Expert Faculty</p>
                   </div>
                </div>

                <div className="flex-1 min-w-[200px] flex items-center gap-4 lg:border-r border-slate-100 pr-4 hidden md:flex">
                   <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-2xl font-black text-slate-900 leading-none">15+</p>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">Years Legacy</p>
                   </div>
                </div>

                <div className="flex-none w-full lg:w-auto">
                   <a href="tel:+917067231189" className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-black px-8 py-3.5 rounded-full hover:brightness-105 transition-all shadow-[0_4px_15px_rgba(251,225,34,0.3)] uppercase tracking-wide text-[13px]">
                      <PhoneCall className="w-4 h-4" /> Book Free Counseling
                   </a>
                </div>
            </div>
         </div>
      </section>

      {/* ── POPULAR EXAM CATEGORIES (KGS GRID STYLE) ── */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8 bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-black text-slate-900">Target Exams (Sarkari Naukri)</h2>
             <Link to="/courses" className="text-[hsl(var(--primary-foreground))] bg-yellow-50 font-bold text-xs px-4 py-2 rounded-full hover:bg-yellow-100 flex items-center transition-colors">View All <ChevronRight className="w-3 h-3 ml-1" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {[
              { title: "UPSC & MPPSC", sub: "Foundation & Target", icon: "🏛️" },
              { title: "SSC Exams", sub: "CGL, CHSL, MTS", icon: "📊" },
              { title: "Defence Exams", sub: "NDA, CDS, AFCAT", icon: "🎖️" },
              { title: "Banking Exams", sub: "SBI & IBPS", icon: "🏦" },
              { title: "Railway Exams", sub: "RRB NTPC, ALP", icon: "🚂" },
              { title: "State Police", sub: "SI & Constable", icon: "🛡️" },
              { title: "Interview Prep", sub: "Mock Interviews", icon: "👔" },
              { title: "Class 11 & 12", sub: "School Foundation", icon: "📚" },
            ].map((exam, i) => (
              <Link key={i} to="/contact" className="card-kgs bg-slate-50 p-5 sm:p-6 flex flex-col items-center text-center justify-center h-full hover:border-[hsl(var(--primary))]/50 hover:bg-white group">
                <div className="text-3xl mb-3 opacity-90 group-hover:opacity-100 transition-opacity transform group-hover:-translate-y-1 duration-300 drop-shadow-sm">{exam.icon}</div>
                <h3 className="font-extrabold text-slate-800 text-[14px] sm:text-[15px] mb-1 group-hover:text-amber-600 transition-colors leading-tight">{exam.title}</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wide">{exam.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPCOMING BATCHES (CONSULTATION FOCUS) ── */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
           <div className="text-center md:text-left mb-10 border-l-4 border-[hsl(var(--primary))] pl-4 py-1">
              <h2 className="text-3xl font-black text-slate-900 leading-none mb-2">Upcoming Batches (Gurukul)</h2>
              <p className="text-slate-500 font-medium">Join India's most trusted foundation & target batches for assured selection.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { img: "/images/hero_combo_top.jpeg", title: "Comprehensive Foundation Batch 2026", desc: "A definitive classroom batch covering complete General Studies from absolute basics to advanced level.", status: "Admissions Open", filled: 88, seatsLeft: 12 },
                { img: "/images/hero_combo_mid.png", title: "SSC Intensive Target Program", desc: "Rigorous daily practice and mock test-driven preparation for secure selections across CGL and CHSL.", status: "Limited Seats", filled: 94, seatsLeft: 5 },
                { img: "/images/hero_combo_bottom.jpeg", title: "Free Career Counseling Seminar", desc: "Guidance directly from toppers and expert mentors to completely roadmap your preparation journey.", status: "Next Sunday", filled: 98, seatsLeft: 2 },
              ].map((course, i) => (
                 <div key={i} className="card-kgs overflow-hidden flex flex-col group h-full shadow-[0_2px_15px_rgb(0,0,0,0.03)] border-slate-200">
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                       <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-fast"></span> {course.status}
                       </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col items-start bg-white">
                       <h3 className="font-extrabold text-slate-900 text-[17px] mb-3 leading-snug group-hover:text-blue-700 transition-colors">{course.title}</h3>
                       <p className="text-[13px] text-slate-600 mb-6 leading-relaxed flex-1 font-medium">{course.desc}</p>
                       
                       <div className="w-full bg-slate-50 rounded-lg p-3 mb-6 border border-slate-100">
                          <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5 uppercase">
                             <span>Seats Filled</span>
                             <span className="text-red-500 animate-pulse-fast">Only {course.seatsLeft} Left!</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                             <div className="h-full bg-[hsl(var(--primary))] rounded-full" style={{ width: `${course.filled}%` }}></div>
                          </div>
                          <div className="text-[10px] text-right mt-1 font-bold text-slate-400">{course.filled}% Capacity</div>
                       </div>

                       <div className="mt-auto w-full">
                          <Link to="/contact" className="w-full inline-flex items-center justify-center gap-2 text-[13px] font-black text-slate-800 bg-[hsl(var(--primary))]/20 border border-[hsl(var(--primary))]/30 px-4 py-3 rounded-xl hover:bg-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] transition-all">
                             <Handshake className="w-4 h-4" /> SECURE SEAT (FREE COUNSELING)
                          </Link>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
           
           <div className="mt-16 rounded-[24px] overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative">
              <img src="/images/results_banner.jpg" alt="Our Achievers" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                 <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                    <Play className="w-6 h-6 ml-1" />
                 </div>
              </div>
           </div>

           {/* Video Social Proof Vault */}
           <div className="mt-10">
              <div className="flex justify-between flex-wrap gap-4 items-end mb-6">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-none">Toppers' Voice (Suniye Toppers ki Zubaan)</h3>
                    <p className="text-slate-500 font-medium mt-2">Real reviews, authentic tears of joy, and unmatched 'Sarkari Naukri' selections.</p>
                 </div>
                 <Link to="/results" className="text-red-600 font-bold text-sm flex items-center gap-1 hover:underline">
                    <Youtube className="w-4 h-4"/> Watch All Videos
                 </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[1, 2, 3, 4].map((v) => (
                    <div key={v} className="bg-slate-900 rounded-xl aspect-[4/3] relative overflow-hidden group cursor-pointer border border-slate-800 shadow-lg">
                       <img src="/images/results_banner.jpg" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" alt="Video Thumbnail" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-12 bg-red-600 text-white rounded flex items-center justify-center group-hover:bg-red-500 transition-colors">
                             <Play className="w-5 h-5 ml-0.5" />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* ── ABOUT THE ACADEMY ADVANTAGE ── */}
      <section className="py-20 bg-white border-y border-slate-200 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
             
             <div className="flex-1 w-full order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-4 pt-8">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform group">
                         <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <GraduationCap className="w-6 h-6" />
                         </div>
                         <h4 className="font-extrabold text-slate-900">Topper's Pedagogy</h4>
                         <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wide">Basics to Advanced</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform group">
                         <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <Video className="w-6 h-6" />
                         </div>
                         <h4 className="font-extrabold text-slate-900">1-on-1 Mentorship</h4>
                         <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wide">Direct Access</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform group">
                         <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <ShieldCheck className="w-6 h-6" />
                         </div>
                         <h4 className="font-extrabold text-slate-900">Rigorous 'Abhyas'</h4>
                         <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wide">Mock Tests & Analysis</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform group">
                         <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Clock className="w-6 h-6" />
                         </div>
                         <h4 className="font-extrabold text-slate-900">Legacy of Results</h4>
                         <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wide">Decades of Success</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex-1 order-1 lg:order-2">
                <div className="inline-block px-4 py-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-black text-[10px] uppercase tracking-widest rounded-full mb-6">
                   Why Choose AIM Academy
                </div>
                <h2 className="text-4xl lg:text-[46px] font-black leading-[1.1] mb-6 text-slate-900 tracking-tight">
                   We Don't Just Teach.<br/>We <span className="text-blue-600">Engineer Success.</span>
                </h2>
                <p className="text-slate-600 text-[17px] leading-relaxed mb-8 font-medium">
                   AIM Academy’s ecosystem is built entirely around student performance, continuous evaluation, and strategic mental conditioning. We prepare you to ace the exam, not just face it.
                </p>
                <Link to="/contact" className="inline-flex items-center gap-3 bg-slate-900 text-white font-extrabold text-[14px] px-8 py-4 rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all uppercase tracking-wide">
                   Talk to a Counselor Now <ArrowRight className="w-4 h-4" />
                </Link>
             </div>

          </div>
        </div>
      </section>

      {/* ── EXPERT FACULTY ── */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="container mx-auto px-4 lg:px-8">
           <div className="text-center md:text-left mb-10 border-l-4 border-slate-900 pl-4 py-1">
              <h2 className="text-3xl font-black text-slate-900 mb-2 leading-none">Guidance from Proven Educators</h2>
              <p className="text-slate-500 font-medium">Learn directly from India's most respected faculty who have guided thousands to final selection.</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { name: "Rahul Sir", sub: "History Strategy Expert", img: "/images/faculty_1.png" },
                { name: "Priya Ma'am", sub: "Science Specialist", img: "/images/faculty_2.png" },
                { name: "Amit Sir", sub: "Maths Wizard", img: "/images/faculty_3.png" },
                { name: "Vikas Sir", sub: "Geography Mentor", img: "/images/faculty_4.png" },
                { name: "Neha Ma'am", sub: "Current Affairs Analysis", img: "/images/faculty_5.png" },
              ].map((faculty, i) => (
                 <div key={i} className="flex flex-col items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-[0_2px_15px_rgb(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-50 rounded-full overflow-hidden mb-4 border-[4px] border-[hsl(var(--primary))]/50 shadow-inner flex items-end justify-center">
                       <img src={faculty.img} alt={faculty.name} className="w-[90%] h-[90%] object-contain object-bottom" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-[16px]">{faculty.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold text-center mt-1 uppercase tracking-widest leading-snug">{faculty.sub}</p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── OFFLINE CENTERS ── */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 lg:px-8">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
             <div className="border-l-4 border-blue-600 pl-4 py-1">
               <h2 className="text-3xl font-black text-slate-900 mb-2 leading-none">Visit Our Offline Centers</h2>
               <p className="text-slate-500 font-medium">Walk in for free counseling and demo classes.</p>
             </div>
             <a href="tel:+917067231189" className="text-slate-900 font-black text-[13px] uppercase tracking-wide bg-[hsl(var(--primary))] px-8 py-3.5 rounded-full hover:brightness-105 flex items-center gap-2 shadow-sm transition-all">
                <PhoneCall className="w-4 h-4" /> Helpdesk
             </a>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
               { city: "Jabalpur - Ranjhi Branch", address: "Main Road Ranjhi, Adarsh Market, Beside Police Petrol Pump, Jabalpur" },
               { city: "Jabalpur - Adhartal Branch", address: "Main Road Adhartal, Near Spring Day School, Opposite HDFC Bank" },
               { city: "Bhopal - Corporate Office", address: "Zone-II, Maharana Pratap Nagar, Bhopal, Madhya Pradesh" },
             ].map((center, i) => (
               <div key={i} className="bg-slate-50 p-8 rounded-3xl flex items-start gap-5 border border-slate-200 shadow-sm hover:border-[hsl(var(--primary))]/80 hover:shadow-md transition-all group cursor-pointer">
                 <div className="mt-1 shrink-0 bg-white shadow-sm p-3 rounded-2xl group-hover:bg-[hsl(var(--primary))] transition-colors">
                   <MapPin className="text-[hsl(var(--primary-foreground))] w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-extrabold text-slate-900 text-[17px] mb-2">{center.city}</h3>
                   <p className="text-[13px] text-slate-500 leading-relaxed font-semibold">{center.address}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* ── MOBILE STICKY CTA border ── */}
      <div className="fixed bottom-0 left-0 w-full bg-[hsl(var(--primary))] border-t border-[hsl(var(--primary))/20] shadow-[0_-5px_20px_rgba(0,0,0,0.15)] z-[60] md:hidden">
         <div className="flex text-[11px] font-black uppercase text-[hsl(var(--primary-foreground))]">
            <a href="tel:+917067231189" className="flex-1 py-4 flex items-center justify-center gap-2 border-r border-[hsl(var(--primary-foreground))]/10 active:bg-white/20 transition-colors">
               <PhoneCall className="w-4 h-4" /> Call Helpdesk
            </a>
            <a href="/contact" className="flex-1 py-4 flex items-center justify-center gap-2 active:bg-white/20 transition-colors">
               <Handshake className="w-4 h-4" /> Secure Seat
            </a>
         </div>
      </div>

      {/* ── LEAD MAGNET EXIT-INTENT POPUP ── */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPopup(false)}></div>
           <div className="bg-white max-w-md w-[90%] mx-auto rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in duration-300">
              <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors z-20">
                 <X className="w-4 h-4" />
              </button>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16"></div>
                 <div className="w-16 h-16 bg-white shadow-lg mx-auto rounded-2xl flex items-center justify-center mb-4 transform -rotate-12">
                    <Download className="w-8 h-8 text-blue-600 transform rotate-12" />
                 </div>
                 <h2 className="text-2xl font-black text-white leading-tight mb-2">Wait! Do not leave empty handed.</h2>
                 <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Download 5 Years Solved Papers PDF Free</p>
              </div>
              <div className="p-8">
                 <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> High-Yield 'Sarkari' Target Material
                 </div>
                 <form onSubmit={(e) => { e.preventDefault(); setShowPopup(false); }} className="space-y-4">
                    <div>
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">WhatsApp Number</label>
                       <div className="flex relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 font-bold">+91</span>
                          <input type="tel" required placeholder="Enter 10 digit number" className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-900 transition-colors" />
                       </div>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-black uppercase tracking-wider py-4 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                       <Handshake className="w-5 h-5" /> Send PDF Now
                    </button>
                 </form>
                 <p className="text-[10px] text-center text-slate-400 font-medium mt-4">We respect your privacy. No spam, just pure value.</p>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Index;
