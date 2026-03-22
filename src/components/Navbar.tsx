import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, X, ChevronDown, Rocket, GraduationCap, 
  Trophy, BookOpen, Users, Phone, Zap 
} from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Courses", path: "/courses", hasDropdown: true },
    { name: "Results", path: "/results" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 w-full z-[100] transition-all duration-300">
      {/* Ticker Bar (Coursera blue) */}
      <div className="ticker-bar">
         <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex gap-12">
                <span>⚡ Enrollments open for SSC CGL & UPSC Batch 2026</span>
                <span>🏆 AIM Academy ranks #1 in Jabalpur Success Ratios</span>
                <span>📞 Call for Free Counseling: +91 70672 31189</span>
              </span>
            ))}
         </div>
      </div>

      {/* Main Nav (Clean White) */}
      <div className={cn(
        "w-full bg-white transition-all duration-300",
        scrolled ? "py-3 shadow-md border-b border-slate-100" : "py-5"
      )}>
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
             {/* Official Logo Integration */}
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 shadow-sm border border-slate-100 overflow-hidden group-hover:scale-110 transition-transform">
                <img src="/images/logo_main.png" alt="AIM Academy Logo" className="w-full h-full object-contain" />
             </div>
             <div className="flex flex-col">
                <span className="font-display font-black text-2xl tracking-tighter text-slate-900 group-hover:text-primary transition-colors leading-none">AIM</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Academy Group</span>
             </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-sm font-bold tracking-tight transition-colors flex items-center gap-1 relative py-1",
                  "after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full",
                  location.pathname === link.path ? "text-primary after:w-full" : "text-slate-600 hover:text-primary"
                )}
              >
                {link.name}
                {link.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-slate-200 mx-2" />
            
            <Link to="/contact" className="btn-coursera">
              Begin Free
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-2xl animate-fade-in">
          <div className="flex flex-col p-6 gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/contact" className="btn-coursera w-full" onClick={() => setIsOpen(false)}>
              Join For Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
