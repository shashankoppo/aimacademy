import { Link } from "react-router-dom";
import { Youtube, Instagram, Facebook, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#f8fafc] border-t border-slate-200 text-slate-600 pt-16">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-4">
             <Link to="/" className="flex items-center gap-2 mb-4">
               <img src="/images/logo_main.png" alt="Logo" className="w-14 grayscale opacity-80" />
               <div className="flex flex-col">
                 <span className="font-bold text-lg leading-none text-slate-800">AIM Academy</span>
                 <span className="text-[9px] text-slate-500 uppercase tracking-widest">Coaching Institute</span>
               </div>
             </Link>
             <p className="text-sm leading-relaxed mb-6">
               AIM Academy is India's most trusted online education platform that provides affordable & comprehensive learning experience to students for various competitive exams.
             </p>
             <div className="flex gap-4">
                <a href="#" aria-label="Facebook" className="text-slate-400 hover:text-blue-600 transition-colors"><Facebook className="w-5 h-5"/></a>
                <a href="#" aria-label="Twitter" className="text-slate-400 hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5"/></a>
                <a href="#" aria-label="YouTube" className="text-slate-400 hover:text-red-600 transition-colors"><Youtube className="w-5 h-5"/></a>
                <a href="#" aria-label="Instagram" className="text-slate-400 hover:text-pink-600 transition-colors"><Instagram className="w-5 h-5"/></a>
             </div>
          </div>

          {/* Links 1 */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
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
            <h4 className="font-bold text-slate-900 mb-4">Popular Exams</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">UPSC & State PSC</Link></li>
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">SSC Exams</Link></li>
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">Defence Exams</Link></li>
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">Banking Exams</Link></li>
              <li><Link to="/courses" className="hover:text-blue-600 transition-colors">Foundation Courses</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-slate-900 mb-4">Course Related Query</h4>
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
        <div className="border-t border-slate-200 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} AIM Academy. All Rights Reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy policy</Link>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
