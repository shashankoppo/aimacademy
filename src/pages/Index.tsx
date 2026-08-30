import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Clock, Youtube, ShieldCheck, GraduationCap, Video, ArrowRight, ChevronRight, ChevronLeft, PhoneCall, Handshake, Users, Award, X, Play, Download, CheckCircle2 } from "lucide-react";
import { useAdminData, type VideoItem } from "@/hooks/useAdminData";

const getYouTubeVideoId = (url: string) => {
   const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
   return match?.[1] ?? null;
};

const getYouTubeEmbedUrl = (url: string) => {
   const id = getYouTubeVideoId(url);
   return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1` : null;
};

const POPUP_CLOSED_KEY = "AIM_ACADEMY_HOME_POPUP_CLOSED";

const Index = () => {
   const { videos, websiteSettings } = useAdminData();
   const [currentSlide, setCurrentSlide] = useState(0);
   const [showPopup, setShowPopup] = useState(false);
   const [isLeadSubmitting, setIsLeadSubmitting] = useState(false);
   const [isLeadSuccess, setIsLeadSuccess] = useState(false);
   const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
   const [heroSlides, setHeroSlides] = useState([
      "/images/HEROMAIN 007.jpeg",
      "/images/STUDENT BANNER 01.jpeg",
      "/images/STUDENT_BANNER.jpeg"
   ]);

   const [faculty, setFaculty] = useState([
      { name: "Dr. Imran Khan", sub: "Founder, Director & GS Faculty", img: "/images/founder_solo.png" },
      { name: "Mr. Sandeep Yadav", sub: "Maths Faculty", img: "/images/faculty_1.png" },
      { name: "Mr. Irshad Mansoori", sub: "Maths Faculty", img: "/images/faculty_2.png" },
      { name: "Mr. Shubham Patel", sub: "MP / Current Affairs", img: "/images/faculty_3.png" },
      { name: "Mr. Abhishek Sengar", sub: "English Faculty", img: "/images/faculty_4.png" },
      { name: "Mr. Atul Rajpoot", sub: "MP / English Faculty", img: "/images/faculty_5.png" },
      { name: "Mr. Yogesh Tiwari", sub: "Science Faculty", img: "/images/faculty_1.png" },
      { name: "Mr. Pushparaj Kushwaha", sub: "History & Polity", img: "/images/faculty_2.png" },
   ]);

   useEffect(() => {
      if (sessionStorage.getItem(POPUP_CLOSED_KEY) === "true" || localStorage.getItem("lead_submitted") === "true") {
         return;
      }

      // Lead Magnet Popup after 5 seconds
      const popupTimer = setTimeout(() => setShowPopup(true), 5000);

      const timer = setInterval(() => {
         setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 4000); // Slides every 4 seconds
      return () => {
         clearInterval(timer);
         clearTimeout(popupTimer);
      };
   }, [heroSlides.length]);

   useEffect(() => {
      if (websiteSettings?.slides?.length) setHeroSlides(websiteSettings.slides);
      if (websiteSettings?.faculty?.length) setFaculty(websiteSettings.faculty);
   }, [websiteSettings]);

   const closePopup = () => {
      sessionStorage.setItem(POPUP_CLOSED_KEY, "true");
      setShowPopup(false);
   };

   const handleLeadSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLeadSubmitting(true);
      // Simulate API call for lead submission
      setTimeout(() => {
         setIsLeadSubmitting(false);
         setIsLeadSuccess(true);
         localStorage.setItem("lead_submitted", "true");
         setTimeout(() => {
            closePopup();
            setIsLeadSuccess(false);
         }, 3000);
      }, 1500);
   };

   const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
   const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
   const visibleVideos = [...videos]
      .filter((video) => video.isVisible)
      .sort((a, b) => {
         if (a.isFeatured === b.isFeatured) return a.displayOrder - b.displayOrder;
         return a.isFeatured ? -1 : 1;
      })
      .slice(0, 10);
   const activeEmbedUrl = activeVideo ? getYouTubeEmbedUrl(activeVideo.youtubeUrl) : null;

   return (
      <div className="min-h-screen bg-[#FFFF00] font-sans text-slate-800">
         <h1 className="sr-only">AIM Academy Jabalpur - Best MPPSC & UPSC Coaching in Central India</h1>
         
         {/* JSON-LD Structured Data for Local SEO */}
         <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "AIM Academy",
              "url": "https://aimacademix.in",
              "logo": "https://aimacademix.in/images/logo_main.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "3rd Floor, Manas Bhawan Extension, Wright Town",
                "addressLocality": "Jabalpur",
                "addressRegion": "Madhya Pradesh",
                "postalCode": "482002",
                "addressCountry": "IN"
              },
              "description": "Best MPPSC, UPSC, SSC and Banking coaching institute in Jabalpur with 14+ years of legacy.",
              "telephone": "+91-7067231189"
            })}
         </script>

         {/* ── KGS-STYLE HERO (FULL WIDTH SLIDER) ── */}
         <section className="w-full relative group bg-transparent border-b border-black/5">

            {/* Main Slider Area */}
            <div className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] bg-transparent overflow-hidden relative cursor-pointer block">

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
                     <Handshake className="w-4 h-4" /> Book Free Counselling To Secure Seat
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
         <section className="bg-transparent border-b border-black/5 shadow-sm relative z-20">
            <div className="container mx-auto px-4 lg:px-8">
               <div className="py-6 lg:py-8 flex flex-wrap justify-between items-center gap-6">

                  <div className="flex-1 min-w-[200px] flex items-center gap-4 sm:border-r border-slate-100 pr-4">
                     <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                        <GraduationCap className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">7,000+</p>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">Students Mentored</p>
                     </div>
                  </div>

                  <div className="flex-1 min-w-[200px] flex items-center gap-4 lg:border-r border-slate-100 pr-4 hidden sm:flex">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">8+2</p>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">Expert Faculty</p>
                     </div>
                  </div>

                  <div className="flex-1 min-w-[200px] flex items-center gap-4 lg:border-r border-slate-100 pr-4 hidden md:flex">
                     <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">13+</p>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">Years Legacy</p>
                     </div>
                  </div>

                  <div className="flex-none w-full lg:w-auto">
                     <a href="tel:+917067231189" className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-black px-8 py-3.5 rounded-full hover:brightness-105 transition-all shadow-[0_4px_15px_rgba(251,225,34,0.3)] uppercase tracking-wide text-[13px]">
                        <PhoneCall className="w-4 h-4" /> Book Free Counselling
                     </a>
                  </div>
               </div>
            </div>
         </section>

         {/* ── POPULAR EXAM CATEGORIES (KGS GRID STYLE) ── */}
         <section className="py-12 bg-transparent">
            <div className="container mx-auto px-4 lg:px-8 bg-transparent p-6 md:p-8 rounded-[24px] border border-black/5">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Target Exams (Sarkari Naukri)</h2>
                  <Link to="/courses" className="text-[hsl(var(--primary-foreground))] bg-yellow-50 font-bold text-xs px-4 py-2 rounded-full hover:bg-yellow-100 flex items-center transition-colors">View All <ChevronRight className="w-3 h-3 ml-1" /></Link>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                  {[
                     { title: "UPSC", sub: "Fundamental Course", icon: "🏛️" },
                     { title: "MP PSC", sub: "Pre & Mains Program", icon: "📊" },
                     { title: "SUB INSPECTOR", sub: "Pre & Physical Prep", icon: "🛡️" },
                     { title: "RAILWAY", sub: "NTPC, ALP, Group D", icon: "🚂" },
                     { title: "SSC / CGL", sub: "Central Govt Jobs", icon: "🏦" },
                     { title: "CONSTABLE / PATWARI", sub: "State Specialized", icon: "👮" },
                     { title: "SAMVIDA 3rd", sub: "Teacher Recruitment", icon: "📚" },
                     { title: "OTHER VYAPAM", sub: "All State Level Exams", icon: "📝" },
                  ].map((exam, i) => (
                     <Link key={i} to="/contact" className="card-kgs bg-white/40 p-5 sm:p-6 flex flex-col items-center text-center justify-center h-full hover:border-black/20 hover:bg-white group">
                        <div className="text-3xl mb-3 opacity-90 group-hover:opacity-100 transition-opacity transform group-hover:-translate-y-1 duration-300 drop-shadow-sm">{exam.icon}</div>
                        <h3 className="font-extrabold text-slate-800 text-[14px] sm:text-[15px] mb-1 group-hover:text-amber-600 transition-colors leading-tight">{exam.title}</h3>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wide">{exam.sub}</p>
                     </Link>
                  ))}
               </div>
            </div>
         </section>

         {/* ── UPCOMING BATCHES (CONSULTATION FOCUS) ── */}
         <section className="py-20">
            <div className="container mx-auto px-4 lg:px-8">
               <div className="text-center md:text-left mb-10 border-l-4 border-slate-900 pl-4 py-1">
                  <h2 className="text-3xl font-black text-slate-900 leading-none mb-2">Upcoming Batches</h2>
                  <p className="text-slate-500 font-medium">Join India's most trusted foundation & target batches for assured selection.</p>
               </div>

               <div className="grid md:grid-cols-3 gap-8">
                  {(websiteSettings?.upcomingBatches?.length ? websiteSettings.upcomingBatches : [
                     { img: "/images/hero_combo_top.jpeg", title: "Comprehensive Foundation Batch 2026", desc: "A definitive classroom batch covering complete General Studies from absolute basics to advanced level.", status: "Admissions Open", totalSeats: 100, seatsLeft: 12 },
                     { img: "/images/hero_combo_mid.png", title: "SSC Intensive Target Program", desc: "Rigorous daily practice and mock test-driven preparation for secure selections across CGL and CHSL.", status: "Limited Seats", totalSeats: 80, seatsLeft: 5 },
                     { isCustomSplit: true, title: "Free Career Counselling Seminar", desc: "Guidance directly from toppers and expert mentors to completely roadmap your preparation journey.", status: "Next Sunday", totalSeats: 100, seatsLeft: 2 },
                  ]).map((course, i) => (
                     <div key={i} className="card-kgs overflow-hidden flex flex-col group h-full">
                        {course.isCustomSplit ? (
                           <div className="relative aspect-video overflow-hidden bg-slate-900 p-3 pb-4 pt-10 flex gap-3 items-center justify-center border-b-[4px] border-[hsl(var(--primary))]">
                              <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1.5 shadow-md z-10">
                                 <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-fast"></span> {course.status}
                              </div>
                              
                              {/* Left Image */}
                              <div className="flex-1 h-full rounded-lg overflow-hidden border border-slate-700 relative group-hover:border-gold transition-colors bg-white">
                                 <img src="/images/founder_solo.png" className="w-full h-full object-contain mix-blend-multiply" style={{ objectPosition: "center 20%" }} alt="Mr. Imran Khan" />
                                 <div className="absolute bottom-0 left-0 w-full bg-[#1e40af] py-1 px-1 text-center">
                                    <p className="text-[9px] font-black text-white uppercase">Mr. Imran Khan</p>
                                    <p className="text-[7px] font-bold text-blue-200 uppercase">Founder / Mentor</p>
                                 </div>
                              </div>

                              {/* Separator */}
                              <div className="w-1.5 h-14 bg-gold rounded-full opacity-90 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>

                              {/* Right Image */}
                              <div className="flex-1 h-full rounded-lg overflow-hidden border border-slate-700 relative group-hover:border-gold transition-colors bg-white">
                                 <img src="/images/faculty_5.png" className="w-[120%] h-[120%] object-contain -ml-[10%] mix-blend-multiply" style={{ objectPosition: "center 30%" }} alt="Mr. Sandeep Sir" />
                                 <div className="absolute bottom-0 left-0 w-full bg-[#047857] py-1 px-1 text-center">
                                    <p className="text-[9px] font-black text-white uppercase">Mr. Sandeep Sir</p>
                                    <p className="text-[7px] font-bold text-emerald-200 uppercase">Expert Faculty</p>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="relative aspect-video overflow-hidden bg-slate-100">
                              <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider flex items-center gap-1.5 shadow-md z-10">
                                 <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-fast"></span> {course.status}
                              </div>
                           </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col items-start bg-white/40">
                           <h3 className="font-extrabold text-slate-900 text-[17px] mb-3 leading-snug group-hover:text-blue-700 transition-colors">{course.title}</h3>
                           <p className="text-[13px] text-slate-600 mb-6 leading-relaxed flex-1 font-medium">{course.desc}</p>

                           <div className="w-full bg-slate-50 rounded-lg p-3 mb-6 border border-slate-100">
                              <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5 uppercase">
                                 <span>Seats Filled</span>
                                 <span className="text-red-500 animate-pulse-fast">Only {course.seatsLeft} Left!</span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-[hsl(var(--primary))] rounded-full" style={{ width: `${Math.floor(((course.totalSeats || 100) - (course.seatsLeft || 0)) / (course.totalSeats || 100) * 100)}%` }}></div>
                              </div>
                              <div className="text-[10px] text-right mt-1 font-bold text-slate-400">{Math.floor(((course.totalSeats || 100) - (course.seatsLeft || 0)) / (course.totalSeats || 100) * 100)}% Capacity</div>
                           </div>

                           <div className="mt-auto w-full">
                              <Link to="/contact" className="w-full inline-flex items-center justify-center gap-2 text-[13px] font-black text-slate-800 bg-[hsl(var(--primary))]/20 border border-[hsl(var(--primary))]/30 px-4 py-3 rounded-xl hover:bg-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] transition-all">
                                 <Handshake className="w-4 h-4" /> SECURE SEAT (FREE Counselling)
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
               <div className="mt-14">
                  <div className="flex justify-between flex-wrap gap-4 items-end mb-6">
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">Toppers' Voice (Suniye Toppers ki Zubaan)</h3>
                        <p className="text-slate-500 font-medium mt-2">Real reviews, authentic tears of joy, and unmatched 'Sarkari Naukri' selections.</p>
                     </div>
                     <Link to="/results" className="text-red-600 font-bold text-sm flex items-center gap-1 hover:underline">
                        <Youtube className="w-4 h-4" /> Watch All Videos
                     </Link>
                  </div>
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                     {visibleVideos.map((video) => (
                        <figure key={video.id} className="m-0 relative group">
                           <button type="button" onClick={() => setActiveVideo(video)} className="w-full bg-slate-900 rounded-xl aspect-[4/3] relative overflow-hidden cursor-pointer border border-slate-800 shadow-lg block text-left">
                              <img src={video.thumbnailUrl} loading="lazy" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" alt={video.title} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-10 h-12 bg-red-600 text-white rounded flex items-center justify-center group-hover:bg-red-500 transition-colors">
                                    <Play className="w-5 h-5 ml-0.5" />
                                 </div>
                              </div>
                              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                 <p className="text-white text-[11px] font-bold leading-snug">{video.title}</p>
                              </div>
                           </button>
                           <figcaption className="sr-only">Success testimonial from an AIM Academy student ranking top from the Jabalpur batch. {video.title}</figcaption>
                        </figure>
                     ))}
                  </div>
                  {visibleVideos.length === 0 && (
                     <div className="rounded-xl border border-slate-200 bg-white/50 px-6 py-10 text-center text-slate-400 font-medium">Published videos will appear here automatically.</div>
                  )}
               </div>
            </div>
         </section>

         {/* ── ABOUT THE ACADEMY ADVANTAGE ── */}
         <section className="py-20 bg-transparent border-y border-black/5 relative overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8 relative z-10">
               <div className="flex flex-col lg:flex-row gap-12 items-center">

                  <div className="flex-1 w-full order-2 lg:order-1">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/40 p-6 rounded-3xl border-2 border-slate-200 shadow-lg flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform group">
                           <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <GraduationCap className="w-6 h-6" />
                           </div>
                           <h4 className="font-extrabold text-slate-900">Topper's Pedagogy</h4>
                           <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wide">Basics to Advanced</p>
                        </div>
                        <div className="bg-white/40 p-6 rounded-3xl border-2 border-slate-200 shadow-lg flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform group">
                           <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                              <ShieldCheck className="w-6 h-6" />
                           </div>
                           <h4 className="font-extrabold text-slate-900">Rigorous 'Abhyas'</h4>
                           <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wide">Mock Tests & Analysis</p>
                        </div>
                        <div className="bg-white/40 p-6 rounded-3xl border-2 border-slate-200 shadow-lg flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform group">
                           <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                              <Video className="w-6 h-6" />
                           </div>
                           <h4 className="font-extrabold text-slate-900">1-on-1 Mentorship</h4>
                           <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wide">Direct Access</p>
                        </div>
                        <div className="bg-white/40 p-6 rounded-3xl border-2 border-slate-200 shadow-lg flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform group">
                           <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                              <Clock className="w-6 h-6" />
                           </div>
                           <h4 className="font-extrabold text-slate-900">Legacy of Results</h4>
                           <p className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wide">Decades of Success</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex-1 order-1 lg:order-2">
                     <div className="inline-block px-4 py-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-black text-[10px] uppercase tracking-widest rounded-full mb-6">
                        Why Choose AIM Academy
                     </div>
                     <h2 className="text-4xl lg:text-[46px] font-black leading-[1.1] mb-6 text-slate-900 tracking-tight">
                        We Don't Just Teach.<br />We <span className="text-blue-600">Engineer Success.</span>
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
         <section className="py-16 bg-transparent">
            <div className="container mx-auto px-4 lg:px-8">
               <div className="text-center md:text-left mb-10 border-l-4 border-slate-900 pl-4 py-1">
                  <h2 className="text-3xl font-black text-slate-900 mb-2 leading-none">Guidance from Proven Educators</h2>
                  <p className="text-slate-500 font-medium">Learn directly from India's most respected faculty who have guided thousands to final selection.</p>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {faculty.map((member, i) => (
                     <div key={i} className="flex flex-col items-center bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-[0_0_15px_rgba(0,0,0,0.15)] hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full overflow-hidden mb-4 border-[4px] border-primary/30 shadow-lg flex items-center justify-center">
                           <img
                              src={member.img}
                              alt={member.name}
                              className="w-full h-full object-cover transition-all duration-500"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-4xl font-black text-slate-300">${member.name.charAt(0)}</span>`;
                                }
                              }}
                           />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-[16px]">{member.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold text-center mt-1 uppercase tracking-widest leading-snug">{member.sub}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* ── OFFLINE CENTERS ── */}
         <section className="py-16 bg-transparent border-t border-black/5">
            <div className="container mx-auto px-4 lg:px-8">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                  <div className="border-l-4 border-blue-600 pl-4 py-1">
                     <h2 className="text-3xl font-black text-slate-900 mb-2 leading-none">Visit Our Offline Centers</h2>
                     <p className="text-slate-500 font-medium">Walk in for free Counselling and demo classes.</p>
                  </div>
                  <a href="tel:+917067231189" className="text-slate-900 font-black text-[13px] uppercase tracking-wide bg-[hsl(var(--primary))] px-8 py-3.5 rounded-full hover:brightness-105 flex items-center gap-2 shadow-sm transition-all">
                     <PhoneCall className="w-4 h-4" /> Helpdesk
                  </a>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                     { city: "Jabalpur - Ranjhi Branch", address: "Main Road Ranjhi, Adarsh Market, Beside Police Petrol Pump, Jabalpur" },
                     { city: "Jabalpur - Adhartal Branch", address: "Main Road Adhartal, Beside Indore Sweets, Keshari Traders, Opposite to Durga Patr Emporium" },
                  ].map((center, i) => (
                     <div key={i} className="bg-white/40 p-8 rounded-3xl flex items-start gap-5 border-2 border-slate-200 shadow-lg hover:border-black/20 hover:shadow-xl transition-all group cursor-pointer">
                        <div className="mt-1 shrink-0 bg-white shadow-sm p-3 rounded-2xl group-hover:bg-[hsl(var(--primary))] transition-colors">
                           <MapPin className="text-slate-700 group-hover:text-white w-6 h-6 transition-colors" />
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
               <Link to="/contact" className="flex-1 py-4 flex items-center justify-center gap-2 active:bg-white/20 transition-colors">
                  <Handshake className="w-4 h-4" /> Secure Seat
               </Link>
            </div>
         </div>

         {/* ── NON-INTRUSIVE FLOATING WIDGET ── */}
         {showPopup && (
            <div className="fixed bottom-28 right-4 md:bottom-24 md:right-8 z-[100] max-w-sm w-[calc(100%-2rem)] md:w-80 animate-in slide-in-from-bottom-8 duration-300">
               <div className="bg-white rounded-2xl overflow-hidden shadow-2xl relative border border-slate-200">
                  <button onClick={closePopup} className="absolute top-3 right-3 w-7 h-7 bg-white text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors z-20 shadow-sm border border-slate-200">
                     <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="bg-blue-600 p-4 pr-10 relative overflow-hidden">
                     <h2 className="text-lg font-black text-white leading-tight">Request Free Roadmap</h2>
                     <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider mt-1">Get Expert Career Guidance</p>
                  </div>
                  <div className="p-4">
                     <form onSubmit={handleLeadSubmit} className="space-y-3">
                        <div>
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">WhatsApp Number</label>
                           <div className="flex relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 font-bold text-sm">+91</span>
                              <input type="tel" required pattern="[0-9]{10}" placeholder="10 digit number" className="w-full bg-slate-50 border border-slate-200 pl-12 pr-3 py-2.5 rounded-lg outline-none focus:border-blue-500 text-sm font-bold text-slate-900 transition-colors" disabled={isLeadSubmitting || isLeadSuccess} />
                           </div>
                        </div>
                        <button type="submit" disabled={isLeadSubmitting || isLeadSuccess} className="w-full bg-blue-700 text-white font-black uppercase tracking-wider py-2.5 rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm disabled:opacity-70">
                           {isLeadSubmitting ? (
                             <span className="animate-pulse">Processing...</span>
                           ) : isLeadSuccess ? (
                             <span className="text-emerald-300 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Success!</span>
                           ) : (
                             <><Handshake className="w-4 h-4" /> Submit Request</>
                           )}
                        </button>
                     </form>
                  </div>
               </div>
            </div>
         )}

         {activeVideo && activeEmbedUrl && (
            <div className="fixed inset-0 z-[120] bg-slate-950/95 flex items-center justify-center p-3 sm:p-6">
               <button onClick={() => setActiveVideo(null)} aria-label="Close video" className="absolute top-4 right-4 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
               </button>
               <div className="w-full max-w-6xl">
                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl border border-white/10">
                     <iframe
                        title={activeVideo.title}
                        src={activeEmbedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                     />
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default Index;
