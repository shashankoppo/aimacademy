import { Link } from "react-router-dom";
import { Youtube, Instagram, Facebook, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 mt-20 relative overflow-hidden">
      {/* Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-4">
             <Link to="/" className="flex items-center gap-2 mb-6">
               <img src="/images/logo_main.png" alt="Logo" className="w-14" />
               <div className="flex flex-col">
                 <span className="font-bold text-xl leading-none text-white tracking-tight">AIM Academy</span>
                 <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Coaching Institute</span>
               </div>
             </Link>
             <p className="text-sm leading-relaxed mb-6 text-slate-400">
               AIM Academy is India's most trusted online education platform that provides affordable & comprehensive learning experience to students for various competitive exams.
             </p>
             <div className="flex gap-4">
                <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-slate-900 transition-all"><Facebook className="w-5 h-5"/></a>
                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-slate-900 transition-all"><Twitter className="w-5 h-5"/></a>
                <a href="#" aria-label="YouTube" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-slate-900 transition-all"><Youtube className="w-5 h-5"/></a>
                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-slate-900 transition-all"><Instagram className="w-5 h-5"/></a>
             </div>
          </div>

          {/* Links 1 */}
          <div className="lg:col-span-2">
            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
              <li><Link to="/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
              <li><Link to="/gallery" className="hover:text-blue-600 transition-colors">Gallery</Link></li>
              <li><Link to="/faqs" className="hover:text-blue-600 transition-colors">FAQS</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="lg:col-span-3">
            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8">Popular Exams</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">UPSC & MP PSC</Link></li>
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">SI & Police Constable</Link></li>
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">SSC & CGL Special</Link></li>
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">Railways & Vyapam</Link></li>
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">Samvida & Teaching</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8">Course Related Query</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors font-semibold">Ask Your Doubts</Link></li>
              <li className="flex items-center gap-2">
                 <Mail className="w-4 h-4 text-slate-400" />
                 <a href="mailto:info@aimacademy.in" className="hover:text-blue-600 transition-colors">info@aimacademy.in</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/5 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-medium">
          <div className="text-center md:text-left space-y-2">
            <p className="text-slate-300">© {new Date().getFullYear()} AIM Academy. All Rights Reserved.</p>
            <p className="opacity-50">Technical Partner: <span className="text-primary font-bold">ELSxGlobal</span> (Division of Evolucentsphere Pvt Ltd)</p>
          </div>
          <div className="flex flex-wrap gap-6 uppercase tracking-widest">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy policy</Link>
            <span className="text-white/10 hidden sm:inline">|</span>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
