import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Globe, Menu, X, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/admin-api";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [bannerText, setBannerText] = useState(
    "🚀 Admissions Open for MP PSC & UPSC Foundation Batch 2025-26 | Call +91 70672 31189  •  🏆 AIM Academy: Jabalpur's #1 Selection Hub for 14+ Years  •  🌟 Free Career Counselling with Expert Faculty | Book Now  •  🎓 Exclusive Merit-based Scholarships Available for 2025 Sessions  •  📚 New Batches for SSC, Banking & All Govt Exams Starting Soon  •  📍 Visit our Jabalpur Campus for a Demo Class & Mentorship  •  ✨ 7,000+ Students Already Transformed Their Careers  •  ✅ Join the Legacy of Success | Join AIM Academy - The Synonym of Success"
  );
  const translateRef = useRef<HTMLDivElement>(null);
  const mobileTranslateRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBanner = async () => {
      try {
        const settings = await apiRequest<{ bannerText: string }>("/admin/website-settings");
        if (settings.bannerText) setBannerText(settings.bannerText);
      } catch {
        const saved = localStorage.getItem("aim_top_banner");
        if (saved) setBannerText(saved);
      }
    };
    void loadBanner();
  }, []);

  // Inject Google Translate script once globally
  useEffect(() => {
    if (!document.getElementById("google-translate-script")) {
      // @ts-ignore
      window.googleTranslateElementInit = () => {
        // @ts-ignore
        new window.google.translate.TranslateElement(
          { 
            pageLanguage: "en", 
            includedLanguages: 'hi,en,mr,gu,pa,ta,te',
            layout: 0, 
            autoDisplay: false 
          },
          "google_translate_element"
        );
      };
      const s = document.createElement("script");
      s.id = "google-translate-script";
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  // Close translate dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (translateRef.current && translateRef.current.contains(target)) ||
        (mobileTranslateRef.current && mobileTranslateRef.current.contains(target)) ||
        (dropdownRef.current && dropdownRef.current.contains(target))
      ) {
        return;
      }
      setShowTranslate(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "Results", path: "/results" },
    { name: "Resources", path: "/resources" },
    { name: "Contact", path: "/contact" },
  ];

  const changeFontSize = (size: number) => {
    document.documentElement.style.fontSize = `${size}px`;
  };

  const handleTranslate = (lang: string) => {
    const selectField = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectField) {
      selectField.value = lang;
      selectField.dispatchEvent(new Event('change'));
    }
    setShowTranslate(false);
  };

  return (
    <header className="w-full z-50 sticky top-0 shadow-md">
      {/* ── HEADER UTILITY BAR ── */}
      <div className="bg-blue-600 text-white border-b border-white/10 flex items-center justify-between px-4 lg:px-8 py-1.5 text-xs">
        <div className="flex items-center gap-4 hidden sm:flex">
           <span className="font-semibold text-blue-200">Accessibility:</span>
           <div className="flex items-center gap-2">
             <button onClick={() => changeFontSize(14)} className="hover:text-[#FFFF00] font-bold" title="Decrease text size">A-</button>
             <button onClick={() => changeFontSize(16)} className="hover:text-[#FFFF00] font-bold" title="Normal text size">A</button>
             <button onClick={() => changeFontSize(18)} className="hover:text-[#FFFF00] font-bold" title="Increase text size">A+</button>
           </div>
           <div className="h-3 w-px bg-white/20 mx-2"></div>
           <div className="flex items-center gap-3">
              <button onClick={() => handleTranslate('en')} className="hover:text-[#FFFF00] font-bold">English</button>
              <span className="text-white/40">|</span>
              <button onClick={() => handleTranslate('hi')} className="hover:text-[#FFFF00] font-bold">हिंदी</button>
           </div>
        </div>

        {/* Sarkari Naukri Notification Feed (Ticker) */}
        <div className="flex-1 sm:ml-8 overflow-hidden relative flex items-center">
           <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider mr-3 shrink-0 z-10 relative shadow-sm">
             Important
           </div>
           <div className="animate-marquee whitespace-nowrap flex w-full">
            <span className="text-[11px] font-semibold tracking-wide px-8 text-white">
              {bannerText}
            </span>
            <span className="text-[11px] font-semibold tracking-wide px-8 text-white">
              {bannerText}
            </span>
          </div>
        </div>
      </div>

      <nav className="bg-[#FFFF00] border-b border-black/5">
        {/* Main Nav Container */}
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <img src="/images/logo_main.png" alt="Logo" className="w-14 h-14 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl leading-none text-slate-900 tracking-tighter">AIM ACADEMY</span>
              <span className="text-[7px] text-slate-500 font-black uppercase tracking-[0.2em] -mt-0.5 self-end pr-1">Synonym of Success</span>
            </div>
          </Link>



          {/* Desktop Links & Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm font-bold text-slate-800 hover:text-slate-900 hover:underline underline-offset-4 decoration-2 decoration-slate-900 transition-all px-1"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-800/20" />

            {/* ── TRANSLATE DROPDOWN ── */}
            <div className="relative" ref={translateRef}>
              <button
                onClick={() => setShowTranslate((p) => !p)}
                className={`flex items-center gap-2 text-[12px] font-black px-4 py-2 rounded-full border-2 transition-all shadow-sm ${
                  showTranslate
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-900 border-slate-900 hover:bg-slate-50"
                }`}
              >
                <Globe className={`w-4 h-4 ${showTranslate ? "animate-spin-slow" : ""}`} />
                <span>LAN / हिंदी</span>
              </button>
            </div>

            <Link 
              to="/login" 
              className="bg-slate-900 text-white font-black py-2.5 px-6 rounded-full text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              LOGIN
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-3">
             <button 
               ref={mobileTranslateRef}
               onClick={() => setShowTranslate(!showTranslate)}
               className={`p-2 rounded-full border-2 transition-all ${showTranslate ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-900 border-slate-200"}`}
             >
                <Globe className="w-5 h-5" />
             </button>
             <button 
               className="p-2 bg-slate-900 text-white rounded-lg shadow-md" 
               onClick={() => setIsOpen(!isOpen)}
             >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b-4 border-slate-900 shadow-2xl px-6 py-8 flex flex-col gap-6 z-[400] animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-xl font-black text-slate-900 p-3 hover:bg-slate-100 rounded-xl flex items-center justify-between group transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>

            <div className="h-px bg-slate-100 w-full" />

            <Link
              to="/login"
              className="bg-slate-900 text-white text-center py-4 rounded-2xl font-black text-lg shadow-xl"
              onClick={() => setIsOpen(false)}
            >
              STUDENT LOGIN
            </Link>
          </div>
        )}
      </nav>

      {/* Global Translate Dropdown - Works for both Desktop and Mobile toggles */}
      <div 
        ref={dropdownRef}
        className={`absolute right-4 lg:right-8 top-[110px] lg:top-[90px] bg-white border-2 border-slate-900 rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,0.1)] p-5 min-w-[260px] z-[500] transition-all duration-300 ${
          showTranslate ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">
            Translate Page
          </p>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        
        {/* GOOGLE TRANSLATE TARGET ID - ALWAYS PRESENT FOR SCRIPT */}
        <div
          id="google_translate_element"
          className="
            [&_.goog-te-gadget]:font-sans [&_.goog-te-gadget]:!text-[0px]
            [&_select]:w-full [&_select]:rounded-xl [&_select]:border-2 [&_select]:border-slate-200
            [&_select]:px-4 [&_select]:py-3 [&_select]:text-sm [&_select]:outline-none
            [&_select]:bg-slate-50 [&_select]:cursor-pointer [&_select]:font-bold
            [&_select:hover]:border-slate-900
            [&_.goog-logo-link]:hidden [&_.goog-te-gadget-simple]:border-none
            [&_.goog-te-gadget-icon]:hidden
          "
        />
        <p className="text-[10px] text-slate-400 mt-4 italic text-center">
          Select your preferred language
        </p>
      </div>

    </header>
  );
};

export default Navbar;
