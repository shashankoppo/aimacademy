import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone, Search } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "Practice", path: "/courses" },
    { name: "Current Affairs", path: "/resources" },
    { name: "Test Series", path: "/resources" },
    { name: "Study Materials", path: "/resources" },
  ];

  return (
    <nav className="w-full bg-white shadow-sm z-50 sticky top-0">
      {/* Top Thin Bar */}
      <div className="bg-slate-50 border-b border-slate-100 hidden md:block">
        <div className="container mx-auto px-4 lg:px-8 py-1.5 flex justify-between items-center text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-6">
            <span>All Exams</span>
            <a href="tel:8757354880" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Phone className="w-3 h-3" /> Call Us: +91 70672 31189
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-primary font-bold text-blue-700 transition-colors">Book Free Consultation</Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo_main.png" alt="Logo" className="w-14" />
          <div className="flex flex-col">
             <span className="font-bold text-lg leading-none text-slate-800">AIM Academy</span>
             <span className="text-[9px] text-slate-500 uppercase tracking-wide">Global Studies</span>
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
