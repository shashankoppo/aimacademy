import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone, Search } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bannerText, setBannerText] = useState("New Batch Admissions Open for MP PSC & UPSC Foundation 2026-27 | AIM Academy: Synonym of Success | Call: +91 70672 31189");

  useEffect(() => {
    const saved = localStorage.getItem("aim_top_banner");
    if (saved) setBannerText(saved);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "Resources", path: "/resources" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="w-full bg-[#FFFF00] shadow-sm z-50 sticky top-0">
      {/* Top Running Banner */}
      <div className="bg-blue-600 text-white overflow-hidden py-1.5 hidden md:block border-b border-white/5">
        <div className="animate-marquee whitespace-nowrap inline-block">
          <span className="text-[10px] font-bold uppercase tracking-wider mx-10">
            {bannerText}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider mx-10">
            {bannerText}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider mx-10">
            {bannerText}
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo_main.png" alt="Logo" className="w-14" />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg text-slate-800 leading-none">
              <span className="text-slate-800">AIM </span>
              <span className="relative inline-flex flex-col">
                <span className="font-bold text-lg text-slate-800 leading-none">Academy</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold leading-tight">Synonym of Success</span>
              </span>
            </span>
          </div>
        </Link>

        {/* Global Search Like KGS */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="What do you want to learn?"
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4" />
        </div>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="text-sm font-medium text-slate-700 hover:text-primary transition-colors">
              {link.name}
            </Link>
          ))}
          <Link to="/login" className="btn-primary ml-2 py-2 px-5 text-sm">
            Login / Register
          </Link>
        </div>

        <button className="lg:hidden text-slate-700" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-lg px-4 py-4 flex flex-col gap-4">
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="What do you want to learn?"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
          </div>
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="text-sm font-medium text-slate-700 p-2 hover:bg-slate-50 rounded" onClick={() => setIsOpen(false)}>
              {link.name}
            </Link>
          ))}
          <Link to="/login" className="btn-primary text-center w-full" onClick={() => setIsOpen(false)}>Login / Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
